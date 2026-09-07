import { useEffect, useRef, useState } from 'react';
import MapView from './MapView.jsx';
import { Modal } from './Shared.jsx';
import { designTotals } from '../lib/design.js';
import { summarize, fmtFt, fmtSqFt } from '../lib/geometry.js';
import { usePhotoUrls } from './PhotosStage.jsx';
import { imageryById } from '../lib/mapServices.js';

function exportData(design) {
  const fc = {
    type: 'FeatureCollection',
    properties: {
      application: 'Planting Bed Designer',
      address: design.location.address,
      createdAt: design.createdAt,
      exportedAt: new Date().toISOString(),
      units: 'feet; area in square feet; coordinates WGS84 [lng, lat]',
      totals: designTotals(design),
    },
    features: design.beds.map((b) => {
      const s = summarize(b.points);
      return {
        type: 'Feature',
        properties: {
          number: b.number,
          name: b.name,
          color: b.color,
          areaSqFt: Math.round(s.areaSqFt * 10) / 10,
          perimeterFt: Math.round(s.perimeterFt * 10) / 10,
          sidesFt: s.sidesFt.map((f) => Math.round(f * 10) / 10),
          photo: b.photo ? (b.photo.unavailable ? { unavailable: true, note: b.photo.note } : { filename: b.photo.name }) : null,
        },
        geometry: { type: 'Polygon', coordinates: [[...b.points, b.points[0]].map(([lat, lng]) => [lng, lat])] },
      };
    }),
  };
  const blob = new Blob([JSON.stringify(fc, null, 2)], { type: 'application/geo+json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `planting-beds-${new Date().toISOString().slice(0, 10)}.geojson`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(a.href);
    a.remove();
  }, 500);
}

export default function CompleteStage({ design, dispatch, onEditBed, onStartNew }) {
  const loc = design.location;
  const totals = designTotals(design);
  const urls = usePhotoUrls(design.beds);
  const mapRef = useRef(null);
  const [rename, setRename] = useState(null);
  const created = new Date(design.createdAt);

  useEffect(() => {
    const pts = design.beds.flatMap((b) => b.points);
    if (pts.length) mapRef.current?.fitPoints(pts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="page report-page" data-testid="complete-stage">
      <h1>Design complete</h1>
      <p className="lead" style={{ margin: 0 }}>{loc.address}</p>
      <p className="hint">
        Created {created.toLocaleDateString()} · Imagery: {imageryById(loc.imagery).name} · Measurements are estimates from aerial imagery.
      </p>

      <div className="minimap report-map">
        <MapView ref={mapRef} center={[loc.lat, loc.lng]} zoom={loc.zoom} imageryId={loc.imagery} beds={design.beds} activeBedId={null} mode="view" onViewChange={() => {}} />
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

      <div className="btn-row no-print">
        <button type="button" className="btn" onClick={() => window.print()}>
          Print design
        </button>
        <button type="button" className="btn" onClick={() => window.print()} title="Choose “Save as PDF” in the print dialog">
          Save as PDF
        </button>
        <button type="button" className="btn" onClick={() => exportData(design)}>
          Export design data
        </button>
      </div>

      {design.beds.map((b) => {
        const s = summarize(b.points);
        const url = urls[b.id];
        return (
          <section key={b.id} className="bedcard bed-report" style={{ '--c': b.color }} aria-label={b.name} data-testid={`complete-bed-${b.number}`}>
            <h3>
              <span>
                <span className="chip" style={{ background: b.color }} />
                {b.name}
              </span>
              <span className="status-pill">Bed {b.number}</span>
            </h3>
            {b.photo && !b.photo.unavailable ? (
              url ? (
                <img className="photo-preview" src={url} alt={`Current condition of ${b.name}`} data-testid={`complete-photo-${b.number}`} />
              ) : (
                <div className="photo-missing">{b.photo.previewable === false ? `Photo saved (${b.photo.name}); preview not available in this browser.` : 'Loading photo…'}</div>
              )
            ) : (
              <div className="photo-missing">No photo{b.photo?.note ? ` — ${b.photo.note}` : ''}</div>
            )}
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
            <table className="sidestable">
              <tbody>
                {s.sidesFt.map((ft, i) => (
                  <tr key={i}>
                    <td>Side {i + 1}</td>
                    <td>{fmtFt(ft)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="btn-row no-print">
              <button type="button" className="btn btn-sm" onClick={() => onEditBed(b.id, 'lengths')}>
                Edit measurements
              </button>
              <button type="button" className="btn btn-sm" onClick={() => onEditBed(b.id, 'outline')}>
                Edit outline
              </button>
              <button type="button" className="btn btn-sm" onClick={() => dispatch({ type: 'setStage', stage: 'photos' })}>
                Edit photo
              </button>
              <button type="button" className="btn btn-sm" onClick={() => setRename({ id: b.id, name: b.name })}>
                Rename
              </button>
            </div>
          </section>
        );
      })}

      <div className="btn-row no-print">
        <button type="button" className="btn btn-danger btn-block" onClick={onStartNew}>
          Start new design
        </button>
      </div>

      {rename && (
        <Modal title="Rename bed" onClose={() => setRename(null)}>
          <div className="field">
            <label htmlFor="rn2">Bed name</label>
            <input id="rn2" className="input" type="text" value={rename.name} maxLength={40} onChange={(e) => setRename({ ...rename, name: e.target.value })} autoFocus />
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
