// Save and open a design as a small JSON file. This is how a design moves
// between devices or is kept after clearing browser data, without any
// account or server. Photo bytes are not included (they can be tens of MB);
// the report notes which beds had photos and the user re-adds them.

import { STAGES, upgradeDesign } from './design.js';

export const DESIGN_FILE_KIND = 'planting-bed-designer/design';
export const DESIGN_FILE_VERSION = 1;

export function designFileName(design) {
  const addr = (design.location?.address || 'design')
    .split(',')[0]
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
  return `planting-beds-${addr || 'design'}-${new Date().toISOString().slice(0, 10)}.json`;
}

export function serializeDesign(design) {
  return JSON.stringify(
    {
      kind: DESIGN_FILE_KIND,
      fileVersion: DESIGN_FILE_VERSION,
      savedAt: new Date().toISOString(),
      design: { ...design, beds: design.beds.map((b) => ({ ...b, photo: null })) },
    },
    null,
    2,
  );
}

export function saveDesignFile(design) {
  const blob = new Blob([serializeDesign(design)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = designFileName(design);
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(a.href);
    a.remove();
  }, 500);
}

export class DesignFileError extends Error {}

// Returns a design ready to use, or throws DesignFileError with a message
// suitable for showing to the user.
export function parseDesignFile(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new DesignFileError('This file is not a saved design. Choose a file that ends in .json and was saved from this app.');
  }
  const d = data?.kind === DESIGN_FILE_KIND ? data.design : data;
  if (!d || !Array.isArray(d.beds) || !d.location || typeof d.location.lat !== 'number') {
    throw new DesignFileError('This file does not contain a planting bed design.');
  }
  // Photos never travel with the file, so the design cannot be past Review.
  const stage = STAGES.indexOf(d.stage) > STAGES.indexOf('review') ? 'review' : d.stage || 'review';
  return upgradeDesign({
    ...d,
    stage,
    completed: false,
    beds: d.beds.map((b) => ({ ...b, photo: null })),
  });
}

export function readDesignFile(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onerror = () => reject(new DesignFileError('The file could not be read.'));
    r.onload = () => {
      try {
        resolve(parseDesignFile(String(r.result)));
      } catch (e) {
        reject(e);
      }
    };
    r.readAsText(file);
  });
}
