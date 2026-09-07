// Geometry for small residential polygons.
// Points are [lat, lng]. Internally we project to a local east/north plane
// (meters) centered on the polygon; at bed scale the error is far below the
// uncertainty of the imagery itself.

const R = 6371008.8; // mean Earth radius, meters
const FT_PER_M = 3.28084;
const rad = (d) => (d * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;

export const metersToFeet = (m) => m * FT_PER_M;
export const feetToMeters = (ft) => ft / FT_PER_M;
export const sqMetersToSqFeet = (m2) => m2 * FT_PER_M * FT_PER_M;

/** Haversine distance in meters between two [lat, lng] points. */
export function distanceMeters(a, b) {
  const dLat = rad(b[0] - a[0]);
  const dLng = rad(b[1] - a[1]);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

/** Local planar projection around an origin [lat, lng]. Returns {x, y} meters. */
export function toLocal(origin, p) {
  const cosLat = Math.cos(rad(origin[0]));
  return {
    x: rad(p[1] - origin[1]) * R * cosLat,
    y: rad(p[0] - origin[0]) * R,
  };
}

export function fromLocal(origin, { x, y }) {
  const cosLat = Math.cos(rad(origin[0]));
  return [origin[0] + deg(y / R), origin[1] + deg(x / (R * cosLat))];
}

export function centroid(points) {
  if (!points.length) return [0, 0];
  const lat = points.reduce((s, p) => s + p[0], 0) / points.length;
  const lng = points.reduce((s, p) => s + p[1], 0) / points.length;
  return [lat, lng];
}

/** Lengths of each side (meters) for a closed polygon. side i runs from point i to point i+1. */
export function sideLengths(points) {
  const n = points.length;
  if (n < 2) return [];
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = points[i];
    const b = points[(i + 1) % n];
    if (n === 2 && i === 1) break; // open two-point line has one side
    out.push(distanceMeters(a, b));
  }
  return out;
}

/** Perimeter of a closed polygon in meters. */
export function perimeterMeters(points) {
  if (points.length < 3) return 0;
  return sideLengths(points).reduce((s, l) => s + l, 0);
}

/** Shoelace area in square meters using a local plane. */
export function areaSquareMeters(points) {
  if (points.length < 3) return 0;
  const o = centroid(points);
  const loc = points.map((p) => toLocal(o, p));
  let a = 0;
  for (let i = 0; i < loc.length; i++) {
    const p = loc[i];
    const q = loc[(i + 1) % loc.length];
    a += p.x * q.y - q.x * p.y;
  }
  return Math.abs(a) / 2;
}

/** Midpoint of side i (between point i and i+1). */
export function midpoint(points, i) {
  const a = points[i];
  const b = points[(i + 1) % points.length];
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
}

/**
 * Set the length of side i to `meters`. Point i stays fixed; point i+1 slides
 * along the existing bearing of the side. Returns a new points array.
 */
export function setSideLength(points, i, meters) {
  const n = points.length;
  if (n < 2 || meters <= 0) return points.slice();
  const a = points[i];
  const bIdx = (i + 1) % n;
  const b = points[bIdx];
  const o = a;
  const lb = toLocal(o, b);
  const cur = Math.hypot(lb.x, lb.y);
  if (cur === 0) return points.slice();
  const k = meters / cur;
  const nb = fromLocal(o, { x: lb.x * k, y: lb.y * k });
  const out = points.slice();
  out[bIdx] = nb;
  return out;
}

/** Simple self-intersection check (O(n^2)), used to warn the user. */
export function isSelfIntersecting(points) {
  const n = points.length;
  if (n < 4) return false;
  const o = centroid(points);
  const l = points.map((p) => toLocal(o, p));
  const seg = (i) => [l[i], l[(i + 1) % n]];
  const cross = (p, q, r) => (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
  const intersects = ([p1, p2], [p3, p4]) => {
    const d1 = cross(p3, p4, p1), d2 = cross(p3, p4, p2);
    const d3 = cross(p1, p2, p3), d4 = cross(p1, p2, p4);
    return d1 * d2 < 0 && d3 * d4 < 0;
  };
  for (let i = 0; i < n; i++) {
    for (let j = i + 2; j < n; j++) {
      if (i === 0 && j === n - 1) continue; // adjacent via wraparound
      if (intersects(seg(i), seg(j))) return true;
    }
  }
  return false;
}

export function summarize(points) {
  const sidesM = points.length >= 3 ? sideLengths(points) : [];
  return {
    sidesFt: sidesM.map(metersToFeet),
    perimeterFt: metersToFeet(perimeterMeters(points)),
    areaSqFt: sqMetersToSqFeet(areaSquareMeters(points)),
    pointCount: points.length,
  };
}

export const fmtFt = (ft) => `${ft.toFixed(1)} ft`;
export const fmtSqFt = (sf) => `${Math.round(sf).toLocaleString()} sq ft`;
