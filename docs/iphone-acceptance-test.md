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


## Part C — Hardiness zone and planting design (Safari)

25. After choosing an address at Location, a green badge "USDA Zone Nx" appears under the address within a few seconds. Record the zone shown and confirm it against <https://planthardiness.ars.usda.gov/> for the same ZIP.
26. Tap **Change** on the badge and pick a different zone; the badge updates and says "Chosen manually." Change it back.
27. On the Photos stage, with no photos added, the button reads "Skip photos and design the beds" and is enabled. Tap it. The Plants stage opens with the map fitted to all beds.
28. The Trees tab is selected. The count in the sheet handle ("N for your zone") is smaller than the full list, and no plant with a zone range outside yours appears (search "crape" in zone 6 or colder: no result).
29. Search "maple", tap **Red Maple**. The sheet collapses and the banner reads "Tap the map to place Red Maple." Tap inside Bed 1. A green circle about 40 ft across appears with a label. Tap again nearby: a second circle, banner shows "(2 placed)".
30. Tap **Shrubs**, search "hydrangea", place two Panicle Hydrangea inside the tree circle. Overlap is allowed; nothing is blocked.
31. Tap **Flowers & bulbs**, place three Hosta. Each is an irregular blob roughly 18 in. across, not a circle, and each has a different outline.
32. Tap **Done**. Tap one hydrangea circle: it highlights, a handle appears, and About / Remove buttons show at the bottom. Drag the handle a few feet; the circle follows. Tap **Remove**; it disappears and the count drops.
33. The sheet's "Placed so far" section lists plants by bed with correct quantities.
34. Tap **Finish design and see the report**. The report shows the zone badge, the plants on the map, and a plant list table with quantities and mature sizes.
35. Print preview: plant circles render on the map and the plant list table is on the page.
36. Tap **Edit planting**; the Plants stage reopens with everything still placed. Refresh the page; plants survive.

## Part D — Light, filters, growth, existing features, report extras (Safari)

37. At Review, tap **Full sun** on Bed 1 and **Shade** on Bed 2. The buttons fill in the bed's color. Refresh; the choices persist.
38. At Plants, a "For bed:" row shows a chip per bed. Tap Bed 2's chip: the Light filter jumps to Shade and the list shrinks. Tap **Any** to clear.
39. Check **Deer resistant**: Hosta disappears from Flowers & bulbs; Hellebore stays. Check **Native** as well: the list shrinks again and every row shows both tags.
40. Place a Hosta inside Bed 1 (full sun). A yellow "Light check" notice appears in the sheet naming Hosta and Bed 1.
41. Plant rows show a small photo for most plants (needs a connection). Open ⓘ on one: a larger photo with a "Photo via Wikipedia" caption.
42. Tap **Undo** (top left): the last placement disappears. **Redo** restores it. Undo is disabled when nothing is left to undo.
43. With nothing selected, the **Mature / Year N** slider at the bottom scales tree and shrub circles down at Year 1 and back up at Mature. Flower drifts do not change.
44. Tap **Existing**, pick **Existing tree**, set width to 30 ft, tap the map: a dashed gray circle. Tap Done, tap the circle, drag the width slider to 40 ft; it grows. It is not counted in "Placed so far" quantities.
45. "Placed so far" shows a coverage percentage per bed. Place enough shrubs in a small bed to exceed 115%; the figure turns red with an "outgrow" note.
46. Tap **Show bloom calendar**: one row per plant with a colored bar across its months, and a note naming months with nothing in bloom.
47. Report: map has a scale bar (bottom left) and an N arrow (bottom right) and a legend line under it. Plant list has a Light column with a ⚠ on the mismatched Hosta. Coverage table, bloom calendar, and Materials table are present. Print preview shows all of them.
48. Tap **Shopping list (CSV)**: a .csv downloads and opens in Numbers or Excel with quantity and suggested size columns.
49. Tap **Save to my designs**, name it, Save. Start a new design; on the first screen a **My designs** list shows it. Tap it: the saved design opens at Review with every bed and plant. Tap ✕ on it, confirm; it is gone.
