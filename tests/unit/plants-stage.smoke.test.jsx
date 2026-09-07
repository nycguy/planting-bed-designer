// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';

vi.mock('leaflet/dist/leaflet.css', () => ({}));
// jsdom has no SVG renderer for Leaflet vector layers; the map itself is
// covered by the Playwright suite. Stand in a plain div here.
vi.mock('../../src/components/MapView.jsx', () => ({
  default: React.forwardRef(function MapStub(props, ref) {
    React.useImperativeHandle(ref, () => ({ fitPoints: () => {}, flyTo: () => {}, invalidate: () => {} }));
    return React.createElement('div', { className: 'leaflet-container', 'data-mode': props.mode, 'data-plants': (props.plants || []).length });
  }),
}));

function design() {
  const sq = [[41.2, -73.7], [41.2001, -73.7], [41.2001, -73.7001], [41.2, -73.7001]];
  return {
    version: 1, id: 'd1', createdAt: new Date().toISOString(), stage: 'plants', bedCount: 1,
    beds: [{ id: 'b1', number: 1, name: 'Bed 1', color: '#FF7A00', points: sq, closed: true, sun: 'full', photo: null }],
    location: { address: '10 Elm St', lat: 41.20005, lng: -73.70005, zoom: 19, imagery: 'nys' },
    reviewed: true, photosDone: true, completed: false,
    zone: { zone: '6b', tempRange: '-5 to 0', zip: '10549', source: 'test', manual: false },
    plants: [{ id: 'p1', plantId: 'hosta', category: 'flower', lat: 41.20005, lng: -73.70005, bedId: 'b1' }],
  };
}

describe('PlantsStage', () => {
  it('lists zone-appropriate plants and reports what is placed', async () => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    const { default: PlantsStage } = await import('../../src/components/PlantsStage.jsx');
    const el = document.createElement('div');
    document.body.appendChild(el);
    const dispatch = vi.fn();
    await act(async () => {
      createRoot(el).render(React.createElement(PlantsStage, { design: design(), dispatch }));
    });
    expect(el.textContent).toContain('Zone 6b');
    expect(el.querySelector('[data-testid="plant-acer-rubrum"]')).toBeTruthy(); // zone 3–9 tree
    expect(el.querySelector('[data-testid="plant-lagerstroemia"]')).toBeNull(); // zone 7–9, excluded
    expect(el.textContent).toContain('1 × Hosta');
    // Hosta in a full-sun bed trips the light check.
    expect(el.querySelector('[data-testid="light-check"]').textContent).toContain('Hosta in Bed 1');
    // Coverage line is shown for the bed.
    expect(el.textContent).toMatch(/\d+% covered at maturity/);
    // Filters: deer resistance removes hosta from the flower list.
    await act(async () => {
      el.querySelector('[role="tab"][aria-selected="false"]:nth-of-type(3)')?.click();
    });
    await act(async () => {
      [...el.querySelectorAll('[role="tab"]')].find((t) => t.textContent.startsWith('Flowers')).click();
    });
    expect(el.querySelector('[data-testid="plant-hosta"]')).toBeTruthy();
    await act(async () => {
      el.querySelector('[data-testid="filter-deer"]').click();
    });
    expect(el.querySelector('[data-testid="plant-hosta"]')).toBeNull();
    expect(el.querySelector('[data-testid="plant-helleborus"]')).toBeTruthy();
    await act(async () => {
      el.querySelector('[data-testid="filter-deer"]').click();
      [...el.querySelectorAll('[role="tab"]')].find((t) => t.textContent.startsWith('Trees')).click();
    });
    // Choosing a plant enters placing mode.
    await act(async () => {
      el.querySelector('[data-testid="plant-acer-rubrum"]').click();
    });
    expect(el.querySelector('.map-banner').textContent).toContain('Tap the map to place Red Maple');
    // Finishing marks the design complete.
    await act(async () => {
      el.querySelector('[data-testid="finish-design"]').click();
    });
    expect(dispatch).toHaveBeenCalledWith({ type: 'setCompleted', value: true });
    expect(dispatch).toHaveBeenCalledWith({ type: 'setStage', stage: 'complete' });
  });
});
