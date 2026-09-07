# Planting Bed Designer

A mobile-first web app for homeowners. Find your house on aerial imagery, tap out the outline of each planting bed, see feet and square feet as you go, adjust points or type exact side lengths, add one current photo per bed, and print or save a PDF report.

Everything runs in the browser. There is no server, no account, and no upload: designs and photos are stored only on the device that created them.

## What it does

Six guided stages, shown in the bar at the top:

1. **Beds** — choose 1–12 beds. Each gets a fixed color used everywhere.
2. **Location** — type an address, pick a suggestion, then pan/zoom to your yard. Switch imagery sources if one is blurry for your area.
3. **Sketch** — tap corners to draw each bed. Live side lengths, perimeter, and area update as you draw, drag a point, add a point (tap a dashed midpoint), remove a point, or type a new side length. Undo, restore, clear, redraw, rename.
4. **Review** — every bed with its numbers, plus combined totals. "Beds are finished" is the only way forward.
5. **Photos** — one card per bed with *Choose photo* and *Take photo*. Progress ("2 of 4 bed photos added"). A bed can be marked "Photo unavailable" with a note.
6. **Complete** — the report: address, map with all outlines, totals, and a section per bed with photo and measurements. Print, Save as PDF, Export design data (GeoJSON), edit anything, or start over.

Photo controls do not exist in the DOM until Review is confirmed.

## Technical approach and why

| Decision | Choice | Reason |
|---|---|---|
| Framework | React 18 + Vite 5, single-page, no backend | Fast, static, deploys to GitHub Pages with one workflow; no operating cost |
| Map | Leaflet 1.9 | Best-tested touch handling of the free map libraries; drag-to-pan does not fire click, so panning never adds stray points; small bundle |
| Imagery | Esri World Imagery (default), USGS Imagery Only, optional MapTiler Satellite | Esri gives the most consistent sub-foot residential detail worldwide without a key; USGS is a US fallback; MapTiler adds a third source when a free key is supplied |
| Geocoding | Photon (komoot) for suggestions, Nominatim fallback for one-shot lookups | Both are free, no key, OpenStreetMap-based; Photon explicitly supports autocomplete at hobby volume |
| Measurement | Haversine side lengths, shoelace area on a local east/north plane | At bed scale the projection error is orders of magnitude below imagery error; no scale bar or calibration needed because tiles carry real ground coordinates |
| Side-length editing | Fixed start point, end point slides along the existing bearing | Predictable; the dialog states exactly which point moves before you apply |
| Storage | Design JSON in `localStorage`; photo bytes in IndexedDB | Photos can be tens of MB; IndexedDB handles blobs, `localStorage` cannot |
| Photos | Downscaled to ≤1800 px JPEG via `createImageBitmap` + canvas; HEIC kept raw if the browser cannot decode it | Prevents iOS memory crashes on 12–48 MP originals; Safari decodes HEIC natively, other browsers still store the file |
| Transfer to Safari | Whole design (minus photo bytes) compressed with lz-string into the URL fragment | Works with no server; fragment never leaves the device; typical design is under 2 KB |
| Tests | Vitest (geometry, model, transfer, mount smoke) + Playwright (desktop, iPhone 13 portrait and landscape) | Playwright can drive the drawing and file inputs; see the honest limits below |

## Running locally

```bash
npm install
npm run dev          # http://localhost:5173
npm run test:unit    # Vitest
npm run build        # production build → dist/
npm run preview      # serve dist/ on http://localhost:4173
npx playwright install chromium   # first time only
npm run test:e2e     # Playwright against the preview server
```

Node 20 or 22.

## Accounts and API keys

None are required. The app works out of the box with Esri World Imagery, USGS imagery, and Photon/Nominatim geocoding.

**Optional — MapTiler Satellite as a third imagery source**

1. Create a free account at <https://cloud.maptiler.com/> and create a key.
2. In the key settings, restrict **Allowed HTTP origins** to your production origin (for example `https://<user>.github.io`) so the key cannot be reused elsewhere.
3. Locally: copy `.env.example` to `.env` and set `VITE_MAPTILER_KEY`.
4. On GitHub: add a repository secret named `VITE_MAPTILER_KEY`. The deploy workflow already passes it to the build.

Free-tier limits apply (MapTiler publishes a monthly tile-request cap). The key is embedded in the built JavaScript — that is normal for browser map keys and is why the origin restriction matters.

Esri World Imagery is used under Esri's basemap terms with the required attribution shown on the map. Photon and Nominatim are community services; the app debounces requests and sends a single request per keystroke pause. If you expect heavy traffic, host your own Photon or switch to a keyed geocoder.

