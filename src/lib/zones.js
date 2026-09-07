// USDA Plant Hardiness Zone lookup.
//
// Source: phzmapi.org — a static JSON mirror of the 2023 USDA Plant Hardiness
// Zone Map (PRISM Climate Group, Oregon State University), keyed by ZIP
// code. No key, no account. If the ZIP is missing from that dataset, or the
// request fails, the app asks the user to pick a zone instead.

const PHZM = 'https://phzmapi.org/';
const NOMINATIM_REVERSE = 'https://nominatim.openstreetmap.org/reverse';

export const ZONE_OPTIONS = ['3a', '3b', '4a', '4b', '5a', '5b', '6a', '6b', '7a', '7b', '8a', '8b', '9a', '9b', '10a', '10b'];

export class ZoneError extends Error {
  constructor(message, kind) {
    super(message);
    this.kind = kind; // 'no-zip' | 'not-found' | 'network'
  }
}

export function normalizeZip(v) {
  const m = String(v || '').match(/\b(\d{5})(?:-\d{4})?\b/);
  return m ? m[1] : null;
}

export async function zipForPoint(lat, lng, { signal } = {}) {
  const url = new URL(NOMINATIM_REVERSE);
  url.searchParams.set('lat', lat);
  url.searchParams.set('lon', lng);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('zoom', '18');
  const res = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  if (!res.ok) throw new ZoneError('Could not look up the ZIP code for this location.', 'network');
  const data = await res.json();
  return normalizeZip(data?.address?.postcode);
}

export async function zoneForZip(zip, { signal } = {}) {
  const z = normalizeZip(zip);
  if (!z) throw new ZoneError('No ZIP code was found for this address.', 'no-zip');
  let res;
  try {
    res = await fetch(`${PHZM}${z}.json`, { signal });
  } catch (e) {
    if (e.name === 'AbortError') throw e;
    throw new ZoneError('The hardiness zone service could not be reached.', 'network');
  }
  if (res.status === 404) throw new ZoneError(`ZIP ${z} is not in the hardiness zone dataset.`, 'not-found');
  if (!res.ok) throw new ZoneError('The hardiness zone service returned an error.', 'network');
  const data = await res.json();
  if (!data?.zone) throw new ZoneError(`No zone is listed for ZIP ${z}.`, 'not-found');
  return {
    zone: String(data.zone).toLowerCase(),
    tempRange: data.temperature_range || null, // e.g. "0 to 5" (°F)
    zip: z,
    source: 'USDA PHZM 2023 via phzmapi.org',
    fetchedAt: new Date().toISOString(),
    manual: false,
  };
}

// Full lookup for a geocoded address: use its postcode if the geocoder
// supplied one, otherwise reverse-geocode the point for a ZIP, then fetch.
export async function zoneForLocation({ lat, lng, postcode }, { signal } = {}) {
  let zip = normalizeZip(postcode);
  if (!zip) zip = await zipForPoint(lat, lng, { signal });
  return zoneForZip(zip, { signal });
}

export function manualZone(zone) {
  return { zone: String(zone).toLowerCase(), tempRange: null, zip: null, source: 'Chosen by user', fetchedAt: new Date().toISOString(), manual: true };
}

export function zoneLabel(z) {
  if (!z?.zone) return 'Unknown';
  const t = z.tempRange ? ` (average annual low ${z.tempRange.replace(' to ', ' to ')} °F)` : '';
  return `Zone ${z.zone}${t}`;
}
