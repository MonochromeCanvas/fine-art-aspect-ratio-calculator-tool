const assert=require('node:assert/strict');
const {calculate,schedules}=require('../custom-size-request/discount-pricing.js');
for(const customerType of ['general','artist','nonprofit']) {
 for(let quantity=1;quantity<=10000;quantity++) {
  const p=calculate({unitPrice:36,quantity,customerType});
  const tier=schedules[customerType].find(b=>quantity>=b.from&&quantity<=b.to);
  assert.equal(p.total,Math.round(3600*quantity*(100-tier.rate)/100)/100);
  assert.ok(Math.abs(p.subtotal-p.total-p.savings)<1e-7);
  assert.ok(Math.abs(p.baseSavings+p.volumeSavings-p.savings)<1e-7);
 }
}
for(const [customerType,total] of [['general',1530],['artist',1260],['nonprofit',1170]])
 assert.equal(calculate({unitPrice:36,quantity:50,customerType}).total,total);
for(const [customerType,total] of [['general',34.2],['artist',28.8],['nonprofit',27]])
 assert.equal(calculate({unitPrice:36,quantity:1,customerType}).total,total);
for(const [quantity,rate] of [[24,25],[25,30],[49,30],[50,35],[99,35],[100,40],[499,40],[500,50]]) {
 const p=calculate({unitPrice:100,quantity,customerType:'nonprofit'});
 assert.equal(p.total,quantity*(100-rate));
}
for(const quantity of [0,-1,NaN,Infinity,1.5,10001]) assert.equal(calculate({unitPrice:8,quantity}).valid,false);
assert.equal(calculate({unitPrice:8,quantity:1,customerType:'unknown'}).valid,false);
assert.equal(calculate({unitPrice:36,quantity:500,customerType:'nonprofit'}).review,true);
console.log('PASS: all three groups, exact whole-order tiers, 16x20 examples, nonprofit boundaries and cap, invalid quantities, totals through 10,000.');

for (const customerType of ['general', 'artist', 'nonprofit']) {
 for (const productionTiming of ['rush', 'unsure']) {
  for (const quantity of [1, 24, 25, 50, 100, 250, 500, 10000]) {
   const p = calculate({unitPrice: 36, quantity, customerType, productionTiming});
   assert.equal(p.valid, true);
   assert.equal(p.total, 36 * quantity);
   assert.equal(p.savings, 0);
   assert.equal(p.baseSavings, 0);
   assert.equal(p.volumeSavings, 0);
   assert.equal(p.effectiveRate, 0);
   assert.equal(p.baseRate, 0);
   assert.equal(p.review, true);
   assert.equal(p.discountsEligible, false);
  }
 }
 assert.deepEqual(calculate({unitPrice:36, quantity:50, customerType, productionTiming:'standard'}), calculate({unitPrice:36, quantity:50, customerType}));
}
assert.equal(calculate({unitPrice:36, quantity:1, productionTiming:'invalid'}).valid, false);
console.log('PASS: rush and uncertain timing remove all discounts for every customer group; standard pricing is preserved.');
