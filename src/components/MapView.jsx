import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { imageryById } from '../lib/mapServices.js';
import { distanceMeters, metersToFeet, midpoint, sideLengths } from '../lib/geometry.js';

const isTouch = () => typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

function lenLabel(text, color, cls = '') {
  return L.divIcon({
    className: '',
    html: `<div class="lenlabel ${cls}" style="--c:${color}">${text}</div>`,
    iconSize: [0, 0],
  });
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
  cb.current = { onViewChange, onAddPoint, onMoveVertex, onSelectVertex, onInsertPoint, onSelectBed, onImageryError, onPreviewLength };
  const stateRef = useRef({});
  stateRef.current = { beds, activeBedId, mode };
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
      if (!map.current || !pts?.length) return;
      if (pts.length === 1) return map.current.setView(pts[0], Math.max(map.current.getZoom(), 19));
      map.current.fitBounds(L.latLngBounds(pts), { padding: [40, 40], maxZoom: 21 });
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
    layers.current = L.layerGroup().addTo(m);
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
    const t = L.tileLayer(src.url, {
      maxNativeZoom: src.maxNativeZoom,
      maxZoom: 22,
      attribution: src.attribution,
      crossOrigin: true,
    });
    t.on('tileerror', () => {
      errors += 1;
      if (errors === 6) cb.current.onImageryError?.(src);
    });
    t.on('load', () => {
      errors = 0;
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
    el.current?.classList.toggle('drawing', mode === 'draw');
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
          fillOpacity: active ? 0.28 : 0.15,
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
      {mode === 'draw' && isTouch() && <div className="crosshair" aria-hidden="true" />}
    </div>
  );
});

export default MapView;
