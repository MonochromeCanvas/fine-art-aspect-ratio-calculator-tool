// Run with Node + Playwright installed. CHROME_PATH may select a local Chrome binary.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(process.env.TOOL_URL || pathToFileURL(path.join(__dirname, '..', 'index.html')).href);
    const upload = page.locator('#artworkUpload');
    async function image(w, h, mime = 'image/png') {
      const data = await page.evaluate(({ w, h, mime }) => {
        const c = document.createElement('canvas'); c.width = w; c.height = h;
        const ctx = c.getContext('2d'); ctx.fillStyle = '#315d49'; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#e8d2aa'; ctx.fillRect(w / 4, h / 4, w / 2, h / 2);
        return c.toDataURL(mime).split(',')[1];
      }, { w, h, mime });
      await upload.setInputFiles({ name: 'test-artwork.' + (mime === 'image/jpeg' ? 'jpg' : mime.split('/')[1]), mimeType: mime, buffer: Buffer.from(data, 'base64') });
      await page.waitForFunction(() => document.querySelector('#uploadStatus').textContent.includes('— ready'));
    }
    const text = id => page.locator('#' + id).innerText();
    async function desired(w, h = '') {
      await page.locator('#qualityExtras').evaluate(el => { el.open = true; });
      await page.locator('#qualityWidth').fill(w);
      await page.locator('#qualityHeight').fill(h);
    }
    await image(3600, 4800);
    assert.match(await text('uploadRatio'), /3:4/);
    assert.match(await text('uploadPrintSize'), /12 x 16 inches.*30.48 x 40.64 cm/);
    assert.match(await text('uploadSizes'), /9 x 12.*12 x 16/s);
    assert.doesNotMatch(await text('uploadSizes'), /18 x 24/);
    await desired('12'); assert.match(await text('qualityResultTitle'), /^300 PPI/);
    await desired('18'); assert.match(await text('qualityResultTitle'), /^200 PPI/);
    assert.match(await text('orderGuidance'), /below 300/);
    await desired('12', '12');
    assert.match(await text('qualityResultTitle'), /^300 PPI.*cropped/);
    assert.match(await text('qualityResultMeta'), /25%.*400 PPI.*9 x 12/);
    await desired('-1'); assert.match(await text('qualityResultTitle'), /positive/);
    await image(4800, 3600, 'image/jpeg');
    assert.match(await text('uploadRatio'), /4:3/);
    assert.equal(await page.locator('#qualityWidth').inputValue(), '');
    assert.match(await text('uploadSizes'), /16 x 12/);
    await page.locator('#useUploadSizeButton').click();
    assert.match(await text('ratioResultTitle'), /3:4/);
    assert.match(await text('ratioResultFit'), /16 x 12/);
    await page.locator('#ratioWidth').fill('16.01');
    assert.match(await text('ratioResultIntro'), /not an exact fit/);
    assert.equal(await page.locator('#ratioMatchesWrap').isVisible(), false);
    await page.locator('[data-reset-view]').first().click();
    await page.locator('[data-task="resize"]').click();
    await page.locator('#resizeWidth').fill('12'); await page.locator('#resizeHeight').fill('16');
    await page.locator('#targetWidth').fill('18'); assert.match(await text('resizeResultTitle'), /18 x 24 inches/);
    await page.locator('#targetHeight').fill('20'); assert.match(await text('resizeResultBody'), /change the original/);
    await page.locator('#task-resize [data-reset-view]').click();
    await image(3000, 3000, 'image/webp'); assert.match(await text('uploadRatio'), /1:1/);
    await image(1001, 777); assert.match(await text('uploadRatio'), /143:111/); assert.match(await text('uploadSizes'), /No exact/);
    await image(2999, 3999); assert.match(await text('uploadPrintSize'), /9.99 x 13.33 inches/);
    await image(1, 1); assert.doesNotMatch(await text('uploadPrintSize'), /0 x 0/);
    await upload.setInputFiles({name:'broken.png', mimeType:'image/png', buffer:Buffer.from('broken')});
    await page.waitForFunction(() => document.querySelector('#uploadStatus').textContent.includes('could not'));
    assert.equal(await page.locator('#uploadSummary').isVisible(), false);
    await upload.setInputFiles({name:'art.pdf', mimeType:'application/pdf', buffer:Buffer.from('pdf')});
    assert.match(await text('uploadStatus'), /Please choose/);
    await page.locator('#clearArtwork').click(); assert.equal(await upload.inputValue(), '');
    await image(3600, 4800);
    await page.locator('#qualityExtras').evaluate(el => { el.open = false; });
    const order = page.getByRole('link', { name: 'Order prints with us' });
    assert.match(await order.getAttribute('href'), /monochromecanvas.com\/collections\/order-giclee-prints\?utm_source=aspect_ratio_helper/);
    assert.equal(await order.getAttribute('target'), '_blank');
    await page.screenshot({path:process.env.DESKTOP_SCREENSHOT || '/tmp/helper-desktop.png', fullPage:true});
    for (const width of [320, 390, 768]) {
      await page.setViewportSize({width, height:844});
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'No overflow at ' + width);
    }
    await page.setViewportSize({width:390, height:844});
    await page.screenshot({path:process.env.MOBILE_SCREENSHOT || '/tmp/helper-mobile.png', fullPage:false});
    assert.deepEqual(errors, []);
    console.log('PASS: PNG/JPEG/WebP; portrait/landscape/square/odd/tiny images; exact 300 PPI; crop vs border; invalid and corrupt input; replacement/reset; frame accuracy; proportional resizing; ordering CTA; mobile overflow; no JS errors.');
  } finally { await browser.close(); }
})();
