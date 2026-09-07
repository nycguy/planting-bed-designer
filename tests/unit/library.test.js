// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { listLibrary, saveToLibrary, removeFromLibrary, libraryEntry } from '../../src/lib/library.js';
import { newDesign, reducer } from '../../src/lib/design.js';

function sample(id) {
  let d = { ...newDesign(), id, bedCount: 1 };
  d = reducer(d, { type: 'confirmBeds' });
  d = reducer(d, { type: 'setLocation', location: { address: '10 Elm St, Mount Kisco, NY', lat: 41.2, lng: -73.7, zoom: 19, imagery: 'nys' } });
  return d;
}

describe('design library', () => {
  beforeEach(() => localStorage.clear());
  it('saves, lists newest first, replaces same id, and deletes', () => {
    expect(listLibrary()).toEqual([]);
    saveToLibrary(sample('a'), 'Front bed A');
    saveToLibrary(sample('b'), 'Front bed B');
    let l = listLibrary();
    expect(l.map((e) => e.name)).toEqual(['Front bed B', 'Front bed A']);
    expect(l[0].address).toBe('10 Elm St, Mount Kisco, NY');
    saveToLibrary(sample('a'), 'Front bed A v2');
    l = listLibrary();
    expect(l).toHaveLength(2);
    expect(libraryEntry('a').name).toBe('Front bed A v2');
    removeFromLibrary('b');
    expect(listLibrary().map((e) => e.id)).toEqual(['a']);
  });
  it('defaults the name to the address', () => {
    const e = saveToLibrary(sample('c'), '   ');
    expect(e.name).toBe('10 Elm St, Mount Kisco, NY');
  });
});
