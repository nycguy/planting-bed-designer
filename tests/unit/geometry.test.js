import { describe, it, expect } from 'vitest';
import {
  distanceMeters, areaSquareMeters, perimeterMeters, sideLengths, setSideLength,
  metersToFeet, feetToMeters, sqMetersToSqFeet, summarize, isSelfIntersecting, fromLocal, toLocal,
} from '../../src/lib/geometry.js';

// A rectangle roughly 10 m (E-W) by 6 m (N-S) near Richmond, VA.
const origin = [37.5407, -77.4360];
const rect = [
  origin,
  fromLocal(origin, { x: 10, y: 0 }),
  fromLocal(origin, { x: 10, y: 6 }),
  fromLocal(origin, { x: 0, y: 6 }),
];

describe('distances', () => {
  it('haversine matches local projection at bed scale', () => {
    expect(distanceMeters(rect[0], rect[1])).toBeCloseTo(10, 3);
    expect(distanceMeters(rect[1], rect[2])).toBeCloseTo(6, 3);
  });
  it('round-trips local <-> geographic', () => {
    const p = fromLocal(origin, { x: 3.3, y: -4.4 });
    const l = toLocal(origin, p);
    expect(l.x).toBeCloseTo(3.3, 6);
    expect(l.y).toBeCloseTo(-4.4, 6);
  });
  it('converts units', () => {
    expect(metersToFeet(1)).toBeCloseTo(3.28084, 5);
    expect(feetToMeters(metersToFeet(7))).toBeCloseTo(7, 9);
    expect(sqMetersToSqFeet(1)).toBeCloseTo(10.7639, 3);
  });
});

describe('polygon measurements', () => {
  it('computes area and perimeter of a rectangle', () => {
    expect(areaSquareMeters(rect)).toBeCloseTo(60, 2);
    expect(perimeterMeters(rect)).toBeCloseTo(32, 2);
    expect(sideLengths(rect)).toHaveLength(4);
  });
  it('returns zero for fewer than three points', () => {
    expect(areaSquareMeters(rect.slice(0, 2))).toBe(0);
    expect(perimeterMeters(rect.slice(0, 2))).toBe(0);
  });
  it('summarize reports feet', () => {
    const s = summarize(rect);
    expect(s.areaSqFt).toBeCloseTo(60 * 10.7639, 1);
    expect(s.perimeterFt).toBeCloseTo(32 * 3.28084, 2);
    expect(s.sidesFt[0]).toBeCloseTo(32.8084, 2);
    expect(s.pointCount).toBe(4);
  });
  it('detects self-intersection (bow-tie)', () => {
    const bow = [rect[0], rect[2], rect[1], rect[3]];
    expect(isSelfIntersecting(bow)).toBe(true);
    expect(isSelfIntersecting(rect)).toBe(false);
  });
});

describe('side length editing', () => {
  it('keeps the start point fixed and moves the end point along the bearing', () => {
    const out = setSideLength(rect, 0, 15);
    expect(out[0]).toEqual(rect[0]);
    expect(distanceMeters(out[0], out[1])).toBeCloseTo(15, 3);
    // still due east
    const l = toLocal(rect[0], out[1]);
    expect(l.y).toBeCloseTo(0, 3);
    expect(l.x).toBeCloseTo(15, 3);
  });
  it('changes adjacent side and area, not unrelated sides', () => {
    const out = setSideLength(rect, 0, 15);
    const before = sideLengths(rect), after = sideLengths(out);
    expect(after[0]).toBeCloseTo(15, 3);
    expect(after[1]).not.toBeCloseTo(before[1], 1); // adjacent side stretched
    expect(after[2]).toBeCloseTo(before[2], 3); // opposite side unchanged
    expect(areaSquareMeters(out)).toBeGreaterThan(areaSquareMeters(rect));
  });
  it('wraps around on the closing side', () => {
    const out = setSideLength(rect, 3, 9);
    expect(distanceMeters(out[3], out[0])).toBeCloseTo(9, 3);
    expect(out[3]).toEqual(rect[3]);
  });
  it('ignores invalid lengths', () => {
    expect(setSideLength(rect, 0, 0)).toEqual(rect);
  });
});
