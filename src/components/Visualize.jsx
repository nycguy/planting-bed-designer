import { lazy, Suspense, useState } from 'react';

// Renderings of the design: a scaled plan drawing and a 3D massing view.
// Both are loaded on demand so the main app stays small.
const PlanDrawingPanel = lazy(() => import('./PlanDrawing.jsx').then((m) => ({ default: m.PlanDrawingPanel })));
const Scene3DPanel = lazy(() => import('./Scene3D.jsx').then((m) => ({ default: m.Scene3DPanel })));

export default function Visualize({ design, defaultTab = null }) {
  const [tab, setTab] = useState(defaultTab); // null | 'plan' | '3d'
  const hasBeds = design.beds.some((b) => b.closed && b.points.length >= 3);
  if (!hasBeds) return null;
  return (
    <section className="visualize" aria-label="Visualize the design">
      <h2 style={{ fontSize: 20, margin: '14px 0 6px' }}>See the design</h2>
      <div className="segmented no-print" role="tablist" aria-label="Rendering">
        <button type="button" role="tab" aria-selected={tab === 'plan'} className={`seg ${tab === 'plan' ? 'on' : ''}`} onClick={() => setTab(tab === 'plan' ? null : 'plan')} data-testid="tab-plan">
          Plan drawing
        </button>
        <button type="button" role="tab" aria-selected={tab === '3d'} className={`seg ${tab === '3d' ? 'on' : ''}`} onClick={() => setTab(tab === '3d' ? null : '3d')} data-testid="tab-3d">
          3D view
        </button>
      </div>
      {!tab && <p className="hint no-print">A plan drawing at true scale with a keyed plant list, or a 3D view you can orbit at eye level. Both use the exact bed shapes, plant positions, and mature sizes.</p>}
      <Suspense fallback={<p className="hint">Loading…</p>}>
        {tab === 'plan' && <PlanDrawingPanel design={design} />}
        {tab === '3d' && <Scene3DPanel design={design} />}
      </Suspense>
    </section>
  );
}
