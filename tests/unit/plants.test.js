import { describe, it, expect } from 'vitest';
import { PLANTS, CATEGORIES, EXISTING, searchPlants, suitableForZone, zoneNumber, plantById, sunCompatible, footprintSqFt } from '../../src/data/plants.js';
import { lookupTitle } from '../../src/lib/plantPhotos.js';
import { bedCoverage, reducer, newDesign } from '../../src/lib/design.js';
import { normalizeZip, manualZone, zoneLabel } from '../../src/lib/zones.js';
import { pointInPolygon, offsetMeters, distanceMeters } from '../../src/lib/geometry.js';
import { driftShape } from '../../src/components/MapView.jsx';

describe('plant list', () => {
  it('has well-formed entries in every category', () => {
    const ids = new Set();
    for (const p of PLANTS) {
      expect(ids.has(p.id)).toBe(false);
      ids.add(p.id);
      expect(CATEGORIES.some((c) => c.id === p.category)).toBe(true);
      expect(p.zoneMin).toBeLessThanOrEqual(p.zoneMax);
      expect(p.spreadFt).toBeGreaterThan(0);
      expect(p.heightFt).toBeGreaterThan(0);
      expect(p.botanical.length).toBeGreaterThan(3);
    }
    for (const c of CATEGORIES.filter((c) => c.id !== 'existing')) expect(PLANTS.filter((p) => p.category === c.id).length).toBeGreaterThan(30);
  });
  it('parses zone strings', () => {
    expect(zoneNumber('7a')).toBe(7);
    expect(zoneNumber('10b')).toBe(10);
    expect(zoneNumber(null)).toBeNull();
  });
  it('filters by zone', () => {
    const crape = plantById('lagerstroemia'); // zones 7–9
    expect(suitableForZone(crape, '6b')).toBe(false);
    expect(suitableForZone(crape, '7a')).toBe(true);
    const z6 = searchPlants({ category: 'tree', zone: '6b', query: '' });
    expect(z6.some((p) => p.id === 'lagerstroemia')).toBe(false);
    expect(z6.some((p) => p.id === 'acer-rubrum')).toBe(true);
    // No zone: everything in the category.
    expect(searchPlants({ category: 'tree', zone: null, query: '' }).length).toBe(PLANTS.filter((p) => p.category === 'tree').length);
  });
  it('searches name, botanical name, and notes', () => {
    expect(searchPlants({ category: 'shrub', zone: '6a', query: 'hydrangea' }).length).toBeGreaterThanOrEqual(3);
    expect(searchPlants({ category: 'flower', zone: '6a', query: 'echinacea' })[0].id).toBe('echinacea');
    expect(searchPlants({ category: 'flower', zone: '6a', query: 'monarch' })[0].id).toBe('asclepias-tuberosa');
  });
});

describe('zones', () => {
  it('normalizes ZIPs', () => {
    expect(normalizeZip('10549')).toBe('10549');
    expect(normalizeZip('10549-1234')).toBe('10549');
    expect(normalizeZip('K1A 0B1')).toBeNull();
  });
  it('labels manual zones', () => {
    const z = manualZone('6B');
    expect(z.zone).toBe('6b');
    expect(z.manual).toBe(true);
    expect(zoneLabel(z)).toBe('Zone 6b');
    expect(zoneLabel({ zone: '7a', tempRange: '0 to 5' })).toContain('0 to 5');
  });
});

describe('placement geometry', () => {
  const sq = [[41.2, -73.7], [41.2001, -73.7], [41.2001, -73.7001], [41.2, -73.7001]];
  it('finds points inside and outside a bed', () => {
    expect(pointInPolygon([41.20005, -73.70005], sq)).toBe(true);
    expect(pointInPolygon([41.2005, -73.70005], sq)).toBe(false);
  });
  it('builds an ~18 inch drift that is stable for a given id', () => {
    const c = [41.2, -73.7];
    const a = driftShape(c, 'plant-1');
    const b = driftShape(c, 'plant-1');
    expect(a).toEqual(b);
    expect(a).toHaveLength(10);
    const radii = a.map((p) => distanceMeters(c, p));
    const maxDiam = Math.max(...radii) * 2;
    expect(maxDiam).toBeGreaterThan(0.3);
    expect(maxDiam).toBeLessThan(0.75);
    expect(driftShape(c, 'plant-2')).not.toEqual(a);
  });
  it('offsets by meters', () => {
    const p = offsetMeters([41.2, -73.7], 10, 0);
    expect(distanceMeters([41.2, -73.7], p)).toBeCloseTo(10, 1);
  });
});


