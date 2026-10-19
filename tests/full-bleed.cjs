const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
(async () => {
  const browser = await chromium.launch({headless: true, ...(process.env.CHROME_PATH ? {executablePath: process.env.CHROME_PATH} : {})});
  try {
    const page = await browser.newPage({viewport: {width: 1280, height: 900}, acceptDownloads: true});
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(process.env.BUILDER_URL || pathToFileURL(path.join(__dirname, '../white-border-builder-tool/index.html')).href);
    await page.locator('[data-mode=full-bleed]').click();
    assert.equal(await page.locator('#evenBorder').isVisible(), false);
    assert.equal(await page.locator('#evenFrameWidth').isVisible(), true);
    const data = await page.evaluate(() => {
      const c = document.createElement('canvas'); c.width = 1200; c.height = 1500;
      const ctx = c.getContext('2d'); ctx.fillStyle = '#c02020'; ctx.fillRect(0, 0, c.width, c.height);
      return c.toDataURL().split(',')[1];
    });
    await page.locator('#fileInput').setInputFiles({name: 'art.png', mimeType: 'image/png', buffer: Buffer.from(data, 'base64')});
    await page.locator('#evenFrameWidth').fill('2');
    await page.locator('#evenFrameHeight').fill('3');
    await page.waitForFunction(() => !document.querySelector('#downloadButton').disabled);
    assert.match(await page.locator('#summaryContent').innerText(), /Full Bleed, no border/);
    assert.match(await page.locator('#summaryContent').innerText(), /edge to edge/);
    assert.equal(await page.locator('#cropAdjustBlock').isVisible(), true);
    const pending = page.waitForEvent('download');
    await page.locator('#downloadButton').click();
    const download = await pending;
    assert.equal(download.suggestedFilename(), 'art-full-bleed.jpg');
    const stream = await download.createReadStream();
    const chunks = []; for await (const chunk of stream) chunks.push(chunk);
    const pixels = await page.evaluate(async data => {
      const image = new Image(); image.src = 'data:image/jpeg;base64,' + data; await image.decode();
      const c = document.createElement('canvas'); c.width = image.width; c.height = image.height;
      const ctx = c.getContext('2d'); ctx.drawImage(image, 0, 0);
      return {width: c.width, height: c.height, corners: [[0,0],[c.width-1,0],[0,c.height-1],[c.width-1,c.height-1]].map(([x,y]) => Array.from(ctx.getImageData(x,y,1,1).data))};
    }, Buffer.concat(chunks).toString('base64'));
    assert.equal(pixels.width, 600); assert.equal(pixels.height, 900);
    for (const [r,g,b] of pixels.corners) assert.ok(r > g * 2 && r > b * 2, 'Artwork must reach every corner');
    await page.locator('[data-mode=even-border]').click();
    assert.equal(await page.locator('#evenBorder').isVisible(), true);
    assert.equal(await page.locator('#evenBorder').inputValue(), '1');
    await page.locator('#evenFrameWidth').fill('4'); await page.locator('#evenFrameHeight').fill('5');
    assert.match(await page.locator('#summaryContent').innerText(), /1 in on all sides/);
    for (const width of [1280,390,320]) {
      await page.setViewportSize({width, height: 900});
      await page.locator('[data-mode=full-bleed]').click();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      await page.locator('.mode-picker').scrollIntoViewIfNeeded();
      await page.screenshot({path: '/tmp/full-bleed-' + width + '.png'});
    }
    assert.deepEqual(errors, []);
    console.log('PASS: explicit full bleed, crop controls, border settings retained, 300 PPI JPEG with artwork at all corners, mobile layout.');
  } finally { await browser.close(); }
})().catch(e => {console.error(e); process.exit(1);});
