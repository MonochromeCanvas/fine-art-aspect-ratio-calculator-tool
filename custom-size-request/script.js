(function () {
  const STUDIO_EMAIL = "joelle@monochromecanvas.com";
  const WHITE_BORDER_BUILDER_URL = "../white-border-builder-tool/index.html";
  const WHITE_BORDER_BUILDER_IMPORT_QUERY_VALUE = "custom-size-request";
  const WHITE_BORDER_BUILDER_IMPORT_URL =
    WHITE_BORDER_BUILDER_URL + "?import=" + encodeURIComponent(WHITE_BORDER_BUILDER_IMPORT_QUERY_VALUE);
  const WHITE_BORDER_BUILDER_FILE_KEY = "custom-size-request-to-white-border-builder";
  const PREPARED_FILE_DB_NAME = "monochrome-canvas-prep";
  const PREPARED_FILE_STORE = "prepared-files";
  const PREPARED_FILE_KEY = "white-border-builder-to-custom-size-request";
  const PREPARED_FILE_QUERY_VALUE = "white-border-builder";
  const PREPARED_FILE_MAX_AGE_MS = 1000 * 60 * 60 * 24;
  const CUSTOM_SIZE_REQUEST_READY_ACTION = "monochrome-custom-size-request-ready";
  const PREPARED_ARTWORK_TRANSFER_ACTION = "monochrome-transfer-prepared-artwork";
  const PREPARED_ARTWORK_RECEIVED_ACTION = "monochrome-transfer-received";
  const PREPARED_ARTWORK_ERROR_ACTION = "monochrome-transfer-error";
  const STANDARD_SIZE_TOLERANCE = 0.05;
  const materials = [
    {
      slug: "hot-press-bright-archival",
      label: "100% Cotton Hot Press Archival Paper",
      description: "Smooth archival paper for crisp detail, illustration, and refined tonal work.",
      url: "https://monochromecanvas.com/products/hot-press-bright-archival",
      maxShort: 44,
      maxLong: 72,
      baseRate: 0.148,
      minPrice: 5
    },
    {
      slug: "hot-press-bright-archival-paper-copy",
      label: "100% Cotton Cold Press Archival Paper",
      description: "Soft texture for artwork that benefits from a tactile paper surface.",
      url: "https://monochromecanvas.com/products/hot-press-bright-archival-paper-copy",
      maxShort: 44,
      maxLong: 72,
      baseRate: 0.148,
      minPrice: 6
    },
    {
      slug: "mould-made-watercolour-paper",
      label: "Mould-Made Watercolour Paper",
      description: "A more painterly, premium paper choice with gentle tooth and depth.",
      url: "https://monochromecanvas.com/products/mould-made-watercolour-paper",
      maxShort: 44,
      maxLong: 72,
      baseRate: 0.168,
      minPrice: 7
    },
    {
      slug: "heavyweight-cotton-poly-blend-matte-canvas",
      label: "Heavyweight Cotton-Poly Blend Matte Canvas",
      description: "Loose matte canvas for odd sizes, custom framing, and studio finishing.",
      url: "https://monochromecanvas.com/products/heavyweight-cotton-poly-blend-matte-canvas",
      maxShort: 40,
      maxLong: 70,
      supportsStretchingBorder: true,
      baseRate: 0.19,
      minPrice: 12
    },
    {
      slug: "photo-rag-baryta",
      label: "Photo Rag Baryta",
      description: "A premium baryta finish with rich depth for photographic and high-contrast work.",
      url: "https://monochromecanvas.com/products/photo-rag-baryta",
      maxShort: 44,
      maxLong: 72,
      baseRate: 0.168,
      minPrice: 8
    },
    {
      slug: "pro-luster-photo-paper",
      label: "Pro Luster Photo Paper",
      description: "A balanced luster finish for photography, graphic work, and everyday display prints.",
      url: "https://monochromecanvas.com/products/pro-luster-photo-paper",
      maxShort: 44,
      maxLong: 72,
      baseRate: 0.111,
      minPrice: 3
    }
  ];

  // Standard sizes synced from the live Monochrome Canvas product pages on April 24, 2026.
  const websiteVariantText = {
    "hot-press-bright-archival": String.raw`4x4 - $5.00  4x6 - $6.00  5x5 - $7.00  5x7 - $8.00  6x6 - $8.00  6x7.5 - $8.00  6x8 - $8.00  6x9 - $8.00  8x8 - $10.50  8x10 - $10.00  8x12 - $12.50  8x24 - $22.00  8.5x11 - $12.00  9x12 - $14.00  10x10 - $14.50  10x15 - $18.00  10x20 - $23.00  10x30 - $34.00  11x14 - $18.00  11x17 - $22.00  12x12 - $17.00  12x15 - $21.00  12x16 - $22.00  12x18 - $25.00  12x24 - $33.00  12x36 - $48.00  13x19 - $28.00  14x14 - $23.00  14x20 - $31.00  14x21 - $33.00  15x20 - $34.00  15x45 - $82.00  16x16 - $29.00  16x20 - $36.00  16x24 - $43.00  16x48 - $92.00  18x22 - $46.00  18x24 - $48.00  18x27 - $54.00  19x19 - $42.00  20x20 - $45.00  20x24 - $55.00  20x30 - $66.00  20x40 - $88.00  21x28 - $65.00  22x33 - $80.00  24x24 - $70.00  24x30 - $86.00  24x32 - $91.00  24x36 - $107.00  24x48 - $153.00  26x39 - $127.00  27x36 - $124.00  28x35 - $125.00  28x42 - $147.00  30x30 - $125.00  30x40 - $155.00  30x45 - $171.00  32x40 - $148.00  33x44 - $183.00  34x51 - $220.00  36x36 - $165.00  36x45 - $208.00  36x48 - $220.00  36x54 - $245.00  40x50 - $255.00`,
    "hot-press-bright-archival-paper-copy": String.raw`4x4 - $6.00  4x6 - $8.00  5x5 - $8.00  5x7 - $8.00  6x6 - $8.00  6x7.5 - $8.00  6x8 - $8.00  6x9 - $8.00  8x8 - $8.00  8x10 - $10.00  8x12 - $12.00  8x24 - $22.00  8.5x11 - $12.00  9x12 - $13.00  10x10 - $12.00  10x15 - $18.00  10x20 - $23.00  10x30 - $34.00  11x14 - $18.00  11x17 - $22.00  12x12 - $17.00  12x15 - $21.00  12x16 - $22.00  12x18 - $25.00  12x24 - $32.00  12x36 - $48.00  13x19 - $28.00  14x14 - $23.00  14x20 - $31.00  14x21 - $33.00  15x20 - $34.00  15x45 - $74.00  16x16 - $29.00  16x20 - $36.00  16x24 - $43.00  16x48 - $84.00  18x22 - $46.00  18x24 - $48.00  18x27 - $54.00  19x19 - $42.00  20x20 - $45.00  20x25 - $55.00  20x30 - $66.00  20x40 - $88.00  21x28 - $65.00  22x33 - $80.00  24x24 - $63.00  24x30 - $79.00  24x32 - $84.00  24x36 - $94.00  24x48 - $125.00  26x39 - $127.00  27x36 - $124.00  28x35 - $125.00  28x42 - $147.00  30x30 - $125.00  30x40 - $155.00  30x45 - $171.00  32x40 - $148.00  33x44 - $183.00  34x51 - $220.00  36x36 - $165.00  36x45 - $208.00  36x48 - $220.00  36x54 - $245.00  40x50 - $255.00`,
    "mould-made-watercolour-paper": String.raw`4x4 - $7.00  4x6 - $8.00  5x5 - $10.00  5x7 - $10.00  6x6 - $10.00  6x7.5 - $10.00  6x8 - $10.00  6x9 - $10.00  8x8 - $10.00  8x10 - $12.00  8x12 - $14.00  8x24 - $26.00  8.5x11 - $14.00  9x12 - $15.00  10x10 - $14.00  10x15 - $21.00  10x20 - $27.00  10x30 - $40.00  11x14 - $21.00  11x17 - $26.00  12x12 - $20.00  12x15 - $25.00  12x16 - $26.00  12x18 - $29.00  12x24 - $38.00  12x36 - $57.00  13x19 - $33.00  14x14 - $27.00  14x20 - $37.00  14x21 - $39.00  15x20 - $40.00  15x45 - $88.00  16x16 - $34.00  16x20 - $43.00  16x24 - $51.00  16x48 - $100.00  18x24 - $57.00  18x27 - $64.00  19x19 - $48.00  20x20 - $53.00  20x24 - $64.00  20x25 - $65.00  20x30 - $80.00  20x40 - $104.00  20x60 - $170.00  21x28 - $77.00  22x33 - $95.00  24x24 - $75.00  24x30 - $87.00  24x32 - $90.00  24x36 - $112.00  24x48 - $160.00  26x39* - $172.00  27x36* - $164.00  28x35* - $164.00  28x42* - $200.00  30x30* - $152.00  30x40* - $203.00  30x45* - $190.00  32x40* - $216.00  32x48* - $300.00  33x44* - $244.00  34x51* - $290.00  36x36* - $218.00  36x45* - $274.00  36x48* - $290.00  36x54* - $326.00  40x50* - $335.00`,
    "heavyweight-cotton-poly-blend-matte-canvas": String.raw`8x8 / None - $12.00  8x8 / 2" - $13.80  8x10 / None - $15.00  8x10 / 2" - $17.25  8x12 / None - $17.00  8x12 / 2" - $19.55  8x24 / None - $30.00  8x24 / 2" - $34.50  8.5x11 / None - $16.00  8.5x11 / 2" - $18.40  9x12 / None - $18.00  9x12 / 2" - $20.70  10x10 / None - $17.00  10x10 / 2" - $19.55  10x15 / None - $24.00  10x15 / 2" - $27.60  10x20 / None - $31.00  10x20 / 2" - $35.65  10x30 / None - $45.00  10x30 / 2" - $51.75  11x14 / None - $25.00  11x14 / 2" - $28.75  11x17 / None - $29.00  11x17 / 2" - $33.35  12x12 / None - $23.00  12x12 / 2" - $26.45  12x15 / None - $28.00  12x15 / 2" - $32.20  12x16 / None - $30.00  12x16 / 2" - $36.50  12x18 / None - $33.00  12x18 / 2" - $37.95  12x24 / None - $43.00  12x24 / 2" - $49.45  12x36 / None - $63.00  12x36 / 2" - $72.45  13x19 / None - $38.00  13x19 / 2" - $43.70  14x14 / None - $31.00  14x14 / 2" - $35.65  14x20 / None - $44.00  14x20 / 2" - $50.60  15x20 / None - $45.00  15x20 / 2" - $60.75  16x16 / None - $39.00  16x16 / 2" - $44.85  16x20 / None - $48.00  16x20 / 2" - $55.20  16x24 / None - $57.00  16x24 / 2" - $65.55  18x24 / None - $71.00  18x24 / 2" - $81.65  18x30 / None - $80.00  18x30 / 2" - $92.00  20x20 / None - $60.00  20x20 / 2" - $69.00  20x24 / None - $74.00  20x24 / 2" - $85.10  20x30 / None - $87.00  20x30 / 2" - $100.05  20x40 / None - $115.00  20x40 / 2" - $122.25  24x24 / None - $83.00  24x30 / None - $103.00  24x30 / 2" - $118.00  24x32 / None - $110.00  24x36 / None - $124.00  24x36 / 2" - $142.00  24x38 / None - $142.00`,
    "photo-rag-baryta": String.raw`4x6 - $8.00  5x7 - $10.00  6x8 - $10.00  6x9 - $10.00  8x8 - $10.00  8x10 - $12.00  8x12 - $14.00  8x24 - $26.00  8.5x11 - $14.00  9x12 - $15.00  10x10 - $14.00  10x15 - $21.00  10x20 - $27.00  10x30 - $40.00  11x14 - $21.00  11x17 - $26.00  12x12 - $20.00  12x15 - $25.00  12x16 - $26.00  12x18 - $29.00  12x24 - $38.00  12x36 - $57.00  13x19 - $33.00  14x14 - $27.00  14x20 - $37.00  14x21 - $39.00  15x20 - $40.00  15x45 - $88.00  16x16 - $34.00  16x20 - $43.00  16x24 - $51.00  16x48 - $100.00  18x24 - $57.00  18x27 - $64.00  20x20 - $53.00  20x24 - $65.00  20x30 - $80.00  20x40 - $104.00  20x60 - $170.00  21x28 - $77.00  22x33 - $95.00  24x24 - $75.00  24x30 - $87.00  24x32 - $90.00  24x36 - $112.00  24x48 - $160.00  26x39* - $172.00  27x36* - $164.00  28x35* - $164.00  28x42* - $200.00  30x30* - $152.00  30x40* - $203.00  30x45* - $220.00  32x40* - $216.00  32x48* - $300.00  33x44* - $244.00  34x51* - $290.00  36x36* - $218.00  36x45* - $274.00  36x48* - $290.00  36x54* - $326.00  40x50* - $335.00`,
    "pro-luster-photo-paper": String.raw`4x6 - $3.00  5x7 - $5.00  8x10 - $8.00  10x10 - $10.00  12x12 - $12.00  11x14 - $16.00  16x16 - $22.00  16x20 - $31.00  20x20 - $40.00  20x24 - $50.00  18x24 - $43.00  20x30 - $57.00  24x32 - $72.00  24x36 - $78.00`
  };
  const websitePricingTables = buildWebsitePricingTables(websiteVariantText);

  const projectTypes = [
    "Fine art reproduction",
    "Photography print",
    "Show or portfolio",
    "Gift or personal project",
    "Other"
  ];

  const state = {
    file: null,
    objectUrl: null,
    imageWidth: null,
    imageHeight: null,
    dimensionsAutoFilled: false,
    isSyncingDimensions: false,
    lockedRatio: null,
    sizeFieldsEdited: false,
    lastPreparedTransferId: "",
    orderMode: "standard",
    clientInvoiceAmountEdited: false,
    lastRecommendedRetail: 0
  };

  const elements = {
    fileInput: document.getElementById("fileInput"),
    fileMeta: document.getElementById("fileMeta"),
    materialSelect: document.getElementById("materialSelect"),
    materialDescription: document.getElementById("materialDescription"),
    materialLink: document.getElementById("materialLink"),
    canvasOptions: document.getElementById("canvasOptions"),
    canvasBorderSelect: document.getElementById("canvasBorderSelect"),
    borderDepthField: document.getElementById("borderDepthField"),
    borderDepthInput: document.getElementById("borderDepthInput"),
    edgeStyleField: document.getElementById("edgeStyleField"),
    edgeStyleSelect: document.getElementById("edgeStyleSelect"),
    edgeColorField: document.getElementById("edgeColorField"),
    edgeColorInput: document.getElementById("edgeColorInput"),
    widthInput: document.getElementById("widthInput"),
    heightInput: document.getElementById("heightInput"),
    quantityInput: document.getElementById("quantityInput"),
    productionTiming: document.getElementById("productionTiming"),
    requestedDeadline: document.getElementById("requestedDeadline"),
    rushDeadlineDate: document.getElementById("rushDeadlineDate"),
    ratioToggleCard: document.getElementById("ratioToggleCard"),
    ratioLockToggle: document.getElementById("ratioLockToggle"),
    ratioModeNote: document.getElementById("ratioModeNote"),
    mobilePreviewMount: document.getElementById("mobilePreviewMount"),
    standardOrderModeButton: document.getElementById("standardOrderModeButton"),
    invoiceClientModeButton: document.getElementById("invoiceClientModeButton"),
    standardOrderPanel: document.getElementById("standardOrderPanel"),
    invoiceClientPanel: document.getElementById("invoiceClientPanel"),
    projectTypeSelect: document.getElementById("projectTypeSelect"),
    customerPricingChoice: document.getElementById("customerPricingChoice"),
    discountPricingNote: document.getElementById("discountPricingNote"),
    standardNameInput: document.getElementById("standardNameInput"),
    standardEmailInput: document.getElementById("standardEmailInput"),
    standardNotesInput: document.getElementById("standardNotesInput"),
    artistNameInput: document.getElementById("artistNameInput"),
    artistEmailInput: document.getElementById("artistEmailInput"),
    clientNameInput: document.getElementById("clientNameInput"),
    clientEmailInput: document.getElementById("clientEmailInput"),
    payoutMethodSelect: document.getElementById("payoutMethodSelect"),
    payoutHandleInput: document.getElementById("payoutHandleInput"),
    clientInvoiceAmountInput: document.getElementById("clientInvoiceAmountInput"),
    invoiceNotesInput: document.getElementById("invoiceNotesInput"),
    productionCostValue: document.getElementById("productionCostValue"),
    recommendedRetailValue: document.getElementById("recommendedRetailValue"),
    artistPayoutValue: document.getElementById("artistPayoutValue"),
    artistPayoutNote: document.getElementById("artistPayoutNote"),
    qualityBadge: document.getElementById("qualityBadge"),
    estimateLabel: document.getElementById("estimateLabel"),
    estimateTotal: document.getElementById("estimateTotal"),
    estimateRange: document.getElementById("estimateRange"),
    previewStage: document.getElementById("previewStage"),
    desktopPreviewMount: document.getElementById("desktopPreviewMount"),
    previewFrame: document.querySelector(".wall-frame"),
    previewImage: document.getElementById("previewImage"),
    previewPlaceholder: document.getElementById("previewPlaceholder"),
    summaryContent: document.getElementById("summaryContent"),
    guidanceContent: document.getElementById("guidanceContent"),
    prepFlowNote: document.getElementById("prepFlowNote"),
    prepareSupportCopy: document.getElementById("prepareSupportCopy"),
    prepareFieldNote: document.getElementById("prepareFieldNote"),
    formMessage: document.getElementById("formMessage")
  };

  // Artwork-specific values are saved per entry. Contact, customer group, and timing are shared.
  const artworkFieldIds = ["materialSelect", "widthInput", "heightInput", "quantityInput", "ratioLockToggle", "canvasBorderSelect", "borderDepthInput", "edgeStyleSelect", "edgeColorInput"];
  const artworkStateKeys = ["file", "objectUrl", "imageWidth", "imageHeight", "dimensionsAutoFilled", "lockedRatio", "sizeFieldsEdited"];
  const requestArtworks = { entries: [{id: 1, snapshot: null}], activeId: 1, nextId: 2, busy: false };

  function saveCurrentArtwork(estimate) {
    estimate = estimate || calculateEstimate();
    const fields = {};
    artworkFieldIds.forEach(function (id) { fields[id] = elements[id].type === "checkbox" ? elements[id].checked : elements[id].value; });
    const savedState = {};
    artworkStateKeys.forEach(function (key) { savedState[key] = state[key]; });
    const maxSize = getMaxSizeFeedback(estimate);
    let error = !estimate.quantityValid ? "Enter a whole-number quantity from 1 to 10,000." :
      !(estimate.width > 0 && estimate.height > 0) ? "Enter a positive width and height." :
      !state.file || !state.imageWidth ? "Upload the artwork file." : !maxSize.fits ? maxSize.message : "";
    if (!error && estimate.canvasOptions.hasStretchingBorder && !(estimate.canvasOptions.borderDepth > 0)) error = "Enter a valid canvas stretching border depth.";
    if (!error && estimate.canvasOptions.hasStretchingBorder && estimate.canvasOptions.edgeStyle === "color" && !estimate.canvasOptions.edgeColor) error = "Describe the requested canvas edge color.";
    const entry = requestArtworks.entries.find(function (item) { return item.id === requestArtworks.activeId; });
    entry.snapshot = {
      fields: fields, state: savedState, estimate: estimate, error: error,
      quality: formatQualityValue(getResolutionFeedback(estimate.width, estimate.height)),
      fit: getSizingFeedback(estimate.width, estimate.height),
      sizingMode: getSizingModeLabel(estimate.width, estimate.height)
    };
  }

  function getRequestEntries() {
    const customerType = isInvoiceMode() ? "artist" : document.querySelector('input[name="customerPricing"]:checked').value;
    return requestArtworks.entries.map(function (entry) {
      const snapshot = entry.snapshot;
      if (!snapshot) return entry;
      const e = snapshot.estimate;
      const pricing = MonochromePrintDiscounts.calculate({unitPrice: e.unitPrice, quantity: e.quantity, customerType: customerType, productionTiming: elements.productionTiming.value});
      const estimate = Object.assign({}, e, {customerType: customerType, productionTiming: elements.productionTiming.value, pricing: pricing,
        total: pricing.valid ? pricing.total : 0, subtotal: pricing.valid ? pricing.subtotal : 0,
        discountRate: pricing.valid ? pricing.effectiveRate : 0, discountAmount: pricing.valid ? pricing.savings : 0});
      return {id: entry.id, snapshot: Object.assign({}, snapshot, {estimate: estimate})};
    });
  }

  function restoreArtwork(entry) {
    const snapshot = entry.snapshot;
    artworkStateKeys.forEach(function (key) { state[key] = snapshot.state[key]; });
    artworkFieldIds.forEach(function (id) {
      if (elements[id].type === "checkbox") elements[id].checked = snapshot.fields[id];
      else elements[id].value = snapshot.fields[id];
    });
    elements.fileInput.value = "";
    if (state.file && typeof DataTransfer !== "undefined") {
      const transfer = new DataTransfer(); transfer.items.add(state.file); elements.fileInput.files = transfer.files;
    }
    elements.previewImage.hidden = !state.file;
    if (state.objectUrl) elements.previewImage.src = state.objectUrl;
    else elements.previewImage.removeAttribute("src");
    elements.previewPlaceholder.classList.toggle("is-hidden", Boolean(state.file));
    render();
  }

  function selectArtwork(id) {
    if (requestArtworks.busy || id === requestArtworks.activeId) return;
    saveCurrentArtwork();
    requestArtworks.activeId = id;
    restoreArtwork(requestArtworks.entries.find(function (entry) { return entry.id === id; }));
  }

  function addArtwork() {
    if (requestArtworks.busy) return;
    saveCurrentArtwork();
    if (requestArtworks.entries.length >= 30) { showMessage("For more than 30 artwork entries, please contact the studio to plan the request.", true); return; }
    const entry = {id: requestArtworks.nextId++, snapshot: null};
    requestArtworks.entries.push(entry); requestArtworks.activeId = entry.id;
    state.file = null; state.objectUrl = null; state.imageWidth = null; state.imageHeight = null;
    state.lockedRatio = null; state.sizeFieldsEdited = false; state.dimensionsAutoFilled = false;
    elements.fileInput.value = ""; elements.previewImage.hidden = true; elements.previewImage.removeAttribute("src"); elements.previewPlaceholder.classList.remove("is-hidden");
    elements.widthInput.value = "16"; elements.heightInput.value = "20"; elements.quantityInput.value = "1";
    elements.ratioLockToggle.checked = false;
    elements.canvasBorderSelect.value = "none"; elements.borderDepthInput.value = "2"; elements.edgeStyleSelect.value = "white"; elements.edgeColorInput.value = "";
    render(); elements.fileInput.focus();
  }

  function removeArtwork(id) {
    if (requestArtworks.busy || requestArtworks.entries.length === 1) return;
    saveCurrentArtwork();
    const entry = requestArtworks.entries.find(function (item) { return item.id === id; });
    requestArtworks.entries = requestArtworks.entries.filter(function (item) { return item.id !== id; });
    if (entry.snapshot.state.objectUrl) URL.revokeObjectURL(entry.snapshot.state.objectUrl);
    if (requestArtworks.activeId === id) {
      requestArtworks.activeId = requestArtworks.entries[0].id; restoreArtwork(requestArtworks.entries[0]);
    } else render();
  }

  function renderArtworkRequest(estimate) {
    saveCurrentArtwork(estimate);
    const entries = getRequestEntries();
    const list = document.getElementById("requestArtworkList");
    // Keep the focused control stable while editing a number or removing an entry.
    const focusedId = document.activeElement && document.activeElement.dataset.requestFocus;
    list.replaceChildren();
    entries.forEach(function (entry, index) {
      const s = entry.snapshot, e = s.estimate;
      const card = document.createElement("div"); card.className = "request-artwork-card";
      card.classList.toggle("is-active", entry.id === requestArtworks.activeId);
      if (s.state.objectUrl) { const img = document.createElement("img"); img.src = s.state.objectUrl; img.alt = ""; card.append(img); }
      else { const placeholder = document.createElement("span"); placeholder.textContent = String(index + 1); card.append(placeholder); }
      const select = document.createElement("button"); select.type = "button"; select.className = "request-artwork-select"; select.dataset.requestFocus = "select-" + entry.id;
      select.setAttribute("aria-pressed", String(entry.id === requestArtworks.activeId));
      const title = document.createElement("strong"); title.textContent = "Artwork " + (index + 1) + ": " + (s.state.file ? s.state.file.name : "Choose a file");
      select.append(title);
      if (s.state.file) {
        const detail = document.createElement("span"); detail.textContent = formatDimensions(e.width, e.height) + " · " + e.material.label + " · Qty " + e.quantity + " · " + (s.error ? "Needs details" : formatMoney(e.total)) + (s.fit.needsPrep ? " · Formatting needed for PDF" : "");
        select.append(detail);
        select.addEventListener("click", function () { selectArtwork(entry.id); });
      } else {
        card.classList.add("is-upload");
        select.setAttribute("aria-label", "Upload artwork " + (index + 1));
        card.addEventListener("click", function (event) {
          if (requestArtworks.busy || event.target.closest(".request-artwork-remove")) return;
          selectArtwork(entry.id);
          elements.fileInput.click();
        });
      }
      card.append(select);
      if (entries.length > 1) { const remove = document.createElement("button"); remove.type = "button"; remove.className = "request-artwork-remove"; remove.textContent = "Remove"; remove.setAttribute("aria-label", "Remove artwork " + (index + 1)); remove.dataset.requestFocus = "remove-" + entry.id; remove.addEventListener("click", function () { removeArtwork(entry.id); }); card.append(remove); }
      list.append(card);
    });
    if (focusedId) { const focused = Array.from(list.querySelectorAll("button")).find(function (button) { return button.dataset.requestFocus === focusedId; }); if (focused) focused.focus({preventScroll: true}); }
    const total = entries.reduce(function (sum, entry) { return sum + entry.snapshot.estimate.total; }, 0);
    const incomplete = entries.some(function (entry) { return Boolean(entry.snapshot.error); });
    document.getElementById("addArtworkButton").disabled = isInvoiceMode();
    const combinedLabel = "Combined estimate: " + formatMoney(total) + " · " + entries.length + (entries.length === 1 ? " artwork" : " artworks") + (incomplete ? " · Complete the missing artwork details before sending" : "") + (elements.productionTiming.value !== "standard" ? " · Before any rush fees" : "");
    document.getElementById("requestCombinedTotal").textContent = combinedLabel;
    document.getElementById("requestBottomTotal").textContent = combinedLabel;
  }

  function requestArtworkError() {
    saveCurrentArtwork();
    const entries = getRequestEntries();
    const index = entries.findIndex(function (entry) { return Boolean(entry.snapshot.error); });
    return index < 0 ? "" : "Artwork " + (index + 1) + ": " + entries[index].snapshot.error;
  }

  function requestedDeadlineText() {
    const details = elements.requestedDeadline.value.trim();
    if (elements.productionTiming.value !== "rush" || !elements.rushDeadlineDate.value) return details;
    return elements.rushDeadlineDate.value + (details ? " · " + details : "");
  }

  function requestDocumentData() {
    saveCurrentArtwork();
    const entries = getRequestEntries();
    return {
      contact: getPrimaryContact(), customerType: entries[0].snapshot.estimate.customerType,
      timing: {standard: "Standard production", rush: "Rush order requested", unsure: "Not sure - deadline review requested"}[elements.productionTiming.value],
      deadline: requestedDeadlineText() || "Not provided",
      notes: getActiveNotes(), projectType: elements.projectTypeSelect.value,
      total: entries.reduce(function (sum, entry) { return sum + entry.snapshot.estimate.total; }, 0),
      entries: entries.map(function (entry, index) {
        const s = entry.snapshot, e = s.estimate;
        return {number: index + 1, filename: s.state.file.name, url: s.state.objectUrl, pixelWidth: s.state.imageWidth, pixelHeight: s.state.imageHeight,
          width: e.width, height: e.height, material: e.material.label, quantity: e.quantity, unitPrice: e.unitPrice,
          total: e.total, savings: e.discountAmount, quality: s.quality, sizingMode: s.sizingMode, needsPrep: s.fit.needsPrep,
          canvas: e.canvasOptions.canAddBorder ? formatEdgeStyle(e.canvasOptions) : "", fit: s.fit.message || "Check the preview before printing."};
      })
    };
  }

  const pdfReview = {blob: null, filename: "", urls: [], trigger: null, token: 0};

  function clearPdfReview() {
    pdfReview.urls.forEach(function (url) { URL.revokeObjectURL(url); });
    pdfReview.urls = []; pdfReview.blob = null; pdfReview.filename = "";
    document.getElementById("pdfPreviewPages").replaceChildren();
  }

  function closePdfPreview() {
    pdfReview.token++;
    document.getElementById("pdfPreviewDialog").classList.add("is-hidden");
    document.querySelector(".app-shell").inert = false;
    document.body.style.overflow = "";
    clearPdfReview();
    if (pdfReview.trigger) pdfReview.trigger.focus({preventScroll: true});
  }

  async function openPdfPreview() {
    const error = validateRequest();
    if (error) { showMessage(error, true); return; }
    const entries = getRequestEntries();
    const mismatched = entries.findIndex(function (entry) { return entry.snapshot.fit.needsPrep; });
    if (mismatched >= 0) {
      selectArtwork(entries[mismatched].id);
      showMessage("Artwork " + (mismatched + 1) + ": Format the file in White Border Builder for the requested size, then replace it here before previewing the request PDF. Your quote estimate is still available.", true);
      document.getElementById("artworkFormattingNotice").scrollIntoView({block: "center", behavior: "smooth"});
      return;
    }
    clearPdfReview();
    const token = ++pdfReview.token;
    pdfReview.trigger = document.activeElement;
    const dialog = document.getElementById("pdfPreviewDialog");
    const status = document.getElementById("pdfPreviewStatus");
    const download = document.getElementById("downloadReviewedPdfButton");
    download.disabled = true;
    status.textContent = "Preparing your PDF preview…";
    dialog.classList.remove("is-hidden");
    document.querySelector(".app-shell").inert = true;
    document.body.style.overflow = "hidden";
    document.getElementById("editRequestButton").focus();
    showMessage("", false);
    try {
      const data = requestDocumentData();
      const result = await MonochromeRequestPdf.create(data, {preview: true});
      if (token !== pdfReview.token) return;
      pdfReview.blob = result.blob;
      const customerName = data.contact.name.normalize("NFC")
        .replace(/[<>:"/\\|?*\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g, "")
        .trim().replace(/\s+/g, "-").replace(/^[. -]+|[. -]+$/g, "").slice(0, 100) || "customer";
      pdfReview.filename = "monochrome-canvas-print-request-" + customerName + ".pdf";
      const pages = document.getElementById("pdfPreviewPages");
      result.pages.forEach(function (page, index) {
        const url = URL.createObjectURL(page); pdfReview.urls.push(url);
        const image = document.createElement("img"); image.src = url;
        image.alt = "Request PDF preview, page " + (index + 1) + " of " + result.pages.length;
        image.width = 1275; image.height = 1650;
        pages.append(image);
      });
      status.textContent = result.pages.length + " pages · " + data.entries.length + (data.entries.length === 1 ? " artwork" : " artworks") + " · Combined estimate: " + formatMoney(data.total);
      download.disabled = false;
    } catch (error) {
      if (token !== pdfReview.token) return;
      status.textContent = "The PDF preview could not be created. Choose Edit request, check your artwork files, and try again.";
    }
  }

  function downloadReviewedPdf() {
    if (!pdfReview.blob) return;
    triggerBlobDownload(pdfReview.blob, pdfReview.filename);
    document.getElementById("pdfPreviewStatus").textContent = "PDF downloaded. Your request has not been sent automatically and no order has been placed. For website sizes and quantities, order through website checkout. For a custom quote, email the PDF AND every full-resolution, print-ready artwork file to joelle@monochromecanvas.com for studio review.";
  }

  function handlePdfPreviewKeydown(event) {
    if (document.getElementById("pdfPreviewDialog").classList.contains("is-hidden")) return;
    if (event.key === "Escape") { event.preventDefault(); closePdfPreview(); return; }
    if (event.key !== "Tab") return;
    const controls = Array.from(document.getElementById("pdfPreviewDialog").querySelectorAll("button:not(:disabled), a[href]"));
    const first = controls[0], last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  init();

  function init() {
    populateMaterials();
    populateProjectTypes();
    state.lockedRatio = getCurrentSizeRatio();
    bindEvents();
    setupPreparedArtworkMessaging();
    setupResponsivePreview();
    render();
    importPreparedArtworkIfRequested();
  }

  function populateMaterials() {
    elements.materialSelect.innerHTML = "";
    materials.forEach((material) => {
      const option = document.createElement("option");
      option.value = material.slug;
      option.textContent = material.label;
      elements.materialSelect.appendChild(option);
    });
  }

  function populateProjectTypes() {
    projectTypes.forEach((label) => {
      const option = document.createElement("option");
      option.value = label;
      option.textContent = label;
      elements.projectTypeSelect.appendChild(option);
    });
  }

  function getOrderMode() {
    return state.orderMode;
  }

  function isInvoiceMode() {
    return getOrderMode() === "invoice-client";
  }

  function getOrderModeLabel(mode) {
    return mode === "invoice-client" ? "Invoice My Client" : "Standard Order";
  }

  function setOrderMode(mode) {
    state.orderMode = mode === "invoice-client" ? "invoice-client" : "standard";
    render();
  }

  function syncInvoiceAmount(estimate) {
    const recommendedRetail = roundMoney(estimate.total * 2);
    const currentValue = getNumericValue(elements.clientInvoiceAmountInput);
    const shouldAutofill =
      !state.clientInvoiceAmountEdited ||
      !elements.clientInvoiceAmountInput.value.trim() ||
      Math.abs(currentValue - state.lastRecommendedRetail) < 0.01;

    if (shouldAutofill) {
      elements.clientInvoiceAmountInput.value = formatMoneyInput(recommendedRetail);
      state.clientInvoiceAmountEdited = false;
    }

    state.lastRecommendedRetail = recommendedRetail;
    return recommendedRetail;
  }

  function getInvoicePricing(estimate) {
    const productionCost = estimate.total;
    const recommendedRetail = syncInvoiceAmount(estimate);
    const clientInvoiceAmount = getNumericValue(elements.clientInvoiceAmountInput);
    const artistPayout = roundMoney(clientInvoiceAmount - productionCost);

    return {
      productionCost: productionCost,
      recommendedRetail: recommendedRetail,
      clientInvoiceAmount: clientInvoiceAmount,
      artistPayout: artistPayout
    };
  }

  function getActiveNotes() {
    return isInvoiceMode() ? elements.invoiceNotesInput.value.trim() : elements.standardNotesInput.value.trim();
  }

  function getPrimaryContact() {
    if (isInvoiceMode()) {
      return {
        name: elements.artistNameInput.value.trim(),
        email: elements.artistEmailInput.value.trim()
      };
    }

    return {
      name: elements.standardNameInput.value.trim(),
      email: elements.standardEmailInput.value.trim()
    };
  }

  function bindEvents() {
    document.getElementById("formatArtworkLink").addEventListener("click", handOffToWhiteBorderBuilder);
    document.getElementById("addArtworkButton").addEventListener("click", addArtwork);
    document.getElementById("previewRequestPdfButton").addEventListener("click", openPdfPreview);
    document.getElementById("editRequestButton").addEventListener("click", closePdfPreview);
    document.getElementById("downloadReviewedPdfButton").addEventListener("click", downloadReviewedPdf);
    document.getElementById("pdfPreviewDialog").addEventListener("click", function (event) {
      if (event.target === event.currentTarget) closePdfPreview();
    });
    document.addEventListener("keydown", handlePdfPreviewKeydown);
    elements.fileInput.addEventListener("change", handleFileChange);
    elements.standardOrderModeButton.addEventListener("click", function () {
      setOrderMode("standard");
    });
    elements.invoiceClientModeButton.addEventListener("click", function () {
      setOrderMode("invoice-client");
    });
    [elements.widthInput, elements.heightInput].forEach((input) => {
      input.addEventListener("input", handleSizeInput);
      input.addEventListener("change", handleSizeInput);
    });
    elements.ratioLockToggle.addEventListener("change", handleRatioLockChange);
    [
      elements.materialSelect,
      elements.canvasBorderSelect,
      elements.borderDepthInput,
      elements.edgeStyleSelect,
      elements.edgeColorInput,
      elements.quantityInput,
      elements.productionTiming,
      elements.requestedDeadline,
      elements.rushDeadlineDate,
      elements.projectTypeSelect,
      elements.customerPricingChoice,
      elements.standardNameInput,
      elements.standardEmailInput,
      elements.standardNotesInput,
      elements.artistNameInput,
      elements.artistEmailInput,
      elements.clientNameInput,
      elements.clientEmailInput,
      elements.payoutMethodSelect,
      elements.payoutHandleInput,
      elements.invoiceNotesInput
    ].forEach((input) => {
      input.addEventListener("input", render);
      input.addEventListener("change", render);
    });

    elements.clientInvoiceAmountInput.addEventListener("input", function () {
      state.clientInvoiceAmountEdited = true;
      render();
    });
    elements.clientInvoiceAmountInput.addEventListener("change", function () {
      state.clientInvoiceAmountEdited = true;
      render();
    });


  }

  function markSizeFieldsEdited() {
    state.sizeFieldsEdited = true;
    state.dimensionsAutoFilled = false;
  }

  function handleSizeInput(event) {
    if (state.isSyncingDimensions) {
      return;
    }

    markSizeFieldsEdited();
    syncLinkedDimension(event.target);
    render();
  }

  function handleRatioLockChange() {
    if (elements.ratioLockToggle.checked) {
      state.lockedRatio = getPreferredArtworkRatio();
      syncLinkedDimension(elements.widthInput);
    }

    render();
  }

  async function handleFileChange(event) {
    const file = event.target.files && event.target.files[0];

    if (!file) {
      clearFile();
      render();
      return;
    }

    requestArtworks.busy = true;
    try {
      await loadFileIntoState(file);
      render();
    } catch (error) {
      clearFile();
      showMessage("That file could not be read for a live quality preview.", true);
      render();
    } finally { requestArtworks.busy = false; }
  }

  function clearFile() {
    if (state.objectUrl) {
      URL.revokeObjectURL(state.objectUrl);
    }
    state.file = null;
    state.objectUrl = null;
    state.imageWidth = null;
    state.imageHeight = null;
    state.lockedRatio = null;
    elements.ratioLockToggle.checked = false;
    elements.previewImage.hidden = true;
    elements.previewImage.removeAttribute("src");
    elements.previewPlaceholder.classList.remove("is-hidden");
    state.dimensionsAutoFilled = false;
  }

  function loadFileIntoState(file) {
    requestArtworks.busy = true;
    clearFile();

    return new Promise(function (resolve, reject) {
      state.file = file;
      state.objectUrl = URL.createObjectURL(file);

      const image = new Image();
      image.onload = function () {
        state.imageWidth = image.naturalWidth;
        state.imageHeight = image.naturalHeight;
        state.lockedRatio = getPreferredArtworkRatio();
        elements.ratioLockToggle.checked = true;
                  elements.previewImage.src = state.objectUrl;
        elements.previewImage.hidden = false;
        elements.previewPlaceholder.classList.add("is-hidden");
        autoFillDimensionsAt300Ppi();
        syncLinkedDimension(elements.widthInput);
        requestArtworks.busy = false;
        resolve();
      };
      image.onerror = function () {
        requestArtworks.busy = false;
        clearFile();
        reject(new Error("Could not load image"));
      };
      image.src = state.objectUrl;
    });
  }

  function getSelectedMaterial() {
    return materials.find((material) => material.slug === elements.materialSelect.value) || materials[0];
  }

  function getNumericValue(input) {
    const parsed = parseFloat(input.value);
    return isFinite(parsed) ? parsed : 0;
  }

  function isRatioLocked() {
    return Boolean(state.imageWidth && state.imageHeight && elements.ratioLockToggle.checked);
  }

  function getCurrentSizeRatio() {
    const width = getNumericValue(elements.widthInput);
    const height = getNumericValue(elements.heightInput);
    return width > 0 && height > 0 ? width / height : null;
  }

  function getPreferredArtworkRatio() {
    if (state.imageWidth && state.imageHeight) {
      return state.imageWidth / state.imageHeight;
    }

    return state.lockedRatio || getCurrentSizeRatio() || 1;
  }

  function syncLinkedDimension(changedInput) {
    if (!isRatioLocked()) {
      return;
    }

    const ratio = getPreferredArtworkRatio();
    const width = getNumericValue(elements.widthInput);
    const height = getNumericValue(elements.heightInput);

    state.isSyncingDimensions = true;
    if (changedInput === elements.heightInput && height > 0) {
      elements.widthInput.value = formatDimensionInput(height * ratio);
    } else if (width > 0) {
      elements.heightInput.value = formatDimensionInput(width / ratio);
    }
    state.isSyncingDimensions = false;
  }

  function getAspectDifference(width, height) {
    if (!(width > 0) || !(height > 0) || !state.imageWidth || !state.imageHeight) {
      return 0;
    }

    const artworkRatio = state.imageWidth / state.imageHeight;
    const requestedRatio = width / height;
    return Math.abs(artworkRatio - requestedRatio) / requestedRatio;
  }

  function getSizingModeLabel(width, height) {
    if (isRatioLocked()) {
      return "Linked proportions";
    }

    return "Independent quote dimensions";
  }

  function roundMoney(value) {
    return Math.round(value * 100) / 100;
  }

  function roundQuote(value) {
    return Math.ceil(value * 2) / 2;
  }

  function roundInterpolatedQuote(value) {
    return Math.round(value * 4) / 4;
  }

  function formatMoney(value) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(value);
  }

  function formatDimension(value) {
    const rounded = Math.round(value * 100) / 100;
    if (Math.abs(rounded - Math.round(rounded)) < 0.001) {
      return String(Math.round(rounded));
    }
    return rounded.toFixed(2).replace(/\.?0+$/, "");
  }

  function formatDimensions(width, height) {
    return formatDimension(width) + " x " + formatDimension(height) + " in";
  }

  function formatDimensionInput(value) {
    return (Math.round(value * 100) / 100).toFixed(2).replace(/\.?0+$/, "");
  }

  function formatMoneyInput(value) {
    return (Math.round(value * 100) / 100).toFixed(2).replace(/\.?0+$/, "");
  }

  function normalizeSizeKey(width, height) {
    const shortSide = Math.min(width, height);
    const longSide = Math.max(width, height);
    return formatDimension(shortSide) + "x" + formatDimension(longSide);
  }

  function getAreaFromSizeLabel(label) {
    const parts = label
      .replace(/\*/g, "")
      .split("x")
      .map(function (value) {
        return parseFloat(value);
      });

    if (parts.length !== 2 || !isFinite(parts[0]) || !isFinite(parts[1])) {
      return 0;
    }

    return parts[0] * parts[1];
  }

  function buildWebsitePricingTables(rawTables) {
    const tables = {};
    const pattern = /([0-9.]+x[0-9.]+(?:\*)?)(?: \/ (None|2"))? - \$([0-9]+(?:\.[0-9]{2})?)/g;

    Object.keys(rawTables).forEach(function (slug) {
      const groupedEntries = {};
      pattern.lastIndex = 0;
      let match = pattern.exec(rawTables[slug]);

      while (match) {
        const sizeLabel = match[1];
        const groupKey = match[2] || "default";
        const sizeKey = normalizeSizeKey.apply(null, sizeLabel.replace(/\*/g, "").split("x").map(parseFloat));
        const price = parseFloat(match[3]);
        const area = getAreaFromSizeLabel(sizeLabel);

        if (!groupedEntries[groupKey]) {
          groupedEntries[groupKey] = [];
        }

        groupedEntries[groupKey].push({
          sizeKey: sizeKey,
          area: area,
          price: price,
          shortSide: Math.min.apply(null, sizeLabel.replace(/\*/g, "").split("x").map(parseFloat)),
          longSide: Math.max.apply(null, sizeLabel.replace(/\*/g, "").split("x").map(parseFloat))
        });

        match = pattern.exec(rawTables[slug]);
      }

      tables[slug] = {};
      Object.keys(groupedEntries).forEach(function (groupKey) {
        const sizeMap = {};
        const areaTotals = {};
        const areaCounts = {};

        groupedEntries[groupKey].forEach(function (entry) {
          sizeMap[entry.sizeKey] = entry.price;
          areaTotals[entry.area] = (areaTotals[entry.area] || 0) + entry.price;
          areaCounts[entry.area] = (areaCounts[entry.area] || 0) + 1;
        });

        tables[slug][groupKey] = {
          sizeMap: sizeMap,
          entries: groupedEntries[groupKey].map(function (entry) {
            return {
              sizeKey: entry.sizeKey,
              price: entry.price,
              shortSide: entry.shortSide,
              longSide: entry.longSide
            };
          }),
          points: Object.keys(areaTotals)
            .map(function (area) {
              return {
                area: Number(area),
                price: roundMoney(areaTotals[area] / areaCounts[area])
              };
            })
            .sort(function (a, b) {
              return a.area - b.area;
            })
        };

        tables[slug][groupKey].smoothedPoints = buildSmoothedWebsitePoints(tables[slug][groupKey].points);
      });
    });

    return tables;
  }

  function buildSmoothedWebsitePoints(points) {
    const blocks = [];

    (points || []).forEach(function (point) {
      blocks.push({
        points: [point],
        weight: 1,
        average: point.price
      });

      while (blocks.length > 1 && blocks[blocks.length - 2].average > blocks[blocks.length - 1].average) {
        const right = blocks.pop();
        const left = blocks.pop();
        const totalWeight = left.weight + right.weight;

        blocks.push({
          points: left.points.concat(right.points),
          weight: totalWeight,
          average: (left.average * left.weight + right.average * right.weight) / totalWeight
        });
      }
    });

    return blocks
      .reduce(function (collection, block) {
        return collection.concat(
          block.points.map(function (point) {
            return {
              area: point.area,
              price: roundMoney(block.average)
            };
          })
        );
      }, [])
      .sort(function (a, b) {
        return a.area - b.area;
      });
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function autoFillDimensionsAt300Ppi() {
    if (state.sizeFieldsEdited || !state.imageWidth || !state.imageHeight) {
      state.dimensionsAutoFilled = false;
      return;
    }

    elements.widthInput.value = formatDimensionInput(state.imageWidth / 300);
    elements.heightInput.value = formatDimensionInput(state.imageHeight / 300);
    state.dimensionsAutoFilled = true;
  }

  function getScaledPreviewSize(width, height) {
    const maxWidth = 340;
    const maxHeight = 280;
    const scale = Math.min(maxWidth / width, maxHeight / height);

    return {
      width: Math.round(width * scale),
      height: Math.round(height * scale)
    };
  }

  function formatMaxSize(material) {
    return formatDimension(material.maxShort) + " x " + formatDimension(material.maxLong) + " in";
  }

  function formatRotatableMaxSize(material) {
    return formatDimension(material.maxLong) + " x " + formatDimension(material.maxShort) + " in";
  }

  function getCanvasOptions(material) {
    const canAddBorder = Boolean(material.supportsStretchingBorder);
    const hasStretchingBorder = canAddBorder && elements.canvasBorderSelect.value === "stretch";
    const borderDepth = hasStretchingBorder ? Math.max(0, getNumericValue(elements.borderDepthInput)) : 0;
    const edgeStyle = hasStretchingBorder ? elements.edgeStyleSelect.value : "";
    const edgeColor = hasStretchingBorder ? elements.edgeColorInput.value.trim() : "";

    return {
      canAddBorder: canAddBorder,
      hasStretchingBorder: hasStretchingBorder,
      borderDepth: borderDepth,
      edgeStyle: edgeStyle,
      edgeColor: edgeColor
    };
  }

  function formatEdgeStyle(options) {
    if (!options.hasStretchingBorder) {
      return "No stretching border";
    }

    if (options.edgeStyle === "mirror") {
      return "Mirrored edge, " + formatDimension(options.borderDepth) + " in per side";
    }

    if (options.edgeStyle === "color") {
      return (
        "Color edge" +
        (options.edgeColor ? " (" + options.edgeColor + ")" : "") +
        ", " +
        formatDimension(options.borderDepth) +
        " in per side"
      );
    }

    return "White edge, " + formatDimension(options.borderDepth) + " in per side";
  }

  function getProductionDimensions(material, width, height) {
    const canvasOptions = getCanvasOptions(material);
    const extra = canvasOptions.hasStretchingBorder ? canvasOptions.borderDepth * 2 : 0;

    return {
      width: width + extra,
      height: height + extra,
      canvasOptions: canvasOptions
    };
  }

  function fitsMaxSize(width, height, material) {
    const shortSide = Math.min(width, height);
    const longSide = Math.max(width, height);

    return shortSide <= material.maxShort && longSide <= material.maxLong;
  }

  function getAreaMultiplier(area) {
    if (area >= 1800) return 0.88;
    if (area >= 1000) return 0.92;
    if (area >= 450) return 0.95;
    if (area >= 150) return 0.98;
    if (area >= 80) return 1.05;
    return 1.14;
  }

  function getFormulaUnitPrice(material, productionWidth, productionHeight) {
    const area = productionWidth * productionHeight;
    return roundQuote(Math.max(material.minPrice, area * material.baseRate * getAreaMultiplier(area)));
  }

  function getWebsitePricingGroup(material, canvasOptions) {
    const pricing = websitePricingTables[material.slug];
    if (!pricing) {
      return null;
    }

    if (!material.supportsStretchingBorder) {
      return pricing.default || null;
    }

    if (canvasOptions.hasStretchingBorder) {
      if (Math.abs(canvasOptions.borderDepth - 2) < 0.001) {
        return pricing['2"'] || null;
      }
      return null;
    }

    return pricing.None || null;
  }

  function getInterpolatedWebsitePrice(points, area) {
    if (!points || !points.length) {
      return null;
    }

    if (points.length === 1) {
      return points[0].price;
    }

    if (area < points[0].area || area > points[points.length - 1].area) {
      return null;
    }

    for (let index = 0; index < points.length; index += 1) {
      if (Math.abs(points[index].area - area) < 0.001) {
        return points[index].price;
      }
    }

    for (let index = 1; index < points.length; index += 1) {
      const previous = points[index - 1];
      const next = points[index];

      if (area > previous.area && area < next.area) {
        const ratio = (area - previous.area) / (next.area - previous.area);
        return previous.price + (next.price - previous.price) * ratio;
      }
    }

    return null;
  }

  function getWebsiteStandardMatch(pricingGroup, width, height) {
    const sizeKey = normalizeSizeKey(width, height);

    if (Object.prototype.hasOwnProperty.call(pricingGroup.sizeMap, sizeKey)) {
      return {
        sizeKey: sizeKey,
        price: pricingGroup.sizeMap[sizeKey]
      };
    }

    const shortSide = Math.min(width, height);
    const longSide = Math.max(width, height);
    const tolerantMatch = (pricingGroup.entries || []).find(function (entry) {
      return (
        Math.abs(entry.shortSide - shortSide) <= STANDARD_SIZE_TOLERANCE &&
        Math.abs(entry.longSide - longSide) <= STANDARD_SIZE_TOLERANCE
      );
    });

    if (!tolerantMatch) {
      return null;
    }

    return {
      sizeKey: tolerantMatch.sizeKey,
      price: tolerantMatch.price
    };
  }

  function getPricingSourceLabel(estimate) {
    if (estimate.pricingSource === "website-standard") {
      return "Listed website size";
    }

    if (estimate.pricingSource === "website-interpolated") {
      return "Between listed website sizes";
    }

    return "Fully custom estimate";
  }

  function getPricingSourceMessage(estimate) {
    if (estimate.pricingSource === "website-standard") {
      if (estimate.discountRate) {
        return "Base unit price matches the listed standard size; your customer discount and eligible quantity savings are included.";
      }

      return "This standard size matches the current website price for this material.";
    }

    if (estimate.pricingSource === "website-interpolated") {
      return "This custom size is priced between nearby listed website sizes for this material.";
    }

    return "This request is using the fully custom pricing estimate for this material and finishing setup.";
  }

  function getUnitLabel(estimate) {
    return estimate.pricingSource === "website-standard" ? "Unit price before savings" : "Unit estimate before savings";
  }

  function calculateEstimate() {
    const material = getSelectedMaterial();
    const width = getNumericValue(elements.widthInput);
    const height = getNumericValue(elements.heightInput);
    const quantity = Number(elements.quantityInput.value);
    const productionDimensions = getProductionDimensions(material, width, height);
    const formulaUnitPrice = getFormulaUnitPrice(material, productionDimensions.width, productionDimensions.height);
    const pricingGroup = getWebsitePricingGroup(material, productionDimensions.canvasOptions);
    const requestArea = width * height;
    let pricingSource = "formula-estimate";
    let unit = formulaUnitPrice;
    const standardMatch = pricingGroup && width > 0 && height > 0 ? getWebsiteStandardMatch(pricingGroup, width, height) : null;

    if (standardMatch) {
      unit = standardMatch.price;
      pricingSource = "website-standard";
    } else if (pricingGroup && requestArea > 0) {
      const interpolatedWebsitePrice = getInterpolatedWebsitePrice(
        pricingGroup.smoothedPoints || pricingGroup.points,
        requestArea
      );

      if (interpolatedWebsitePrice !== null) {
        unit = roundMoney(roundInterpolatedQuote(interpolatedWebsitePrice));
        pricingSource = "website-interpolated";
      }
    }

    const customerType = isInvoiceMode() ? "artist" : document.querySelector('input[name="customerPricing"]:checked').value;
    const artist = customerType === "artist";
    const pricing = MonochromePrintDiscounts.calculate({unitPrice:unit, quantity:quantity, customerType:customerType, productionTiming:elements.productionTiming.value});
    const subtotal = pricing.valid ? pricing.subtotal : 0;
    const discountRate = pricing.valid ? pricing.effectiveRate : 0;
    const discountAmount = pricing.valid ? pricing.savings : 0;
    const total = pricing.valid ? pricing.total : 0;
    return {
      material: material,
      width: width,
      height: height,
      productionWidth: productionDimensions.width,
      productionHeight: productionDimensions.height,
      canvasOptions: productionDimensions.canvasOptions,
      quantity: quantity,
      quantityValid: pricing.valid,
      artist: artist,
      customerType: customerType,
      productionTiming: elements.productionTiming.value,
      pricing: pricing,
      pricingSource: pricingSource,
      unitPrice: unit,
      formulaUnitPrice: formulaUnitPrice,
      subtotal: subtotal,
      discountRate: discountRate,
      discountAmount: discountAmount,
      total: total
    };
  }

  function getMaxSizeFeedback(estimate) {
    if (!(estimate.productionWidth > 0) || !(estimate.productionHeight > 0)) {
      return {
        fits: true,
        message: ""
      };
    }

    const fits = fitsMaxSize(estimate.productionWidth, estimate.productionHeight, estimate.material);
    const productionSize = formatDimensions(estimate.productionWidth, estimate.productionHeight);
    const maxSize = formatMaxSize(estimate.material);

    if (fits) {
      return {
        fits: true,
        message: "",
        productionSize: productionSize,
        maxSize: maxSize
      };
    }

    return {
      fits: false,
      message:
        "This material can print up to " +
        maxSize +
        " or " +
        formatRotatableMaxSize(estimate.material) +
        ". Please adjust the size or contact Monochrome Canvas to discuss other printing options.",
      productionSize: productionSize,
      maxSize: maxSize
    };
  }

  function getResolutionFeedback(width, height) {
    if (!(width > 0) || !(height > 0)) {
      return {
        status: "muted",
        label: "Need size",
        message: "Enter the finished size to preview file quality at the custom dimensions.",
        ppi: null,
        requiresReview: false
      };
    }

    if (!state.imageWidth || !state.imageHeight) {
      return {
        status: "muted",
        label: "Waiting for file",
        message: "Upload a file to check whether it should print well at the requested size.",
        ppi: null,
        requiresReview: false
      };
    }

    const ppi = Math.floor(Math.min(state.imageWidth / width, state.imageHeight / height));
    if (ppi >= 300) {
      return {
        status: "good",
        label: "Print ready",
        message: "This file clears the preferred 300 PPI threshold for the requested size.",
        ppi: ppi,
        requiresReview: false
      };
    }

    if (ppi >= 230) {
      return {
        status: "warn",
        label: "Looks good",
        message: "This file should still print well, with only minor softness in very fine detail.",
        ppi: ppi,
        requiresReview: false
      };
    }

    return {
      status: "danger",
      label: "Studio review",
      message:
        "This file is below the recommended pixel count for the requested size. It can still be submitted, but it will require studio review before invoicing.",
      ppi: ppi,
      requiresReview: true
    };
  }

  function getSizingFeedback(width, height) {
    if (!(width > 0) || !(height > 0) || !state.imageWidth || !state.imageHeight) {
      return {
        needsPrep: false,
        cropPreview: false,
        message: ""
      };
    }

    const artworkRatio = state.imageWidth / state.imageHeight;
    const requestedRatio = width / height;
    const difference = getAspectDifference(width, height);

    if (difference <= 0.005) {
      return {
        needsPrep: false,
        cropPreview: false,
        message: "The uploaded file matches the requested print proportions."
      };
    }

    const direction = artworkRatio > requestedRatio ? "wider" : "taller";
    return {
      needsPrep: true,
      cropPreview: false,
      message:
        "The artwork is " +
        direction +
        " than the requested print size. To keep the image intentional, use White Border Builder to choose a full-bleed crop or borders, then upload the prepared file here. You can still estimate the requested size now; the request PDF needs a matching prepared file."
    };
  }

  function formatQualityValue(feedback) {
    if (!feedback.ppi) {
      return feedback.message;
    }

    return feedback.ppi + " PPI" + (feedback.requiresReview ? " - studio review needed" : "");
  }

  function renderOrderMode(invoicePricing) {
    const invoiceMode = isInvoiceMode();

    elements.standardOrderModeButton.classList.toggle("is-active", !invoiceMode);
    elements.standardOrderModeButton.setAttribute("aria-selected", String(!invoiceMode));
    elements.invoiceClientModeButton.classList.toggle("is-active", invoiceMode);
    elements.invoiceClientModeButton.setAttribute("aria-selected", String(invoiceMode));
    elements.standardOrderPanel.classList.toggle("is-hidden", invoiceMode);
    elements.invoiceClientPanel.classList.toggle("is-hidden", !invoiceMode);

    elements.estimateLabel.textContent = invoiceMode ? "Production cost" : "This artwork estimate";
    elements.prepareSupportCopy.textContent = "Review your request PDF before downloading it. You can return to edit any details, then create an updated preview.";
    elements.prepareFieldNote.textContent = "Downloading does not submit an order. For sizes and quantities available on our website, order through website checkout. For a custom quote, email the PDF AND every full-resolution, print-ready artwork file to joelle@monochromecanvas.com for studio review.";

    elements.productionCostValue.textContent = formatMoney(invoicePricing.productionCost);
    elements.recommendedRetailValue.textContent = formatMoney(invoicePricing.recommendedRetail);
    elements.artistPayoutValue.textContent = formatMoney(invoicePricing.artistPayout);
    elements.artistPayoutNote.textContent =
      invoicePricing.clientInvoiceAmount > 0 && invoicePricing.clientInvoiceAmount < invoicePricing.productionCost
        ? "This invoice amount is below production cost. Raise the client invoice amount before sending."
        : "The estimated artist payout is the client invoice amount minus Monochrome Canvas production cost.";
  }

  function render() {
    const rush = elements.productionTiming.value === "rush";
    document.getElementById("rushDeadlineField").classList.toggle("is-hidden", !rush);
    elements.rushDeadlineDate.disabled = !rush;
    elements.rushDeadlineDate.required = rush;
    document.getElementById("requestedDeadlineLabel").textContent = rush ? "Deadline time and details (optional)" : "Requested deadline (date and time, if known)";
    elements.requestedDeadline.placeholder = rush ? "For example: needed by 2 PM Eastern for an event" : "For example: Friday, October 23 by 2 PM";
    const estimate = calculateEstimate();
    const feedback = getResolutionFeedback(estimate.width, estimate.height);
    const sizingFeedback = getSizingFeedback(estimate.width, estimate.height);
    const maxSizeFeedback = getMaxSizeFeedback(estimate);
    renderArtworkRequest(estimate);
    const invoicePricing = getInvoicePricing(estimate);
    const maxWidthAt300 = state.imageWidth ? state.imageWidth / 300 : null;
    const maxHeightAt300 = state.imageHeight ? state.imageHeight / 300 : null;
    const selectedMaterial = getSelectedMaterial();

    const bands = MonochromePrintDiscounts.schedules[estimate.customerType];
    const baseRate = bands[0].rate;
    const customerLabel = {general:"Tool",artist:"Artist",nonprofit:"Nonprofit"}[estimate.customerType];
    const validSavings = estimate.quantityValid && estimate.width > 0 && estimate.height > 0;
    const percent = validSavings ? (estimate.pricing.effectiveRate * 100).toLocaleString("en-US", {maximumFractionDigits: 2}) + "%" : "";
    const discountsEligible = estimate.productionTiming === "standard";
    const timingLabel = {standard: "Standard production", rush: "Rush order requested", unsure: "Deadline review requested"}[estimate.productionTiming];
    const timingNote = discountsEligible
      ? "Discounts apply to standard production only. Selecting standard production does not confirm your deadline; the studio will confirm turnaround."
      : estimate.productionTiming === "rush"
      ? "Rush orders do not qualify for customer or quantity discounts. This estimate shows the print cost before any rush fees. Availability, timing, and final pricing require studio confirmation."
      : "The studio will review your deadline. This estimate shows the print cost without discounts or rush fees until standard or rush timing is confirmed.";
    document.getElementById("timingNote").textContent = timingNote;
    document.getElementById("standardSavingsExplainer").classList.toggle("is-hidden", !discountsEligible);
    const rateGrid = document.getElementById("bulkRateGrid");
    rateGrid.classList.toggle("is-hidden", !discountsEligible);
    rateGrid.replaceChildren();
    bands.forEach(function (band) {
      const card = document.createElement("div");
      const active = estimate.productionTiming === "standard" && validSavings && estimate.quantity >= band.from && estimate.quantity <= band.to;
      card.classList.toggle("is-applied", active);
      const range = document.createElement("span");
      range.textContent = band.from + (band.to === 10000 ? "+" : "–" + band.to) + " prints";
      const rate = document.createElement("strong");
      rate.textContent = band.rate + "% off";
      const detail = document.createElement("small");
      detail.textContent = active ? "Your whole-order rate" : "Off the whole order";
      card.append(range, rate, detail);
      rateGrid.append(card);
    });
    document.getElementById("bulkEligibility").textContent = "Discounts are available on all print sizes and materials for standard, non-rush orders. Quantity is per artwork, size, and material.";
    document.getElementById("bulkEffectiveRate").textContent = !discountsEligible
      ? (estimate.productionTiming === "rush" ? "Rush order: discounts do not apply" : "Discounts pending deadline review")
      : validSavings
      ? percent + " off your whole order" : "Enter a valid size and quantity to see your savings";
    elements.discountPricingNote.textContent = !discountsEligible ? timingNote : validSavings
      ? "You save " + formatMoney(estimate.pricing.savings) + " total: " + formatMoney(estimate.pricing.baseSavings) +
        " in automatic " + customerLabel.toLowerCase() + " savings + " + formatMoney(estimate.pricing.volumeSavings) + " in extra quantity savings."
      : "Enter a positive size and a whole-number quantity from 1 to 10,000.";
    const nextBand = bands.find(function (band) { return band.from > estimate.quantity; });
    document.getElementById("bulkNextTier").textContent = !validSavings || !discountsEligible ? "" :
      (nextBand ? "At " + nextBand.from + " prints, your whole-order discount rises to " + nextBand.rate + "%." : "You’ve reached the highest quantity discount for your customer group.") +
      (estimate.pricing.review ? " Large run: studio review required to confirm pricing and production time." : "") +
      (estimate.customerType === "nonprofit" ? " Nonprofit eligibility is confirmed by the studio." : "");
    document.getElementById("quoteSavings").textContent = !discountsEligible ? "Print cost before any rush fees · Studio confirmation required" : validSavings
      ? "Saving " + formatMoney(estimate.pricing.savings) + " · " + percent + " overall · " + formatMoney(estimate.total / estimate.quantity) + " per print on average"
      : "";
    elements.quantityInput.setAttribute("aria-invalid", String(!estimate.quantityValid));
    elements.materialDescription.textContent = selectedMaterial.description;
    elements.materialLink.href = selectedMaterial.url;
    updateSizeInputLimits(selectedMaterial);
    renderOrderMode(invoicePricing);
    renderCanvasOptions(estimate);
    renderPreviewShape(estimate);
    renderRatioControls(estimate, sizingFeedback);
    elements.estimateTotal.textContent =
      !estimate.quantityValid ? "—" : estimate.width > 0 && estimate.height > 0 ? formatMoney(estimate.total) : "$0.00";

    if (!estimate.quantityValid) {
      elements.estimateRange.textContent = "Enter a whole-number quantity from 1 to 10,000.";
    } else if (estimate.width > 0 && estimate.height > 0) {
      if (maxSizeFeedback.fits) {
        elements.estimateRange.textContent =
          getPricingSourceMessage(estimate) + " Final invoice is confirmed after studio review.";
      } else {
        elements.estimateRange.textContent = maxSizeFeedback.message;
      }
    } else {
      elements.estimateRange.textContent = "Enter the size and quantity to see a custom quote estimate.";
    }

    if (!discountsEligible && estimate.quantityValid && estimate.width > 0 && estimate.height > 0) {
      elements.estimateRange.textContent += " " + timingNote;
    }

    elements.qualityBadge.textContent = feedback.label;
    elements.qualityBadge.className = "quality-badge is-" + feedback.status;
    elements.prepFlowNote.classList.add("is-hidden");
    elements.prepFlowNote.textContent = "";

    if (state.file && state.imageWidth && state.imageHeight) {
      elements.fileMeta.classList.remove("is-muted");
      elements.fileMeta.textContent =
        state.file.name +
        " · " +
        state.imageWidth.toLocaleString() +
        " x " +
        state.imageHeight.toLocaleString() +
        " px · best up to " +
        formatDimensions(maxWidthAt300, maxHeightAt300) +
        " at 300 PPI" +
        (state.dimensionsAutoFilled ? " · size fields filled from this file" : "");
    } else {
      elements.fileMeta.classList.add("is-muted");
      elements.fileMeta.textContent =
        "Upload a file to see its pixel dimensions and recommended maximum print size at 300 PPI.";
    }

    const projectType = elements.projectTypeSelect.value;
    const qualityValue = formatQualityValue(feedback);
    const primaryContact = getPrimaryContact();

    elements.summaryContent.innerHTML = "";
    elements.guidanceContent.innerHTML = "";
    if (!estimate.quantityValid || !(estimate.width > 0) || !(estimate.height > 0)) {
      elements.summaryContent.innerHTML =
        '<p class="summary-empty">The requested size, quantity, material, and file quality will appear here as you fill out the form.</p>';
      return;
    }

    const summaryItems = [
      ["Order type", getOrderModeLabel(getOrderMode())],
      ["Material", estimate.material.label],
      ["Requested size", formatDimensions(estimate.width, estimate.height)],
      ["Sizing mode", getSizingModeLabel(estimate.width, estimate.height)],
      ["Quantity", String(estimate.quantity)],
      [getUnitLabel(estimate), formatMoney(estimate.unitPrice)],
      ["Pricing basis", getPricingSourceLabel(estimate)],
      ["Artwork file", state.file ? state.file.name : "Upload needed"],
      ["File quality", qualityValue],
      [
        "Artwork fit",
        sizingFeedback.cropPreview
          ? "Crop preview active"
          : sizingFeedback.needsPrep
            ? "Sizing prep recommended"
            : sizingFeedback.message || "Upload needed"
      ]
    ];

    summaryItems.push(["Production timing", timingLabel]);
    if (requestedDeadlineText()) summaryItems.push(["Requested deadline", requestedDeadlineText()]);
    if (!discountsEligible) summaryItems.push(["Timing review", timingNote]);

    if (primaryContact.name) {
      summaryItems.push([isInvoiceMode() ? "Artist" : "Contact", primaryContact.name]);
    }


    if (estimate.discountRate) {
      summaryItems.push([customerLabel + " savings (" + baseRate + "%)", formatMoney(estimate.pricing.baseSavings)]);
      if (estimate.pricing.volumeSavings > 0) summaryItems.push(["Additional quantity savings", formatMoney(estimate.pricing.volumeSavings)]);
      summaryItems.push(["Overall order discount", percent]);
      summaryItems.push(["Average per print", formatMoney(estimate.total / estimate.quantity)]);
      if (estimate.pricing.review) summaryItems.push(["Large run", "Studio review requested"]);
    }

    if (estimate.canvasOptions.canAddBorder) {
      summaryItems.push(["Stretching border", formatEdgeStyle(estimate.canvasOptions)]);
    }

    if (estimate.canvasOptions.hasStretchingBorder) {
      summaryItems.push(["Production size", formatDimensions(estimate.productionWidth, estimate.productionHeight)]);
    }

    if (!isInvoiceMode() && projectType) {
      summaryItems.push(["Project type", projectType]);
    }


    if (isInvoiceMode()) {
      if (elements.clientNameInput.value.trim()) {
        summaryItems.push(["Client", elements.clientNameInput.value.trim()]);
      }

      summaryItems.push(["Production cost", formatMoney(invoicePricing.productionCost)]);
      summaryItems.push(["Recommended retail", formatMoney(invoicePricing.recommendedRetail)]);

      if (invoicePricing.clientInvoiceAmount > 0) {
        summaryItems.push(["Client invoice amount", formatMoney(invoicePricing.clientInvoiceAmount)]);
        summaryItems.push(["Estimated artist payout", formatMoney(invoicePricing.artistPayout)]);
      }

      if (elements.payoutMethodSelect.value) {
        const payoutDetails = elements.payoutHandleInput.value.trim();
        summaryItems.push([
          "Payout method",
          payoutDetails ? elements.payoutMethodSelect.value + " · " + payoutDetails : elements.payoutMethodSelect.value
        ]);
      }
    }

    summaryItems.forEach(function (item) {
      const wrap = document.createElement("dl");
      wrap.className = "summary-item";
      if (String(item[1]).length > 100) wrap.classList.add("summary-item--long");
      const label = document.createElement("dt");
      label.textContent = item[0];
      const value = document.createElement("dd");
      value.textContent = item[1];
      wrap.append(label, value);
      elements.summaryContent.appendChild(wrap);
    });

    if (sizingFeedback.needsPrep) {
      renderGuidanceCard({
        title: "Format this artwork for the requested size",
        message: sizingFeedback.message,
        steps: ["Open White Border Builder with this file.", "Choose a full-bleed crop or add borders to reach your desired size.", "Download the prepared file there, return to this request tab, and replace this artwork file."],
        linkHref: WHITE_BORDER_BUILDER_IMPORT_URL,
        linkText: "Open White Border Builder",
        onClick: handOffToWhiteBorderBuilder
      });
    }

    if (!maxSizeFeedback.fits) {
      renderGuidanceCard({
        title: "Size limit reached",
        message: maxSizeFeedback.message,
        tone: "danger"
      });
    }

    if (feedback.requiresReview) {
      renderGuidanceCard({
        title: "Studio review required",
        message: feedback.message,
        tone: "danger"
      });
    }

    if (isInvoiceMode() && invoicePricing.clientInvoiceAmount > 0 && invoicePricing.clientInvoiceAmount < invoicePricing.productionCost) {
      renderGuidanceCard({
        title: "Raise the client invoice amount",
        message:
          "The client invoice amount is below the current production cost for this order. Increase it before sending the invoice request so the studio is not quoting below cost.",
        tone: "danger"
      });
    }
  }

  function updateSizeInputLimits(material) {
    const max = String(material.maxLong);
    elements.widthInput.max = max;
    elements.heightInput.max = max;
    elements.widthInput.title =
      "Maximum size for this material is " +
      formatMaxSize(material) +
      " or " +
      formatRotatableMaxSize(material) +
      ". Contact Monochrome Canvas for other options.";
    elements.heightInput.title = elements.widthInput.title;
  }

  function renderCanvasOptions(estimate) {
    const showCanvasOptions = Boolean(estimate.material.supportsStretchingBorder);
    const showStretchingFields = showCanvasOptions && estimate.canvasOptions.hasStretchingBorder;
    const showColorField = showStretchingFields && estimate.canvasOptions.edgeStyle === "color";

    elements.canvasOptions.classList.toggle("is-hidden", !showCanvasOptions);
    elements.borderDepthField.classList.toggle("is-hidden", !showStretchingFields);
    elements.edgeStyleField.classList.toggle("is-hidden", !showStretchingFields);
    elements.edgeColorField.classList.toggle("is-hidden", !showColorField);
  }

  function renderRatioControls(estimate, sizingFeedback) {
    const hasArtwork = Boolean(state.imageWidth && state.imageHeight);
    const locked = isRatioLocked();
    elements.ratioLockToggle.disabled = !hasArtwork;
    elements.ratioToggleCard.classList.toggle("is-linked", locked);
    elements.ratioToggleCard.classList.toggle("is-unlinked", hasArtwork && !locked);
    elements.ratioModeNote.textContent = !hasArtwork
      ? "Enter width and height independently. Linking becomes available when you upload artwork."
      : locked ? "Linked: changing width or height keeps the uploaded file proportions."
      : "Enter the size you want quoted. If the file shape differs, format it in White Border Builder before downloading the request PDF.";
    document.getElementById("artworkFormattingNotice").classList.toggle("is-hidden", !sizingFeedback.needsPrep);
    document.getElementById("artworkFormattingMessage").textContent = sizingFeedback.message;
  }

  function renderPreviewShape(estimate) {
    const hasArtwork = Boolean(state.imageWidth && state.imageHeight);
    const previewWidth = hasArtwork ? state.imageWidth : estimate.width || 16;
    const previewHeight = hasArtwork ? state.imageHeight : estimate.height || 20;
    const scaledSize = getScaledPreviewSize(previewWidth, previewHeight);
    elements.previewFrame.style.setProperty("--preview-frame-width", scaledSize.width + "px");
    elements.previewFrame.style.setProperty("--preview-frame-ratio", previewWidth + " / " + previewHeight);
    elements.previewFrame.classList.remove("is-crop-preview");
    elements.previewFrame.setAttribute("aria-label", hasArtwork ? "Uploaded print file preview; no crop or border is added by the quote tool" : "Upload an artwork to preview the file");
  }

  function renderGuidanceCard(options) {
    const card = document.createElement("div");
    card.className = "guidance-card" + (options.tone === "danger" ? " is-danger" : "");

    const title = document.createElement("h4");
    title.textContent = options.title;
    card.appendChild(title);

    const message = document.createElement("p");
    message.textContent = options.message;
    card.appendChild(message);

    if (options.steps && options.steps.length) {
      const list = document.createElement("ol");
      list.className = "guidance-steps";

      options.steps.forEach(function (step) {
        const item = document.createElement("li");
        item.textContent = step;
        list.appendChild(item);
      });

      card.appendChild(list);
    }

    if (options.linkHref && options.linkText) {
      const link = document.createElement("a");
      link.href = options.linkHref;
      link.target = "_blank";
      link.rel = "noreferrer";
      link.textContent = options.linkText;
      if (typeof options.onClick === "function") {
        link.addEventListener("click", options.onClick);
      }
      card.appendChild(link);
    }

    elements.guidanceContent.appendChild(card);
  }

  function validateRequest() {
    if (requestArtworks.busy) return "Please wait for the artwork file to finish loading.";
    if (elements.productionTiming.value === "rush" && (!elements.rushDeadlineDate.value || !elements.rushDeadlineDate.validity.valid)) {
      elements.rushDeadlineDate.focus();
      return "Please choose a deadline date for your rush order before preparing the request PDF.";
    }
    const artworkError = requestArtworkError();
    if (artworkError) return artworkError;
    const estimate = calculateEstimate();
    const invoicePricing = getInvoicePricing(estimate);
    const maxSizeFeedback = getMaxSizeFeedback(estimate);
    if (!estimate.quantityValid) return "Please enter a whole-number quantity from 1 to 10,000.";
    if (!state.file) {
      return "Please upload the artwork before preparing the quote request.";
    }
    if (!(estimate.width > 0) || !(estimate.height > 0)) {
      return "Please enter the custom width and height you want quoted.";
    }
    if (!maxSizeFeedback.fits) {
      return maxSizeFeedback.message;
    }
    if (estimate.canvasOptions.hasStretchingBorder && !(estimate.canvasOptions.borderDepth > 0)) {
      return "Please enter the stretching border depth for this canvas request.";
    }
    if (
      estimate.canvasOptions.hasStretchingBorder &&
      estimate.canvasOptions.edgeStyle === "color" &&
      !estimate.canvasOptions.edgeColor
    ) {
      return "Please describe the color edge request for the canvas stretching border.";
    }

    if (isInvoiceMode()) {
      if (!elements.artistNameInput.value.trim() || !elements.artistEmailInput.value.trim()) {
        return "Please enter the artist name and email for this invoice request.";
      }
      if (!elements.clientNameInput.value.trim() || !elements.clientEmailInput.value.trim()) {
        return "Please enter the client name and email so the studio knows who should receive the invoice.";
      }
      if (!elements.payoutMethodSelect.value || !elements.payoutHandleInput.value.trim()) {
        return "Please add the payout method and payout handle so Monochrome Canvas knows how to pay the artist.";
      }
      if (!(invoicePricing.clientInvoiceAmount > 0)) {
        return "Please enter the client invoice amount you want Monochrome Canvas to send.";
      }
      if (invoicePricing.clientInvoiceAmount < invoicePricing.productionCost) {
        return "Please raise the client invoice amount so it is not below the production cost for this order.";
      }
      return "";
    }

    if (!elements.standardNameInput.value.trim() || !elements.standardEmailInput.value.trim()) {
      return "Please enter your name and email so the studio knows where to reply.";
    }
    return "";
  }

  function showMessage(message, isError) {
    if (!message) {
      elements.formMessage.classList.add("is-hidden");
      elements.formMessage.classList.remove("is-error");
      elements.formMessage.textContent = "";
      return;
    }

    elements.formMessage.textContent = message;
    elements.formMessage.classList.remove("is-hidden");
    elements.formMessage.classList.toggle("is-error", Boolean(isError));
  }

  function setupPreparedArtworkMessaging() {
    window.addEventListener("message", handlePreparedArtworkTransfer);
    window.addEventListener("load", notifyPreparedArtworkReady);
    notifyPreparedArtworkReady();
  }

  function notifyPreparedArtworkReady() {
    if (!window.opener || window.opener.closed) {
      return;
    }

    window.opener.postMessage(
      {
        action: CUSTOM_SIZE_REQUEST_READY_ACTION
      },
      "*"
    );
  }

  function handlePreparedArtworkTransfer(event) {
    if (!event.data || event.data.action !== PREPARED_ARTWORK_TRANSFER_ACTION || !event.data.preparedFile) {
      return;
    }

    const preparedFile = event.data.preparedFile;

    if (preparedFile.transferId && preparedFile.transferId === state.lastPreparedTransferId) {
      replyToPreparedArtworkSender(event.source, PREPARED_ARTWORK_RECEIVED_ACTION);
      return;
    }

    importPreparedArtworkTransfer(preparedFile).then(
      function () {
        if (preparedFile.transferId) {
          state.lastPreparedTransferId = preparedFile.transferId;
        }
        replyToPreparedArtworkSender(event.source, PREPARED_ARTWORK_RECEIVED_ACTION);
      },
      function () {
        replyToPreparedArtworkSender(event.source, PREPARED_ARTWORK_ERROR_ACTION);
        showMessage(
          "The prepared file did not load automatically in this browser. You can still upload the prepared JPEG manually here.",
          true
        );
      }
    );
  }

  function replyToPreparedArtworkSender(targetWindow, action) {
    if (!targetWindow || typeof targetWindow.postMessage !== "function") {
      return;
    }

    targetWindow.postMessage({ action: action }, "*");
  }

  async function importPreparedArtworkTransfer(preparedFile) {
    const incomingFile = preparedFile.file || preparedFile.blob || null;
    let file = null;

    if (incomingFile instanceof File) {
      file = incomingFile;
    } else if (incomingFile instanceof Blob) {
      file = new File([incomingFile], preparedFile.filename || "prepared-print.jpg", {
        type: incomingFile.type || "image/jpeg",
        lastModified: preparedFile.createdAt || Date.now()
      });
    }

    if (!file) {
      throw new Error("Prepared file payload missing");
    }

    await loadFileIntoState(file);
    render();
    showMessage(
      "Prepared file loaded from White Border Builder. Review its size and request details, then download the request PDF or create your quote email.",
      false
    );
  }

  function shouldImportPreparedArtwork() {
    const params = new URLSearchParams(window.location.search);
    return params.get("import") === PREPARED_FILE_QUERY_VALUE;
  }

  function stripPreparedArtworkQueryFlag() {
    const url = new URL(window.location.href);
    url.searchParams.delete("import");
    const nextUrl = url.pathname + (url.search ? url.search : "") + (url.hash ? url.hash : "");
    window.history.replaceState({}, "", nextUrl);
  }

  function openPreparedFileDatabase() {
    return new Promise(function (resolve, reject) {
      if (!window.indexedDB) {
        reject(new Error("IndexedDB unavailable"));
        return;
      }

      const request = window.indexedDB.open(PREPARED_FILE_DB_NAME, 1);

      request.onupgradeneeded = function () {
        const database = request.result;
        if (!database.objectStoreNames.contains(PREPARED_FILE_STORE)) {
          database.createObjectStore(PREPARED_FILE_STORE);
        }
      };

      request.onsuccess = function () {
        resolve(request.result);
      };

      request.onerror = function () {
        reject(request.error || new Error("Could not open database"));
      };
    });
  }

  async function readPreparedArtworkRecord() {
    const database = await openPreparedFileDatabase();

    try {
      return await new Promise(function (resolve, reject) {
        const transaction = database.transaction(PREPARED_FILE_STORE, "readonly");
        const store = transaction.objectStore(PREPARED_FILE_STORE);
        const request = store.get(PREPARED_FILE_KEY);

        request.onsuccess = function () {
          resolve(request.result || null);
        };

        request.onerror = function () {
          reject(request.error || new Error("Could not read prepared file"));
        };
      });
    } finally {
      database.close();
    }
  }

  async function clearPreparedArtworkRecord() {
    const database = await openPreparedFileDatabase();

    try {
      await new Promise(function (resolve, reject) {
        const transaction = database.transaction(PREPARED_FILE_STORE, "readwrite");
        const store = transaction.objectStore(PREPARED_FILE_STORE);
        store.delete(PREPARED_FILE_KEY);

        transaction.oncomplete = function () {
          resolve();
        };

        transaction.onerror = function () {
          reject(transaction.error || new Error("Could not clear prepared file"));
        };

        transaction.onabort = function () {
          reject(transaction.error || new Error("Prepared file clear was aborted"));
        };
      });
    } finally {
      database.close();
    }
  }

  async function saveCurrentFileForWhiteBorderBuilder() {
    if (!state.file) {
      throw new Error("No file available for White Border Builder handoff");
    }

    const database = await openPreparedFileDatabase();

    try {
      await new Promise(function (resolve, reject) {
        const transaction = database.transaction(PREPARED_FILE_STORE, "readwrite");
        const store = transaction.objectStore(PREPARED_FILE_STORE);
        store.put(
          {
            source: "custom-size-request",
            filename: state.file.name || "custom-size-artwork",
            blob: state.file,
            createdAt: Date.now()
          },
          WHITE_BORDER_BUILDER_FILE_KEY
        );

        transaction.oncomplete = function () {
          resolve();
        };

        transaction.onerror = function () {
          reject(transaction.error || new Error("Could not save custom size artwork"));
        };

        transaction.onabort = function () {
          reject(transaction.error || new Error("Custom size artwork save was aborted"));
        };
      });
    } finally {
      database.close();
    }
  }

  async function importPreparedArtworkIfRequested() {
    if (!shouldImportPreparedArtwork()) {
      return;
    }

    try {
      const record = await readPreparedArtworkRecord();
      if (!record || !record.blob) {
        showMessage(
          "The prepared file could not be loaded automatically. Please reopen the White Border Builder and try again, or download the file there and upload it here.",
          true
        );
        return;
      }

      if (record.createdAt && Date.now() - record.createdAt > PREPARED_FILE_MAX_AGE_MS) {
        showMessage(
          "That prepared file has expired from the browser handoff. Please reopen the White Border Builder and send it again.",
          true
        );
        return;
      }

      const importedFile = new File([record.blob], record.filename || "prepared-print.jpg", {
        type: record.blob.type || "image/jpeg",
        lastModified: record.createdAt || Date.now()
      });

      await loadFileIntoState(importedFile);
      render();
      showMessage(
        "Prepared file loaded from White Border Builder. Review its size and request details, then download the request PDF or create your quote email.",
        false
      );
    } catch (error) {
      showMessage(
        "The prepared file handoff did not complete in this browser. You can still upload the prepared file manually here.",
        true
      );
    } finally {
      try {
        await clearPreparedArtworkRecord();
      } catch (error) {
        // Ignore cleanup failures so the user can keep moving.
      }
      stripPreparedArtworkQueryFlag();
    }
  }

  async function handOffToWhiteBorderBuilder(event) {
    if (event && (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)) return;
    if (!state.file) return;
    if (event) event.preventDefault();
    const builderWindow = window.open("about:blank", "_blank");
    if (!builderWindow) {
      showMessage("Please allow a new tab, or open the White Border Builder link in a new tab and upload this artwork there. Keep this request tab open so your entries are preserved.", true);
      return;
    }
    builderWindow.opener = null;
    try {
      await saveCurrentFileForWhiteBorderBuilder();
      builderWindow.location.href = WHITE_BORDER_BUILDER_IMPORT_URL;
    } catch (error) {
      builderWindow.location.href = WHITE_BORDER_BUILDER_URL;
      showMessage("White Border Builder opened. Upload the artwork there, download the prepared file, then return to this request tab to replace this entry's file.", false);
    }
    if (typeof builderWindow.focus === "function") builderWindow.focus();
  }

  function triggerBlobDownload(blob, filename) {
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(function () {
      URL.revokeObjectURL(downloadUrl);
    }, 1000);
  }

  function setupResponsivePreview() {
    const mediaQuery = window.matchMedia("(max-width: 760px)");
    const movePreviewStage = function () {
      if (mediaQuery.matches) {
        elements.mobilePreviewMount.appendChild(elements.previewStage);
      } else {
        elements.desktopPreviewMount.appendChild(elements.previewStage);
      }
    };

    movePreviewStage();
    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", movePreviewStage);
    } else if (typeof mediaQuery.addListener === "function") {
      mediaQuery.addListener(movePreviewStage);
    }
  }


})();
