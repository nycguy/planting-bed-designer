// A small on-device library of named designs, so one property can hold
// several versions ("front bed option A / B") and several properties can be
// kept on one phone. Stored in localStorage without photo bytes; photos stay
// in IndexedDB keyed by bed id, so a design reopened from the library finds
// its photos again as long as it is the same device.

const KEY = 'pbd:library:v1';

export function listLibrary() {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.sort((a, b) => (b.savedAt || '').localeCompare(a.savedAt || '')) : [];
  } catch {
    return [];
  }
}

function write(arr) {
  try {
    localStorage.setItem(KEY, JSON.stringify(arr));
    return true;
  } catch {
    return false;
  }
}

export function saveToLibrary(design, name) {
  const entry = {
    id: design.id,
    name: (name || '').trim() || design.location?.address || 'Untitled design',
    address: design.location?.address || '',
    beds: design.beds.length,
    plants: (design.plants || []).length,
    savedAt: new Date().toISOString(),
    design: { ...design, beds: design.beds.map((b) => ({ ...b, photo: b.photo ? { ...b.photo } : null })) },
  };
  const rest = listLibrary().filter((e) => e.id !== design.id);
  return write([entry, ...rest]) ? entry : null;
}

export function removeFromLibrary(id) {
  return write(listLibrary().filter((e) => e.id !== id));
}

export function libraryEntry(id) {
  return listLibrary().find((e) => e.id === id) || null;
}
