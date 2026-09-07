import { useEffect, useRef, useState } from 'react';
import MapView from './MapView.jsx';
import { Modal } from './Shared.jsx';
import { designTotals } from '../lib/design.js';
import { summarize, fmtFt, fmtSqFt } from '../lib/geometry.js';
import { usePhotoUrls } from './PhotosStage.jsx';
import { imageryById } from '../lib/mapServices.js';
import { saveDesignFile } from '../lib/designFile.js';
import { plantById, categoryById, CATEGORIES, sunCompatible, SUN_OPTIONS, SUN_LABELS, footprintSqFt } from '../data/plants.js';
import { BloomCalendar } from './PlantsStage.jsx';
import { bedCoverage } from '../lib/design.js';
import { saveToLibrary } from '../lib/library.js';
import { zoneLabel } from '../lib/zones.js';

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
      hardinessZone: design.zone ? { zone: design.zone.zone, source: design.zone.source, zip: design.zone.zip } : null,
    },
    features: [
      ...(design.plants || []).map((p) => {
        const info = plantById(p.plantId) || {};
        const bed = design.beds.find((b) => b.id === p.bedId);
        return {
          type: 'Feature',
          properties: { kind: 'plant', category: p.category, name: info.name, botanical: info.botanical, matureSpreadFt: info.spreadFt, matureHeightFt: info.heightFt, bed: bed?.name || null },
          geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
        };
      }),
      ...design.beds.map((b) => {
      const s = summarize(b.points);
      return {
        type: 'Feature',
        properties: {
          kind: 'bed',
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
    ],
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
  const [libName, setLibName] = useState(null);
  const [libSaved, setLibSaved] = useState(null);
  const created = new Date(design.createdAt);

  useEffect(() => {
    const pts = design.beds.flatMap((b) => b.points);
    if (!pts.length) return;
    const id = requestAnimationFrame(() => mapRef.current?.fitPoints(pts));
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="page report-page" data-testid="complete-stage">
      <h1>Design complete</h1>
      <p className="lead" style={{ margin: 0 }}>{loc.address}</p>
      <p className="hint">
        Created {created.toLocaleDateString()} · Imagery: {imageryById(loc.imagery).name} · Measurements are estimates from aerial imagery.
      </p>
      {design.zone && (
        <p style={{ margin: '0 0 6px' }}>
          <span className="zonebadge">USDA {zoneLabel(design.zone)}</span>
        </p>
      )}

      <div className="minimap report-map">
        <MapView ref={mapRef} center={[loc.lat, loc.lng]} zoom={loc.zoom} imageryId={loc.imagery} beds={design.beds} activeBedId={null} mode="view" plants={design.plants || []} showScale onViewChange={() => {}} />
      </div>
      <Legend design={design} />

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
        <button type="button" className="btn" onClick={() => saveDesignFile(design)}>
          Save design file
        </button>
        <button type="button" className="btn" onClick={() => exportData(design)}>
          Export design data
        </button>
        {(design.plants || []).some((p) => p.category !== 'existing') && (
          <button type="button" className="btn" onClick={() => exportShoppingList(design)}>
            Shopping list (CSV)
          </button>
        )}
        <button type="button" className="btn" onClick={() => setLibName(design.location?.address?.split(',')[0] || 'My design')}>
          Save to my designs
        </button>
      </div>
      {libSaved && (
        <p className="hint" role="status">
          Saved as “{libSaved}”. Open it later from the first screen under “My designs.”
        </p>
      )}

      <PlantSchedule design={design} dispatch={dispatch} />
      <Materials design={design} />

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

      {libName !== null && (
        <Modal title="Save to my designs" onClose={() => setLibName(null)}>
          <p>Keeps a named copy on this device so you can come back to it or try a second version of the same yard.</p>
          <div className="field">
            <label htmlFor="libname">Name</label>
            <input id="libname" className="input" value={libName} onChange={(e) => setLibName(e.target.value)} maxLength={60} />
          </div>
          <div className="btn-row">
            <button type="button" className="btn" onClick={() => setLibName(null)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                const e = saveToLibrary(design, libName);
                setLibSaved(e ? e.name : null);
                setLibName(null);
              }}
            >
              Save
            </button>
          </div>
        </Modal>
      )}
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


function PlantSchedule({ design, dispatch }) {
  const plants = (design.plants || []).filter((p) => p.category !== 'existing');
  const rows = new Map();
  for (const p of plants) {
    const key = `${p.plantId}|${p.bedId || ''}`;
    if (!rows.has(key)) rows.set(key, { info: plantById(p.plantId), bed: design.beds.find((b) => b.id === p.bedId) || null, n: 0 });
    rows.get(key).n += 1;
  }
  const list = [...rows.values()]
    .filter((r) => r.info)
    .sort((a, b) => (a.bed?.number ?? 99) - (b.bed?.number ?? 99) || CATEGORIES.findIndex((c) => c.id === a.info.category) - CATEGORIES.findIndex((c) => c.id === b.info.category) || a.info.name.localeCompare(b.info.name));

  return (
    <section className="plantsched" aria-label="Plant list">
      <h2 style={{ fontSize: 20, margin: '14px 0 4px' }}>Plant list</h2>
      {list.length === 0 ? (
        <p className="hint">No plants placed yet.</p>
      ) : (
        <table className="schedule">
          <thead>
            <tr>
              <th>Bed</th>
              <th>Plant</th>
              <th className="num">Qty</th>
              <th className="num">Mature size</th>
              <th>Light</th>
            </tr>
          </thead>
          <tbody>
            {list.map((r, i) => (
              <tr key={i}>
                <td>
                  {r.bed ? (
                    <>
                      <span className="chip" style={{ background: r.bed.color }} />
                      {r.bed.name}
                    </>
                  ) : (
                    'Outside beds'
                  )}
                </td>
                <td>
                  <span className="chip" style={{ background: categoryById(r.info.category).color }} />
                  <b>{r.info.name}</b>
                  <br />
                  <small style={{ fontStyle: 'italic', color: 'var(--ink-soft)' }}>{r.info.botanical}</small>
                </td>
                <td className="num">{r.n}</td>
                <td className="num">
                  {r.info.heightFt} ft H × {r.info.spreadFt} ft W
                </td>
                <td>
                  {SUN_LABELS[r.info.sun]}
                  {r.bed?.sun && !sunCompatible(r.info, r.bed.sun) && <span className="warnflag"> ⚠ bed is {SUN_OPTIONS.find((o) => o.id === r.bed.sun)?.label.toLowerCase()}</span>}
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan={2}>
                <b>Total</b>
              </td>
              <td className="num">
                <b>{plants.filter((p) => p.category !== 'existing').length}</b>
              </td>
              <td colSpan={2} />
            </tr>
          </tbody>
        </table>
      )}
      {list.length > 0 && (
        <>
          <h3 style={{ fontSize: 15, margin: '10px 0 4px' }}>Coverage at maturity</h3>
          <table className="schedule">
            <tbody>
              {design.beds.map((b) => {
                const cov = bedCoverage(design, b, (p) => footprintSqFt(plantById(p.plantId), p.spreadFt));
                return (
                  <tr key={b.id}>
                    <td>
                      <span className="chip" style={{ background: b.color }} />
                      {b.name}
                    </td>
                    <td className="num">{fmtSqFt(cov.areaSqFt)} bed</td>
                    <td className="num">{fmtSqFt(cov.plantedSqFt)} planted</td>
                    <td className="num">
                      <b>{Math.round(cov.ratio * 100)}%</b>
                      {cov.ratio > 1.15 && <span className="warnflag"> ⚠ over</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <h3 style={{ fontSize: 15, margin: '10px 0 4px' }}>Bloom calendar</h3>
          <BloomCalendar plants={plants} />
        </>
      )}
      <div className="btn-row no-print">
        <button type="button" className="btn btn-sm" onClick={() => dispatch({ type: 'setStage', stage: 'plants' })}>
          {list.length ? 'Edit planting' : 'Add plants'}
        </button>
      </div>
    </section>
  );
}

// Mulch, soil, and edging quantities from bed area and perimeter.
function Materials({ design }) {
  const beds = design.beds.filter((b) => b.closed && b.points.length >= 3);
  if (!beds.length) return null;
  const rows = beds.map((b) => ({ b, s: summarize(b.points) }));
  const area = rows.reduce((a, r) => a + r.s.areaSqFt, 0);
  const perim = rows.reduce((a, r) => a + r.s.perimeterFt, 0);
  const yards = (sqft, inches) => (sqft * (inches / 12)) / 27;
  const bags = (cy) => Math.ceil((cy * 27) / 2); // 2 cu ft bags
  const fmtCy = (v) => `${(Math.ceil(v * 4) / 4).toFixed(2)} cu yd`;
  return (
    <section aria-label="Materials">
      <h2 style={{ fontSize: 20, margin: '14px 0 4px' }}>Materials</h2>
      <table className="schedule">
        <thead>
          <tr>
            <th>Bed</th>
            <th className="num">Mulch, 2 in.</th>
            <th className="num">Mulch, 3 in.</th>
            <th className="num">Topsoil, 4 in.</th>
            <th className="num">Edging</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ b, s }) => (
            <tr key={b.id}>
              <td>
                <span className="chip" style={{ background: b.color }} />
                {b.name}
              </td>
              <td className="num">{fmtCy(yards(s.areaSqFt, 2))}</td>
              <td className="num">{fmtCy(yards(s.areaSqFt, 3))}</td>
              <td className="num">{fmtCy(yards(s.areaSqFt, 4))}</td>
              <td className="num">{fmtFt(s.perimeterFt)}</td>
            </tr>
          ))}
          <tr>
            <td>
              <b>Total</b>
            </td>
            <td className="num">
              <b>{fmtCy(yards(area, 2))}</b>
              <br />
              <small>~{bags(yards(area, 2))} bags</small>
            </td>
            <td className="num">
              <b>{fmtCy(yards(area, 3))}</b>
              <br />
              <small>~{bags(yards(area, 3))} bags</small>
            </td>
            <td className="num">
              <b>{fmtCy(yards(area, 4))}</b>
            </td>
            <td className="num">
              <b>{fmtFt(perim)}</b>
            </td>
          </tr>
        </tbody>
      </table>
      <p className="hint">Rounded up to the quarter yard. Bag counts assume 2 cu ft bags. Bulk delivery is usually cheaper above about 3 cu yd. Edging length equals the bed perimeter; add 5–10% for cuts and overlaps.</p>
    </section>
  );
}

// Map legend for the printed plan.
function Legend({ design }) {
  const cats = CATEGORIES.filter((c) => (design.plants || []).some((p) => p.category === c.id));
  return (
    <div className="legend" aria-label="Map legend">
      {design.beds.map((b) => (
        <span key={b.id}>
          <span className="chip" style={{ background: b.color }} />
          {b.name}
        </span>
      ))}
      {cats.map((c) => (
        <span key={c.id}>
          <span className={`chip round ${c.id === 'existing' ? 'dashed' : ''}`} style={{ background: c.color }} />
          {c.id === 'flower' ? 'Flower / bulb drift' : c.id === 'existing' ? 'Existing (kept)' : `${c.label.replace(/s$/, '')} at mature spread`}
        </span>
      ))}
    </div>
  );
}

// Shopping list: quantities by plant with a suggested nursery container size.
function containerFor(info) {
  if (info.category === 'tree') return info.heightFt >= 40 ? '15 gal or B&B, 1.5–2 in. caliper' : '7–10 gal';
  if (info.category === 'shrub') return info.spreadFt >= 6 ? '5 gal' : '3 gal';
  if (/\(bulb\)/i.test(info.name)) return 'Bulbs, bag of 10–25';
  return info.spreadFt >= 2 ? '1 gal' : '1 qt';
}

function exportShoppingList(design) {
  const rows = new Map();
  for (const p of design.plants || []) {
    if (p.category === 'existing') continue;
    const info = plantById(p.plantId);
    if (!info) continue;
    const bed = design.beds.find((b) => b.id === p.bedId);
    const key = `${info.id}|${bed?.name || ''}`;
    if (!rows.has(key)) rows.set(key, { info, bed: bed?.name || 'Outside beds', n: 0 });
    rows.get(key).n += 1;
  }
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const header = ['Category', 'Plant', 'Botanical name', 'Bed', 'Quantity', 'Suggested size', 'Mature H x W (ft)', 'Light', 'Native', 'Deer resistant', 'Zones'];
  const lines = [header.map(esc).join(',')];
  [...rows.values()]
    .sort((a, b) => CATEGORIES.findIndex((c) => c.id === a.info.category) - CATEGORIES.findIndex((c) => c.id === b.info.category) || a.info.name.localeCompare(b.info.name))
    .forEach((r) =>
      lines.push([categoryById(r.info.category).label, r.info.name, r.info.botanical, r.bed, r.n, containerFor(r.info), `${r.info.heightFt} x ${r.info.spreadFt}`, SUN_LABELS[r.info.sun] || r.info.sun, r.info.native ? 'Yes' : 'No', r.info.deerResistant ? 'Yes' : 'No', `${r.info.zoneMin}-${r.info.zoneMax}`].map(esc).join(',')),
    );
  const blob = new Blob([`\uFEFF${lines.join('\r\n')}`], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `plant-shopping-list-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(a.href);
    a.remove();
  }, 500);
}
