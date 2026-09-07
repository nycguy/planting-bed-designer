// Geocoding: Photon (komoot) — OpenStreetMap-based, no key, permits
// autocomplete-style queries at hobby volumes. Nominatim is the fallback for a
// single confirmed lookup when Photon is unreachable.

const PHOTON = 'https://photon.komoot.io/api/';
const NOMINATIM = 'https://nominatim.openstreetmap.org/search';

export class GeocodeError extends Error {
  constructor(message, kind) {
    super(message);
    this.kind = kind; // 'network' | 'limit' | 'none'
  }
}

function formatPhoton(f) {
  const p = f.properties || {};
  const line1 = [p.housenumber, p.street || p.name].filter(Boolean).join(' ');
  const line2 = [p.city || p.town || p.village || p.county, p.state, p.postcode].filter(Boolean).join(', ');
  const [lng, lat] = f.geometry.coordinates;
  return {
    label: line1 || p.name || 'Unnamed place',
    detail: [line2, p.country].filter(Boolean).join(', '),
    lat,
    lng,
    postcode: p.postcode || null,
    isAddress: !!p.housenumber,
  };
}

export async function suggestAddresses(query, { signal, bias } = {}) {
  const q = query.trim();
  if (q.length < 3) return [];
  const url = new URL(PHOTON);
  url.searchParams.set('q', q);
  url.searchParams.set('limit', '8');
  url.searchParams.set('lang', 'en');
  if (bias) {
    url.searchParams.set('lat', bias.lat);
    url.searchParams.set('lon', bias.lng);
  }
  let res;
  try {
    res = await fetch(url, { signal });
  } catch (e) {
    if (e.name === 'AbortError') throw e;
    throw new GeocodeError('Address search is unavailable. Check your connection and try again.', 'network');
  }
  if (res.status === 429) throw new GeocodeError('Too many searches in a short time. Wait a moment and try again.', 'limit');
  if (!res.ok) throw new GeocodeError('Address search failed. Try again.', 'network');
  const data = await res.json();
  const items = (data.features || []).map(formatPhoton);
  // Favor complete residential addresses (with house numbers).
  items.sort((a, b) => Number(b.isAddress) - Number(a.isAddress));
  return items;
}

export async function geocodeOnce(query, { signal } = {}) {
  const url = new URL(NOMINATIM);
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('limit', '1');
  url.searchParams.set('addressdetails', '1');
  let res;
  try {
    res = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  } catch {
    throw new GeocodeError('Address search is unavailable. Check your connection and try again.', 'network');
  }
  if (res.status === 429) throw new GeocodeError('Too many searches in a short time. Wait a moment and try again.', 'limit');
  if (!res.ok) throw new GeocodeError('Address search failed. Try again.', 'network');
  const data = await res.json();
  if (!data.length) throw new GeocodeError('Address not found. Check the spelling or try adding the city and state.', 'none');
  const r = data[0];
  return { label: r.display_name, detail: '', lat: Number(r.lat), lng: Number(r.lon), postcode: r.address?.postcode || null, isAddress: true };
}

// Imagery sources. All are true top-down (orthographic) imagery.
//
// Two kinds:
//   type 'xyz'           — pre-rendered tiles addressed by {z}/{x}/{y}.
//   type 'arcgis-export' — an ArcGIS Server map service with no tile cache.
//                          The app requests each 256 px tile through the
//                          service's export operation with a Web Mercator
//                          bounding box. Slightly slower than cached tiles
//                          but the imagery is rendered at whatever scale
//                          the map is showing, so it stays sharp when zoomed
//                          in on a single yard.
const MAPTILER_KEY = import.meta.env?.VITE_MAPTILER_KEY;

export const IMAGERY = [
  {
    id: 'nys',
    type: 'arcgis-export',
    name: 'New York State Orthoimagery (latest)',
    url: 'https://orthos.its.ny.gov/arcgis/rest/services/wms/Latest/MapServer',
    // Statewide mosaic of the most recent NYSDOP flights (2022–2025), natural
    // color, 12-inch or 6-inch source pixels. Leaf-off spring imagery, which
    // makes bed edges and hardscape easier to see than summer canopy.
    maxNativeZoom: 21,
    maxZoom: 22,
    // Service extent is New York State only; outside it the map is blank.
    bounds: [[40.45, -79.8], [45.05, -71.8]],
    attribution: 'Orthoimagery &copy; NYS ITS Geospatial Services (NYSDOP)',
    crossOrigin: false,
  },
  {
    id: 'esri',
    type: 'xyz',
    name: 'Esri World Imagery',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    maxNativeZoom: 19,
    maxZoom: 22,
    attribution: 'Imagery &copy; Esri, Maxar, Earthstar Geographics, and the GIS User Community',
    crossOrigin: true,
  },
  {
    id: 'usgs',
    type: 'xyz',
    name: 'USGS Imagery (US only)',
    url: 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}',
    maxNativeZoom: 16,
    maxZoom: 22,
    attribution: 'Imagery courtesy of the U.S. Geological Survey',
    crossOrigin: true,
  },
  ...(MAPTILER_KEY
    ? [
        {
          id: 'maptiler',
          type: 'xyz',
          name: 'MapTiler Satellite',
          url: `https://api.maptiler.com/tiles/satellite-v2/{z}/{x}/{y}.jpg?key=${MAPTILER_KEY}`,
          maxNativeZoom: 20,
          maxZoom: 22,
          attribution: '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          crossOrigin: true,
        },
      ]
    : []),
];

export const DEFAULT_IMAGERY = 'nys';
export const imageryById = (id) => IMAGERY.find((s) => s.id === id) || IMAGERY[0];

// True when a point falls inside a source's published coverage. Sources
// without a bounds entry are treated as worldwide.
export function imageryCovers(src, lat, lng) {
  if (!src?.bounds) return true;
  const [[s, w], [n, e]] = src.bounds;
  return lat >= s && lat <= n && lng >= w && lng <= e;
}

// Pick the best source for a location: the default if it covers the point,
// otherwise the first worldwide source.
export function bestImageryFor(lat, lng) {
  const def = imageryById(DEFAULT_IMAGERY);
  if (imageryCovers(def, lat, lng)) return def.id;
  return IMAGERY.find((s) => !s.bounds)?.id || def.id;
}
