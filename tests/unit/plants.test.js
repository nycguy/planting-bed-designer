import { describe, it, expect } from 'vitest';
import { PLANTS, CATEGORIES, searchPlants, suitableForZone, zoneNumber, plantById } from '../../src/data/plants.js';
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
    for (const c of CATEGORIES) expect(PLANTS.filter((p) => p.category === c.id).length).toBeGreaterThan(30);
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
