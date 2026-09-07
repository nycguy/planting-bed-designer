# Planting Bed Designer

A mobile-first web app for homeowners. Find your house on aerial imagery, tap out the outline of each planting bed, see feet and square feet as you go, adjust points or type exact side lengths, add one current photo per bed, and print or save a PDF report.

Everything runs in the browser. There is no server, no account, and no upload: designs and photos are stored only on the device that created them.

## What it does

Seven guided stages, shown in the bar at the top:

1. **Beds** — choose 1–12 beds. Each gets a fixed color used everywhere.
2. **Location** — type an address, pick a suggestion, then pan/zoom to your yard. New York addresses get NYS orthoimagery automatically; switch sources if one is blurry or out of date for your area. The USDA hardiness zone for the address is looked up and shown here.
3. **Sketch** — tap corners to draw each bed. Live side lengths, perimeter, and area update as you draw, drag a point, add a point (tap a dashed midpoint), remove a point, or type a new side length. Undo, restore, clear, redraw, rename.
4. **Review** — a map fitted to all beds, each filled in its color with a bed-number and area label, then every bed's numbers and combined totals. Set each bed's light (full sun, part sun, shade) here; the plant list uses it. "Beds are finished" is the only way forward.
5. **Photos** — optional. One card per bed with *Choose photo* and *Take photo*. Progress ("2 of 4 bed photos added"). A bed can be marked "Photo unavailable" with a note, or the stage skipped entirely.
6. **Plants** — the planting design. Pick a category (Trees, Shrubs, Grasses, Flowers, or Existing for things already in the yard), narrow the list by light, native status, and deer resistance (on by default) on top of the zone filter, choose a plant, and tap the map to place it — one per tap. Trees and shrubs draw as circles at mature spread; flowers and bulbs as roughly 18-inch irregular drifts; existing trees, shrubs, and hardscape in dashed gray at a width you set. Circles may overlap. Tap a placed plant (when not placing) to move or remove it. Undo and redo. A maturity slider shows the design at year 1, 3, 5, 10, or full size. The sheet lists what is placed in each bed with a coverage percentage at maturity, flags plants whose light needs do not match the bed, and shows a bloom calendar. Plant rows and the detail dialog carry a reference photo from Wikipedia.
7. **Complete** — the report (with **Add another bed**, which returns to Sketch for the new bed and then back through Review): address, hardiness zone, plan map with scale bar, north arrow, and legend, totals, a plant list by bed with quantities, mature sizes, and light checks, coverage per bed, a bloom calendar, a materials table (mulch at 2 and 3 in., topsoil at 4 in., edging length, with bag counts), and a section per bed with photo and measurements. Print, Save as PDF, Save design file, Export design data (GeoJSON), Shopping list (CSV with suggested container sizes), Save to my designs, edit anything, or start over. Saved designs appear under **My designs** on the first screen, so one yard can hold several versions.

Photo controls do not exist in the DOM until Review is confirmed.

## Technical approach and why

| Decision | Choice | Reason |
|---|---|---|
| Framework | React 18 + Vite 5, single-page, no backend | Fast, static, deploys to GitHub Pages with one workflow; no operating cost |
| Map | Leaflet 1.9 | Best-tested touch handling of the free map libraries; drag-to-pan does not fire click, so panning never adds stray points; small bundle |
| Imagery | New York State Orthoimagery (NY addresses), Maine GeoLibrary Orthoimagery (Maine addresses), Esri World Imagery, USGS Imagery Only, optional MapTiler Satellite | NYS ITS publishes a statewide 6–12 inch leaf-off ortho mosaic (2022–2025) as a free ArcGIS map service; it is far sharper at yard scale than commercial basemaps. It has no tile cache, so the app requests each tile through the service's export operation. Maine GeoLibrary publishes a statewide 3-inch leaf-off image service, used the same way. Outside those states the app switches to Esri automatically; USGS is a second US fallback; MapTiler adds a source when a free key is supplied |
| Geocoding | Photon (komoot) for suggestions, Nominatim fallback for one-shot lookups | Both are free, no key, OpenStreetMap-based; Photon explicitly supports autocomplete at hobby volume. Requests are biased toward New York and results are ranked New York → rest of US → world, with complete street addresses first in each group |
| Measurement | Haversine side lengths, shoelace area on a local east/north plane | At bed scale the projection error is orders of magnitude below imagery error; no scale bar or calibration needed because tiles carry real ground coordinates |
| Side-length editing | Fixed start point, end point slides along the existing bearing | Predictable; the dialog states exactly which point moves before you apply |
| Storage | Design JSON in `localStorage`; photo bytes in IndexedDB | Photos can be tens of MB; IndexedDB handles blobs, `localStorage` cannot |
| Photos | Downscaled to ≤1800 px JPEG via `createImageBitmap` + canvas; HEIC kept raw if the browser cannot decode it | Prevents iOS memory crashes on 12–48 MP originals; Safari decodes HEIC natively, other browsers still store the file |
| Transfer to Safari | Whole design (minus photo bytes) compressed with lz-string into the URL fragment | Works with no server; fragment never leaves the device; typical design is under 2 KB |
| Hardiness zone | `phzmapi.org/{zip}.json` — static mirror of the 2023 USDA PHZM by ZIP code | Free, no key. ZIP comes from the geocoder or a Nominatim reverse lookup. If either step fails the user picks a zone from a list |
| Plant photos | Wikipedia page summaries (REST API, CORS, no key), looked up by genus + species and cached on device | The only free, keyless, reliably licensed source for a photo per botanical name. Missing photos simply do not render |
| Plant reference | Bundled list of 147 landscape plants (47 trees, 46 shrubs, 6 ornamental grasses, 48 perennials/bulbs) in `src/data/plants.js` with zone range, mature spread and height, light, and notes | No free plant API offers zone and size data without a key and daily caps. A bundled list works offline and can be edited in one file. Ranges are typical nursery figures, not guarantees |
| Tests | Vitest (geometry, model, transfer, mount smoke) + Playwright (desktop, iPhone 13 portrait and landscape) | Playwright can drive the drawing and file inputs; see the honest limits below |

