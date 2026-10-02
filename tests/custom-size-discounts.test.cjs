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
