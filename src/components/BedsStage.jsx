import { useState } from 'react';
import { BED_COLORS } from '../lib/design.js';
import { readDesignFile } from '../lib/designFile.js';
import { listLibrary, removeFromLibrary } from '../lib/library.js';
import { upgradeDesign } from '../lib/design.js';

export default function BedsStage({ design, dispatch }) {
  const n = design.bedCount;
  const [openErr, setOpenErr] = useState(null);
  const [library, setLibrary] = useState(() => listLibrary());
  // The file input is created on demand rather than rendered, so the page
  // never contains a file input before the Photos stage.
  const openSavedDesign = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = async () => {
      const f = input.files?.[0];
      input.remove();
      if (!f) return;
      try {
        const d = await readDesignFile(f);
        setOpenErr(null);
        dispatch({ type: 'replace', design: d });
      } catch (err) {
        setOpenErr(err.message || 'The file could not be opened.');
      }
    };
    input.style.display = 'none';
    document.body.appendChild(input);
    input.click();
  };
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
      {library.length > 0 && (
        <>
          <div className="divider" />
          <h2 style={{ fontSize: 18, margin: '0 0 6px' }}>My designs</h2>
          <ul className="librarylist" data-testid="library">
            {library.map((e) => (
              <li key={e.id}>
                <button
                  type="button"
                  className="libraryrow"
                  onClick={() => {
                    const d = upgradeDesign({ ...e.design, stage: 'review', completed: false });
                    dispatch({ type: 'replace', design: d });
                  }}
                >
                  <b>{e.name}</b>
                  <small>
                    {e.address ? `${e.address} · ` : ''}
                    {e.beds} bed{e.beds === 1 ? '' : 's'}, {e.plants} plant{e.plants === 1 ? '' : 's'} · saved {new Date(e.savedAt).toLocaleDateString()}
                  </small>
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  aria-label={`Delete ${e.name}`}
                  onClick={() => {
                    if (window.confirm(`Delete “${e.name}” from my designs?`)) {
                      removeFromLibrary(e.id);
                      setLibrary(listLibrary());
                    }
                  }}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
      <div className="divider" />
      <p className="hint">Have a design file saved from this app? Open it to continue where you left off. Photos are added again after Review.</p>
      <button type="button" className="btn btn-block" onClick={openSavedDesign}>
        Open a saved design file
      </button>
      {openErr && (
        <div className="notice notice-warn" role="alert">
          {openErr}
        </div>
      )}
    </div>
  );
}
