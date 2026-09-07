import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { imageryById } from '../lib/mapServices.js';

// Leaflet tile layer for an ArcGIS Server map service that has no tile
// cache (for example NYS orthoimagery). Each tile is fetched through the
// service's export operation using the tile's Web Mercator bounding box,
// so it lines up exactly with ordinary XYZ tiles.
const ArcGISExportLayer = L.TileLayer.extend({
  getTileUrl(coords) {
    const size = this.getTileSize();
    const nw = this._map.unproject(coords.scaleBy(size), coords.z);
    const se = this._map.unproject(coords.add([1, 1]).scaleBy(size), coords.z);
    const a = L.CRS.EPSG3857.project(nw);
    const b = L.CRS.EPSG3857.project(se);
    const bbox = [a.x, b.y, b.x, a.y].join(',');
    const image = this.options.imageService;
    const q = new URLSearchParams({
      f: 'image',
      format: 'jpg',
      bboxSR: '3857',
      imageSR: '3857',
      size: `${size.x},${size.y}`,
      bbox,
      ...(image ? {} : { transparent: 'false', dpi: '96' }),
      ...(this.options.params || {}),
    });
    return `${this._url}/${image ? 'exportImage' : 'export'}?${q}`;
  },
});
import { distanceMeters, metersToFeet, midpoint, sideLengths, summarize, fmtSqFt, offsetMeters } from '../lib/geometry.js';
import { plantById, categoryById, YEARS_TO_MATURE } from '../data/plants.js';

const isTouch = () => typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

function lenLabel(text, color, cls = '') {
  return L.divIcon({
    className: '',
    html: `<div class="lenlabel ${cls}" style="--c:${color}">${text}</div>`,
    iconSize: [0, 0],
  });
}

function escapeHtml(t) {
  return String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
}

// Deterministic pseudo-random in [0, 1) from a string and index, so a
// flower drift keeps the same outline every time it is drawn.
function hash01(str, i) {
  let h = 2166136261 ^ i;
  for (let k = 0; k < str.length; k++) {
    h ^= str.charCodeAt(k);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}

// An irregular, kidney-ish outline about 18 in. across for a flower or
// bulb grouping. Ten points around the center with a jittered radius.
export function driftShape(center, seed, diameterFt = 1.5) {
  const r = (diameterFt * 0.3048) / 2;
  const n = 10;
  const pts = [];
  const stretch = 1 + 0.35 * hash01(seed, 99); // slightly elongated
  const rot = hash01(seed, 98) * Math.PI;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const jitter = 0.72 + 0.56 * hash01(seed, i);
    const x = Math.cos(a) * r * jitter * stretch;
    const y = Math.sin(a) * r * jitter;
    const e = x * Math.cos(rot) - y * Math.sin(rot);
    const nn = x * Math.sin(rot) + y * Math.cos(rot);
    pts.push(offsetMeters(center, e, nn));
  }
  return pts;
}

