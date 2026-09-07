// Design JSON lives in localStorage (small, synchronous, survives refresh).
// Photo bytes live in IndexedDB (large blobs, keyed by bed id).
// Everything stays on the user's device; nothing is uploaded to a server.

const DESIGN_KEY = 'pbd:design:v1';
const DB_NAME = 'pbd-photos';
const STORE = 'photos';

export function storageAvailable() {
  try {
    const k = '__pbd_test__';
    localStorage.setItem(k, '1');
    localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

export function loadDesign() {
  try {
    const raw = localStorage.getItem(DESIGN_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw);
    if (!d || !Array.isArray(d.beds)) return null;
    return d;
  } catch {
    return null;
  }
}

export function saveDesign(design) {
  try {
    localStorage.setItem(DESIGN_KEY, JSON.stringify(design));
    return true;
  } catch {
    return false;
  }
}

export function clearDesign() {
  try {
    localStorage.removeItem(DESIGN_KEY);
  } catch {
    /* ignore */
  }
}

function openDb() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in globalThis)) return reject(new Error('IndexedDB unavailable'));
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx(mode, fn) {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const store = t.objectStore(STORE);
        const req = fn(store);
        t.oncomplete = () => resolve(req?.result);
        t.onerror = () => reject(t.error);
        t.onabort = () => reject(t.error);
      }),
  );
}

export const savePhotoBlob = (bedId, blob) => tx('readwrite', (s) => s.put(blob, bedId));
export const loadPhotoBlob = (bedId) => tx('readonly', (s) => s.get(bedId));
export const deletePhotoBlob = (bedId) => tx('readwrite', (s) => s.delete(bedId));
export const clearAllPhotos = () => tx('readwrite', (s) => s.clear());
