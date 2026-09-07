// Photo handling tuned for iPhone: large HEIC/JPEG files are downscaled to a
// JPEG no wider than MAX_EDGE so storage stays small and previews render fast.
// If the browser cannot decode the format (HEIC outside Safari), the original
// bytes are kept and the UI shows a "preview unavailable" state instead of
// failing the workflow.

export const MAX_EDGE = 1800;
export const MAX_INPUT_BYTES = 60 * 1024 * 1024; // 60 MB — above this iOS Safari tends to run out of memory

export class PhotoError extends Error {
  constructor(message, kind) {
    super(message);
    this.kind = kind; // 'too-large' | 'unsupported' | 'damaged'
  }
}

function loadImage(blob) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('decode'));
    };
    img.src = url;
  });
}

async function decode(blob) {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(blob);
    } catch {
      /* fall through to <img> */
    }
  }
  return loadImage(blob);
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    if (canvas.toBlob) {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('encode'))), type, quality);
    } else {
      reject(new Error('encode'));
    }
  });
}

/**
 * Returns { blob, type, width, height, previewable }.
 * Throws PhotoError for files that cannot be used at all.
 */
export async function processPhoto(file) {
  if (!file || file.size === 0) throw new PhotoError('That file is empty or damaged. Choose a different photo.', 'damaged');
  if (file.size > MAX_INPUT_BYTES) throw new PhotoError('That photo is too large to process on this device. Choose a smaller photo.', 'too-large');
  const looksLikeImage = (file.type && file.type.startsWith('image/')) || /\.(jpe?g|png|heic|heif|webp|gif|tiff?)$/i.test(file.name || '');
  if (!looksLikeImage) throw new PhotoError('That file is not a photo. Choose a JPEG, PNG, or HEIC image.', 'unsupported');

  let bitmap;
  try {
    bitmap = await decode(file);
  } catch {
    // HEIC on a non-Apple browser lands here. Keep the original; no preview.
    if (/heic|heif/i.test(file.type + ' ' + file.name)) {
      return { blob: file, type: file.type || 'image/heic', width: 0, height: 0, previewable: false };
    }
    throw new PhotoError('That photo could not be read. It may be damaged or in an unsupported format.', 'damaged');
  }

  const w = bitmap.width || bitmap.naturalWidth;
  const h = bitmap.height || bitmap.naturalHeight;
  if (!w || !h) throw new PhotoError('That photo could not be read. It may be damaged.', 'damaged');
  const scale = Math.min(1, MAX_EDGE / Math.max(w, h));
  const cw = Math.round(w * scale), ch = Math.round(h * scale);

  const canvas = document.createElement('canvas');
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0, cw, ch);
  if (bitmap.close) bitmap.close();

  try {
    const blob = await canvasToBlob(canvas, 'image/jpeg', 0.86);
    return { blob, type: 'image/jpeg', width: cw, height: ch, previewable: true };
  } catch {
    return { blob: file, type: file.type || 'image/jpeg', width: w, height: h, previewable: true };
  }
}
