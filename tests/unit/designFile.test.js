import { describe, it, expect } from 'vitest';
import { newDesign, makeBeds, reducer } from '../../src/lib/design.js';
import { serializeDesign, parseDesignFile, DesignFileError, designFileName } from '../../src/lib/designFile.js';

function sample() {
  let d = { ...newDesign(), bedCount: 2 };
  d = reducer(d, { type: 'confirmBeds' });
  d = reducer(d, { type: 'setLocation', location: { address: '10 Elm St, Mount Kisco, NY', lat: 41.2, lng: -73.7, zoom: 19, imagery: 'nys' } });
  const sq = [[41.2, -73.7], [41.2001, -73.7], [41.2001, -73.7001], [41.2, -73.7001]];
  d = reducer(d, { type: 'updateBed', id: d.beds[0].id, patch: { points: sq, closed: true, photo: { name: 'x.jpg' } } });
  return { ...d, stage: 'complete', completed: true, reviewed: true };
}

describe('design file', () => {
  it('round-trips a design without photo bytes or metadata', () => {
    const d = sample();
    const back = parseDesignFile(serializeDesign(d));
    expect(back.location.address).toBe(d.location.address);
    expect(back.beds[0].points).toEqual(d.beds[0].points);
    expect(back.beds[0].color).toBe(d.beds[0].color);
    expect(back.beds[0].photo).toBeNull();
  });
  it('never reopens past Review, since photos are not in the file', () => {
    const back = parseDesignFile(serializeDesign(sample()));
    expect(back.stage).toBe('review');
    expect(back.completed).toBe(false);
  });
  it('keeps an earlier stage as-is', () => {
    const back = parseDesignFile(serializeDesign({ ...sample(), stage: 'sketch' }));
    expect(back.stage).toBe('sketch');
  });
  it('rejects files that are not designs', () => {
    expect(() => parseDesignFile('not json')).toThrow(DesignFileError);
    expect(() => parseDesignFile('{"foo":1}')).toThrow(DesignFileError);
  });
  it('names the file after the street address', () => {
    expect(designFileName(sample())).toMatch(/^planting-beds-10-elm-st-\d{4}-\d{2}-\d{2}\.json$/);
  });
});
