import { useEffect, useRef, useState } from 'react';
import MapView from './MapView.jsx';
import { Notice } from './Shared.jsx';
import { suggestAddresses, geocodeOnce, IMAGERY, DEFAULT_IMAGERY, imageryById } from '../lib/mapServices.js';

const START_CENTER = [39.5, -98.35]; // continental US

export default function LocationStage({ design, dispatch }) {
  const loc = design.location;
  const [query, setQuery] = useState(loc?.address || '');
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [imageryErr, setImageryErr] = useState(null);
  const [searching, setSearching] = useState(!loc);
  const abortRef = useRef(null);
  const mapRef = useRef(null);

  // Debounced suggestions.
  useEffect(() => {
    if (!searching) return;
    if (query.trim().length < 3) {
      setItems([]);
      return;
    }
    const t = setTimeout(async () => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      setBusy(true);
      setError(null);
      try {
        const res = await suggestAddresses(query, { signal: ac.signal, bias: loc ? { lat: loc.lat, lng: loc.lng } : null });
        if (!ac.signal.aborted) setItems(res);
      } catch (e) {
        if (e.name !== 'AbortError') setError(e.message);
      } finally {
        if (!ac.signal.aborted) setBusy(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [query, searching]);

  const choose = (item) => {
    const address = [item.label, item.detail].filter(Boolean).join(', ');
    dispatch({
      type: 'setLocation',
      location: { address, lat: item.lat, lng: item.lng, zoom: 19, imagery: loc?.imagery || DEFAULT_IMAGERY, marker: [item.lat, item.lng] },
    });
    setItems([]);
    setSearching(false);
    setQuery(address);
  };

  const searchNow = async () => {
    if (query.trim().length < 3) return;
    setBusy(true);
    setError(null);
    try {
      const res = await suggestAddresses(query);
      if (res.length) return setItems(res);
      const one = await geocodeOnce(query);
      choose(one);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const onViewChange = (center, zoom) => {
    if (!loc) return;
    if (Math.abs(center[0] - loc.lat) < 1e-9 && Math.abs(center[1] - loc.lng) < 1e-9 && zoom === loc.zoom) return;
    dispatch({ type: 'setLocation', location: { lat: center[0], lng: center[1], zoom } });
  };

  return (
    <div className="maplayout">
      {loc && !searching ? (
        <>
          <MapView
            ref={mapRef}
            center={[loc.lat, loc.lng]}
            zoom={loc.zoom}
            imageryId={loc.imagery}
            beds={design.beds}
            activeBedId={null}
            mode="view"
            propertyMarker={loc.marker}
            onViewChange={onViewChange}
            onImageryError={(src) => setImageryErr(src.name)}
          />
          <div className="map-overlay tr">
            <button type="button" className="mapbtn" onClick={() => mapRef.current?.flyTo(loc.marker || [loc.lat, loc.lng], 19)} aria-label="Return to the selected property" title="Return to property">
              ⌖
            </button>
            {IMAGERY.length > 1 && (
              <select
                className="mapbtn text"
                aria-label="Aerial imagery source"
                value={loc.imagery}
                onChange={(e) => {
                  setImageryErr(null);
                  dispatch({ type: 'setLocation', location: { imagery: e.target.value } });
                }}
              >
                {IMAGERY.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="map-banner" aria-live="polite">
            {imageryById(loc.imagery).name}
          </div>
          <div className="sheet">
            <div className="sheet-body" style={{ paddingTop: 12 }}>
              <p style={{ margin: '0 0 4px', fontWeight: 600 }}>{loc.address}</p>
              <p className="hint">Pan and zoom until your house and yard fill the screen. The marker shows where the address was found; the map itself is what matters.</p>
              {imageryErr && (
                <Notice kind="warn" title="Imagery is not loading">
                  {imageryErr} could not be reached. Your design is safe. Try another imagery source from the menu at the top right, or check your connection.
                </Notice>
              )}
              <div className="btn-row">
                <button type="button" className="btn" onClick={() => setSearching(true)}>
                  Change address
                </button>
                <button type="button" className="btn btn-primary" onClick={() => dispatch({ type: 'setStage', stage: 'sketch' })}>
                  This is my property
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="page">
          <h1>Find your property</h1>
          <p>Enter the street address. Pick the closest match and you can fine-tune the position on the map.</p>
          <div className="field">
            <label htmlFor="addr">Street address</label>
            <input
              id="addr"
              className="input"
              type="text"
              autoComplete="street-address"
              placeholder="123 Main St, Springfield, IL"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchNow()}
              aria-describedby="addr-help"
              aria-autocomplete="list"
              aria-expanded={items.length > 0}
              aria-controls="addr-list"
            />
            {items.length > 0 && (
              <ul id="addr-list" className="suggest" role="listbox" aria-label="Matching addresses">
                {items.map((it, i) => (
                  <li key={i} role="option" aria-selected="false">
                    <button type="button" onClick={() => choose(it)}>
                      <span className="lbl">{it.label}</span>
                      <span className="det">{it.detail}</span>
                      {it.isAddress && <span className="tag">Street address</span>}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <p id="addr-help" className="hint">
            {busy ? 'Searching…' : 'Suggestions appear as you type.'}
          </p>
          {error && (
            <Notice kind="err" title="Address search problem">
              {error}
            </Notice>
          )}
          <div className="btn-row">
            {loc && (
              <button type="button" className="btn" onClick={() => setSearching(false)}>
                Keep current location
              </button>
            )}
            <button type="button" className="btn btn-primary" onClick={searchNow} disabled={query.trim().length < 3 || busy}>
              Search
            </button>
          </div>
          <p className="hint">Addresses come from OpenStreetMap data. Nothing you type is stored anywhere except on this device.</p>
        </div>
      )}
    </div>
  );
}
