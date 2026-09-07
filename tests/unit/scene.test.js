// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { localFrame, plantForm, sizeAt, inBloom, foliageColor, FT } from '../../src/lib/scene.js';
import { plantById, PLANTS } from '../../src/data/plants.js';
import { newDesign, reducer } from '../../src/lib/design.js';

vi.mock('leaflet/dist/leaflet.css', () => ({}));

function sample() {
  let d = { ...newDesign(), bedCount: 1 };
  d = reducer(d, { type: 'confirmBeds' });
  d = reducer(d, { type: 'setLocation', location: { address: '10 Elm St', lat: 41.2, lng: -73.7, zoom: 19, imagery: 'nys' } });
  // ~10 m x 6 m rectangle
  const sq = [[41.2, -73.7], [41.20009, -73.7], [41.20009, -73.70007], [41.2, -73.70007]];
  d = reducer(d, { type: 'updateBed', id: d.beds[0].id, patch: { points: sq, closed: true } });
  const bed = d.beds[0].id;
  d = reducer(d, { type: 'addPlant', plant: { id: 'a', plantId: 'cornus-kousa', category: 'tree', lat: 41.20004, lng: -73.70003, bedId: bed } });
  d = reducer(d, { type: 'addPlant', plant: { id: 'b', plantId: 'hydrangea-paniculata', category: 'shrub', lat: 41.20002, lng: -73.70005, bedId: bed } });
  d = reducer(d, { type: 'addPlant', plant: { id: 'c', plantId: 'hosta', category: 'flower', lat: 41.20006, lng: -73.70002, bedId: bed } });
  d = reducer(d, { type: 'addPlant', plant: { id: 'd', plantId: 'picea-abies', category: 'tree', lat: 41.20007, lng: -73.70006, bedId: bed } });
  d = reducer(d, { type: 'addPlant', plant: { id: 'e', plantId: 'existing-feature', category: 'existing', lat: 41.20001, lng: -73.70001, bedId: bed, spreadFt: 6 } });
  return d;
}

describe('scene model', () => {
  it('builds a metric local frame centered on the design', () => {
    const d = sample();
    const f = localFrame(d, 0);
    const p0 = f.toLocal(d.beds[0].points[0]);
    const p1 = f.toLocal(d.beds[0].points[1]);
    // 0.00009 deg lat ≈ 10 m north
    expect(p1.y - p0.y).toBeCloseTo(10.02, 1);
    expect(p1.x - p0.x).toBeCloseTo(0, 5);
    const back = f.fromLocal(p0);
    expect(back[0]).toBeCloseTo(41.2, 8);
    expect(f.bbox.w).toBeGreaterThan(5);
  });
  it('classifies plant forms', () => {
    expect(plantForm(plantById('picea-abies'))).toBe('conifer');
    expect(plantForm(plantById('cornus-kousa'))).toBe('tree');
    expect(plantForm(plantById('hydrangea-paniculata'))).toBe('shrub');
    expect(plantForm(plantById('panicum'))).toBe('grass');
    expect(plantForm(plantById('hosta'))).toBe('flower');
    expect(plantForm(plantById('microbiota'))).toBe('groundcover');
    expect(plantForm(plantById('existing-feature'))).toBe('hardscape');
    for (const p of PLANTS) expect(['tree', 'conifer', 'shrub', 'groundcover', 'grass', 'flower']).toContain(plantForm(p));
  });
  it('scales size by age and reports bloom by month', () => {
    const k = plantById('cornus-kousa');
    expect(sizeAt(k, null, null).spread).toBeCloseTo(25 * FT, 5);
    expect(sizeAt(k, null, 5).spread).toBeCloseTo((25 * FT * 5) / 15, 5);
    expect(sizeAt(plantById('existing-tree'), { spreadFt: 40 }, 1).spread).toBeCloseTo(40 * FT, 5); // existing never grows
    expect(inBloom(k, 6)).toBe(true);
    expect(inBloom(k, 9)).toBe(false);
    expect(foliageColor(k, 'x')).toMatch(/^hsl/);
  });
});

describe('plan drawing', () => {
  it('renders an SVG with beds, one symbol per plant, and a key', async () => {
    const { default: PlanDrawing, buildPlan } = await import('../../src/components/PlanDrawing.jsx');
    const d = sample();
    const plan = buildPlan(d, { years: null, month: 6 });
    expect(plan.plants).toHaveLength(5);
    expect(plan.key.map((k) => k.info.id).sort()).toEqual(['cornus-kousa', 'hosta', 'hydrangea-paniculata', 'picea-abies']); // existing not keyed
    // Kousa radius: 25 ft spread → 12.5 ft → 3.81 m → *40 px
    const kousa = plan.plants.find((p) => p.id === 'a');
    expect(kousa.r).toBeCloseTo(3.81 * 40, 0);
    const html = renderToStaticMarkup(React.createElement(PlanDrawing, { design: d }));
    expect(html).toContain('<svg');
    expect(html).toContain('Plant key');
    expect(html).toContain('Kousa Dogwood');
    expect((html.match(/<path /g) || []).length).toBeGreaterThan(5);
    expect(html).toContain('10 ft'); // scale bar
  });
});
