import { useEffect, useMemo, useRef, useState } from 'react';
import MapView from './MapView.jsx';
import ZonePanel from './ZonePanel.jsx';
import PlantPhoto from './PlantPhoto.jsx';
import { Modal } from './Shared.jsx';
import { CATEGORIES, categoryById, plantById, searchPlants, SUN_LABELS, SUN_OPTIONS, sunCompatible, footprintSqFt, MONTHS } from '../data/plants.js';
import { cryptoId, bedCoverage } from '../lib/design.js';
import { pointInPolygon, fmtSqFt } from '../lib/geometry.js';

// Planting design. The user works one category at a time — trees, shrubs,
// flowers and bulbs, plus things already in the yard — picking from a list
// filtered to the property's hardiness zone and, optionally, a bed's light,
// native status, and deer resistance. Tapping the map places one plant per
// tap. Trees and shrubs draw as circles at mature spread; flowers as small
// drifts; existing features in gray.

const GROWTH_STOPS = [1, 3, 5, 10, null]; // null = mature

export default function PlantsStage({ design, dispatch }) {
  const loc = design.location;
  const plants = design.plants || [];
  const zone = design.zone?.zone || null;
  const mapRef = useRef(null);
  const [category, setCategory] = useState('tree');
  const [query, setQuery] = useState('');
  const [sun, setSun] = useState(null); // light filter
  const [nativeOnly, setNativeOnly] = useState(false);
  const [deerOnly, setDeerOnly] = useState(false);
  const [placing, setPlacing] = useState(null); // plant id being placed
  const [placeWidth, setPlaceWidth] = useState(null); // ft, for existing features
  const [selected, setSelected] = useState(null); // placed plant instance id
  const [collapsed, setCollapsed] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [detail, setDetail] = useState(null);
  const [growthIdx, setGrowthIdx] = useState(GROWTH_STOPS.length - 1);
  const [showBloom, setShowBloom] = useState(false);

  // Undo / redo over the plants array.
  const past = useRef([]);
  const future = useRef([]);
  const [, bump] = useState(0);
  const withHistory = (action) => {
    past.current.push(plants);
    if (past.current.length > 50) past.current.shift();
    future.current = [];
    dispatch(action);
    bump((n) => n + 1);
  };
  const undo = () => {
    if (!past.current.length) return;
    future.current.push(plants);
    dispatch({ type: 'setPlants', plants: past.current.pop() });
    bump((n) => n + 1);
  };
  const redo = () => {
    if (!future.current.length) return;
    past.current.push(plants);
    dispatch({ type: 'setPlants', plants: future.current.pop() });
    bump((n) => n + 1);
  };

  const results = useMemo(() => searchPlants({ category, zone, query, sun, nativeOnly, deerOnly }), [category, zone, query, sun, nativeOnly, deerOnly]);
  const placingInfo = placing ? plantById(placing) : null;
  const selectedPlant = selected ? plants.find((p) => p.id === selected) : null;
  const selectedInfo = selectedPlant ? plantById(selectedPlant.plantId) : null;

  useEffect(() => {
    const pts = design.beds.flatMap((b) => b.points);
    if (!pts.length) return;
    const id = requestAnimationFrame(() => mapRef.current?.fitPoints(pts));
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bedAt = (latlng) => design.beds.find((b) => b.closed && pointInPolygon(latlng, b.points)) || null;

  const place = (latlng) => {
    if (!placingInfo) return;
    const bed = bedAt(latlng);
    withHistory({
      type: 'addPlant',
      plant: {
        id: cryptoId(),
        plantId: placingInfo.id,
        category: placingInfo.category,
        lat: latlng[0],
        lng: latlng[1],
        bedId: bed?.id || null,
        ...(placingInfo.category === 'existing' ? { spreadFt: placeWidth || placingInfo.spreadFt } : {}),
      },
    });
  };

  const footprint = (p) => footprintSqFt(plantById(p.plantId), p.spreadFt);

  const counts = useMemo(() => {
    const byPlant = new Map();
    for (const p of plants) byPlant.set(p.plantId, (byPlant.get(p.plantId) || 0) + 1);
    return byPlant;
  }, [plants]);

  const byBed = useMemo(() => {
    const m = new Map();
    for (const p of plants) {
      const k = p.bedId || 'none';
      if (!m.has(k)) m.set(k, []);
      m.get(k).push(p);
    }
    return m;
  }, [plants]);

  const mismatches = useMemo(() => {
    const out = [];
    for (const p of plants) {
      const bed = design.beds.find((b) => b.id === p.bedId);
      const info = plantById(p.plantId);
      if (bed?.sun && info && info.category !== 'existing' && !sunCompatible(info, bed.sun)) out.push({ plant: p, info, bed });
    }
    return out;
  }, [plants, design.beds]);

  const cat = categoryById(category);
  const growthYears = GROWTH_STOPS[growthIdx];
  const banner = placingInfo
    ? `Tap the map to place ${placingInfo.name}${counts.get(placingInfo.id) ? ` (${counts.get(placingInfo.id)} placed)` : ''}`
    : selectedInfo
      ? `${selectedInfo.name} selected — drag the handle to move it`
      : plants.length
        ? `${plants.length} item${plants.length === 1 ? '' : 's'} placed${growthYears ? ` · shown at year ${growthYears}` : ''}`
        : 'Choose a plant below, then tap the map';

  const bedsWithSun = design.beds.filter((b) => b.sun);

  return (
    <div className="maplayout" data-testid="plants-stage">
      <MapView
        ref={mapRef}
        center={[loc.lat, loc.lng]}
        zoom={Math.max(loc.zoom, 19)}
        imageryId={loc.imagery}
        beds={design.beds}
        activeBedId={null}
        mode="plant"
        plants={plants}
        selectedPlantId={selected}
        placing={!!placing}
        growthYears={growthYears}
        onPlacePlant={placing ? place : undefined}
        onSelectPlant={(id) => {
          setSelected(id);
          if (id) setPlacing(null);
        }}
        onMovePlant={(id, latlng) => withHistory({ type: 'movePlant', id, lat: latlng[0], lng: latlng[1], bedId: bedAt(latlng)?.id || null })}
        onViewChange={() => {}}
      />

      <div className="map-banner" aria-live="polite">
        {banner}
      </div>

      <div className="map-overlay tl">
        <button type="button" className="mapbtn" onClick={undo} disabled={!past.current.length} aria-label="Undo" title="Undo" data-testid="undo">
          ↶
        </button>
        <button type="button" className="mapbtn" onClick={redo} disabled={!future.current.length} aria-label="Redo" title="Redo" data-testid="redo">
          ↷
        </button>
      </div>

      <div className="map-overlay tr">
        <button type="button" className="mapbtn" onClick={() => mapRef.current?.fitPoints(design.beds.flatMap((b) => b.points))} aria-label="Zoom to all beds" title="Zoom to all beds">
          ⤢
        </button>
        {(placing || selected) && (
          <button
            type="button"
            className="mapbtn text"
            onClick={() => {
              setPlacing(null);
              setSelected(null);
            }}
          >
            Done
          </button>
        )}
      </div>

      {placingInfo?.category === 'existing' && (
        <div className="map-overlay bc widthctl">
          <label>
            Width {placeWidth || placingInfo.spreadFt} ft
            <input type="range" min={2} max={60} step={1} value={placeWidth || placingInfo.spreadFt} onChange={(e) => setPlaceWidth(Number(e.target.value))} aria-label="Width of existing feature in feet" />
          </label>
        </div>
      )}

      {selectedPlant && (
        <div className="map-overlay bc">
          <button type="button" className="mapbtn text" onClick={() => setDetail(selectedInfo)}>
            About
          </button>
          {selectedInfo?.category === 'existing' && (
            <label className="mapbtn text widthinline">
              {selectedPlant.spreadFt || selectedInfo.spreadFt} ft
              <input type="range" min={2} max={60} step={1} value={selectedPlant.spreadFt || selectedInfo.spreadFt} onChange={(e) => dispatch({ type: 'updatePlant', id: selectedPlant.id, patch: { spreadFt: Number(e.target.value) } })} aria-label="Width in feet" />
            </label>
          )}
          <button
            type="button"
            className="mapbtn text"
            onClick={() => {
              withHistory({ type: 'removePlant', id: selectedPlant.id });
              setSelected(null);
            }}
          >
            Remove
          </button>
        </div>
      )}

      {!placing && !selected && plants.some((p) => p.category !== 'existing') && (
        <div className="map-overlay bc growth">
          <label>
            {growthYears ? `Year ${growthYears}` : 'Mature'}
            <input type="range" min={0} max={GROWTH_STOPS.length - 1} step={1} value={growthIdx} onChange={(e) => setGrowthIdx(Number(e.target.value))} aria-label="Years after planting" data-testid="growth-slider" />
          </label>
        </div>
      )}

      <aside className={`sheet ${collapsed ? 'collapsed' : ''}`} aria-label="Plant selection">
        <button type="button" className="sheet-handle" onClick={() => setCollapsed((v) => !v)} aria-expanded={!collapsed} aria-label={collapsed ? 'Show plant list' : 'Hide plant list to see more of the map'}>
          <span className="grab" aria-hidden="true" />
          <span className="title">
            <span className="chip" style={{ background: cat.color }} />
            {cat.label}
            <span className="stat">
              · {results.length}
              {category === 'existing' ? '' : ' for your zone'}
            </span>
          </span>
          <span className="stat">
            {plants.length} placed{collapsed ? ' ▲' : ' ▼'}
          </span>
        </button>

        <div className="sheet-body">
          <ZonePanel design={design} dispatch={dispatch} compact />
          {!zone && <p className="hint">Without a zone, every plant in the list is shown.</p>}

          <div className="segmented" role="tablist" aria-label="Plant category">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={category === c.id}
                className={`seg ${category === c.id ? 'on' : ''}`}
                style={{ '--c': c.color }}
                onClick={() => {
                  setCategory(c.id);
                  setPlacing(null);
                  setQuery('');
                }}
              >
                {c.label}
                {plants.some((p) => p.category === c.id) && <span className="count">{plants.filter((p) => p.category === c.id).length}</span>}
              </button>
            ))}
          </div>

          {category !== 'existing' && (
            <div className="filters">
              <div className="filterrow">
                <span className="sunlabel">Light:</span>
                <button type="button" className={`seg ${!sun ? 'on' : ''}`} onClick={() => setSun(null)} aria-pressed={!sun}>
                  Any
                </button>
                {SUN_OPTIONS.map((o) => (
                  <button key={o.id} type="button" className={`seg ${sun === o.id ? 'on' : ''}`} onClick={() => setSun(o.id)} aria-pressed={sun === o.id} title={o.hint} data-testid={`filter-sun-${o.id}`}>
                    {o.label}
                  </button>
                ))}
              </div>
              {bedsWithSun.length > 0 && (
                <div className="filterrow bedchips">
                  <span className="sunlabel">For bed:</span>
                  {bedsWithSun.map((b) => (
                    <button key={b.id} type="button" className={`bedchip ${sun === b.sun ? 'on' : ''}`} style={{ '--c': b.color }} onClick={() => setSun(b.sun)} title={`${b.name}: ${SUN_OPTIONS.find((o) => o.id === b.sun)?.label}`}>
                      <span className="chip" style={{ background: b.color }} />
                      {b.name}
                    </button>
                  ))}
                </div>
              )}
              <div className="filterrow">
                <label className="check">
                  <input type="checkbox" checked={nativeOnly} onChange={(e) => setNativeOnly(e.target.checked)} data-testid="filter-native" /> Native
                </label>
                <label className="check">
                  <input type="checkbox" checked={deerOnly} onChange={(e) => setDeerOnly(e.target.checked)} data-testid="filter-deer" /> Deer resistant
                </label>
              </div>
            </div>
          )}

          {category === 'existing' && (
            <p className="hint">Mark what is already in the yard — trees you are keeping, a walkway, the house wall. Set the width with the slider, then tap the map. These draw in gray and are not counted as new plants.</p>
          )}

          {category !== 'existing' && (
            <input className="input" type="search" placeholder={`Search ${cat.label.toLowerCase()}…`} value={query} onChange={(e) => setQuery(e.target.value)} aria-label={`Search ${cat.label}`} data-testid="plant-search" />
          )}

          {results.length === 0 && (
            <p className="hint">
              No {cat.label.toLowerCase()} match{zone ? ` in zone ${zone}` : ''} with these filters.
            </p>
          )}

          <ul className="plantlist">
            {results.map((p) => {
              const n = counts.get(p.id) || 0;
              const on = placing === p.id;
              return (
                <li key={p.id} className={on ? 'on' : ''}>
                  <button
                    type="button"
                    className="plantrow"
                    aria-pressed={on}
                    data-testid={`plant-${p.id}`}
                    onClick={() => {
                      setSelected(null);
                      setPlacing(on ? null : p.id);
                      setPlaceWidth(null);
                      if (!on) setCollapsed(true);
                    }}
                  >
                    {p.category !== 'existing' && <PlantPhoto plant={p} size={44} />}
                    <span className="plantname">
                      {p.name}
                      <small>{p.botanical}</small>
                      {(p.native || p.deerResistant) && (
                        <span className="tags">
                          {p.native && <em>Native</em>}
                          {p.deerResistant && <em>Deer resistant</em>}
                        </span>
                      )}
                    </span>
                    <span className="plantmeta">
                      {p.category === 'flower' ? `${p.heightFt} ft tall` : `${p.spreadFt} ft wide`}
                      {p.category !== 'existing' && (
                        <small>
                          Zones {p.zoneMin}–{p.zoneMax}
                        </small>
                      )}
                    </span>
                    {n > 0 && <span className="count">{n}</span>}
                  </button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setDetail(p)} aria-label={`About ${p.name}`}>
                    ⓘ
                  </button>
                </li>
              );
            })}
          </ul>

          {mismatches.length > 0 && (
            <div className="notice notice-warn" role="status" data-testid="light-check">
              <b>Light check.</b>{' '}
              {mismatches.slice(0, 4).map((m, i) => (
                <span key={m.plant.id}>
                  {i > 0 ? '; ' : ''}
                  {m.info.name} in {m.bed.name} ({SUN_OPTIONS.find((o) => o.id === m.bed.sun)?.label.toLowerCase()}) prefers {SUN_LABELS[m.info.sun]?.toLowerCase()}
                </span>
              ))}
              {mismatches.length > 4 ? `; and ${mismatches.length - 4} more.` : '.'}
            </div>
          )}

          {plants.length > 0 && (
            <section className="plantsummary">
              <h3>Placed so far</h3>
              {design.beds.map((b) => {
                const list = byBed.get(b.id) || [];
                if (!list.length) return null;
                const cov = bedCoverage(design, b, footprint);
                return (
                  <div key={b.id} className="bedplants" style={{ '--c': b.color }}>
                    <b>
                      <span className="chip" style={{ background: b.color }} /> {b.name}
                      {cov.count > 0 && <span className={`cov ${cov.ratio > 1.15 ? 'over' : cov.ratio < 0.5 ? 'under' : ''}`}>{Math.round(cov.ratio * 100)}% covered at maturity</span>}
                    </b>
                    {summarizeList(list)}
                    {cov.ratio > 1.15 && <small className="hint">Plants will outgrow this bed by about {fmtSqFt(cov.plantedSqFt - cov.areaSqFt)}. Consider fewer or smaller plants.</small>}
                  </div>
                );
              })}
              {byBed.get('none')?.length > 0 && (
                <div className="bedplants" style={{ '--c': '#888' }}>
                  <b>Outside the beds</b>
                  {summarizeList(byBed.get('none'))}
                </div>
              )}
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowBloom((v) => !v)} aria-expanded={showBloom}>
                {showBloom ? 'Hide' : 'Show'} bloom calendar
              </button>
              {showBloom && <BloomCalendar plants={plants} />}
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirmClear(true)}>
                Remove all
              </button>
            </section>
          )}

          <button
            type="button"
            className="btn btn-primary btn-block"
            data-testid="finish-design"
            onClick={() => {
              dispatch({ type: 'setCompleted', value: true });
              dispatch({ type: 'setStage', stage: 'complete' });
            }}
          >
            {plants.length ? 'Finish design and see the report' : 'Skip planting and see the report'}
          </button>
        </div>
      </aside>

      {detail && (
        <Modal title={detail.name} onClose={() => setDetail(null)}>
          {detail.category !== 'existing' && <PlantPhoto plant={detail} wide />}
          <p style={{ fontStyle: 'italic', marginTop: 0 }}>{detail.botanical}</p>
          <dl className="facts">
            <dt>Type</dt>
            <dd>{categoryById(detail.category).label}</dd>
            {detail.category !== 'existing' && (
              <>
                <dt>Hardiness</dt>
                <dd>
                  Zones {detail.zoneMin}–{detail.zoneMax}
                </dd>
                <dt>Mature size</dt>
                <dd>
                  {detail.heightFt} ft tall × {detail.spreadFt} ft wide
                </dd>
                <dt>Light</dt>
                <dd>{SUN_LABELS[detail.sun] || detail.sun}</dd>
                {detail.bloom && (
                  <>
                    <dt>Blooms</dt>
                    <dd>
                      <span className="chip" style={{ background: detail.bloomColor }} />
                      {MONTHS[detail.bloom[0] - 1]}
                      {detail.bloom[1] !== detail.bloom[0] ? `–${MONTHS[detail.bloom[1] - 1]}` : ''}
                    </dd>
                  </>
                )}
                <dt>Wildlife</dt>
                <dd>
                  {detail.native ? 'Native to the eastern US. ' : 'Not native. '}
                  {detail.deerResistant ? 'Usually left alone by deer.' : 'Deer may browse it.'}
                </dd>
              </>
            )}
          </dl>
          {detail.notes && <p>{detail.notes}</p>}
          {detail.category !== 'existing' && <p className="hint">Sizes, zones, and bloom times are typical nursery ranges. Cultivar, soil, and exposure change them. Deer behavior varies by neighborhood.</p>}
          <div className="btn-row">
            <button type="button" className="btn" onClick={() => setDetail(null)}>
              Close
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setCategory(detail.category);
                setSelected(null);
                setPlacing(detail.id);
                setPlaceWidth(null);
                setDetail(null);
                setCollapsed(true);
              }}
            >
              Place this
            </button>
          </div>
        </Modal>
      )}

      {confirmClear && (
        <Modal title="Remove everything placed?" onClose={() => setConfirmClear(false)}>
          <p>This removes every placed plant and existing feature from the design. Bed outlines and photos are not affected. Undo can bring them back until you leave this screen.</p>
          <div className="btn-row">
            <button type="button" className="btn" onClick={() => setConfirmClear(false)}>
              Keep them
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                withHistory({ type: 'clearPlants' });
                setSelected(null);
                setPlacing(null);
                setConfirmClear(false);
              }}
            >
              Remove all
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function summarizeList(list) {
  const m = new Map();
  for (const p of list) m.set(p.plantId, (m.get(p.plantId) || 0) + 1);
  return (
    <ul>
      {[...m.entries()]
        .map(([id, n]) => ({ info: plantById(id), n }))
        .filter((x) => x.info)
        .sort((a, b) => CATEGORIES.findIndex((c) => c.id === a.info.category) - CATEGORIES.findIndex((c) => c.id === b.info.category) || a.info.name.localeCompare(b.info.name))
        .map(({ info, n }) => (
          <li key={info.id}>
            <span className="chip" style={{ background: categoryById(info.category).color }} /> {n} × {info.name}
          </li>
        ))}
    </ul>
  );
}

