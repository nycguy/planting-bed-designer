import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const here = path.dirname(fileURLToPath(import.meta.url));
const fixture = (n) => path.join(here, '..', 'fixtures', n);
const tilePng = fs.readFileSync(fixture('tile.png'));

// External services are mocked so tests are deterministic and run offline.
async function mockServices(page) {
  await page.route(/photon\.komoot\.io/, (route) =>
    route.fulfill({
      json: {
        features: [
          {
            geometry: { type: 'Point', coordinates: [-77.436, 37.5407] },
            properties: { housenumber: '123', street: 'Maple Ave', city: 'Richmond', state: 'Virginia', postcode: '23220', country: 'United States' },
          },
          {
            geometry: { type: 'Point', coordinates: [-77.44, 37.55] },
            properties: { name: 'Maple Avenue', city: 'Richmond', state: 'Virginia', country: 'United States' },
          },
        ],
      },
    }),
  );
  await page.route(/phzmapi\.org/, (route) => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ zone: '6b', temperature_range: '-5 to 0', coordinates: { lat: 41.2, lon: -73.7 } }) }));
  await page.route(/nominatim\.openstreetmap\.org\/reverse/, (route) => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ address: { postcode: '10549' } }) }));
  await page.route(/orthos\.its\.ny\.gov|arcgisonline\.com|nationalmap\.gov|maptiler\.com/, (route) => route.fulfill({ body: tilePng, contentType: 'image/png' }));
}

async function startDesign(page, beds) {
  await mockServices(page);
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /how many planting beds/i })).toBeVisible();
  const input = page.getByLabel('Number of beds', { exact: true });
  await input.fill(String(beds));
  await page.getByRole('button', { name: /continue with/i }).click();
}

async function findProperty(page) {
  await page.getByLabel('Street address').fill('123 Maple');
  const opt = page.getByRole('option').first();
  await expect(opt).toContainText('123 Maple Ave');
  await opt.click();
  await expect(page.getByText('123 Maple Ave, Richmond, Virginia, 23220, United States')).toBeVisible();
  await page.getByRole('button', { name: 'This is my property' }).click();
}

async function mapBox(page) {
  const box = await page.locator('.leaflet-container').first().boundingBox();
  if (!box) throw new Error('map not visible');
  return box;
}

/** Click a rectangle of points around the map center, offset so beds do not overlap. */
async function drawBed(page, dx = 0, dy = 0, size = 60) {
  const b = await mapBox(page);
  const cx = b.x + b.width / 2 + dx, cy = b.y + b.height / 2 + dy;
  const map = page.locator('.leaflet-container').first();
  const pts = [
    [cx - size, cy - size],
    [cx + size, cy - size],
    [cx + size, cy + size],
    [cx - size, cy + size],
  ];
  for (const [x, y] of pts) {
    await map.click({ position: { x: x - b.x, y: y - b.y } });
    await page.waitForTimeout(80);
  }
  await expect(page.locator('.vtx')).toHaveCount(4);
  await page.getByRole('button', { name: 'Finish bed' }).click();
}

