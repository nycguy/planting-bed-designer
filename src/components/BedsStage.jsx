import { BED_COLORS } from '../lib/design.js';

export default function BedsStage({ design, dispatch }) {
  const n = design.bedCount;
  const set = (v) => dispatch({ type: 'setBedCount', count: Number.isFinite(v) ? v : 1 });
  const hasBeds = design.beds.length > 0;
  return (
    <div className="page">
      <h1>How many planting beds do you want to design?</h1>
      <p>You can name each bed later. Choose between 1 and 12.</p>
      <div className="counter" role="group" aria-label="Number of beds">
        <button type="button" className="btn" onClick={() => set(n - 1)} disabled={n <= 1} aria-label="One fewer bed">
          −
        </button>
        <input
          className="input"
          type="number"
          inputMode="numeric"
          min={1}
          max={12}
          value={n}
          aria-label="Number of beds"
          onChange={(e) => set(parseInt(e.target.value, 10))}
        />
        <button type="button" className="btn" onClick={() => set(n + 1)} disabled={n >= 12} aria-label="One more bed">
          +
        </button>
      </div>
      <p>Each bed gets its own color, used on the map, in measurements, and in the final report.</p>
      <div className="swatches" aria-hidden="true">
        {Array.from({ length: n }, (_, i) => (
          <span key={i} style={{ background: BED_COLORS[i % BED_COLORS.length] }}>
            {i + 1}
          </span>
        ))}
      </div>
      {hasBeds && n < design.beds.length && (
        <div className="notice notice-warn" role="status">
          Reducing the count removes Bed {n + 1}
          {design.beds.length > n + 1 ? ` through Bed ${design.beds.length}` : ''} and any work on them.
        </div>
      )}
      <button type="button" className="btn btn-primary btn-block" onClick={() => dispatch({ type: 'confirmBeds' })}>
        {hasBeds ? 'Save and continue' : `Continue with ${n} bed${n === 1 ? '' : 's'}`}
      </button>
    </div>
  );
}
