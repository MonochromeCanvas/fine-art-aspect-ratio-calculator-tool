(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.MonochromePrintDiscounts = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';
  const schedules = {
    general: [{from:1,to:24,rate:5},{from:25,to:49,rate:10},{from:50,to:10000,rate:15}],
    artist: [{from:1,to:24,rate:20},{from:25,to:49,rate:25},{from:50,to:10000,rate:30}],
    nonprofit: [{from:1,to:24,rate:25},{from:25,to:49,rate:30},{from:50,to:99,rate:35},{from:100,to:499,rate:40},{from:500,to:10000,rate:50}]
  };
  function calculate({unitPrice, quantity, customerType = 'general', productionTiming = 'standard'}) {
    if (!['standard','rush','unsure'].includes(productionTiming) || !schedules[customerType] || !Number.isFinite(unitPrice) || unitPrice < 0 || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 10000) return {valid:false};
    const bands = schedules[customerType], baseRate = bands[0].rate;
    const cents = Math.round(unitPrice * 100), subtotal = cents * quantity;
    const discountsEligible = productionTiming === 'standard';
    const appliedBaseRate = discountsEligible ? baseRate : 0;
    const baseline = Math.round(subtotal * (100 - appliedBaseRate) / 100);
    const selectedTier = bands.find(band => quantity >= band.from && quantity <= band.to);
    const net = Math.round(subtotal * (100 - (discountsEligible ? selectedTier.rate : 0)) / 100);
    return {valid:true, customerType, productionTiming, discountsEligible, baseRate:appliedBaseRate, selectedTier, subtotal:subtotal/100, total:net/100,
      baseSavings:(subtotal-baseline)/100, volumeSavings:(baseline-net)/100,
      savings:(subtotal-net)/100, effectiveRate:subtotal ? (subtotal-net)/subtotal : 0,
      review:!discountsEligible || quantity >= 250};
  }
  return {calculate, schedules};
});
