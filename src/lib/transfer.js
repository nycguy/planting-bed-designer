import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';

const PARAM = 'd';

/**
 * Encode a design (without photo bytes) into a URL fragment so it can be
 * opened in another browser. Photo bytes stay in the original browser's
 * IndexedDB; photo metadata is stripped so the new browser asks again.
 */
export function encodeDesign(design) {
  const slim = {
    ...design,
    beds: design.beds.map((b) => ({ ...b, photo: null })),
  };
  return compressToEncodedURIComponent(JSON.stringify(slim));
}

export function decodeDesign(encoded) {
  try {
    const json = decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    const d = JSON.parse(json);
    if (!d || !Array.isArray(d.beds)) return null;
    return d;
  } catch {
    return null;
  }
}

export function transferUrl(design, base = globalThis.location?.href || '') {
  const url = new URL(base);
  url.hash = `${PARAM}=${encodeDesign(design)}`;
  return url.toString();
}

/** Read and remove a transferred design from the current URL hash. */
export function consumeTransferFromUrl() {
  if (!globalThis.location) return null;
  const hash = globalThis.location.hash.replace(/^#/, '');
  const params = new URLSearchParams(hash);
  const enc = params.get(PARAM);
  if (!enc) return null;
  const design = decodeDesign(enc);
  try {
    history.replaceState(null, '', globalThis.location.pathname + globalThis.location.search);
  } catch {
    /* ignore */
  }
  return design;
}

/**
 * Heuristic detection of in-app browsers (WKWebView inside ChatGPT, Gmail,
 * Facebook, Instagram, etc.). These are exactly the environments where the
 * iOS photo picker has been observed to close early. Safari and standalone
 * (home-screen) Safari are treated as safe.
 */
export function detectEnvironment(ua = globalThis.navigator?.userAgent || '', nav = globalThis.navigator) {
  const isIOS = /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && nav?.maxTouchPoints > 1);
  const isAndroid = /Android/i.test(ua);
  const knownApps = /ChatGPT|OpenAI|FBAN|FBAV|Instagram|Twitter|Line\/|MicroMessenger|GSA\/|Snapchat|LinkedIn|Slack|Teams|Outlook/i.test(ua);
  // iOS Safari includes "Safari/" and "Version/". WKWebView in-app browsers
  // usually omit "Safari/" (and always omit "Version/" when embedded).
  const iosLooksEmbedded = isIOS && (!/Safari\//.test(ua) || !/Version\//.test(ua));
  const androidWebView = isAndroid && /; wv\)/.test(ua);
  const standalone = nav?.standalone === true || globalThis.matchMedia?.('(display-mode: standalone)')?.matches;
  const embedded = !standalone && (knownApps || iosLooksEmbedded || androidWebView);
  return { isIOS, isAndroid, embedded, standalone: !!standalone };
}

/** Best-effort deep link that asks iOS to open a URL in Safari. */
export function safariSchemeUrl(httpsUrl) {
  return httpsUrl.replace(/^https:\/\//, 'x-safari-https://').replace(/^http:\/\//, 'x-safari-http://');
}
