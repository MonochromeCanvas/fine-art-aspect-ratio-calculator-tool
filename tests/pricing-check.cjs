const assert=require('node:assert/strict');
const {projects,calculateEstimate,buildSummary}=require('../commission-cost-calculator/pricing-planner.js');
for(const [kind,catalog] of Object.entries(projects)) {
 for(const key of Object.keys(catalog)) {
  const baseline=calculateEstimate(kind,{project:key});
  for(const usage of ['unsure','personal','commercial','business','site','broad']) {
   const e=calculateEstimate(kind,{project:key,usage,deadline:'Tomorrow',budget:'$50',quantity:78});
   assert.equal(e.low,baseline.low);assert.equal(e.high,baseline.high);
   assert.ok(e.low===null || (Number.isFinite(e.low)&&e.low>0&&e.high>=e.low));
   assert.ok(buildSummary(e,{}).includes(e.range));
  }
 }
 assert.equal(calculateEstimate(kind,{project:'toString'}).key,'custom');
}
const card=calculateEstimate('artwork',{project:'illustration',quantity:78,payment:'flat'});
assert.deepEqual([card.low,card.high],[100,800]);assert.match(card.collectionNote,/not the whole collection/);
const royalty=calculateEstimate('artwork',{project:'illustration',payment:'royalty'});
assert.equal(royalty.range,'Let’s discuss terms');assert.match(royalty.note,/no discount/);
for(const quantity of ['abc','',0,-1,1.5,501,Infinity]) assert.equal(calculateEstimate('artwork',{project:'illustration',quantity}).quantityValid,false);
assert.equal(calculateEstimate('artwork',{project:'portrait',payment:'royalty',quantity:78}).royalty,false);
const first=calculateEstimate('mural',{project:'first-look',usage:'broad',deadline:'Tomorrow'});
assert.deepEqual([first.low,first.high],[350,500]);
console.log('PASS bounded pricing, collection units, royalties, optional context, invalid quantity and custom scope');
