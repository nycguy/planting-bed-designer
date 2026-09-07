// Shared model for the plan drawing and the 3D view.
//
// Both renderers work in a local east/north frame in meters, centered on
// the beds, so that geometry is drawn at true scale regardless of latitude.

import { plantById, categoryById, YEARS_TO_MATURE } from '../data/plants.js';
import { pointInPolygon } from './geometry.js';

export const FT = 0.3048;

// Build a local frame: returns { toLocal([lat,lng]) -> {x east, y north} m, center, bbox }.
export function localFrame(design, marginM = 6) {
  const pts = design.beds.flatMap((b) => b.points);
  const plantPts = (design.plants || []).map((p) => [p.lat, p.lng]);
  const all = [...pts, ...plantPts];
  if (!all.length) return null;
  const lat0 = all.reduce((a, p) => a + p[0], 0) / all.length;
  const lng0 = all.reduce((a, p) => a + p[1], 0) / all.length;
  const kx = 111320 * Math.cos((lat0 * Math.PI) / 180);
  const ky = 111320;
  const toLocal = ([lat, lng]) => ({ x: (lng - lng0) * kx, y: (lat - lat0) * ky });
  const fromLocal = ({ x, y }) => [lat0 + y / ky, lng0 + x / kx];
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const grow = (x, y, r = 0) => {
    minX = Math.min(minX, x - r);
    maxX = Math.max(maxX, x + r);
    minY = Math.min(minY, y - r);
    maxY = Math.max(maxY, y + r);
  };
  for (const p of pts) {
    const l = toLocal(p);
    grow(l.x, l.y);
  }
  for (const p of design.plants || []) {
    const l = toLocal([p.lat, p.lng]);
    const info = plantById(p.plantId);
    grow(l.x, l.y, ((p.spreadFt || info?.spreadFt || 2) * FT) / 2);
  }
  minX -= marginM;
  minY -= marginM;
  maxX += marginM;
  maxY += marginM;
  return { toLocal, fromLocal, center: [lat0, lng0], bbox: { minX, minY, maxX, maxY, w: maxX - minX, h: maxY - minY } };
}

// Deterministic pseudo-random in [0,1).
export function seeded(str, i = 0) {
  let h = 2166136261 ^ i;
  for (let k = 0; k < str.length; k++) {
    h ^= str.charCodeAt(k);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}

const CONIFER = /^(Picea|Pinus|Thuja|Juniperus|Tsuga|Abies|Chamaecyparis|Microbiota|Taxus)\b/;
const BROADLEAF_EVERGREEN = /^(Ilex|Buxus|Kalmia|Pieris|Prunus laurocerasus|Rhododendron|Helleborus|Liriope|Polystichum)\b/;

export function plantForm(info) {
  if (!info) return 'shrub';
  if (info.category === 'existing') return info.id === 'existing-tree' ? 'tree' : info.id === 'existing-shrub' ? 'shrub' : 'hardscape';
  if (info.category === 'tree') return CONIFER.test(info.botanical) ? 'conifer' : 'tree';
  if (info.category === 'shrub') return CONIFER.test(info.botanical) && info.heightFt <= 2 ? 'groundcover' : 'shrub';
  if (info.category === 'grass') return 'grass';
  return 'flower';
}

export function isEvergreen(info) {
  if (!info) return false;
  return CONIFER.test(info.botanical) || BROADLEAF_EVERGREEN.test(info.botanical) || /evergreen/i.test(info.notes || '');
}

// Foliage color by form, with a little per-plant variation.
export function foliageColor(info, seed = '') {
  const f = plantForm(info);
  const v = (seeded(seed, 7) - 0.5) * 0.12;
  const shade = (h, s, l) => `hsl(${h}, ${Math.round(s * 100)}%, ${Math.round((l + v) * 100)}%)`;
  if (f === 'conifer') return shade(150, 0.35, 0.28);
  if (f === 'tree') return /purple|Black Lace|Crimson/i.test(info.notes || info.botanical) ? shade(345, 0.25, 0.28) : shade(110, 0.4, 0.4);
  if (f === 'shrub') return /purple|Wine|Black Lace|Ninebark/i.test(info.notes || info.name) ? shade(340, 0.3, 0.3) : shade(120, 0.38, 0.42);
  if (f === 'groundcover') return shade(140, 0.35, 0.36);
  if (f === 'grass') return shade(75, 0.45, 0.5);
  if (f === 'hardscape') return 'hsl(0, 0%, 62%)';
  return shade(100, 0.4, 0.45);
}

export function inBloom(info, month) {
  return !!(info?.bloom && month >= info.bloom[0] && month <= info.bloom[1]);
}

// Size at a given age (years; null = mature), in meters.
export function sizeAt(info, instance, years) {
  const spreadFt = instance?.spreadFt || info?.spreadFt || 2;
  const heightFt = info?.heightFt || 2;
  const yrs = YEARS_TO_MATURE[info?.category] || 0;
  const f = years == null || !yrs ? 1 : Math.max(0.12, Math.min(1, years / yrs));
  return { spread: spreadFt * FT * f, height: heightFt * FT * f };
}

// Plant instances resolved into local coordinates with their info.
export function scenePlants(design, frame) {
  return (design.plants || [])
    .map((p) => {
      const info = plantById(p.plantId);
      if (!info) return null;
      const l = frame.toLocal([p.lat, p.lng]);
      return { ...p, info, x: l.x, y: l.y, form: plantForm(info), cat: categoryById(info.category) };
    })
    .filter(Boolean);
}

export function sceneBeds(design, frame) {
  return design.beds
    .filter((b) => b.closed && b.points.length >= 3)
    .map((b) => ({ ...b, local: b.points.map((p) => frame.toLocal(p)) }));
}

export { pointInPolygon };
