const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const {pathToFileURL} = require('node:url');
const path = require('node:path');
const routes=['index.html','white-border-builder-tool/index.html','custom-size-request/index.html','invoice-my-client/index.html','commission-cost-calculator/index.html','commission-cost-calculator/graphic-design.html','commission-cost-calculator/mural-design.html'];
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
 try {
  for(const [i,route] of routes.entries()) {
   const page=await browser.newPage({viewport:{width:1280,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
   const url=process.env.TOOLS_BASE_URL?new URL(route,process.env.TOOLS_BASE_URL).href:pathToFileURL(path.join(__dirname,'..',route)).href;
   await page.goto(url);await page.evaluate(()=>document.fonts.ready);
   assert.equal(await page.locator('.eyebrow').first().textContent(),'A free tool from our Akron, Ohio print studio');
   assert.match(await page.locator('h1').evaluate(e=>getComputedStyle(e).fontFamily),/Gloock/);
   assert.match(await page.locator('.hero,.hero-card').first().evaluate(e=>getComputedStyle(e).backgroundImage),/nav-bg.jpg/);
   await page.locator('.studio-tool-menu summary').click();
   assert.equal(await page.locator('.studio-tool-list a').count(),7);
   assert.equal(await page.locator('.studio-tool-list [aria-current=page]').count(),1);
   assert.equal(await page.locator('.studio-tool-list a[target=_blank]').count(),6);
   await page.locator('.studio-tool-menu summary').click();
   await page.screenshot({path:'/tmp/studio-tool-'+i+'-desktop.png'});
   for(const width of [390,320]) {
    await page.setViewportSize({width,height:844});
    const overflow=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,offenders:[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1&&e.getBoundingClientRect().width>0).slice(0,8).map(e=>e.tagName+'.'+e.className)}));
    assert.ok(overflow.scroll<=width,route+': '+JSON.stringify(overflow));
    await page.locator('.studio-tool-menu summary').click();
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,route+' open menu');
    await page.locator('.studio-tool-menu summary').click();
   }
   await page.setViewportSize({width:390,height:844});await page.screenshot({path:'/tmp/studio-tool-'+i+'-mobile.png'});
   if(i>=1&&i<=3){
    const file=page.locator('#fileInput');assert.equal(await file.isVisible(),true);
    await file.focus();assert.equal(await file.evaluate(e=>document.activeElement===e),true);
    const data=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=1200;c.height=1500;return c.toDataURL().split(',')[1]});
    await file.setInputFiles({name:'studio-check.png',mimeType:'image/png',buffer:Buffer.from(data,'base64')});
    await page.waitForFunction(()=>document.body.innerText.includes('1200')||document.body.innerText.includes('1,200'));
    if(i===1){await page.locator('[data-mode=even-border]').click();assert.equal(await page.locator('#evenBorder').isVisible(),true);await page.locator('#evenBorder').fill('0');assert.equal(await page.locator('#downloadButton').isEnabled(),true);}
   }
   if(i>=4){const total=page.locator(i===4?'#estimateRange':i===5?'#designEstimateRange':'#muralEstimateRange');assert.ok((await total.innerText()).trim().length > 0);const select=page.locator('select').first();const options=await select.locator('option').evaluateAll(es=>es.filter(e=>!e.disabled).map(e=>e.value));if(options.length>1)await select.selectOption(options[1]);assert.ok((await total.innerText()).trim().length > 0);}
   assert.deepEqual(errors,[],route);console.log('PASS '+route);await page.close();
  }
 } finally {await browser.close();}
})();
