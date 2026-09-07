import { useEffect, useMemo, useRef, useState } from 'react';
import MapView from './MapView.jsx';
import { Modal, Notice, StatusPill } from './Shared.jsx';
import { IMAGERY, imageryById } from '../lib/mapServices.js';
import { bedStatus, bedValid, allBedsValid } from '../lib/design.js';
import { summarize, fmtFt, fmtSqFt, setSideLength, feetToMeters, isSelfIntersecting } from '../lib/geometry.js';

const isTouch = () => typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

export default function SketchStage({ design, dispatch, initialBedId = null, initialAction = null }) {
  const loc = design.location;
  const beds = design.beds;
  const firstOpen = beds.find((b) => b.id === initialBedId) || beds.find((b) => !bedValid(b)) || beds[0];
  const [activeId, setActiveId] = useState(firstOpen?.id);
  const active = beds.find((b) => b.id === activeId) || beds[0];
  const [mode, setMode] = useState(active && active.points.length && active.closed && initialAction !== 'redraw' ? 'edit' : 'draw');
  const [selVtx, setSelVtx] = useState(null);
  const [hotSide, setHotSide] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [showList, setShowList] = useState(false);
  const [livePts, setLivePts] = useState(null);
  const [previewFt, setPreviewFt] = useState(null);
  const [lengthEdit, setLengthEdit] = useState(null); // { side, value }
  const [rename, setRename] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [imageryErr, setImageryErr] = useState(null);
  const [warning, setWarning] = useState(null);
  const history = useRef({}); // bedId -> [points[]]
  const snapshot = useRef({}); // bedId -> points[] when editing began
  const mapRef = useRef(null);

  const pts = livePts || active?.points || [];
  const sum = useMemo(() => summarize(pts), [pts]);
  const allDone = allBedsValid(design);

  const pushHistory = (bed) => {
    const h = (history.current[bed.id] ||= []);
    h.push(bed.points);
    if (h.length > 50) h.shift();
  };
  const setPoints = (points, extra = {}) => {
    pushHistory(active);
    dispatch({ type: 'updateBed', id: active.id, patch: { points, ...extra } });
  };

  const selectBed = (id, focus = true) => {
    const b = beds.find((x) => x.id === id);
    if (!b) return;
    setActiveId(id);
    setSelVtx(null);
    setHotSide(null);
    setLivePts(null);
    if (b.closed && b.points.length >= 3) {
      snapshot.current[id] = b.points;
      setMode('edit');
      if (focus) mapRef.current?.fitPoints(b.points);
    } else {
      setMode('draw');
      if (focus && b.points.length) mapRef.current?.fitPoints(b.points);
    }
    setShowList(false);
  };

  useEffect(() => {
    if (active && !snapshot.current[active.id]) snapshot.current[active.id] = active.points;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.id]);

  // Entry actions from Review / Complete screens.
  useEffect(() => {
    if (!active) return;
    if (initialAction === 'redraw') {
      snapshot.current[active.id] = active.points;
      dispatch({ type: 'updateBed', id: active.id, patch: { points: [], closed: false } });
      setMode('draw');
    } else if (initialAction === 'lengths' && bedValid(active)) {
      const s = summarize(active.points);
      if (s.sidesFt.length) setLengthEdit({ side: 0, value: s.sidesFt[0].toFixed(1) });
      setHotSide(0);
    }
    if (active.points.length) setTimeout(() => mapRef.current?.fitPoints(active.points), 50);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- drawing ----
  const addPoint = (latlng) => {
    if (!active || mode !== 'draw') return;
    setWarning(null);
    setPoints([...active.points, latlng], { closed: false });
  };
  const addAtCrosshair = () => {
    const c = mapRef.current?.getCenter();
    if (c) addPoint(c);
  };
  const undo = () => {
    const h = history.current[active.id];
    if (h?.length) {
      const prev = h.pop();
      dispatch({ type: 'updateBed', id: active.id, patch: { points: prev, closed: prev.length >= 3 && mode === 'edit' ? active.closed : false } });
      setSelVtx(null);
    } else if (mode === 'draw' && active.points.length) {
      dispatch({ type: 'updateBed', id: active.id, patch: { points: active.points.slice(0, -1), closed: false } });
    }
  };
  const finishBed = () => {
    if (active.points.length < 3) return setWarning('A bed needs at least three points before it can be finished.');
    if (isSelfIntersecting(active.points)) return setWarning('The outline crosses over itself. Move a point so the sides do not cross, then finish the bed.');
    setWarning(null);
    dispatch({ type: 'updateBed', id: active.id, patch: { closed: true } });
    snapshot.current[active.id] = active.points;
    // Move on to the next unstarted bed, if any.
    const next = beds.find((b) => b.id !== active.id && !bedValid(b) && b.points.length === 0);
    if (next) {
      setActiveId(next.id);
      setMode('draw');
    } else {
      setMode('edit');
    }
    setSelVtx(null);
  };
  const clearBed = () => {
    setPoints([], { closed: false });
    setMode('draw');
    setSelVtx(null);
    setConfirmClear(false);
  };
  const cancelDrawing = () => {
    const snap = snapshot.current[active.id] || [];
    dispatch({ type: 'updateBed', id: active.id, patch: { points: snap, closed: snap.length >= 3 } });
    setMode(snap.length >= 3 ? 'edit' : 'draw');
    setSelVtx(null);
    setWarning(null);
  };

  // ---- editing ----
  const moveVertex = (idx, latlng, final) => {
    const next = active.points.slice();
    next[idx] = latlng;
    if (!final) return setLivePts(next);
    setLivePts(null);
    setPoints(next);
  };
  const insertPoint = (sideIdx, latlng) => {
    const next = active.points.slice();
    next.splice(sideIdx + 1, 0, latlng);
    setPoints(next);
    setSelVtx(sideIdx + 1);
  };
  const removeVertex = () => {
    if (selVtx == null) return;
    if (active.points.length <= 3) return setWarning('A bed needs at least three points. Move this point instead of removing it, or redraw the bed.');
    const next = active.points.filter((_, i) => i !== selVtx);
    setPoints(next);
    setSelVtx(null);
  };
  const restoreShape = () => {
    const snap = snapshot.current[active.id];
    if (snap) setPoints(snap, { closed: snap.length >= 3 });
    setSelVtx(null);
  };
  const redraw = () => {
    snapshot.current[active.id] = active.points;
    setPoints([], { closed: false });
    setMode('draw');
    setSelVtx(null);
  };

  // ---- side length editing ----
  const openLength = (side) => {
    setLengthEdit({ side, value: sum.sidesFt[side].toFixed(1) });
    setHotSide(side);
  };
  const applyLength = () => {
    const ft = parseFloat(lengthEdit.value);
    if (!(ft > 0)) return;
    const next = setSideLength(active.points, lengthEdit.side, feetToMeters(ft));
    setPoints(next);
    setLengthEdit(null);
    setHotSide(lengthEdit.side);
  };

  const prevBed = () => {
    const i = beds.findIndex((b) => b.id === active.id);
    if (i > 0) selectBed(beds[i - 1].id);
  };
  const nextBed = () => {
    const i = beds.findIndex((b) => b.id === active.id);
    if (i < beds.length - 1) selectBed(beds[i + 1].id);
  };

  if (!active || !loc) return null;
  const canUndo = (history.current[active.id]?.length || 0) > 0 || (mode === 'draw' && active.points.length > 0);
  const idx = beds.findIndex((b) => b.id === active.id);
  const nextSide = lengthEdit ? (lengthEdit.side + 1) % active.points.length : null;

  return (
    <div className="maplayout">
      <MapView
        ref={mapRef}
        center={[loc.lat, loc.lng]}
        zoom={loc.zoom}
        imageryId={loc.imagery}
        beds={beds}
        activeBedId={active.id}
        mode={mode}
        selectedVertex={selVtx}
        hotSide={hotSide}
        onViewChange={(c, z) => dispatch({ type: 'setLocation', location: { lat: c[0], lng: c[1], zoom: z } })}
        onAddPoint={addPoint}
        onMoveVertex={moveVertex}
        onSelectVertex={(i) => {
          setSelVtx(i);
          if (i != null) setCollapsed(false);
        }}
        onInsertPoint={insertPoint}
        onSelectBed={(id) => mode !== 'draw' && selectBed(id, false)}
        onImageryError={(src) => setImageryErr(src.name)}
        onPreviewLength={setPreviewFt}
      />

      <div className="map-banner" aria-live="polite">
        <span className="chip" style={{ background: active.color }} />
        {mode === 'draw' ? (active.points.length ? `Tap to add point ${active.points.length + 1} of ${active.name}` : `Tap the map to start ${active.name}`) : `Editing ${active.name} — drag a point, or tap a dashed dot to add one`}
      </div>

      <div className="map-overlay tr">
        <button type="button" className="mapbtn" onClick={() => mapRef.current?.flyTo(loc.marker || [loc.lat, loc.lng], 19)} aria-label="Return to the selected property" title="Return to property">
          ⌖
        </button>
        <button type="button" className={`mapbtn ${showList ? 'on' : ''}`} onClick={() => setShowList((v) => !v)} aria-label="Show bed list" aria-expanded={showList}>
          ☰
        </button>
        {IMAGERY.length > 1 && (
          <select className="mapbtn text" aria-label="Aerial imagery source" value={loc.imagery} onChange={(e) => dispatch({ type: 'setLocation', location: { imagery: e.target.value } })}>
            {IMAGERY.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {mode === 'draw' && isTouch() && (
        <div className="map-overlay bc">
          <button type="button" className="mapbtn text" onClick={addAtCrosshair}>
            Add point at crosshair
          </button>
        </div>
      )}

      <aside className={`sheet ${collapsed ? 'collapsed' : ''}`} aria-label="Bed controls">
        <button type="button" className="sheet-handle" onClick={() => setCollapsed((v) => !v)} aria-expanded={!collapsed} aria-label={collapsed ? 'Show bed controls' : 'Hide bed controls to see more of the map'}>
          <span className="grab" aria-hidden="true" />
          <span className="title">
            <span className="chip" style={{ background: active.color }} />
            {active.name}
            <span className="stat">
              · {idx + 1} of {beds.length}
            </span>
          </span>
          <span className="stat">
            {pts.length >= 3 ? fmtSqFt(sum.areaSqFt) : `${pts.length} pt${pts.length === 1 ? '' : 's'}`}
            {collapsed ? ' ▲' : ' ▼'}
          </span>
        </button>

        <div className="sheet-body">
          {showList ? (
            <BedList beds={beds} design={design} activeId={active.id} onSelect={selectBed} />
          ) : (
            <>
              <div className="measure" aria-live="polite">
                <div>
                  <b>{pts.length >= 3 ? fmtSqFt(sum.areaSqFt) : '—'}</b>
                  <span>Area (est.)</span>
                </div>
                <div>
                  <b>{pts.length >= 2 ? fmtFt(sum.perimeterFt) : '—'}</b>
                  <span>{pts.length >= 3 ? 'Perimeter' : 'Length so far'}</span>
                </div>
                <div>
                  <b>{mode === 'draw' && previewFt != null ? fmtFt(previewFt) : `${pts.length}`}</b>
                  <span>{mode === 'draw' && previewFt != null ? 'Next side' : 'Points'}</span>
                </div>
              </div>

              {warning && (
                <Notice kind="warn" role="alert">
                  {warning}
                </Notice>
              )}
              {imageryErr && (
                <Notice kind="warn" title="Imagery is not loading">
                  {imageryErr} could not be reached. Your beds are saved. Try another source from the menu at the top right.
                </Notice>
              )}

              {mode === 'draw' ? (
                <>
                  <p className="hint">
                    {isTouch() ? 'Tap the map at each corner of the bed, or line up the crosshair and use “Add point at crosshair.” Pinch and drag to move the map without adding points.' : 'Click each corner of the bed. Drag to move the map; the dashed line previews the next side.'}
                  </p>
                  <div className="btn-row">
                    <button type="button" className="btn" onClick={undo} disabled={!canUndo}>
                      Undo last point
                    </button>
                    <button type="button" className="btn btn-primary" onClick={finishBed} disabled={active.points.length < 3}>
                      Finish bed
                    </button>
                  </div>
                  <div className="btn-row">
                    <button type="button" className="btn btn-sm" onClick={() => setConfirmClear(true)} disabled={!active.points.length}>
                      Clear bed
                    </button>
                    <button type="button" className="btn btn-sm" onClick={cancelDrawing} disabled={!active.points.length && !snapshot.current[active.id]?.length}>
                      Cancel
                    </button>
                    <button type="button" className="btn btn-sm" onClick={() => setRename(active.name)}>
                      Rename
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="hint">Drag any corner to move it. Tap a corner to select it, then remove it. Tap a dashed dot between corners to add a corner there.</p>
                  <div className="btn-row">
                    <button type="button" className="btn" onClick={undo} disabled={!canUndo}>
                      Undo edit
                    </button>
                    <button type="button" className="btn" onClick={removeVertex} disabled={selVtx == null}>
                      Remove point{selVtx != null ? ` ${selVtx + 1}` : ''}
                    </button>
                  </div>
                  <div className="btn-row">
                    <button type="button" className="btn btn-sm" onClick={restoreShape} disabled={!snapshot.current[active.id]?.length}>
                      Restore original
                    </button>
                    <button type="button" className="btn btn-sm" onClick={redraw}>
                      Redraw bed
                    </button>
                    <button type="button" className="btn btn-sm" onClick={() => setRename(active.name)}>
                      Rename
                    </button>
                  </div>
                  <h2 style={{ fontSize: 15, margin: '10px 0 4px' }}>Side lengths (tap to change)</h2>
                  <ul className="sides">
                    {sum.sidesFt.map((ft, i) => (
                      <li key={i} className={hotSide === i ? 'hot' : ''}>
                        <span>Side {i + 1}</span>
                        <button type="button" className="btn btn-sm" onClick={() => openLength(i)} aria-label={`Side ${i + 1}, ${fmtFt(ft)}. Change length`}>
                          {fmtFt(ft)}
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <div className="btn-row">
                <button type="button" className="btn btn-sm" onClick={prevBed} disabled={idx === 0}>
                  ‹ Previous bed
                </button>
                <button type="button" className="btn btn-sm" onClick={nextBed} disabled={idx >= beds.length - 1}>
                  Next bed ›
                </button>
              </div>
              {allDone ? (
                <button type="button" className="btn btn-primary btn-block" onClick={() => dispatch({ type: 'setStage', stage: 'review' })}>
                  All beds drawn — review them
                </button>
              ) : (
                <p className="hint">
                  {beds.filter(bedValid).length} of {beds.length} beds finished. Measurements are estimates based on the aerial imagery, not a survey.
                </p>
              )}
            </>
          )}
        </div>
      </aside>

      {lengthEdit && (
        <Modal title={`Change side ${lengthEdit.side + 1} of ${active.name}`} onClose={() => { setLengthEdit(null); setHotSide(null); }}>
          <p>
            Current length: <b>{fmtFt(sum.sidesFt[lengthEdit.side])}</b>
          </p>
          <div className="field">
            <label htmlFor="newlen">New length in feet</label>
            <input id="newlen" className="input" type="number" inputMode="decimal" step="0.1" min="0.1" value={lengthEdit.value} onChange={(e) => setLengthEdit({ ...lengthEdit, value: e.target.value })} autoFocus />
          </div>
          <Notice kind="info">
            Point {lengthEdit.side + 1} stays where it is. Point {nextSide + 1} slides along the same line until the side is {lengthEdit.value || '…'} ft. That also changes the length of side {(nextSide) + 1} (the next side) and the bed's area.
          </Notice>
          <div className="btn-row">
            <button type="button" className="btn" onClick={() => { setLengthEdit(null); setHotSide(null); }}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={applyLength} disabled={!(parseFloat(lengthEdit.value) > 0)}>
              Apply length
            </button>
          </div>
        </Modal>
      )}

      {rename != null && (
        <Modal title="Rename bed" onClose={() => setRename(null)}>
          <div className="field">
            <label htmlFor="bedname">Bed name</label>
            <input id="bedname" className="input" type="text" value={rename} maxLength={40} onChange={(e) => setRename(e.target.value)} autoFocus placeholder="Front Walk Bed" />
          </div>
          <div className="btn-row">
            <button type="button" className="btn" onClick={() => setRename(null)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={!rename.trim()}
              onClick={() => {
                dispatch({ type: 'updateBed', id: active.id, patch: { name: rename.trim() } });
                setRename(null);
              }}
            >
              Save name
            </button>
          </div>
        </Modal>
      )}

      {confirmClear && (
        <Modal title={`Clear ${active.name}?`} onClose={() => setConfirmClear(false)}>
          <p>This removes all {active.points.length} points so you can draw the bed again. Other beds are not affected.</p>
          <div className="btn-row">
            <button type="button" className="btn" onClick={() => setConfirmClear(false)}>
              Keep points
            </button>
            <button type="button" className="btn btn-danger" onClick={clearBed}>
              Clear bed
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export function BedList({ beds, design, activeId, onSelect }) {
  return (
    <ul className="bedlist" aria-label="Beds">
      {beds.map((b) => {
        const s = summarize(b.points);
        return (
          <li key={b.id} className={b.id === activeId ? 'active' : ''}>
            <button type="button" className="row" onClick={() => onSelect(b.id)} aria-current={b.id === activeId ? 'true' : undefined}>
              <span className="chip" style={{ background: b.color }} />
              <span className="name">
                {b.name}
                <span className="status"> · Bed {b.number}</span>
              </span>
              {bedValid(b) && <span className="status">{fmtSqFt(s.areaSqFt)}</span>}
              <StatusPill status={bedStatus(b, design)} />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
