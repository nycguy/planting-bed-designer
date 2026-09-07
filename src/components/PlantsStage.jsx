import { useEffect, useMemo, useRef, useState } from 'react';
import MapView from './MapView.jsx';
import ZonePanel from './ZonePanel.jsx';
import { Modal } from './Shared.jsx';
import { CATEGORIES, categoryById, plantById, searchPlants, SUN_LABELS } from '../data/plants.js';
import { cryptoId } from '../lib/design.js';
import { pointInPolygon } from '../lib/geometry.js';

// Planting design. The user works one category at a time — trees, then
// shrubs, then flowers and bulbs, in any order — picking a plant from a
// list filtered to the property's hardiness zone and tapping the map to
// place it. Trees and shrubs draw as circles at mature spread; flowers as
// small drifts. Nothing is pre-designed for the user.

export default function PlantsStage({ design, dispatch }) {
  const loc = design.location;
  const plants = design.plants || [];
  const zone = design.zone?.zone || null;
  const mapRef = useRef(null);
  const [category, setCategory] = useState('tree');
  const [query, setQuery] = useState('');
  const [placing, setPlacing] = useState(null); // plant id being placed
  const [selected, setSelected] = useState(null); // placed plant instance id
  const [collapsed, setCollapsed] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [detail, setDetail] = useState(null); // plant info modal

  const results = useMemo(() => searchPlants({ category, zone, query }), [category, zone, query]);
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

  const bedAt = (latlng) => design.beds.find((b) => b.closed && pointInPolygon(latlng, b.points))?.id || null;

  const place = (latlng) => {
    if (!placingInfo) return;
    dispatch({
      type: 'addPlant',
      plant: { id: cryptoId(), plantId: placingInfo.id, category: placingInfo.category, lat: latlng[0], lng: latlng[1], bedId: bedAt(latlng) },
    });
    // Stay in placing mode so several of the same plant can be tapped in quickly.
  };

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

  const cat = categoryById(category);
  const banner = placingInfo
    ? `Tap the map to place ${placingInfo.name}${counts.get(placingInfo.id) ? ` (${counts.get(placingInfo.id)} placed)` : ''}`
    : selectedInfo
      ? `${selectedInfo.name} selected — drag the handle to move it`
      : plants.length
        ? `${plants.length} plant${plants.length === 1 ? '' : 's'} placed`
        : 'Choose a plant below, then tap the map';

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
        onPlacePlant={placing ? place : undefined}
        onSelectPlant={(id) => {
          setSelected(id);
          if (id) setPlacing(null);
        }}
        onMovePlant={(id, latlng) => dispatch({ type: 'movePlant', id, lat: latlng[0], lng: latlng[1], bedId: bedAt(latlng) })}
        onViewChange={() => {}}
      />

      <div className="map-banner" aria-live="polite">
        {banner}
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

      {selectedPlant && (
        <div className="map-overlay bc">
          <button type="button" className="mapbtn text" onClick={() => setDetail(selectedInfo)}>
            About
          </button>
          <button
            type="button"
            className="mapbtn text"
            onClick={() => {
              dispatch({ type: 'removePlant', id: selectedPlant.id });
              setSelected(null);
            }}
          >
            Remove
          </button>
        </div>
      )}

      <aside className={`sheet ${collapsed ? 'collapsed' : ''}`} aria-label="Plant selection">
        <button type="button" className="sheet-handle" onClick={() => setCollapsed((v) => !v)} aria-expanded={!collapsed} aria-label={collapsed ? 'Show plant list' : 'Hide plant list to see more of the map'}>
          <span className="grab" aria-hidden="true" />
          <span className="title">
            <span className="chip" style={{ background: cat.color }} />
            {cat.label}
            <span className="stat">· {results.length} for your zone</span>
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

          <input
            className="input"
            type="search"
            placeholder={`Search ${cat.label.toLowerCase()}…`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label={`Search ${cat.label}`}
            data-testid="plant-search"
          />

          {results.length === 0 && <p className="hint">No {cat.label.toLowerCase()} match{zone ? ` in zone ${zone}` : ''}. Try a shorter search.</p>}

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
                      if (!on) setCollapsed(true);
                    }}
                  >
                    <span className="plantname">
                      {p.name}
                      <small>{p.botanical}</small>
                    </span>
                    <span className="plantmeta">
                      {p.category === 'flower' ? `${p.heightFt} ft tall` : `${p.spreadFt} ft wide`}
                      <small>Zones {p.zoneMin}–{p.zoneMax}</small>
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

          {plants.length > 0 && (
            <section className="plantsummary">
              <h3>Placed so far</h3>
              {design.beds.map((b) => {
                const list = byBed.get(b.id) || [];
                if (!list.length) return null;
                return (
                  <div key={b.id} className="bedplants" style={{ '--c': b.color }}>
                    <b>
                      <span className="chip" style={{ background: b.color }} /> {b.name}
                    </b>
                    {summarizeList(list)}
                  </div>
                );
              })}
              {byBed.get('none')?.length > 0 && (
                <div className="bedplants" style={{ '--c': '#888' }}>
                  <b>Outside the beds</b>
                  {summarizeList(byBed.get('none'))}
                </div>
              )}
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirmClear(true)}>
                Remove all plants
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
          <p style={{ fontStyle: 'italic', marginTop: 0 }}>{detail.botanical}</p>
          <dl className="facts">
            <dt>Type</dt>
            <dd>{categoryById(detail.category).label}</dd>
            <dt>Hardiness</dt>
            <dd>Zones {detail.zoneMin}–{detail.zoneMax}</dd>
            <dt>Mature size</dt>
            <dd>
              {detail.heightFt} ft tall × {detail.spreadFt} ft wide
            </dd>
            <dt>Light</dt>
            <dd>{SUN_LABELS[detail.sun] || detail.sun}</dd>
          </dl>
          {detail.notes && <p>{detail.notes}</p>}
          <p className="hint">Sizes and zones are typical nursery ranges. Cultivar, soil, and exposure change them.</p>
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
                setDetail(null);
                setCollapsed(true);
              }}
            >
              Place this plant
            </button>
          </div>
        </Modal>
      )}

      {confirmClear && (
        <Modal title="Remove all plants?" onClose={() => setConfirmClear(false)}>
          <p>This removes every placed plant from the design. Bed outlines and photos are not affected.</p>
          <div className="btn-row">
            <button type="button" className="btn" onClick={() => setConfirmClear(false)}>
              Keep plants
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                dispatch({ type: 'clearPlants' });
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
