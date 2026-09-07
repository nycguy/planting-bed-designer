import { summarize } from './geometry.js';
import { bestImageryFor } from './mapServices.js';

export const STAGES = ['beds', 'location', 'sketch', 'review', 'photos', 'plants', 'complete'];
export const STAGE_LABELS = {
  beds: 'Beds',
  location: 'Location',
  sketch: 'Sketch',
  review: 'Review',
  photos: 'Photos',
  plants: 'Plants',
  complete: 'Complete',
};

// Twelve colors chosen to stay distinct from each other and from the greens,
// grays, and tans that dominate aerial imagery.
export const BED_COLORS = [
  '#FF7A00', // orange
  '#1E90FF', // blue
  '#E5007D', // magenta
  '#FFD400', // yellow
  '#00C2D1', // cyan
  '#B4FF00', // lime
  '#9B5DE5', // violet
  '#FF2E2E', // red
  '#FF9EC4', // pink
  '#00E68A', // mint
  '#FFB347', // apricot
  '#7FDBFF', // sky
];

export const DESIGN_VERSION = 1;

export function upgradeDesign(d) {
  if (!d) return d;
  let location = d.location;
  // Designs saved before New York State orthoimagery was added default to
  // Esri. Move them to the best source for their location once; the user
  // can still switch back from the imagery menu.
  if (location && !location.imageryChosen) {
    const best = bestImageryFor(location.lat, location.lng);
    if (best !== location.imagery) location = { ...location, imagery: best };
  }
  return { ...d, location, photosDone: d.photosDone ?? (d.completed || d.stage === 'complete' || false), zone: d.zone ?? null, plants: Array.isArray(d.plants) ? d.plants : [] };
}

export function newDesign() {
  return {
    version: DESIGN_VERSION,
    id: cryptoId(),
    createdAt: new Date().toISOString(),
    stage: 'beds',
    bedCount: 3,
    beds: [],
    location: null, // { address, lat, lng, zoom, imagery }
    reviewed: false,
    photosDone: false, // user moved past the optional Photos stage
    completed: false,
    zone: null, // { zone, tempRange, zip, source, fetchedAt, manual }
    plants: [], // { id, plantId, category, lat, lng, bedId }
  };
}

export function cryptoId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function makeBeds(count, existing = []) {
  const beds = [];
  for (let i = 0; i < count; i++) {
    const prev = existing[i];
    beds.push(
      prev || {
        id: cryptoId(),
        number: i + 1,
        name: `Bed ${i + 1}`,
        color: BED_COLORS[i % BED_COLORS.length],
        points: [],
        closed: false,
        sun: null, // 'full' | 'part' | 'shade' — set at Review
        photo: null, // { name, type, unavailable: bool, note: string } — image bytes live in IndexedDB
      },
    );
  }
  return beds;
}

export function bedStatus(bed, design) {
  if (bed.photo?.unavailable || (bed.photo && !bed.photo.unavailable)) return 'Complete';
  if (design.reviewed && bed.closed && bed.points.length >= 3) return design.photosDone ? 'Reviewed' : 'Photo Optional';
  if (bed.closed && bed.points.length >= 3) return design.reviewed ? 'Reviewed' : 'Ready for Review';
  if (bed.points.length > 0) return 'In Progress';
  return 'Not Started';
}

export function bedValid(bed) {
  return bed.closed && bed.points.length >= 3;
}

export function allBedsValid(design) {
  return design.beds.length > 0 && design.beds.every(bedValid);
}

export function bedSummary(bed) {
  return summarize(bed.points);
}

export function designTotals(design) {
  let area = 0, perimeter = 0;
  for (const b of design.beds) {
    if (!bedValid(b)) continue;
    const s = summarize(b.points);
    area += s.areaSqFt;
    perimeter += s.perimeterFt;
  }
  return { areaSqFt: area, perimeterFt: perimeter, count: design.beds.length };
}

export function photosDone(design) {
  return design.beds.filter((b) => b.photo && (b.photo.unavailable || b.photo.name !== undefined)).length;
}

export function allPhotosDone(design) {
  return design.beds.length > 0 && design.beds.every((b) => b.photo);
}