describe('light, native, deer filters', () => {
  it('matches plant light codes to bed exposure', () => {
    expect(sunCompatible(plantById('hosta'), 'shade')).toBe(true);
    expect(sunCompatible(plantById('hosta'), 'full')).toBe(false);
    expect(sunCompatible(plantById('clethra'), 'full')).toBe(true); // full-shade code
    expect(sunCompatible(plantById('echinacea'), null)).toBe(true); // no bed exposure set
  });
  it('filters by light, native, and deer resistance together', () => {
    const r = searchPlants({ category: 'flower', zone: '6b', sun: 'shade', nativeOnly: true, deerOnly: true });
    expect(r.length).toBeGreaterThan(0);
    for (const p of r) {
      expect(p.native).toBe(true);
      expect(p.deerResistant).toBe(true);
      expect(sunCompatible(p, 'shade')).toBe(true);
    }
    expect(r.some((p) => p.id === 'hosta')).toBe(false); // deer eat hosta
  });
  it('every plant carries the new fields', () => {
    for (const p of PLANTS) {
      expect(typeof p.native).toBe('boolean');
      expect(typeof p.deerResistant).toBe('boolean');
      if (p.bloom) {
        expect(p.bloom[0]).toBeGreaterThanOrEqual(1);
        expect(p.bloom[1]).toBeLessThanOrEqual(12);
        expect(p.bloom[0]).toBeLessThanOrEqual(p.bloom[1]);
        expect(p.bloomColor).toMatch(/^#/);
      }
    }
    expect(EXISTING.length).toBe(3);
    expect(searchPlants({ category: 'existing' })).toHaveLength(3);
  });
});

describe('coverage and footprints', () => {
  it('computes footprint area from spread, with flowers fixed at an 18 in. drift', () => {
    expect(footprintSqFt(plantById('buxus'))).toBeCloseTo(Math.PI * 1.5 * 1.5, 3); // 3 ft spread
    expect(footprintSqFt(plantById('existing-tree'), 20)).toBeCloseTo(Math.PI * 100, 3); // override
    expect(footprintSqFt(plantById('hosta'))).toBeCloseTo(Math.PI * 0.75 * 0.75, 3);
  });
  it('reports bed coverage and ignores existing features', () => {
    let d = { ...newDesign(), bedCount: 1 };
    d = reducer(d, { type: 'confirmBeds' });
    // ~10 m x 10 m square ≈ 1076 sq ft
    const sq = [[41.2, -73.7], [41.20009, -73.7], [41.20009, -73.70012], [41.2, -73.70012]];
    d = reducer(d, { type: 'updateBed', id: d.beds[0].id, patch: { points: sq, closed: true } });
    const bed = d.beds[0];
    d = reducer(d, { type: 'addPlant', plant: { id: 'a', plantId: 'hydrangea-paniculata', category: 'shrub', lat: 41.20004, lng: -73.70006, bedId: bed.id } });
    d = reducer(d, { type: 'addPlant', plant: { id: 'b', plantId: 'existing-tree', category: 'existing', lat: 41.20004, lng: -73.70006, bedId: bed.id, spreadFt: 40 } });
    const cov = bedCoverage(d, bed, (p) => footprintSqFt(plantById(p.plantId), p.spreadFt));
    expect(cov.count).toBe(1);
    expect(cov.plantedSqFt).toBeCloseTo(Math.PI * 9, 2); // 6 ft spread
    expect(cov.ratio).toBeGreaterThan(0.02);
    expect(cov.ratio).toBeLessThan(0.04);
  });
});

describe('Wikipedia title lookup', () => {
  it('reduces botanical names to genus and species', () => {
    expect(lookupTitle('Hydrangea paniculata (\u2018Limelight\u2019, \u2018Little Lime\u2019)')).toBe('Hydrangea paniculata');
    expect(lookupTitle('Thuja occidentalis \u2018Smaragd\u2019')).toBe('Thuja occidentalis');
    expect(lookupTitle('Picea glauca var. densata')).toBe('Picea glauca');
    expect(lookupTitle('Hydrangea × arendsii')).toBe('Hydrangea × arendsii');
    expect(lookupTitle('Rosa (Knock Out, Drift, Oso Easy)')).toBe('Rosa');
  });
});