## Deploying from GitHub

1. Push this repository to GitHub with `main` as the default branch.
2. In **Settings → Pages**, set **Source** to **GitHub Actions**.
3. Push to `main` (or run the *Deploy to GitHub Pages* workflow manually). The workflow runs unit tests, builds, and publishes `dist/`.
4. The site appears at `https://<user>.github.io/<repo>/`. `vite.config.js` uses `base: './'` so it works at that sub-path or at a custom domain root without changes.

`ci.yml` runs unit tests, a build, and the Playwright suite on every pull request and push.

## How designs and photos are stored

- Design (address, map view, imagery choice, beds, points, names, colors, statuses, photo metadata): `localStorage` key `pbd:design:v1`, saved on every change.
- Photo bytes: IndexedDB database `pbd-photos`, keyed by bed id.
- Nothing is sent anywhere. Clearing site data in the browser deletes the design. Private-browsing modes may block storage; the app warns and keeps working for the session.
- The "Open in Safari" / transfer link carries the design in the URL fragment but **not** photos. Photos are re-added in the destination browser.
- **Export design data** downloads a GeoJSON file (WGS84) with per-bed measurements — useful for GIS tools or as a backup.

## Opening the app in Safari (iPhone)

Photo selection has historically failed when the app is opened inside another app's built-in browser (for example, tapping a link inside the ChatGPT app): the Apple Photos sheet appears and then closes before a selection is made.

The app detects likely in-app browsers from the user agent and, before the Photos stage, shows: *"Photo selection may not work inside this browser. Open the design in Safari before adding photos."* Tapping **Open in Safari**:

1. Builds a link containing the full design (address, map position and zoom, imagery, bed count, names, colors, all coordinates and edits, current stage).
2. Attempts the `x-safari-https://` scheme, which some in-app browsers honor.
3. Always shows a sheet with **Copy link** and **Share…** so you can paste the link into Safari if the automatic hand-off is blocked.

Opening the link in Safari restores the design at the Photos stage. Nothing has to be redrawn.

## Known browser limitations

- **In-app browsers (iOS):** the Photos picker may close early; use Open in Safari. The camera option may also be blocked.
- **HEIC previews:** Safari shows them; Chrome/Firefox/Edge store the file but cannot preview it. The report lists the filename.
- **Private browsing:** storage may be unavailable or wiped when the tab closes.
- **Printing maps:** Safari and Chrome print Leaflet tiles reliably; Firefox occasionally omits partially loaded tiles — let the map finish loading before printing.
- **Very small screens (<340 px):** the bottom sheet may need to be collapsed to see the whole bed.
- **Imagery age and accuracy:** aerial tiles can be several years old and are not survey-grade. All measurements are estimates and are labeled as such.

## Repository layout

```
.github/workflows/    ci.yml (tests), deploy.yml (GitHub Pages)
docs/                 iphone-acceptance-test.md
public/               favicon
src/
  App.jsx             stage routing, persistence, transfer, start-new, offline banner
  components/         BedsStage, LocationStage, SketchStage, ReviewStage, PhotosStage, CompleteStage, MapView, Shared
  lib/
    geometry.js       distances, area, perimeter, side-length editing, self-intersection
    design.js         design model, bed colors, statuses, stage gating, reducer
    storage.js        localStorage + IndexedDB
    photos.js         decode / downscale / error classification
    transfer.js       URL-fragment transfer, in-app browser detection
    mapServices.js    geocoding and imagery sources
  styles.css          tokens, layout, map overlays, print styles
tests/
  unit/               Vitest: geometry, design model, transfer, App mount
  e2e/                Playwright: primary workflow, transfer, start-new, mobile layout
  fixtures/           bed1-before.jpg, bed2-before.jpg, tile.png
```

## Testing status — read this before trusting it

- `npm run test:unit`: 20 tests, passing (geometry math, side-length editing semantics, stage gating, status derivation, transfer round-trip, in-app browser detection, App mounts on the Beds stage with no photo inputs).
- `npm run test:e2e`: covers the full 18-step primary workflow from the requirements, the transfer link into a fresh browser context, start-new confirmation, and mobile layout checks on iPhone 13 portrait and landscape emulation. **These were authored but could not be executed in the environment where this repository was generated (browser download blocked). They run in the CI workflow on first push; fix any selector drift there.**
- **The physical iPhone test has not been performed.** Automated `setInputFiles` does not exercise the Apple Photos sheet. Follow `docs/iphone-acceptance-test.md` on a real device before considering the photo requirement met.

## License

See `LICENSE` (placeholder — choose a license before publishing).
