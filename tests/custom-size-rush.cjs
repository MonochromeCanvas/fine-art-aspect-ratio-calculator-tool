const assert = require('node:assert/strict');
const {chromium} = require('playwright');
const {pathToFileURL} = require('node:url');
const path = require('node:path');
(async () => {
 const browser = await chromium.launch({headless:true, ...(process.env.CHROME_PATH ? {executablePath:process.env.CHROME_PATH} : {})});
 try {
  const page = await browser.newPage({viewport:{width:1280,height:1000}});
  const errors=[]; page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.env.QUOTE_URL || pathToFileURL(path.join(__dirname,'../custom-size-request/index.html')).href);
  const timing=page.locator('#productionTiming');
  const total=async()=>Number((await page.locator('#estimateTotal').innerText()).replace(/[^\d.]/g,''));
  assert.equal(await timing.inputValue(),'standard');
  const standardGeneral=await total();
  await timing.selectOption('rush');
  const unit=await total();
  assert.ok(unit>standardGeneral);
  for (const group of ['general','artist','nonprofit']) {
   await page.locator('input[name=customerPricing][value='+group+']').check();
   for (const quantity of [1,25,50,500]) {
    await page.locator('#quantityInput').fill(String(quantity));
    for (const mode of ['rush','unsure']) {
     await timing.selectOption(mode);
     assert.equal(await total(),unit*quantity);
     assert.equal(await page.locator('#bulkRateGrid').isVisible(),false);
     assert.equal(await page.locator('#standardSavingsExplainer').isVisible(),false);
     assert.equal(await page.locator('#bulkNextTier').innerText(),'');
     assert.match(await page.locator('#estimateRange').innerText(),/rush fees/);
     assert.doesNotMatch(await page.locator('#quoteSavings').innerText(),/Saving \$/);
    }
   }
  }
  await page.locator('#quantityInput').fill('1');
  await timing.selectOption('standard');
  assert.equal(await total(),Math.round(unit*0.75*100)/100);
  assert.equal(await page.locator('#bulkRateGrid').isVisible(),true);
  await page.locator('input[value=general][name=customerPricing]').check();
  assert.equal(await total(),standardGeneral);
  await page.locator('#quantityInput').fill('0');
  await timing.selectOption('rush');
  assert.equal(await page.locator('#estimateTotal').innerText(),'—');
  await page.locator('#quantityInput').fill('1');
  const data=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=1200;c.height=1500;return c.toDataURL().split(',')[1]});
  await page.locator('#fileInput').setInputFiles({name:'deadline.png',mimeType:'image/png',buffer:Buffer.from(data,'base64')});
  await page.locator('#standardNameInput').fill('Timing Test');
  await page.locator('#standardEmailInput').fill('timing@example.com');
  const deadline='Friday at 2 PM <b>please confirm</b>';
  await page.locator('#requestedDeadline').fill(deadline);
  assert.equal(await page.locator('#summaryContent b').count(),0);
  for (const mode of ['rush','unsure','standard']) {
   await timing.selectOption(mode);
   await page.locator('#prepareButton').click();
   const body=await page.locator('#emailBody').innerText();
   assert.ok(body.includes('Requested deadline: '+deadline));
   assert.ok(body.includes('Studio hours: Monday–Friday, 9 AM–4 PM Eastern.'));
   if(mode!=='standard') {
    assert.ok(body.includes('Print cost shown without discounts and before any rush fees.'));
    assert.doesNotMatch(body,/Overall order discount:/);
   } else assert.match(body,/Overall order discount:/);
   await page.locator('#closeDialogButton').click();
  }
  await timing.selectOption('rush');
  for (const width of [1280,390,320]) {
   await page.setViewportSize({width,height:1000});
   await timing.scrollIntoViewIfNeeded();
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
   await page.screenshot({path:'/tmp/custom-size-rush-'+width+'.png'});
  }
  assert.deepEqual(errors,[]);
  console.log('PASS: all groups and tiers lose discounts for rush/uncertain timing, standard restoration, invalid quantity, safe deadline summary, email timing/deadline, desktop/mobile.');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
