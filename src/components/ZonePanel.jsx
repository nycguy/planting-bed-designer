import { useEffect, useRef, useState } from 'react';
import { zoneForLocation, manualZone, ZONE_OPTIONS, zoneLabel } from '../lib/zones.js';

// Shows the USDA hardiness zone for the design's location, looking it up
// automatically the first time and offering a manual choice if the lookup
// cannot be completed.
export default function ZonePanel({ design, dispatch, compact = false }) {
  const loc = design.location;
  const zone = design.zone;
  const [state, setState] = useState(zone ? 'done' : 'idle'); // idle | loading | done | error
  const [error, setError] = useState(null);
  const [choosing, setChoosing] = useState(false);
  const attempted = useRef(null);

  useEffect(() => {
    if (!loc || zone) return;
    const key = `${loc.lat},${loc.lng}`;
    if (attempted.current === key) return;
    attempted.current = key;
    const ctrl = new AbortController();
    setState('loading');
    setError(null);
    zoneForLocation(loc, { signal: ctrl.signal })
      .then((z) => {
        dispatch({ type: 'setZone', zone: z });
        setState('done');
      })
      .catch((e) => {
        if (e.name === 'AbortError') return;
        setError(e.message || 'The hardiness zone could not be determined.');
        setState('error');
      });
    return () => ctrl.abort();
  }, [loc?.lat, loc?.lng, zone, dispatch]);

  if (!loc) return null;

  const pick = (
    <select
      className="input"
      aria-label="Hardiness zone"
      value={zone?.zone || ''}
      onChange={(e) => {
        if (!e.target.value) return;
        dispatch({ type: 'setZone', zone: manualZone(e.target.value) });
        setChoosing(false);
        setState('done');
      }}
    >
      <option value="">Choose a zone…</option>
      {ZONE_OPTIONS.map((z) => (
        <option key={z} value={z}>
          Zone {z}
        </option>
      ))}
    </select>
  );

  return (
    <div className={`zonepanel ${compact ? 'compact' : ''}`} data-testid="zone-panel">
      {state === 'loading' && <span className="hint">Looking up the USDA hardiness zone…</span>}
      {state === 'done' && zone && !choosing && (
        <>
          <span className="zonebadge">USDA {zoneLabel(zone)}</span>
          <span className="hint" style={{ marginLeft: 8 }}>
            {zone.manual ? 'Chosen manually.' : `From ${zone.source}${zone.zip ? ` for ZIP ${zone.zip}` : ''}.`}{' '}
            <button type="button" className="linkbtn" onClick={() => setChoosing(true)}>
              Change
            </button>
          </span>
        </>
      )}
      {(state === 'error' || choosing) && (
        <div>
          {state === 'error' && !choosing && <span className="hint">{error} Choose your zone:</span>}
          {pick}
          {choosing && (
            <button type="button" className="btn btn-sm" style={{ marginLeft: 8 }} onClick={() => setChoosing(false)}>
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  );
}
