// Reference photos from Wikipedia page summaries (REST API, CORS enabled,
// no key). Looked up by genus + species from the botanical name. Results are
// cached in memory and localStorage so a plant is fetched once per device.

const CACHE_KEY = 'pbd:plantphotos:v3'; // v3: large size via Special:FilePath
const mem = new Map();
let disk = null;
function loadDisk() {
  if (disk) return disk;
  try {
    disk = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
  } catch {
    disk = {};
  }
  return disk;
}
function saveDisk() {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(disk));
  } catch {
    /* ignore */
  }
}

// "Hydrangea paniculata (\u2018Limelight\u2019)" -> "Hydrangea paniculata"
export function lookupTitle(botanical) {
  const cleaned = String(botanical || '')
    .replace(/[\u2018\u2019'"].*$/, '')
    .replace(/\(.*$/, '')
    .replace(/\b(var|f|subsp|ssp|cv)\.?\s.*$/i, '')
    .replace(/\s+[\u00d7x]\s+/i, ' × ')
    .trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (!parts.length) return null;
  if (parts[1] === '×' && parts[2]) return `${parts[0]} × ${parts[2]}`;
  return parts.slice(0, 2).join(' ');
}

// Build a ~640 px rendition. Rewriting the "NNNpx-" segment of a thumbnail
// URL is fragile (it fails when the original is narrower, and for some file
// types), so ask the wiki's Special:FilePath redirector instead, which
// clamps the width to the original and picks the right thumbnail path.
export function largeUrl(thumbSrc, originalSrc, width = 640) {
  const src = originalSrc || thumbSrc;
  if (!src) return null;
  const m = src.match(/upload\.wikimedia\.org\/wikipedia\/(commons|en)\/(?:thumb\/)?[0-9a-f]\/[0-9a-f]{2}\/([^/]+?)(?:\/\d+px-[^/]+)?$/i);
  if (!m) return thumbSrc || src;
  const host = m[1] === 'commons' ? 'commons.wikimedia.org' : 'en.wikipedia.org';
  return `https://${host}/wiki/Special:FilePath/${m[2]}?width=${width}`;
}

export async function plantPhoto(plant, { signal } = {}) {
  if (!plant) return null;
  const title = plant.wikipediaTitle || lookupTitle(plant.botanical) || plant.name;
  if (mem.has(title)) return mem.get(title);
  const d = loadDisk();
  if (d[title] !== undefined) {
    mem.set(title, d[title]);
    return d[title];
  }
  let result = null;
  try {
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}`, { signal, headers: { Accept: 'application/json' } });
    if (res.ok) {
      const j = await res.json();
      const src = j.thumbnail?.source || null;
      if (src) {
        // Wikipedia thumbnail URLs can be re-sized by changing the "NNNpx-"
        // segment, but only down from the original; asking for more than the
        // original width returns an error, so cap at the original.
        const large = largeUrl(src, j.originalimage?.source) || src;
        result = { src, large, page: j.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`, title: j.title || title };
      }
    }
  } catch (e) {
    if (e.name === 'AbortError') throw e;
  }
  mem.set(title, result);
  d[title] = result;
  saveDisk();
  return result;
}