/** Furthest stage the user is allowed to reach given the current design. */
export function maxReachableStage(design) {
  if (!design.beds.length) return 'beds';
  if (!design.location) return 'location';
  if (!allBedsValid(design)) return 'sketch';
  if (!design.reviewed) return 'review';
  if (!design.photosDone) return 'photos';
  if (!design.completed) return 'plants';
  return 'complete';
}

export function canEnterStage(design, stage) {
  return STAGES.indexOf(stage) <= STAGES.indexOf(maxReachableStage(design));
}

export function reducer(design, action) {
  switch (action.type) {
    case 'replace':
      return action.design;
    case 'setStage':
      return { ...design, stage: action.stage };
    case 'setBedCount': {
      const count = Math.max(1, Math.min(12, action.count));
      return { ...design, bedCount: count };
    }
    case 'confirmBeds': {
      const beds = makeBeds(design.bedCount, design.beds);
      return { ...design, beds, stage: 'location' };
    }
    case 'setLocation':
      return { ...design, location: { ...design.location, ...action.location } };
    case 'updateBed': {
      const beds = design.beds.map((b) => (b.id === action.id ? { ...b, ...action.patch } : b));
      // Any geometry change un-reviews the design so the user re-confirms.
      const geometryChanged = 'points' in action.patch || 'closed' in action.patch;
      return { ...design, beds, reviewed: geometryChanged ? false : design.reviewed };
    }
    case 'setReviewed':
      return { ...design, reviewed: action.value };
    case 'setPhotosDone':
      return { ...design, photosDone: action.value };
    case 'setCompleted':
      return { ...design, completed: action.value };
    case 'setZone':
      return { ...design, zone: action.zone };
    case 'addPlant':
      return { ...design, plants: [...(design.plants || []), action.plant], completed: false };
    case 'movePlant':
      return { ...design, plants: (design.plants || []).map((p) => (p.id === action.id ? { ...p, lat: action.lat, lng: action.lng, bedId: action.bedId ?? p.bedId } : p)) };
    case 'removePlant':
      return { ...design, plants: (design.plants || []).filter((p) => p.id !== action.id), completed: false };
    case 'clearPlants':
      return { ...design, plants: [], completed: false };
    case 'setPlants': // undo / redo
      return { ...design, plants: action.plants, completed: false };
    case 'updatePlant':
      return { ...design, plants: (design.plants || []).map((p) => (p.id === action.id ? { ...p, ...action.patch } : p)) };
    case 'addBed': {
      if (design.beds.length >= 12) return design;
      const n = design.beds.length + 1;
      const bed = { id: action.id || cryptoId(), number: n, name: `Bed ${n}`, color: BED_COLORS[(n - 1) % BED_COLORS.length], points: [], closed: false, sun: null, photo: null };
      return { ...design, beds: [...design.beds, bed], bedCount: n, reviewed: false, completed: false };
    }
    case 'removeBed': {
      if (design.beds.length <= 1) return design;
      const beds = design.beds.filter((b) => b.id !== action.id).map((b, i) => ({ ...b, number: i + 1, name: /^Bed \d+$/.test(b.name) ? `Bed ${i + 1}` : b.name, color: BED_COLORS[i % BED_COLORS.length] }));
      const plants = (design.plants || []).map((p) => (p.bedId === action.id ? { ...p, bedId: null } : p));
      return { ...design, beds, plants, bedCount: beds.length, completed: false };
    }
    case 'setBedSun':
      return { ...design, beds: design.beds.map((b) => (b.id === action.id ? { ...b, sun: action.sun } : b)) };
    default:
      return design;
  }
}

// Planted footprint per bed, as a share of bed area, using mature spread.
export function bedCoverage(design, bed, footprint) {
  const s = summarize(bed.points);
  const list = (design.plants || []).filter((p) => p.bedId === bed.id && p.category !== 'existing');
  const planted = list.reduce((a, p) => a + footprint(p), 0);
  return { areaSqFt: s.areaSqFt, plantedSqFt: planted, ratio: s.areaSqFt > 0 ? planted / s.areaSqFt : 0, count: list.length };
}
