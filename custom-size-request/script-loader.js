(function () {
  const currentScript = document.currentScript;
  const sourceUrl = new URL("./script.js?v=20260720-cotton-pricing-source", currentScript ? currentScript.src : window.location.href);

  function loadScript(source) {
    const script = document.createElement("script");
    script.text = source + "\n//# sourceURL=" + sourceUrl.href;
    document.head.appendChild(script);
  }

  function loadFallback() {
    const script = document.createElement("script");
    script.src = sourceUrl.href;
    document.head.appendChild(script);
  }

  function patchCottonPricing(source) {
    const coldMaterialPattern =
      /(slug: "hot-press-bright-archival-paper-copy",[\s\S]*?baseRate: 0\.148,\n\s*)minPrice: 6/;
    const unifiedTableLine =
      '  websiteVariantText["hot-press-bright-archival-paper-copy"] = websiteVariantText["hot-press-bright-archival"];';

    let patched = source.replace(coldMaterialPattern, "$1minPrice: 5");

    if (!patched.includes(unifiedTableLine)) {
      patched = patched.replace(
        "  const websitePricingTables = buildWebsitePricingTables(websiteVariantText);",
        "  // Hot and cold press intentionally share one cotton-rag pricing ladder.\n" +
          unifiedTableLine +
          "\n  const websitePricingTables = buildWebsitePricingTables(websiteVariantText);"
      );
    }

    return patched;
  }

  fetch(sourceUrl.href, { cache: "no-store" })
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Unable to load calculator script.");
      }
      return response.text();
    })
    .then(function (source) {
      loadScript(patchCottonPricing(source));
    })
    .catch(loadFallback);
})();
