# Real-iPhone acceptance test

Automated tests insert image files directly and cannot reproduce the Apple Photos picker closing early. This checklist must be run on a physical iPhone. Record the iOS version, iPhone model, and the date. Do not mark the photo requirement as met until every step passes.

Device: ____________  iOS: ______  Date: __________  Tester: __________  Production URL: __________________

## Part A — Safari (production experience)

| # | Step | Expected | Pass |
|---|------|----------|------|
| 1 | Open the production URL directly in Safari. | Beds stage loads; stage bar shows Beds highlighted; no "Open in Safari" button in the top bar. | ☐ |
| 2 | Set 1 bed, continue. Enter your address, pick the suggestion. | Map centers on the property with a marker; imagery shows driveway/walk/bed edges. | ☐ |
| 3 | Tap "This is my property." Tap four corners of a bed (or use the crosshair button). | Colored points and lines appear; side labels in feet appear; area shows once 3+ points exist. | ☐ |
| 4 | Pinch and drag the map between taps. | No stray points are added. | ☐ |
| 5 | Tap "Finish bed." Drag one corner. | Polygon and labels follow the finger; area/perimeter update. | ☐ |
| 6 | Tap a side length, enter a new number, read the note, apply. | Named point moves; changed side highlighted; adjacent side and area change. | ☐ |
| 7 | Tap "All beds drawn — review them." | Review screen; **no** Choose photo / Take photo controls anywhere. Swipe up and down to confirm. | ☐ |
| 8 | Tap "Beds are finished." | Photos stage appears; "0 of 1 bed photos added." | ☐ |
| 9 | Tap **Choose photo** → Photo Library. | The Photos picker stays open until you pick or cancel. | ☐ |
| 10 | Pick a photo. | Preview appears in the correct bed card within a few seconds; filename shown; "1 of 1." | ☐ |
| 11 | Tap **Replace photo**, pick a different image. | Preview changes to the new image. | ☐ |
| 12 | Tap **Remove photo**, then **Take photo**. | Camera opens; after capture the photo appears in the bed card. | ☐ |
| 13 | Tap **Choose photo**, then **Cancel** in the picker. | Nothing changes; no error message. | ☐ |
| 14 | Tap "Complete design." | Completion screen with map, totals, bed section, photo, side lengths. | ☐ |
| 15 | Pull to refresh (or close and reopen the tab). | "Continue your saved design?" → Continue → completion screen with the photo still present. | ☐ |
| 16 | Tap "Print design" → Share → Save to Files as PDF (or AirPrint preview). | Map, totals, bed photo, and measurements are legible in the PDF. | ☐ |
| 17 | Tap "Edit outline," change a point, return via Review → "Beds are finished" → "Complete design." | Photo preserved; measurements updated. | ☐ |
| 18 | Rotate to landscape during Sketch. | Controls remain on screen; no horizontal scrolling. | ☐ |

## Part B — opened from the ChatGPT iPhone app (in-app browser)

| # | Step | Expected | Pass |
|---|------|----------|------|
| 19 | Paste the production URL into a ChatGPT conversation and tap it so it opens in ChatGPT's built-in browser. | App loads; **"Open in Safari"** button appears in the top bar. | ☐ |
| 20 | Repeat steps 2–8 inside the in-app browser. | Same behavior; before/at the Photos stage a yellow warning says photo selection may not work here. | ☐ |
| 21 | Tap **Open in Safari** in the warning. | Either Safari opens automatically with the design at the Photos stage, **or** a sheet appears with Copy link / Share. | ☐ |
| 22 | If the sheet appeared: Copy link, open Safari, paste into the address bar, go. | Safari shows "Design transferred"; stage is Photos; Review shows the same address, bed name, color, outline, and side lengths as in step 20 — nothing redrawn. | ☐ |
| 23 | Optionally tap "Try here anyway" in the in-app browser and attempt Choose photo. | Record what happens (this documents the original problem; it is not required to pass). | ☐ |
| 24 | Complete steps 9–15 in Safari. | All pass. | ☐ |

## Recording results

Copy this file to `docs/results/YYYY-MM-DD-<model>.md`, fill in the Pass column, and attach screenshots of steps 9, 10, 21, and 22. Any failure in steps 9–13 or 21–22 means the photo requirement is **not** met.