## Desktop use

The layout was designed for iPhone first, but on a screen 900 px or wider the bottom sheet becomes a side panel (440–500 px) and the plant list fills its height. Hovering a plant thumbnail shows a larger photo. Keyboard on the Plants stage: **Esc** cancels placing or clears the selection, **Delete** removes the selected plant, **Ctrl/Cmd+Z** undoes, **Ctrl/Cmd+Shift+Z** or **Ctrl+Y** redoes.

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

None are required. The app works out of the box with New York State orthoimagery, Esri World Imagery, USGS imagery, Photon/Nominatim geocoding, and the phzmapi.org hardiness-zone lookup.

NYS orthoimagery comes from `https://orthos.its.ny.gov/arcgis/rest/services/wms/Latest/MapServer`, a public service of NYS ITS Geospatial Services (NYSDOP). It covers New York State only; the app checks the address against the service extent and picks Esri for anything outside it.

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

## Plant data

`src/data/plants.js` is the whole plant reference. Each entry has an id, category, common and botanical name, USDA zone range (`zoneMin`–`zoneMax`), mature `spreadFt` and `heightFt`, a light code, `native` and `deerResistant` flags, an optional `bloom` month range with a `bloomColor`, and a short note. To add a plant, add an object; the search, zone filter, map footprint, and report pick it up. The list leans toward Northeast and Mid-Atlantic residential landscapes (zones 4–8). Zone and size figures are typical nursery-catalog ranges and should be checked against a local nursery or extension service before purchasing.

## How designs and photos are stored

- Design (address, map view, imagery choice, hardiness zone, beds, points, names, colors, statuses, photo metadata, placed plants): `localStorage` key `pbd:design:v1`, saved on every change.
- Photo bytes: IndexedDB database `pbd-photos`, keyed by bed id.
- Nothing is sent anywhere. Clearing site data in the browser deletes the design. Private-browsing modes may block storage; the app warns and keeps working for the session.
- The "Open in Safari" / transfer link carries the design in the URL fragment but **not** photos. Photos are re-added in the destination browser.
- **Save design file** (Complete stage) downloads a small JSON file holding the whole design except photo bytes. **Open a saved design file** on the first screen restores it, at the Review stage or earlier, on any device. No account is involved.
- **Export design data** downloads a GeoJSON file (WGS84) with per-bed measurements — useful for GIS tools.

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
  components/         …plus PlantsStage (planting design) and ZonePanel (hardiness zone)
  data/plants.js      plant reference list
  lib/
    zones.js          USDA hardiness zone lookup
    library.js        named designs kept on device
    plantPhotos.js    Wikipedia photo lookup with cache
    designFile.js     save / open design as a JSON file
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

- `npm run test:unit`: 49 tests, passing (geometry math, side-length editing semantics, stage gating, status derivation, transfer round-trip, in-app browser detection, App mounts on the Beds stage with no photo inputs).
- `npm run test:e2e`: covers the full 18-step primary workflow from the requirements, the transfer link into a fresh browser context, start-new confirmation, and mobile layout checks on iPhone 13 portrait and landscape emulation. **These were authored but could not be executed in the environment where this repository was generated (browser download blocked). They run in the CI workflow on first push; fix any selector drift there.**
- **The physical iPhone test has not been performed.** Automated `setInputFiles` does not exercise the Apple Photos sheet. Follow `docs/iphone-acceptance-test.md` on a real device before considering the photo requirement met.

## License

See `LICENSE` (placeholder — choose a license before publishing).