// Twelve-month strip: one row per distinct plant that has a bloom window.
export function BloomCalendar({ plants }) {
  const rows = [];
  const seen = new Set();
  for (const p of plants) {
    if (seen.has(p.plantId)) continue;
    seen.add(p.plantId);
    const info = plantById(p.plantId);
    if (info?.bloom) rows.push(info);
  }
  rows.sort((a, b) => a.bloom[0] - b.bloom[0] || a.bloom[1] - b.bloom[1]);
  if (!rows.length) return <p className="hint">None of the placed plants has a listed bloom window.</p>;
  const covered = new Set();
  rows.forEach((r) => {
    for (let m = r.bloom[0]; m <= r.bloom[1]; m++) covered.add(m);
  });
  const gaps = MONTHS.map((_, i) => i + 1).filter((m) => m >= 3 && m <= 10 && !covered.has(m));
  return (
    <div className="bloomcal" data-testid="bloom-calendar">
      <div className="bloomrow head">
        <span className="bloomname" />
        {MONTHS.map((m) => (
          <span key={m} className="bloomcell">
            {m[0]}
          </span>
        ))}
      </div>
      {rows.map((r) => (
        <div key={r.id} className="bloomrow">
          <span className="bloomname">{r.name}</span>
          {MONTHS.map((_, i) => {
            const m = i + 1;
            const on = m >= r.bloom[0] && m <= r.bloom[1];
            return <span key={m} className={`bloomcell ${on ? 'on' : ''}`} style={on ? { background: r.bloomColor } : undefined} />;
          })}
        </div>
      ))}
      {gaps.length > 0 && (
        <p className="hint" style={{ marginTop: 6 }}>
          Nothing in bloom in {gaps.map((m) => MONTHS[m - 1]).join(', ')}.
        </p>
      )}
    </div>
  );
}