test.describe('Planting Bed Designer — primary workflow', () => {
  test('two-bed design from address to completed report', async ({ page }) => {
    await startDesign(page, 2);
    await findProperty(page);

    // No photo controls before review is finished.
    await expect(page.locator('input[type=file]')).toHaveCount(0);

    // Draw bed 1 (upper-left) and bed 2 (lower-right).
    await expect(page.locator('.map-banner')).toContainText('Bed 1');
    await drawBed(page, -90, -70, 50);
    await expect(page.locator('.map-banner')).toContainText('Bed 2');
    await drawBed(page, 90, 70, 50);

    // Dimensions appear: side labels on the map and area in the sheet.
    await expect(page.locator('.lenlabel').first()).toBeVisible();
    await expect(page.locator('.lenlabel')).toHaveCount(8);
    await expect(page.locator('.measure')).toContainText('sq ft');
    await expect(page.locator('.measure')).toContainText('Perimeter');

    // Edit a point by dragging; area must change.
    const areaBefore = await page.locator('.measure b').first().innerText();
    const vtx = page.locator('.vtx').nth(2);
    const vb = await vtx.boundingBox();
    await page.mouse.move(vb.x + vb.width / 2, vb.y + vb.height / 2);
    await page.mouse.down();
    await page.mouse.move(vb.x + 40, vb.y + 40, { steps: 8 });
    await page.mouse.up();
    await expect(page.locator('.measure b').first()).not.toHaveText(areaBefore);

    // Add a point via a midpoint handle, then remove it.
    await page.locator('.mid').first().click();
    await expect(page.locator('.vtx')).toHaveCount(5);
    await page.getByRole('button', { name: /Remove point 2/ }).click();
    await expect(page.locator('.vtx')).toHaveCount(4);

    // Edit a calculated side length.
    const sideBtn = page.locator('.sides li').first().getByRole('button');
    const sideBefore = await sideBtn.innerText();
    await sideBtn.click();
    await expect(page.getByRole('dialog')).toContainText('stays where it is');
    await page.getByLabel('New length in feet').fill('25');
    await page.getByRole('button', { name: 'Apply length' }).click();
    await expect(page.locator('.sides li').first()).toContainText('25.0 ft');
    expect(sideBefore).not.toBe('25.0 ft');
    // The label on the map matches.
    await expect(page.locator('.lenlabel.hot')).toContainText('25.0 ft');

    // Rename bed 2.
    await page.getByRole('button', { name: 'Rename' }).click();
    await page.getByLabel('Bed name').fill('Driveway Bed');
    await page.getByRole('button', { name: 'Save name' }).click();
    await expect(page.locator('.sheet-handle')).toContainText('Driveway Bed');

    // Review stage.
    await page.getByRole('button', { name: /review them/i }).click();
    await expect(page.getByRole('heading', { name: 'Review your beds' })).toBeVisible();
    await expect(page.getByText('Driveway Bed')).toBeVisible();
    await expect(page.locator('input[type=file]')).toHaveCount(0);
    await expect(page.getByText('Combined area')).toBeVisible();

    // Return to an earlier stage and come back without losing work.
    await page.getByRole('button', { name: /^Beds/ }).click();
    await expect(page.getByRole('heading', { name: /how many/i })).toBeVisible();
    await page.getByRole('button', { name: 'Save and continue' }).click();
    await page.getByRole('button', { name: /^Review/ }).click();
    await expect(page.getByText('Driveway Bed')).toBeVisible();

    // Photos appear only after "Beds are finished".
    await page.getByRole('button', { name: 'Beds are finished' }).click();
    await expect(page.getByRole('heading', { name: /add a current photo/i })).toBeVisible();
    await expect(page.getByText('0 of 2 bed photos added')).toBeVisible();

    await page.getByTestId('file-1').setInputFiles(fixture('bed1-before.jpg'));
    await expect(page.getByTestId('photo-preview-1')).toBeVisible();
    await expect(page.getByTestId('photo-card-1')).toContainText('bed1-before.jpg');
    await expect(page.getByText('1 of 2 bed photos added')).toBeVisible();

    await page.getByTestId('file-2').setInputFiles(fixture('bed2-before.jpg'));
    await expect(page.getByTestId('photo-preview-2')).toBeVisible();
    await expect(page.getByText('2 of 2 bed photos added')).toBeVisible();

    // Replace, then remove and re-add on bed 2.
    await page.getByTestId('replace-2').setInputFiles(fixture('bed1-before.jpg'));
    await expect(page.getByTestId('photo-card-2')).toContainText('bed1-before.jpg');
    await page.getByTestId('photo-card-2').getByRole('button', { name: 'Remove photo' }).click();
    await expect(page.getByText('1 of 2 bed photos added')).toBeVisible();
    await page.getByTestId('file-2').setInputFiles(fixture('bed2-before.jpg'));
    await expect(page.getByText('2 of 2 bed photos added')).toBeVisible();

    // Cancelling the picker (empty selection) is not an error.
    await page.getByTestId('replace-2').setInputFiles([]);
    await expect(page.locator('.notice-err')).toHaveCount(0);

    // Planting design: pick a shrub for the zone and place two of them in Bed 1.
    await page.getByTestId('photos-continue').click();
    await expect(page.getByTestId('plants-stage')).toBeVisible();
    await page.getByRole('tab', { name: 'Shrubs' }).click();
    await page.getByTestId('plant-search').fill('hydrangea');
    await page.getByTestId('plant-hydrangea-paniculata').click();
    await expect(page.locator('.map-banner')).toContainText('Tap the map to place Panicle Hydrangea');
    const mapBox = await page.locator('.leaflet-container').boundingBox();
    await page.mouse.click(mapBox.x + mapBox.width * 0.5, mapBox.y + mapBox.height * 0.45);
    await page.mouse.click(mapBox.x + mapBox.width * 0.55, mapBox.y + mapBox.height * 0.45);
    await expect(page.locator('.map-banner')).toContainText('(2 placed)');
    await page.getByRole('button', { name: 'Done' }).click();
    await expect(page.locator('.sheet-handle')).toContainText('2 placed');

    // Complete.
    await page.getByTestId('finish-design').click();
    await expect(page.getByRole('heading', { name: 'Design complete' })).toBeVisible();
    await expect(page.locator('.schedule')).toContainText('Panicle Hydrangea');
    await expect(page.getByTestId('complete-photo-1')).toBeVisible();
    await expect(page.getByTestId('complete-photo-2')).toBeVisible();
    await expect(page.getByTestId('complete-bed-1')).toContainText('25.0 ft');
    await expect(page.getByText('Combined perimeter')).toBeVisible();

    // Edit a bed from the completion screen; photo must survive.
    await page.getByTestId('complete-bed-1').getByRole('button', { name: 'Edit outline' }).click();
    await expect(page.locator('.map-banner')).toContainText('Editing Bed 1');
    await page.getByRole('button', { name: /^Review/ }).click();
    await page.getByRole('button', { name: 'Beds are finished' }).click();
    await expect(page.getByText('2 of 2 bed photos added')).toBeVisible();
    await page.getByTestId('photos-continue').click();
    await page.getByTestId('finish-design').click();
    await expect(page.getByTestId('complete-photo-1')).toBeVisible();

    // Export produces a download.
    const dl = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export design data' }).click();
    expect((await dl).suggestedFilename()).toMatch(/\.geojson$/);

    // Reload restores the design, including photos.
    await page.reload();
    await page.getByTestId('continue-saved').click();
    await expect(page.getByRole('heading', { name: 'Design complete' })).toBeVisible();
    await expect(page.getByTestId('complete-photo-2')).toBeVisible();
    await expect(page.getByText('Driveway Bed')).toBeVisible();
  });

  test('transfer link recreates the design in a fresh browser context', async ({ page, browser }) => {
    await startDesign(page, 1);
    await findProperty(page);
    await drawBed(page);
    await page.getByRole('button', { name: /review them/i }).click();
    await page.getByRole('button', { name: 'Beds are finished' }).click();
    // Build the transfer URL the same way the "Open in Safari" flow does.
    const url = await page.evaluate(() => window.__pbdTransferUrl(JSON.parse(localStorage.getItem('pbd:design:v1'))));
    const ctx = await browser.newContext(); // clean storage, like Safari
    const p2 = await ctx.newPage();
    await mockServices(p2);
    await p2.goto(url);
    await expect(p2.getByRole('heading', { name: /add a current photo/i })).toBeVisible();
    await expect(p2.getByText('0 of 1 bed photos added')).toBeVisible();
    await p2.getByRole('button', { name: /^Review/ }).click();
    await expect(p2.getByText('123 Maple Ave')).toBeVisible();
    await expect(p2.locator('.lenlabel')).toHaveCount(4);
    await ctx.close();
  });

  test('start new design requires confirmation and clears work', async ({ page }) => {
    await startDesign(page, 1);
    await findProperty(page);
    await page.getByRole('button', { name: 'Start a new design' }).click();
    await page.getByRole('button', { name: 'Keep current design' }).click();
    await expect(page.locator('.map-banner')).toBeVisible();
    await page.getByRole('button', { name: 'Start a new design' }).click();
    await page.getByTestId('confirm-new').click();
    await expect(page.getByRole('heading', { name: /how many/i })).toBeVisible();
  });

  test('mobile layout has no horizontal overflow and keeps controls reachable', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'mobile projects only');
    await startDesign(page, 1);
    await findProperty(page);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    expect(overflow).toBe(false);
    await expect(page.getByRole('button', { name: 'Add point at crosshair' })).toBeVisible();
    await page.getByRole('button', { name: 'Add point at crosshair' }).click();
    await expect(page.locator('.vtx')).toHaveCount(1);
    const finish = page.getByRole('button', { name: 'Finish bed' });
    const fb = await finish.boundingBox();
    expect(fb.height).toBeGreaterThanOrEqual(44);
    // Collapsing the sheet reveals more map.
    await page.getByRole('button', { name: /hide bed controls/i }).click();
    await expect(page.getByRole('button', { name: /show bed controls/i })).toBeVisible();
  });
});
