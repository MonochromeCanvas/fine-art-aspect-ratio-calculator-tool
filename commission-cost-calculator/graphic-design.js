// Shared, bounded project ranges replace the former stacked-multiplier calculator.
(function (root) {
  if (typeof module !== 'undefined' && module.exports) {
    const planner = require('./pricing-planner.js');
    module.exports = { calculateEstimate: options => planner.calculateEstimate('design', options), buildSummary: planner.buildSummary };
  } else {
    root.mcPricingPlanner.init('design');
  }
})(typeof window !== 'undefined' ? window : globalThis);
