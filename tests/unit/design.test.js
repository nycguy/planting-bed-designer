import { describe, it, expect } from 'vitest';
import { newDesign, reducer, makeBeds, bedStatus, maxReachableStage, canEnterStage, designTotals, BED_COLORS } from '../../src/lib/design.js';
import { encodeDesign, decodeDesign, detectEnvironment, transferUrl } from '../../src/lib/transfer.js';

const tri = [[37.54, -77.43], [37.5401, -77.43], [37.5401, -77.4301]];

function readyDesign() {
  let d = reducer(newDesign(), { type: 'setBedCount', count: 2 });
  d = reducer(d, { type: 'confirmBeds' });
  d = reducer(d, { type: 'setLocation', location: { address: '1 Main St', lat: 37.54, lng: -77.43, zoom: 19, imagery: 'esri' } });
  return d;
}

describe('design reducer', () => {
  it('clamps bed count to 1..12', () => {
    expect(reducer(newDesign(), { type: 'setBedCount', count: 0 }).bedCount).toBe(1);
    expect(reducer(newDesign(), { type: 'setBedCount', count: 40 }).bedCount).toBe(12);
  });
  it('creates beds with distinct colors and sequential names', () => {
    const beds = makeBeds(12);
    expect(beds.map((b) => b.name)).toEqual(Array.from({ length: 12 }, (_, i) => `Bed ${i + 1}`));
    expect(new Set(beds.map((b) => b.color)).size).toBe(12);
    expect(beds[0].color).toBe(BED_COLORS[0]);
  });
  it('preserves existing beds when count changes', () => {
    const d = readyDesign();
    const renamed = reducer(d, { type: 'updateBed', id: d.beds[0].id, patch: { name: 'Front Walk Bed' } });
    const grown = reducer(reducer(renamed, { type: 'setBedCount', count: 3 }), { type: 'confirmBeds' });
    expect(grown.beds[0].name).toBe('Front Walk Bed');
    expect(grown.beds).toHaveLength(3);
  });
  it('gates stages on completed work', () => {
    let d = newDesign();
    expect(maxReachableStage(d)).toBe('beds');
    d = readyDesign();
    expect(maxReachableStage(d)).toBe('sketch');
    expect(canEnterStage(d, 'photos')).toBe(false);
    d = reducer(d, { type: 'updateBed', id: d.beds[0].id, patch: { points: tri, closed: true } });
    d = reducer(d, { type: 'updateBed', id: d.beds[1].id, patch: { points: tri, closed: true } });
    expect(maxReachableStage(d)).toBe('review');
    d = reducer(d, { type: 'setReviewed', value: true });
    expect(maxReachableStage(d)).toBe('photos');
    // Geometry edits un-review the design.
    const edited = reducer(d, { type: 'updateBed', id: d.beds[0].id, patch: { points: tri.slice() } });
    expect(edited.reviewed).toBe(false);
    expect(maxReachableStage(edited)).toBe('review');
  });
  it('derives bed statuses', () => {
    let d = readyDesign();
    expect(bedStatus(d.beds[0], d)).toBe('Not Started');
    d = reducer(d, { type: 'updateBed', id: d.beds[0].id, patch: { points: tri.slice(0, 2) } });
    expect(bedStatus(d.beds[0], d)).toBe('In Progress');
    d = reducer(d, { type: 'updateBed', id: d.beds[0].id, patch: { points: tri, closed: true } });
    expect(bedStatus(d.beds[0], d)).toBe('Ready for Review');
    d = reducer(d, { type: 'setReviewed', value: true });
    expect(bedStatus(d.beds[0], d)).toBe('Photo Needed');
    d = reducer(d, { type: 'updateBed', id: d.beds[0].id, patch: { photo: { name: 'a.jpg' } } });
    expect(bedStatus(d.beds[0], d)).toBe('Complete');
  });
  it('sums totals over valid beds only', () => {
    let d = readyDesign();
    d = reducer(d, { type: 'updateBed', id: d.beds[0].id, patch: { points: tri, closed: true } });
    const t = designTotals(d);
    expect(t.count).toBe(2);
    expect(t.areaSqFt).toBeGreaterThan(0);
  });
});

describe('transfer', () => {
  it('round-trips a design through the URL fragment without photo bytes', () => {
    let d = readyDesign();
    d = reducer(d, { type: 'updateBed', id: d.beds[0].id, patch: { points: tri, closed: true, photo: { name: 'x.jpg' } } });
    const url = transferUrl(d, 'https://example.github.io/planting-bed-designer/');
    const enc = new URL(url).hash.replace('#d=', '');
    const back = decodeDesign(enc);
    expect(back.beds[0].points).toEqual(tri);
    expect(back.beds[0].photo).toBeNull();
    expect(back.location.address).toBe('1 Main St');
    expect(back.stage).toBe(d.stage);
    expect(decodeDesign('garbage')).toBeNull();
    expect(encodeDesign(d).length).toBeLessThan(2000);
  });
  it('detects in-app browsers on iOS', () => {
    const safari = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
    const webview = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148';
    const chatgpt = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 ChatGPT/1.2024';
    const desktop = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36';
    expect(detectEnvironment(safari, {}).embedded).toBe(false);
    expect(detectEnvironment(webview, {}).embedded).toBe(true);
    expect(detectEnvironment(chatgpt, {}).embedded).toBe(true);
    expect(detectEnvironment(desktop, { maxTouchPoints: 0 }).embedded).toBe(false);
  });
});