const MapView = forwardRef(function MapView(
  {
    center,
    zoom,
    imageryId,
    beds,
    activeBedId,
    mode = 'view', // 'view' | 'draw' | 'edit'
    selectedVertex = null,
    hotSide = null,
    propertyMarker = null,
    interactive = true,
    onViewChange,
    onAddPoint,
    onMoveVertex,
    onSelectVertex,
    onInsertPoint,
    onSelectBed,
    onImageryError,
    onPreviewLength,
    plants = [],
    selectedPlantId = null,
    placing = false,
    placingPlantId = null, // plant being placed: a ghost footprint follows the pointer
    placingSpreadFt = null,
    growthYears = null, // null = mature; number = years after planting
    showScale = false,
    onPlacePlant,
    onSelectPlant,
    onMovePlant,
  },
  ref,
) {
  const el = useRef(null);
  const map = useRef(null);
  const tiles = useRef(null);
  const layers = useRef(null);
  const preview = useRef(null);
  const previewLabel = useRef(null);
  const propMarker = useRef(null);
  const cb = useRef({});
  cb.current = { onViewChange, onAddPoint, onMoveVertex, onSelectVertex, onInsertPoint, onSelectBed, onImageryError, onPreviewLength, onPlacePlant, onSelectPlant, onMovePlant };
  const plantLayers = useRef(null);
  const stateRef = useRef({});
  stateRef.current = { beds, activeBedId, mode, placing };
  // Layers of the active bed, updated imperatively while a vertex is dragged.
  const live = useRef({ poly: null, labels: [], mids: [], pts: [] });

  const applyLiveDrag = (idx, latlng) => {
    const lv = live.current;
    if (!lv.pts.length) return;
    lv.pts = lv.pts.slice();
    lv.pts[idx] = latlng;
    if (lv.poly) lv.poly.setLatLngs(lv.pts);
    const lens = sideLengths(lv.pts);
    lv.labels.forEach((mk, i) => {
      if (i >= lens.length) return;
      const color = mk.options.bedColor;
      mk.setLatLng(midpoint(lv.pts, i)).setIcon(lenLabel(`${metersToFeet(lens[i]).toFixed(1)} ft`, color, mk.options.hot ? 'hot' : ''));
    });
    lv.mids.forEach((mk, i) => mk.setLatLng(midpoint(lv.pts, i)));
  };

  useImperativeHandle(ref, () => ({
    flyTo: (latlng, z) => map.current?.setView(latlng, z ?? map.current.getZoom(), { animate: true }),
    fitPoints: (pts) => {
      const m = map.current;
      if (!m || !pts?.length) return;
      // The container may have just been laid out; measure before fitting.
      m.invalidateSize({ animate: false });
      if (pts.length === 1) return m.setView(pts[0], Math.max(m.getZoom(), 19), { animate: false });
      m.fitBounds(L.latLngBounds(pts), { padding: [36, 36], maxZoom: 21, animate: false });
    },
    getCenter: () => {
      const c = map.current?.getCenter();
      return c ? [c.lat, c.lng] : null;
    },
    invalidate: () => map.current?.invalidateSize(),
  }));

  // Create map once.
  useEffect(() => {
    if (map.current || !el.current) return;
    const m = L.map(el.current, {
      center,
      zoom,
      zoomControl: true,
      attributionControl: true,
      tap: true,
      touchZoom: true,
      doubleClickZoom: false, // double tap should not zoom while placing points
      maxZoom: 22,
      dragging: interactive,
      scrollWheelZoom: interactive,
    });
    map.current = m;
    if (showScale) L.control.scale({ imperial: true, metric: false, position: 'bottomleft', maxWidth: 140 }).addTo(m);
    layers.current = L.layerGroup().addTo(m);
    plantLayers.current = L.layerGroup().addTo(m);
    preview.current = L.polyline([], { color: '#fff', weight: 2, dashArray: '6 6', interactive: false });
    previewLabel.current = L.marker([0, 0], { icon: lenLabel('', '#fff', 'preview'), interactive: false, keyboard: false });

    m.on('moveend zoomend', () => {
      const c = m.getCenter();
      cb.current.onViewChange?.([c.lat, c.lng], m.getZoom());
    });
    m.on('click', (e) => {
      const { mode } = stateRef.current;
      if (mode === 'draw') cb.current.onAddPoint?.([e.latlng.lat, e.latlng.lng]);
      else if (mode === 'edit') cb.current.onSelectVertex?.(null);
      else if (mode === 'plant') {
        if (cb.current.onPlacePlant) cb.current.onPlacePlant([e.latlng.lat, e.latlng.lng]);
        else cb.current.onSelectPlant?.(null);
      }
    });
    const updatePreview = (latlng) => {
      const { beds, activeBedId, mode } = stateRef.current;
      const bed = beds.find((b) => b.id === activeBedId);
      if (mode !== 'draw' || !bed || bed.points.length === 0) {
        preview.current.remove();
        previewLabel.current.remove();
        cb.current.onPreviewLength?.(null);
        return;
      }
      const last = bed.points[bed.points.length - 1];
      const p = [latlng.lat, latlng.lng];
      preview.current.setLatLngs([last, p]).setStyle({ color: bed.color });
      const ft = metersToFeet(distanceMeters(last, p));
      previewLabel.current.setLatLng([(last[0] + p[0]) / 2, (last[1] + p[1]) / 2]).setIcon(lenLabel(`${ft.toFixed(1)} ft`, bed.color, 'preview'));
      if (!m.hasLayer(preview.current)) preview.current.addTo(m);
      if (!m.hasLayer(previewLabel.current)) previewLabel.current.addTo(m);
      cb.current.onPreviewLength?.(ft);
    };
    if (isTouch()) {
      m.on('move', () => updatePreview(m.getCenter()));
    } else {
      m.on('mousemove', (e) => updatePreview(e.latlng));
      m.on('mouseout', () => updatePreview(m.getCenter()));
    }
    return () => {
      m.remove();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Imagery source.
  useEffect(() => {
    const m = map.current;
    if (!m) return;
    const src = imageryById(imageryId);
    if (tiles.current) tiles.current.remove();
    let errors = 0;
    let loaded = 0;
    const dynamic = src.type === 'arcgis-export' || src.type === 'arcgis-image';
    const opts = {
      maxNativeZoom: src.maxNativeZoom,
      maxZoom: 22,
      attribution: src.attribution,
      crossOrigin: src.crossOrigin !== false,
      // Government map servers sometimes refuse images that arrive with a
      // third-party Referer; sending none matches opening the URL directly.
      referrerPolicy: 'no-referrer',
      bounds: src.bounds ? L.latLngBounds(src.bounds) : undefined,
      // Dynamic export services render each tile on request; fetching only
      // when the map settles and keeping fewer off-screen tiles cuts the
      // request burst that makes these servers time out.
      ...(dynamic ? { updateWhenIdle: true, updateWhenZooming: false, keepBuffer: 1 } : {}),
    };
    const t =
      src.type === 'arcgis-export' || src.type === 'arcgis-image'
        ? new ArcGISExportLayer(src.url, { ...opts, imageService: src.type === 'arcgis-image', params: src.params })
        : L.tileLayer(src.url, opts);
    t.on('tileerror', (ev) => {
      errors += 1;
      // Only report when the source is failing outright, not when a slow
      // dynamic server drops a few tiles out of many.
      if (errors >= 6 && loaded === 0) cb.current.onImageryError?.(src);
      if (import.meta.env?.DEV) console.warn('tile error', ev?.tile?.src);
    });
    t.on('tileload', () => {
      loaded += 1;
    });
    t.on('load', () => {
      if (loaded > 0) errors = 0;
    });
    t.addTo(m);
    tiles.current = t;
  }, [imageryId]);

  // Keep map centered when parent changes center/zoom programmatically.
  useEffect(() => {
    const m = map.current;
    if (!m || !center) return;
    const c = m.getCenter();
    if (Math.abs(c.lat - center[0]) > 1e-7 || Math.abs(c.lng - center[1]) > 1e-7 || m.getZoom() !== zoom) {
      m.setView(center, zoom, { animate: false });
    }
  }, [center?.[0], center?.[1], zoom]);

  // Property marker.
  useEffect(() => {
    const m = map.current;
    if (!m) return;
    if (propMarker.current) propMarker.current.remove();
    if (!propertyMarker) return;
    propMarker.current = L.marker(propertyMarker, {
      icon: L.divIcon({
        className: '',
        html: '<div style="width:18px;height:18px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#1f3a2a;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.6)"></div>',
        iconSize: [18, 18],
        iconAnchor: [9, 18],
      }),
      interactive: false,
      keyboard: false,
    }).addTo(m);
  }, [propertyMarker?.[0], propertyMarker?.[1]]);

  // Draw beds, handles, and labels.
  useEffect(() => {
    const m = map.current;
    const g = layers.current;
    if (!m || !g) return;
    g.clearLayers();
    live.current = { poly: null, labels: [], mids: [], pts: [] };
    const c = el.current?.classList;
    if (c) {
      c.toggle('drawing', mode === 'draw');
      c.toggle('editing', mode === 'edit');
      c.toggle('viewing', mode === 'view');
      c.toggle('panning', mode === 'view' || mode === 'edit');
    }
    if (mode !== 'draw') {
      preview.current.remove();
      previewLabel.current.remove();
    }

    for (const bed of beds) {
      const active = bed.id === activeBedId;
      const pts = bed.points;
      if (!pts.length) continue;
      const opacity = active ? 1 : 0.55;

      if (pts.length >= 3 && (bed.closed || active)) {
        const poly = L.polygon(pts, {
          color: bed.color,
          weight: active ? 4 : 3,
          opacity,
          fillColor: bed.color,
          fillOpacity: mode === 'view' ? 0.3 : mode === 'plant' ? 0.08 : active ? 0.28 : 0.15,
          dashArray: bed.closed ? null : '8 8',
          interactive: mode !== 'draw' && !!cb.current.onSelectBed,
        });
        poly.on('click', (e) => {
          L.DomEvent.stop(e);
          cb.current.onSelectBed?.(bed.id);
        });
        poly.addTo(g);
        if (active) live.current.poly = poly;
      } else if (pts.length >= 2) {
        const line = L.polyline(pts, { color: bed.color, weight: 4, opacity, interactive: false }).addTo(g);
        if (active) live.current.poly = line;
      }
      if (active) live.current.pts = pts.slice();

      // In view mode (Review, report) show one label per bed instead of
      // per-side lengths, which would clutter a map of the whole yard.
      // In plant mode show no bed labels at all; the plants are the subject.
      if (mode === 'plant') continue;
      if (mode === 'view') {
        if (pts.length >= 3 && bed.closed) {
          const c = L.polygon(pts).getBounds().getCenter();
          L.marker(c, {
            icon: L.divIcon({
              className: '',
              html: `<div class="bedlabel" style="--c:${bed.color}">Bed ${bed.number}<small>${fmtSqFt(summarize(pts).areaSqFt)}</small></div>`,
              iconSize: [0, 0],
            }),
            interactive: false,
            keyboard: false,
          }).addTo(g);
        }
        continue;
      }

      // Side-length labels.
      const lens = sideLengths(pts);
      const sideCount = bed.closed || (active && mode !== 'draw') ? pts.length : pts.length - 1;
      for (let i = 0; i < sideCount && i < lens.length; i++) {
        if (pts.length < 2) break;
        const mp = midpoint(pts, i);
        const isHot = active && hotSide === i;
        const lbl = L.marker(mp, {
          icon: lenLabel(`${metersToFeet(lens[i]).toFixed(1)} ft`, bed.color, isHot ? 'hot' : ''),
          interactive: false,
          keyboard: false,
          opacity: active ? 1 : 0.7,
          bedColor: bed.color,
          hot: isHot,
        }).addTo(g);
        if (active) live.current.labels.push(lbl);
      }

      // Vertex handles (active bed only).
      if (active && mode !== 'view') {
        const editable = mode === 'edit' || mode === 'draw';
        pts.forEach((p, idx) => {
          const sel = selectedVertex === idx;
          const mk = L.marker(p, {
            draggable: editable,
            keyboard: false,
            icon: L.divIcon({
              className: '',
              html: `<div class="vtx ${sel ? 'sel' : ''} ${idx === 0 ? 'first' : ''}" style="--c:${bed.color}" role="button" aria-label="Point ${idx + 1}"></div>`,
              iconSize: [28, 28],
              iconAnchor: [14, 14],
            }),
            zIndexOffset: 1000,
          });
          mk.on('click', (e) => {
            L.DomEvent.stop(e);
            cb.current.onSelectVertex?.(idx);
          });
          mk.on('drag', (e) => {
            const ll = e.target.getLatLng();
            applyLiveDrag(idx, [ll.lat, ll.lng]);
            cb.current.onMoveVertex?.(idx, [ll.lat, ll.lng], false);
          });
          mk.on('dragend', (e) => {
            const ll = e.target.getLatLng();
            cb.current.onMoveVertex?.(idx, [ll.lat, ll.lng], true);
          });
          mk.addTo(g);
        });
        // Midpoint handles to insert a new point (edit mode only).
        if (mode === 'edit' && pts.length >= 3) {
          for (let i = 0; i < pts.length; i++) {
            const mp = midpoint(pts, i);
            const mk = L.marker(mp, {
              keyboard: false,
              icon: L.divIcon({
                className: '',
                html: `<div class="mid" style="--c:${bed.color}" role="button" aria-label="Add a point on side ${i + 1}"></div>`,
                iconSize: [18, 18],
                iconAnchor: [9, 9],
              }),
              zIndexOffset: 900,
            });
            mk.on('click', (e) => {
              L.DomEvent.stop(e);
              cb.current.onInsertPoint?.(i, mp);
            });
            mk.addTo(g);
            live.current.mids.push(mk);
          }
        }
      }
    }
  }, [beds, activeBedId, mode, selectedVertex, hotSide]);

  // Plants: circles sized to mature spread for trees and shrubs, small
  // irregular drifts for flowers and bulbs.
  useEffect(() => {
    const m = map.current;
    const g = plantLayers.current;
    if (!m || !g) return;
    g.clearLayers();
    const editable = mode === 'plant';
    el.current?.classList.toggle('placing', editable && !!placing);
    el.current?.classList.toggle('panning', editable && !placing);
    for (const pl of plants) {
      const info = plantById(pl.plantId);
      if (!info) continue;
      const cat = categoryById(info.category);
      const selected = pl.id === selectedPlantId;
      const center = [pl.lat, pl.lng];
      const style = {
        color: selected ? '#fff' : cat.color,
        weight: selected ? 3 : 2,
        opacity: 0.95,
        fillColor: cat.color,
        fillOpacity: selected ? 0.5 : 0.32,
        interactive: editable,
        bubblingMouseEvents: false,
      };
      let shape;
      if (info.category === 'flower') {
        shape = L.polygon(driftShape(center, pl.id), style);
      } else {
        const spreadFt = pl.spreadFt || info.spreadFt;
        const yrs = YEARS_TO_MATURE[info.category] || 0;
        const factor = growthYears == null || !yrs ? 1 : Math.max(0.12, Math.min(1, growthYears / yrs));
        shape = L.circle(center, { ...style, radius: (spreadFt * factor * 0.3048) / 2, dashArray: info.category === 'existing' ? '6 6' : null });
      }
      // A tap on an existing plant selects it — unless a new plant is being
      // placed, in which case the tap adds the new plant right there. This
      // is what lets a shrub go inside a tree's canopy circle.
      shape.on('click', (e) => {
        L.DomEvent.stop(e);
        if (stateRef.current.placing && cb.current.onPlacePlant) cb.current.onPlacePlant([e.latlng.lat, e.latlng.lng]);
        else cb.current.onSelectPlant?.(pl.id);
      });
      shape.addTo(g);

      // Labels: trees and shrubs are labeled from zoom 19; small plants
      // (grasses, flowers, existing) only from zoom 21, where a drift is
      // wide enough to carry a label without piling on its neighbors. The
      // selected plant is always labeled.
      const big = info.category === 'tree' || info.category === 'shrub';
      const minLabelZoom = big ? 19 : 21;
      L.marker(center, {
        icon: L.divIcon({ className: '', html: `<div class="plantlabel ${big ? 'big' : 'small'}" data-minzoom="${minLabelZoom}" style="--c:${cat.color}">${escapeHtml(info.name)}</div>`, iconSize: [0, 0] }),
        interactive: false,
        keyboard: false,
        opacity: selected || m.getZoom() >= minLabelZoom ? 1 : 0,
        zIndexOffset: selected ? 500 : big ? 100 : 0,
      }).addTo(g);

      // Drag handle for the selected plant.
      if (editable && selected) {
        const mk = L.marker(center, {
          draggable: true,
          keyboard: false,
          zIndexOffset: 1200,
          icon: L.divIcon({ className: '', html: `<div class="vtx sel" style="--c:${cat.color}" role="button" aria-label="Move ${escapeHtml(info.name)}"></div>`, iconSize: [28, 28], iconAnchor: [14, 14] }),
        });
        mk.on('drag', (e) => {
          const ll = e.target.getLatLng();
          if (shape.setLatLng) shape.setLatLng(ll);
          else shape.setLatLngs(driftShape([ll.lat, ll.lng], pl.id));
        });
        mk.on('dragend', (e) => {
          const ll = e.target.getLatLng();
          cb.current.onMovePlant?.(pl.id, [ll.lat, ll.lng]);
        });
        mk.addTo(g);
      }
    }
    const relabel = () => {
      // Show/hide labels as zoom crosses each label's threshold.
      const z = m.getZoom();
      g.eachLayer((l) => {
        const html = l.options.icon?.options?.html;
        if (!(l instanceof L.Marker) || !html?.includes('plantlabel')) return;
        const mz = Number(html.match(/data-minzoom="(\d+)"/)?.[1] || 19);
        const isSel = selectedPlantId && html.includes('plantlabel') && l.getLatLng && plants.some((p) => p.id === selectedPlantId && Math.abs(p.lat - l.getLatLng().lat) < 1e-9 && Math.abs(p.lng - l.getLatLng().lng) < 1e-9);
        l.setOpacity(isSel || z >= mz ? 1 : 0);
      });
    };
    m.on('zoomend', relabel);
    return () => m.off('zoomend', relabel);
  }, [plants, selectedPlantId, mode, placing, growthYears]);

  // Ghost footprint: while placing, a translucent circle (or drift) at the
  // plant's mature spread follows the pointer so the user sees exactly how
  // much ground the plant will take before tapping. Pointer devices only.
  useEffect(() => {
    const m = map.current;
    if (!m) return;
    const info = placingPlantId ? plantById(placingPlantId) : null;
    if (!info || !placing) return;
    const cat = categoryById(info.category);
    const style = { color: cat.color, weight: 2, opacity: 0.9, dashArray: '4 6', fillColor: cat.color, fillOpacity: 0.18, interactive: false };
    const spreadFt = placingSpreadFt || info.spreadFt;
    let ghost = null;
    const build = (ll) => (info.category === 'flower' ? L.polygon(driftShape([ll.lat, ll.lng], 'ghost'), style) : L.circle(ll, { ...style, radius: (spreadFt * 0.3048) / 2 }));
    const onMove = (e) => {
      if (!ghost) ghost = build(e.latlng).addTo(m);
      else if (ghost.setLatLng) ghost.setLatLng(e.latlng);
      else ghost.setLatLngs(driftShape([e.latlng.lat, e.latlng.lng], 'ghost'));
    };
    const onOut = () => {
      if (ghost) {
        ghost.remove();
        ghost = null;
      }
    };
    m.on('mousemove', onMove);
    m.on('mouseout', onOut);
    el.current?.classList.add('ghosting');
    return () => {
      m.off('mousemove', onMove);
      m.off('mouseout', onOut);
      onOut();
      el.current?.classList.remove('ghosting');
    };
  }, [placing, placingPlantId, placingSpreadFt]);

  // Re-measure after layout changes (bottom sheet expand/collapse).
  useEffect(() => {
    const m = map.current;
    if (!m || !el.current) return;
    const ro = new ResizeObserver(() => m.invalidateSize());
    ro.observe(el.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="mapwrap">
      <div ref={el} className="leaflet-container" role="application" aria-label="Aerial map of the property" />
      {showScale && (
        <div className="northarrow" aria-label="North is up" title="North is up">
          <svg viewBox="0 0 24 32" width="22" height="30" aria-hidden="true">
            <polygon points="12,2 19,26 12,21 5,26" fill="#fff" stroke="#000" strokeWidth="1.5" />
          </svg>
          N
        </div>
      )}
      {mode === 'draw' && isTouch() && <div className="crosshair" aria-hidden="true" />}
    </div>
  );
});

export default MapView;
