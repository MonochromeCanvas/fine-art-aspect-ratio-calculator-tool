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
   assert.equal(await page.locator('.studio-tool-list a').count(),i<4?4:3);
   assert.equal(await page.locator('.studio-tool-list [aria-current=page]').count(),1);
   assert.equal(await page.locator('.studio-tool-list a[target=_blank]').count(),i<4?3:2);
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
   if(i>=4){
    const total=page.locator('#planningRange');assert.equal(await total.innerText(),'Let’s talk');
    assert.deepEqual(await page.locator('.studio-tool-list a').allTextContents(),['Artwork Commissions','Graphic Design','Mural Design']);
    assert.match(await page.locator('.hero-invite').innerText(),/hiring Joëlle Diane Zellman/);
    assert.equal(await page.locator('.artist-fit a').getAttribute('href'),'https://monochromecanvas.com/pages/commissions');
    for(const card of await page.locator('.starting-card').all()) {
     const key=await card.getAttribute('data-project');await card.click();
     assert.equal(await page.locator('#project').inputValue(),key);
     if(key!=='personal') assert.equal(await card.locator('strong').innerText(),await total.innerText());
     assert.equal(await card.getAttribute('aria-pressed'),'true');
    }
    await page.locator('.starting-card').first().click();
    assert.match(await total.innerText(),/\$/);
    await page.locator('#budget').fill('$450');await page.locator('#brief').fill('<b>A thoughtful project</b>');
    const mail=decodeURIComponent(await page.locator('#emailLink').getAttribute('href'));
    assert.ok(mail.includes('Budget: $450')&&mail.includes('<b>A thoughtful project</b>'));
    assert.equal(await page.locator('.estimate-panel b').count(),0);
    if(i===4){
     assert.equal(await total.innerText(),'$100–$800');
     await page.locator('#quantity').fill('78');
     assert.match(await page.locator('#collectionNote').innerText(),/78 distinct/);
     assert.equal(await total.innerText(),'$100–$800');
     await page.locator('#payment').selectOption('royalty');assert.equal(await total.innerText(),'Let’s discuss terms');
     assert.ok(decodeURIComponent(await page.locator('#emailLink').getAttribute('href')).includes('fee + royalties'));
     await page.locator('#project').selectOption('portrait');assert.equal(await page.locator('#payment').isVisible(),false);
     assert.equal(await total.innerText(),'$950–$1,400');
     assert.equal(await page.locator('#collectionNote').isVisible(),false);
    }
    await page.screenshot({path:'/tmp/studio-tool-'+i+'-selected-mobile.png',fullPage:true});
   }
   assert.deepEqual(errors,[],route);console.log('PASS '+route);await page.close();
  }
 } finally {await browser.close();}
})();
