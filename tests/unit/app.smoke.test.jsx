// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';

vi.mock('leaflet/dist/leaflet.css', () => ({}));

describe('App smoke test', () => {
  it('mounts on the Beds stage with the bed-count question', async () => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    const { default: App } = await import('../../src/App.jsx');
    const el = document.createElement('div');
    document.body.appendChild(el);
    await act(async () => {
      createRoot(el).render(React.createElement(App));
    });
    expect(el.textContent).toContain('How many planting beds do you want to design?');
    expect(el.querySelectorAll('input[type=file]').length).toBe(0);
    // Stage rail shows all six stages; only Beds is reachable at the start.
    const rail = [...el.querySelectorAll('.stagerail button')];
    expect(rail.map((b) => b.textContent)).toEqual(['Beds', 'Location', 'Sketch', 'Review', 'Photos', 'Complete']);
    expect(rail.slice(1).every((b) => b.disabled)).toBe(true);
  });
});
