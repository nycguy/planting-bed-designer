import { describe, it, expect } from 'vitest';
import { IMAGERY, DEFAULT_IMAGERY, imageryById, imageryCovers, bestImageryFor } from '../../src/lib/mapServices.js';

describe('imagery sources', () => {
  it('defaults to New York State orthoimagery', () => {
    expect(DEFAULT_IMAGERY).toBe('nys');
    expect(imageryById('nys').type).toBe('arcgis-export');
  });
  it('uses NYS imagery for a New York address', () => {
    // Mount Kisco, NY
    expect(bestImageryFor(41.204, -73.727)).toBe('nys');
  });
  it('falls back to a worldwide source outside New York', () => {
    // Richmond, VA
    const id = bestImageryFor(37.54, -77.43);
    expect(id).not.toBe('nys');
    expect(imageryById(id).bounds).toBeUndefined();
  });
  it('treats sources without bounds as worldwide', () => {
    expect(imageryCovers(imageryById('esri'), -33.9, 151.2)).toBe(true);
    expect(imageryCovers(imageryById('nys'), -33.9, 151.2)).toBe(false);
  });
  it('every source has the fields MapView needs', () => {
    for (const s of IMAGERY) {
      expect(s.id && s.name && s.url && s.type).toBeTruthy();
      expect(s.maxNativeZoom).toBeGreaterThan(10);
    }
  });
});
