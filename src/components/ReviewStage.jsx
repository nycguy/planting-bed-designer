import { useEffect, useRef, useState } from 'react';
import MapView from './MapView.jsx';
import { Modal, Notice } from './Shared.jsx';
import { bedValid, designTotals } from '../lib/design.js';
import { summarize, fmtFt, fmtSqFt } from '../lib/geometry.js';

export default function ReviewStage({ design, dispatch, onEditBed }) {
  const loc = design.location;
  const totals = designTotals(design);
  const [rename, setRename] = useState(null); // { id, name }
  const mapRef = useRef(null);
  const allPts = design.beds.flatMap((b) => b.points);
  const incomplete = design.beds.filter((b) => !bedValid(b));
  useEffect(() => {
    if (!allPts.length) return;
    const id = requestAnimationFrame(() => mapRef.current?.fitPoints(allPts));
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="page">
      <h1>Review your beds</h1>
      <p>Check each outline and its measurements. All numbers are estimates from the aerial imagery.</p>

      <div className="minimap">
        <MapView
          ref={mapRef}
          center={[loc.lat, loc.lng]}
          zoom={loc.zoom}
          imageryId={loc.imagery}
          beds={design.beds}
          activeBedId={null}
          mode="view"
          onViewChange={() => {}}
        />
      </div>

      <div className="totals">
        <div>
          <b>{totals.count}</b>
          <span>Beds</span>
        </div>
        <div>
          <b>{fmtSqFt(totals.areaSqFt)}</b>
          <span>Combined area</span>
        </div>
        <div>
          <b>{fmtFt(totals.perimeterFt)}</b>
          <span>Combined perimeter</span>
        </div>
      </div>

      {incomplete.length > 0 && (
        <Notice kind="warn" title="Some beds are not finished">
          {incomplete.map((b) => (
            <div key={b.id}>
              {b.name}: {b.points.length < 3 ? `has ${b.points.length} point${b.points.length === 1 ? '' : 's'} and needs at least three` : 'is not closed — open it and choose “Finish bed”'}.
            </div>
          ))}
        </Notice>
      )}

      {design.beds.map((b) => {
        const s = summarize(b.points);
        return (
          <section key={b.id} className="bedcard" style={{ '--c': b.color }} aria-label={b.name}>
            <h3>
              <span>
                <span className="chip" style={{ background: b.color }} />
                {b.name}
              </span>
              <span className="status-pill">Bed {b.number}</span>
            </h3>
            {bedValid(b) ? (
              <>
                <div className="nums">
                  <span>
                    Area <b>{fmtSqFt(s.areaSqFt)}</b>
                  </span>
                  <span>
                    Perimeter <b>{fmtFt(s.perimeterFt)}</b>
                  </span>
                  <span>
                    <b>{s.pointCount}</b> points
                  </span>
                </div>
                <p className="sidesline">Sides: {s.sidesFt.map((ft, i) => `${i + 1}: ${ft.toFixed(1)} ft`).join(' · ')}</p>
              </>
            ) : (
              <p className="sidesline">Not finished.</p>
            )}
            <div className="btn-row">
              <button type="button" className="btn btn-sm" onClick={() => onEditBed(b.id, 'outline')}>
                Edit outline
              </button>
              <button type="button" className="btn btn-sm" onClick={() => onEditBed(b.id, 'lengths')} disabled={!bedValid(b)}>
                Edit lengths
              </button>
              <button type="button" className="btn btn-sm" onClick={() => setRename({ id: b.id, name: b.name })}>
                Rename bed
              </button>
              <button type="button" className="btn btn-sm" onClick={() => onEditBed(b.id, 'redraw')}>
                Redraw bed
              </button>
            </div>
          </section>
        );
      })}

      <button
        type="button"
        className="btn btn-primary btn-block"
        disabled={incomplete.length > 0}
        onClick={() => {
          dispatch({ type: 'setReviewed', value: true });
          dispatch({ type: 'setStage', stage: 'photos' });
        }}
      >
        Beds are finished
      </button>
      <p className="hint" style={{ marginTop: 10 }}>
        Next you will add one current photo of each bed. Photos are not requested until you confirm the beds are finished.
      </p>

      {rename && (
        <Modal title="Rename bed" onClose={() => setRename(null)}>
          <div className="field">
            <label htmlFor="rn">Bed name</label>
            <input id="rn" className="input" type="text" value={rename.name} maxLength={40} onChange={(e) => setRename({ ...rename, name: e.target.value })} autoFocus />
          </div>
          <div className="btn-row">
            <button type="button" className="btn" onClick={() => setRename(null)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={!rename.name.trim()}
              onClick={() => {
                dispatch({ type: 'updateBed', id: rename.id, patch: { name: rename.name.trim() } });
                setRename(null);
              }}
            >
              Save name
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
