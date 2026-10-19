const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { pathToFileURL } = require('node:url');
const path = require('node:path');

(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(pathToFileURL(path.join(__dirname, '../custom-size-request/index.html')).href);
    const toggle = page.locator('#ratioLockToggle');
    const width = page.locator('#widthInput');
    const height = page.locator('#heightInput');
    assert.equal(await toggle.isChecked(), false);
    assert.equal(await toggle.isDisabled(), true);
    assert.equal(await page.locator('#artworkFormattingNotice').isVisible(), false);
    await width.fill('24');
    assert.equal(await height.inputValue(), '20');
    await height.fill('18');
    assert.equal(await width.inputValue(), '24');
    assert.match(await page.locator('#estimateTotal').innerText(), /\$[\d,]+\.\d{2}/);
    assert.equal(await page.evaluate(() => {
      const link = document.querySelector('.size-link-controls');
      return link.previousElementSibling.contains(document.querySelector('#heightInput')) &&
        link.nextElementSibling.contains(document.querySelector('#quantityInput')) &&
        Boolean(link.compareDocumentPosition(document.querySelector('.bulk-pricing')) & Node.DOCUMENT_POSITION_FOLLOWING);
    }), true);
    const data = await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 1200; canvas.height = 1500;
      return canvas.toDataURL().split(',')[1];
    });
    const file = { name: 'portrait.png', mimeType: 'image/png', buffer: Buffer.from(data, 'base64') };
    await page.locator('#fileInput').setInputFiles(file);
    await page.waitForFunction(() => document.querySelector('#ratioLockToggle').checked);
    assert.equal(await toggle.isEnabled(), true);
    assert.equal(await width.inputValue(), '24');
    assert.equal(await height.inputValue(), '30');
    await width.fill('16');
    assert.equal(await height.inputValue(), '20');
    await toggle.uncheck();
    await height.fill('12');
    assert.equal(await width.inputValue(), '16');
    assert.equal(await page.locator('#artworkFormattingNotice').isVisible(), true);
    for (const viewportWidth of [1280,390]) {
      await page.setViewportSize({width:viewportWidth,height:900});
      await page.locator('#artworkFormattingNotice').scrollIntoViewIfNeeded();
      assert.equal(await page.locator('#artworkFormattingNotice').evaluate(e=>getComputedStyle(e).borderLeftColor),'rgb(180, 35, 24)');
      await page.screenshot({path:'/tmp/formatting-warning-'+viewportWidth+'.png'});
    }

    await page.locator('#fileInput').setInputFiles([]);
    assert.equal(await toggle.isChecked(), false);
    assert.equal(await toggle.isDisabled(), true);
    assert.equal(await page.locator('#artworkFormattingNotice').isVisible(), false);
    await width.fill('22');
    assert.equal(await height.inputValue(), '12');
    await page.locator('#fileInput').setInputFiles({ name: 'invalid.png', mimeType: 'image/png', buffer: Buffer.from('invalid') });
    await page.waitForFunction(() => document.querySelector('#ratioLockToggle').disabled);
    assert.equal(await toggle.isChecked(), false);
    await page.reload();
    await page.locator('#fileInput').setInputFiles(file);
    await page.waitForFunction(() => document.querySelector('#ratioLockToggle').checked);
    assert.equal(await width.inputValue(), '4');
    assert.equal(await height.inputValue(), '5');
    for (const viewportWidth of [1280, 390, 320]) {
      await page.setViewportSize({ width: viewportWidth, height: 844 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      await page.locator('#ratioToggleCard').scrollIntoViewIfNeeded();
      await page.screenshot({ path: '/tmp/custom-size-linking-' + viewportWidth + '.png' });
    }
    assert.deepEqual(errors, []);
    console.log('PASS: independent quote dimensions, adjacent toggle, upload linking, formatting guidance, clear/invalid upload, 300 PPI defaults, desktop/mobile layout.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
