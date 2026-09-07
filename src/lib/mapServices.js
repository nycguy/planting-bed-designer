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
  return { label: r.display_name, detail: '', lat: Number(r.lat), lng: Number(r.lon), isAddress: true };
}

// Imagery sources. All are true top-down (orthographic) tiles.
const MAPTILER_KEY = import.meta.env?.VITE_MAPTILER_KEY;

export const IMAGERY = [
  {
    id: 'esri',
    name: 'Esri World Imagery',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    maxNativeZoom: 19,
    maxZoom: 22,
    attribution: 'Imagery &copy; Esri, Maxar, Earthstar Geographics, and the GIS User Community',
  },
  {
    id: 'usgs',
    name: 'USGS Imagery (US only)',
    url: 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}',
    maxNativeZoom: 16,
    maxZoom: 22,
    attribution: 'Imagery courtesy of the U.S. Geological Survey',
  },
  ...(MAPTILER_KEY
    ? [
        {
          id: 'maptiler',
          name: 'MapTiler Satellite',
          url: `https://api.maptiler.com/tiles/satellite-v2/{z}/{x}/{y}.jpg?key=${MAPTILER_KEY}`,
          maxNativeZoom: 20,
          maxZoom: 22,
          attribution: '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        },
      ]
    : []),
];

export const DEFAULT_IMAGERY = 'esri';
export const imageryById = (id) => IMAGERY.find((s) => s.id === id) || IMAGERY[0];
