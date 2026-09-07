import { lazy, Suspense, useState } from 'react';

// Rendering of the design: a scaled plan drawing, loaded on demand.
const PlanDrawingPanel = lazy(() => import('./PlanDrawing.jsx').then((m) => ({ default: m.PlanDrawingPanel })));

export default function Visualize({ design, defaultTab = null }) {
  const [tab, setTab] = useState(defaultTab); // null | 'plan'
  const hasBeds = design.beds.some((b) => b.closed && b.points.length >= 3);
  if (!hasBeds) return null;
  return (
    <section className="visualize" aria-label="Visualize the design">
      <h2 style={{ fontSize: 20, margin: '14px 0 6px' }}>See the design</h2>
      <div className="btn-row no-print" style={{ margin: '0 0 6px' }}>
        <button type="button" className={`btn btn-sm ${tab === 'plan' ? 'btn-primary' : ''}`} onClick={() => setTab(tab === 'plan' ? null : 'plan')} data-testid="tab-plan" aria-expanded={tab === 'plan'}>
          {tab === 'plan' ? 'Hide plan drawing' : 'Show plan drawing'}
        </button>
      </div>
      {!tab && <p className="hint no-print">A plan drawing at true scale: bed shapes, every plant as a canopy symbol at mature spread, and a keyed plant list. Download as PNG or SVG.</p>}
      <Suspense fallback={<p className="hint">Loading…</p>}>{tab === 'plan' && <PlanDrawingPanel design={design} />}</Suspense>
    </section>
  );
}
