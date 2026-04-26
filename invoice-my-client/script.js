(function () {
  const STUDIO_EMAIL = "joelle@monochromecanvas.com";
  const WHITE_BORDER_BUILDER_URL = "../white-border-builder-tool/index.html";
  const PREPARED_FILE_DB_NAME = "monochrome-canvas-prep";
  const PREPARED_FILE_STORE = "prepared-files";
  const PREPARED_FILE_KEY = "white-border-builder-to-custom-size-request";
  const PREPARED_FILE_QUERY_VALUE = "white-border-builder";
  const PREPARED_FILE_MAX_AGE_MS = 1000 * 60 * 60 * 24;
  const CUSTOM_SIZE_REQUEST_READY_ACTION = "monochrome-custom-size-request-ready";
  const PREPARED_ARTWORK_TRANSFER_ACTION = "monochrome-transfer-prepared-artwork";
  const PREPARED_ARTWORK_RECEIVED_ACTION = "monochrome-transfer-received";
  const PREPARED_ARTWORK_ERROR_ACTION = "monochrome-transfer-error";
  const EXPORT_PPI = 300;
  const SAFE_EXPORT_MAX_DIMENSION = 12000;
  const SAFE_EXPORT_MAX_PIXELS = 80000000;
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

  const quantityDiscounts = [
    { min: 250, rate: 0.25 },
    { min: 100, rate: 0.2 },
    { min: 50, rate: 0.15 },
    { min: 10, rate: 0.1 }
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
    activePointers: new Map(),
    pinchStartDistance: null,
    pinchStartScale: 1,
    lastPreparedTransferId: "",
    orderMode: "invoice-client",
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
    ratioToggleCard: document.getElementById("ratioToggleCard"),
    ratioLockToggle: document.getElementById("ratioLockToggle"),
    ratioModeNote: document.getElementById("ratioModeNote"),
    cropControls: document.getElementById("cropControls"),
    cropControlsNote: document.getElementById("cropControlsNote"),
    cropXInput: document.getElementById("cropXInput"),
    cropYInput: document.getElementById("cropYInput"),
    cropZoomInput: document.getElementById("cropZoomInput"),
    mobilePreviewMount: document.getElementById("mobilePreviewMount"),
    standardOrderModeButton: document.getElementById("standardOrderModeButton"),
    invoiceClientModeButton: document.getElementById("invoiceClientModeButton"),
    standardOrderPanel: document.getElementById("standardOrderPanel"),
    invoiceClientPanel: document.getElementById("invoiceClientPanel"),
    projectTypeSelect: document.getElementById("projectTypeSelect"),
    artistToggle: document.getElementById("artistToggle"),
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
    downloadButton: document.getElementById("downloadButton"),
    downloadNote: document.getElementById("downloadNote"),
    prepFlowNote: document.getElementById("prepFlowNote"),
    prepareSupportCopy: document.getElementById("prepareSupportCopy"),
    prepareFieldNote: document.getElementById("prepareFieldNote"),
    prepareButton: document.getElementById("prepareButton"),
    formMessage: document.getElementById("formMessage"),
    emailDialog: document.getElementById("emailDialog"),
    dialogLabel: document.getElementById("dialogLabel"),
    dialogTitle: document.getElementById("dialogTitle"),
    dialogSupportCopy: document.getElementById("dialogSupportCopy"),
    emailSubject: document.getElementById("emailSubject"),
    emailBody: document.getElementById("emailBody"),
    emailLink: document.getElementById("emailLink"),
    copyButton: document.getElementById("copyButton"),
    closeDialogButton: document.getElementById("closeDialogButton")
  };

  init();

  function init() {
    populateMaterials();
    populateProjectTypes();
    state.lockedRatio = getCurrentSizeRatio();
    bindEvents();
    setupPreparedArtworkMessaging();
    setupResponsivePreview();
    setupPreviewInteractions();
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
      elements.cropXInput,
      elements.cropYInput,
      elements.cropZoomInput,
      elements.quantityInput,
      elements.projectTypeSelect,
      elements.artistToggle,
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

    elements.downloadButton.addEventListener("click", handleDownload);
    elements.prepareButton.addEventListener("click", handlePrepare);
    elements.closeDialogButton.addEventListener("click", closeDialog);
    elements.emailDialog.addEventListener("click", function (event) {
      if (event.target === elements.emailDialog) {
        closeDialog();
      }
    });
    elements.emailLink.addEventListener("click", handleEmailLinkClick);
    elements.copyButton.addEventListener("click", copySummary);
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
      elements.cropZoomInput.value = "1";
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

    try {
      await loadFileIntoState(file);
      render();
    } catch (error) {
      clearFile();
      showMessage("That file could not be read for a live quality preview.", true);
      render();
    }
  }

  function clearFile() {
    if (state.objectUrl) {
      URL.revokeObjectURL(state.objectUrl);
    }
    state.file = null;
    state.objectUrl = null;
    state.imageWidth = null;
    state.imageHeight = null;
    elements.previewImage.hidden = true;
    elements.previewImage.removeAttribute("src");
    elements.previewPlaceholder.classList.remove("is-hidden");
    state.dimensionsAutoFilled = false;
    elements.cropXInput.value = "50";
    elements.cropYInput.value = "50";
    elements.cropZoomInput.value = "1";
  }

  function loadFileIntoState(file) {
    clearFile();

    return new Promise(function (resolve, reject) {
      state.file = file;
      state.objectUrl = URL.createObjectURL(file);

      const image = new Image();
      image.onload = function () {
        state.imageWidth = image.naturalWidth;
        state.imageHeight = image.naturalHeight;
        state.lockedRatio = getPreferredArtworkRatio();
        elements.cropXInput.value = "50";
        elements.cropYInput.value = "50";
        elements.cropZoomInput.value = "1";
        elements.previewImage.src = state.objectUrl;
        elements.previewImage.hidden = false;
        elements.previewPlaceholder.classList.add("is-hidden");
        autoFillDimensionsAt300Ppi();
        resolve();
      };
      image.onerror = function () {
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

  function getRangeValue(input) {
    const parsed = parseInt(input.value, 10);
    return isFinite(parsed) ? parsed : 50;
  }

  function getCropScale() {
    const parsed = parseFloat(elements.cropZoomInput.value);
    return isFinite(parsed) ? parsed : 1;
  }

  function isRatioLocked() {
    return elements.ratioLockToggle.checked;
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

  function isCropPreviewActive(width, height) {
    return !isRatioLocked() && getAspectDifference(width, height) > 0.025;
  }

  function getCropPositionText() {
    return "X " + getRangeValue(elements.cropXInput) + "%, Y " + getRangeValue(elements.cropYInput) + "%";
  }

  function getSizingModeLabel(width, height) {
    if (isRatioLocked()) {
      return "Linked proportions";
    }

    return isCropPreviewActive(width, height) ? "Unlinked custom crop" : "Unlinked custom size";
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

  function getQuantityDiscount(quantity) {
    const tier = quantityDiscounts.find(function (entry) {
      return quantity >= entry.min;
    });
    return tier ? tier.rate : 0;
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
        return "Base unit price matches the website for this standard size, with quantity pricing applied here.";
      }

      return "This standard size matches the current website price for this material.";
    }

    if (estimate.pricingSource === "website-interpolated") {
      return "This custom size is priced between nearby listed website sizes for this material.";
    }

    return "This request is using the fully custom pricing estimate for this material and finishing setup.";
  }

  function getUnitLabel(estimate) {
    return estimate.pricingSource === "website-standard" ? "Unit price" : "Unit estimate";
  }

  function calculateEstimate() {
    const material = getSelectedMaterial();
    const width = getNumericValue(elements.widthInput);
    const height = getNumericValue(elements.heightInput);
    const quantity = Math.max(1, Math.round(getNumericValue(elements.quantityInput) || 1));
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

    const subtotal = roundMoney(unit * quantity);
    const discountRate = getQuantityDiscount(quantity);
    const discountAmount = roundMoney(subtotal * discountRate);
    const total = roundMoney(subtotal - discountAmount);
    return {
      material: material,
      width: width,
      height: height,
      productionWidth: productionDimensions.width,
      productionHeight: productionDimensions.height,
      canvasOptions: productionDimensions.canvasOptions,
      quantity: quantity,
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

    if (difference <= 0.025) {
      return {
        needsPrep: false,
        cropPreview: false,
        message: "The artwork shape is close to the requested print size."
      };
    }

    if (!isRatioLocked()) {
      return {
        needsPrep: false,
        cropPreview: true,
        message:
          "The preview is cropping the uploaded artwork to fill this custom size. Use the crop sliders to choose the focus area, link the size to keep the full image, or prep a bordered version first if you do not want the artwork trimmed."
      };
    }

    const direction = artworkRatio > requestedRatio ? "wider" : "taller";
    return {
      needsPrep: true,
      cropPreview: false,
      message:
        "The artwork is " +
        direction +
        " than the requested print size. To keep the image intentional, prepare a cropped or bordered version in the White Border Builder before sending the quote request."
    };
  }

  function formatQualityValue(feedback) {
    if (!feedback.ppi) {
      return feedback.message;
    }

    return feedback.ppi + " PPI" + (feedback.requiresReview ? " - studio review needed" : "");
  }

  function getCropBounds(width, height) {
    if (!state.imageWidth || !state.imageHeight) {
      return null;
    }

    const requestedRatio = width > 0 && height > 0 ? width / height : state.imageWidth / state.imageHeight;
    let cropWidth = state.imageWidth;
    let cropHeight = cropWidth / requestedRatio;

    if (cropHeight > state.imageHeight) {
      cropHeight = state.imageHeight;
      cropWidth = cropHeight * requestedRatio;
    }

    const cropScale = isCropPreviewActive(width, height) ? getCropScale() : 1;
    cropWidth /= cropScale;
    cropHeight /= cropScale;

    const maxX = Math.max(0, state.imageWidth - cropWidth);
    const maxY = Math.max(0, state.imageHeight - cropHeight);
    const x = maxX * (getRangeValue(elements.cropXInput) / 100);
    const y = maxY * (getRangeValue(elements.cropYInput) / 100);

    return {
      x: x,
      y: y,
      width: cropWidth,
      height: cropHeight
    };
  }

  function getExportInfo(estimate) {
    if (!state.file || !(estimate.width > 0) || !(estimate.height > 0) || !state.imageWidth || !state.imageHeight) {
      return null;
    }

    const cropBounds = getCropBounds(estimate.width, estimate.height);
    if (!cropBounds) {
      return null;
    }

    const requestedWidth = Math.max(1, Math.round(estimate.width * EXPORT_PPI));
    const requestedHeight = Math.max(1, Math.round(estimate.height * EXPORT_PPI));
    const requestedScale = Math.min(1, requestedWidth / cropBounds.width, requestedHeight / cropBounds.height);
    const safeScale = Math.min(
      1,
      SAFE_EXPORT_MAX_DIMENSION / cropBounds.width,
      SAFE_EXPORT_MAX_DIMENSION / cropBounds.height,
      Math.sqrt(SAFE_EXPORT_MAX_PIXELS / (cropBounds.width * cropBounds.height))
    );
    const exportScale = Math.min(requestedScale, safeScale);
    const exportWidth = Math.max(1, Math.round(cropBounds.width * exportScale));
    const exportHeight = Math.max(1, Math.round(cropBounds.height * exportScale));
    const matchesRequested = exportWidth === requestedWidth && exportHeight === requestedHeight;
    const limitedBySource = requestedScale === 1 && !matchesRequested;
    const limitedForSafety = safeScale < requestedScale;

    let message =
      "Download JPEG: " +
      exportWidth.toLocaleString() +
      " x " +
      exportHeight.toLocaleString() +
      " px.";

    if (matchesRequested) {
      message +=
        " This matches " +
        formatDimensions(estimate.width, estimate.height) +
        " at " +
        EXPORT_PPI +
        " PPI.";
    } else if (limitedForSafety) {
      message += " Export size is reduced a bit to keep the browser stable on large files.";
    } else if (limitedBySource) {
      message += " This uses the file's native cropped resolution, so studio review still matters for larger prints.";
    } else {
      message += " This preserves the cropped artwork at a high-quality attachment size.";
    }

    return {
      cropBounds: cropBounds,
      exportWidth: exportWidth,
      exportHeight: exportHeight,
      requestedWidth: requestedWidth,
      requestedHeight: requestedHeight,
      message: message
    };
  }

  function renderOrderMode(invoicePricing) {
    const invoiceMode = isInvoiceMode();

    elements.standardOrderModeButton.classList.toggle("is-active", !invoiceMode);
    elements.standardOrderModeButton.setAttribute("aria-selected", String(!invoiceMode));
    elements.invoiceClientModeButton.classList.toggle("is-active", invoiceMode);
    elements.invoiceClientModeButton.setAttribute("aria-selected", String(invoiceMode));
    elements.standardOrderPanel.classList.toggle("is-hidden", invoiceMode);
    elements.invoiceClientPanel.classList.toggle("is-hidden", !invoiceMode);

    elements.estimateLabel.textContent = invoiceMode ? "Production cost" : "Estimated quote";
    elements.prepareButton.textContent = invoiceMode ? "Create Invoice Request" : "Create Email Request";
    elements.prepareSupportCopy.textContent = invoiceMode
      ? "We will open an email draft addressed to joelle@monochromecanvas.com with your artist, client, and invoice details filled in."
      : "We will open an email draft addressed to joelle@monochromecanvas.com with your quote details filled in.";
    elements.prepareFieldNote.textContent = invoiceMode
      ? "Attach the artwork file before sending so the studio can review it. If approved, Monochrome Canvas can invoice your client using the details below."
      : "Attach the artwork file before sending so the studio can review it. If your email app does not open, copy the summary and use the contact page as a backup.";
    elements.dialogLabel.textContent = invoiceMode ? "Invoice Request Ready" : "Quote Request Ready";
    elements.dialogTitle.textContent = invoiceMode ? "Your invoice request email is ready." : "Your studio email is ready.";
    elements.dialogSupportCopy.textContent = invoiceMode
      ? "Review the request below, then open your email draft and attach the artwork file before sending. This draft is addressed to joelle@monochromecanvas.com so the studio can invoice your client after review."
      : "Review the request below, then open your email draft and attach the artwork file before sending. This draft is addressed to joelle@monochromecanvas.com.";

    elements.productionCostValue.textContent = formatMoney(invoicePricing.productionCost);
    elements.recommendedRetailValue.textContent = formatMoney(invoicePricing.recommendedRetail);
    elements.artistPayoutValue.textContent = formatMoney(invoicePricing.artistPayout);
    elements.artistPayoutNote.textContent =
      invoicePricing.clientInvoiceAmount > 0 && invoicePricing.clientInvoiceAmount < invoicePricing.productionCost
        ? "This invoice amount is below production cost. Raise the client invoice amount before sending."
        : "The estimated artist payout is the client invoice amount minus Monochrome Canvas production cost.";
  }

  function render() {
    const estimate = calculateEstimate();
    const feedback = getResolutionFeedback(estimate.width, estimate.height);
    const sizingFeedback = getSizingFeedback(estimate.width, estimate.height);
    const maxSizeFeedback = getMaxSizeFeedback(estimate);
    const exportInfo = getExportInfo(estimate);
    const invoicePricing = getInvoicePricing(estimate);
    const maxWidthAt300 = state.imageWidth ? state.imageWidth / 300 : null;
    const maxHeightAt300 = state.imageHeight ? state.imageHeight / 300 : null;
    const selectedMaterial = getSelectedMaterial();

    elements.materialDescription.textContent = selectedMaterial.description;
    elements.materialLink.href = selectedMaterial.url;
    updateSizeInputLimits(selectedMaterial);
    renderOrderMode(invoicePricing);
    renderCanvasOptions(estimate);
    renderPreviewShape(estimate);
    renderRatioControls(estimate, sizingFeedback);
    elements.estimateTotal.textContent =
      estimate.width > 0 && estimate.height > 0 ? formatMoney(estimate.total) : "$0.00";

    if (estimate.width > 0 && estimate.height > 0) {
      if (maxSizeFeedback.fits) {
        elements.estimateRange.textContent = isInvoiceMode()
          ? getPricingSourceMessage(estimate) + " Recommended retail starts at 2x the production cost for this order."
          : getPricingSourceMessage(estimate) + " Final invoice is confirmed after studio review.";
      } else {
        elements.estimateRange.textContent = maxSizeFeedback.message;
      }
    } else {
      elements.estimateRange.textContent = "Enter the size and quantity to see a custom quote estimate.";
    }

    elements.qualityBadge.textContent = feedback.label;
    elements.qualityBadge.className = "quality-badge is-" + feedback.status;
    elements.downloadButton.disabled = !exportInfo;
    elements.downloadNote.textContent = exportInfo
      ? exportInfo.message
      : "Upload artwork and enter a size to export a cropped JPEG you can attach to the email request.";
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
    if (!(estimate.width > 0) || !(estimate.height > 0)) {
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

    if (primaryContact.name) {
      summaryItems.push([isInvoiceMode() ? "Artist" : "Contact", primaryContact.name]);
    }

    if (sizingFeedback.cropPreview) {
      summaryItems.push(["Crop position", getCropPositionText()]);
    }

    if (estimate.discountRate) {
      summaryItems.push(["Quantity pricing", Math.round(estimate.discountRate * 100) + "% applied"]);
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

    if (!isInvoiceMode() && elements.artistToggle.checked) {
      summaryItems.push(["Artist pricing", "Please review"]);
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
      wrap.innerHTML = "<dt>" + item[0] + "</dt><dd>" + item[1] + "</dd>";
      elements.summaryContent.appendChild(wrap);
    });

    if (sizingFeedback.cropPreview) {
      elements.prepFlowNote.textContent =
        "If you switch to the White Border Builder, download the edited file there first, then come back here and upload that prepared version before sending your request.";
      elements.prepFlowNote.classList.remove("is-hidden");
      renderGuidanceCard({
        title: "Want borders instead of a crop?",
        message:
          "This preview is trimming the artwork to fit the requested size. If you would rather keep the full image with added border space, prep the file first and then return here for the quote.",
        steps: [
          "Open the White Border Builder.",
          "Adjust the crop or add borders there.",
          "Download the prepared file from that tool.",
          "Come back here and upload that prepared version for the quote request."
        ],
        linkHref: WHITE_BORDER_BUILDER_URL,
        linkText: "Prepare file in White Border Builder"
      });
    } else if (sizingFeedback.needsPrep) {
      elements.prepFlowNote.textContent =
        "If you prepare the artwork in the White Border Builder, download that finished file there and then re-upload it here before creating the request.";
      elements.prepFlowNote.classList.remove("is-hidden");
      renderGuidanceCard({
        title: "Prepare this file before ordering",
        message:
          "The artwork shape does not match this print size closely enough yet. The easiest path is to prep the file first, then return here once that new version is ready.",
        steps: [
          "Open the White Border Builder.",
          "Add the border or framing space you want.",
          "Download the prepared file from that tool.",
          "Return here and upload that prepared file for the quote."
        ],
        linkHref: WHITE_BORDER_BUILDER_URL,
        linkText: "Open White Border Builder to prep file"
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
    const locked = isRatioLocked();
    const cropPreviewActive = Boolean(sizingFeedback.cropPreview);
    const cropControlsVisible = !locked;

    elements.ratioToggleCard.classList.toggle("is-linked", locked);
    elements.ratioToggleCard.classList.toggle("is-unlinked", !locked);
    elements.ratioModeNote.textContent = locked
      ? "Linked: changing width or height keeps the uploaded artwork proportions."
      : "Unlinked: width and height can differ. If the shape changes, the preview will crop to fill the requested size.";
    elements.cropControls.classList.toggle("is-hidden", !cropControlsVisible);
    elements.cropControls.classList.toggle("is-ready", cropPreviewActive);
    elements.cropControls.classList.toggle("is-waiting", cropControlsVisible && !cropPreviewActive);
    elements.cropXInput.disabled = !cropPreviewActive;
    elements.cropYInput.disabled = !cropPreviewActive;
    elements.cropZoomInput.disabled = !cropPreviewActive;

    if (!cropControlsVisible) {
      elements.cropControlsNote.textContent =
        "Unlink the size if you want to enter a custom crop instead of preserving the uploaded artwork proportions.";
    } else if (!state.file) {
      elements.cropControlsNote.textContent =
        "Upload artwork to preview the crop. The sliders will activate when the requested shape differs from the file.";
    } else if (cropPreviewActive) {
      elements.cropControlsNote.textContent =
        "Drag the preview or use the sliders to set the crop. Pinch on touch screens, or use zoom, to tighten the framing.";
    } else {
      elements.cropControlsNote.textContent =
        "This size is still close to the uploaded artwork shape, so no crop adjustment is needed yet.";
    }
  }

  function renderPreviewShape(estimate) {
    const hasRequestedSize = estimate.width > 0 && estimate.height > 0;
    const previewWidth = hasRequestedSize ? estimate.width : state.imageWidth || 16;
    const previewHeight = hasRequestedSize ? estimate.height : state.imageHeight || 20;
    const scaledSize = getScaledPreviewSize(previewWidth, previewHeight);
    const cropPreviewActive = isCropPreviewActive(estimate.width, estimate.height);
    const cropX = getRangeValue(elements.cropXInput) + "%";
    const cropY = getRangeValue(elements.cropYInput) + "%";
    const cropScale = cropPreviewActive ? getCropScale() : 1;

    elements.previewFrame.style.setProperty("--preview-frame-width", scaledSize.width + "px");
    elements.previewFrame.style.setProperty("--preview-frame-ratio", previewWidth + " / " + previewHeight);
    elements.previewFrame.style.setProperty("--crop-position-x", cropX);
    elements.previewFrame.style.setProperty("--crop-position-y", cropY);
    elements.previewFrame.style.setProperty("--crop-scale", cropScale);
    elements.previewFrame.classList.toggle("is-crop-preview", cropPreviewActive);
    elements.previewFrame.setAttribute(
      "aria-label",
      cropPreviewActive
        ? "Crop preview shown in the requested print ratio: " + formatDimensions(previewWidth, previewHeight)
        : hasRequestedSize
        ? "Preview shown in the requested print ratio: " + formatDimensions(previewWidth, previewHeight)
        : "Preview shown in the uploaded artwork ratio"
    );
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
      card.appendChild(link);
    }

    elements.guidanceContent.appendChild(card);
  }

  function validateRequest() {
    const estimate = calculateEstimate();
    const invoicePricing = getInvoicePricing(estimate);
    const maxSizeFeedback = getMaxSizeFeedback(estimate);
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

  function buildEmailDraft() {
    const estimate = calculateEstimate();
    const invoicePricing = getInvoicePricing(estimate);
    const feedback = getResolutionFeedback(estimate.width, estimate.height);
    const sizingFeedback = getSizingFeedback(estimate.width, estimate.height);
    const primaryContact = getPrimaryContact();
    const subjectPrefix = isInvoiceMode() ? "Invoice my client" : "Custom size quote request";
    const subject =
      subjectPrefix +
      " | " +
      estimate.material.label +
      " | " +
      formatDimensions(estimate.width, estimate.height) +
      " | Qty " +
      estimate.quantity;
    const bodyLines = [
      "Hi Joëlle,",
      ""
    ];

    if (isInvoiceMode()) {
      bodyLines.push("I would like Monochrome Canvas to invoice my client for the request below.");
      bodyLines.push("");
      bodyLines.push("Artist name: " + primaryContact.name);
      bodyLines.push("Artist email: " + primaryContact.email);
      bodyLines.push("Client name: " + elements.clientNameInput.value.trim());
      bodyLines.push("Client email: " + elements.clientEmailInput.value.trim());
      bodyLines.push(
        "Payout method: " + elements.payoutMethodSelect.value + " (" + elements.payoutHandleInput.value.trim() + ")"
      );
    } else {
      bodyLines.push("I would like a custom size quote from Monochrome Canvas for the request below.");
      bodyLines.push("");
      bodyLines.push("Customer name: " + primaryContact.name);
      bodyLines.push("Customer email: " + primaryContact.email);
    }

    bodyLines.push("Artwork file: " + (state.file ? state.file.name + " (attach before sending)" : "Will attach before sending"));
    bodyLines.push("Material: " + estimate.material.label);
    bodyLines.push("Requested size: " + formatDimensions(estimate.width, estimate.height));
    bodyLines.push("Print quality: " + formatQualityValue(feedback));
    bodyLines.push("Sizing mode: " + getSizingModeLabel(estimate.width, estimate.height));
    bodyLines.push("Quantity: " + estimate.quantity);
    bodyLines.push(getUnitLabel(estimate) + ": " + formatMoney(estimate.unitPrice));
    bodyLines.push("Pricing basis: " + getPricingSourceLabel(estimate));
    bodyLines.push((isInvoiceMode() ? "Production cost" : "Quote estimate") + ": " + formatMoney(estimate.total));

    if (isInvoiceMode()) {
      bodyLines.push("Recommended starting retail: " + formatMoney(invoicePricing.recommendedRetail));
      bodyLines.push("Client invoice amount: " + formatMoney(invoicePricing.clientInvoiceAmount));
      bodyLines.push("Estimated artist payout: " + formatMoney(invoicePricing.artistPayout));
    }

    bodyLines.push(
      "Artwork fit: " +
        (sizingFeedback.cropPreview
          ? "Crop preview active."
          : sizingFeedback.needsPrep
          ? "Sizing prep recommended in the White Border Builder before printing."
          : sizingFeedback.message || "Not checked")
    );

    if (sizingFeedback.cropPreview) {
      bodyLines.push("Crop position: " + getCropPositionText());
    }

    if (estimate.canvasOptions.canAddBorder) {
      bodyLines.push("Canvas stretching border: " + formatEdgeStyle(estimate.canvasOptions));
    }

    if (estimate.discountRate) {
      bodyLines.push("Quantity pricing: " + Math.round(estimate.discountRate * 100) + "% applied");
    }

    if (!isInvoiceMode() && elements.projectTypeSelect.value) {
      bodyLines.push("Project type: " + elements.projectTypeSelect.value);
    }

    if (!isInvoiceMode() && elements.artistToggle.checked) {
      bodyLines.push("Artist pricing review requested: Yes");
    }

    if (getActiveNotes()) {
      bodyLines.push("Notes: " + getActiveNotes());
    }

    bodyLines.push("");
    if (isInvoiceMode()) {
      bodyLines.push("If the file is approved for printing, please send the invoice to the client email listed above.");
      bodyLines.push(
        "Please send the artist payout through " +
          elements.payoutMethodSelect.value +
          " using " +
          elements.payoutHandleInput.value.trim() +
          " after payment is received."
      );
    } else {
      bodyLines.push("Please reply to the customer email listed above if the file is approved for printing.");
    }
    bodyLines.push("");
    bodyLines.push("Thank you,");
    bodyLines.push(primaryContact.name);

    return {
      subject: subject,
      body: bodyLines.join("\n"),
      href:
        "mailto:" +
        encodeURIComponent(STUDIO_EMAIL) +
        "?subject=" +
        encodeURIComponent(subject) +
        "&body=" +
        encodeURIComponent(bodyLines.join("\n"))
    };
  }

  function handlePrepare() {
    const error = validateRequest();
    if (error) {
      showMessage(error, true);
      return;
    }

    const draft = buildEmailDraft();
    showMessage("", false);
    elements.emailSubject.textContent = draft.subject;
    elements.emailBody.textContent = draft.body;
    elements.emailLink.href = draft.href;
    elements.emailDialog.classList.remove("is-hidden");
  }

  function copySummary() {
    const draft = buildEmailDraft();
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      showMessage("Copy is not available in this browser. You can still use the email draft button.", true);
      return;
    }

    navigator.clipboard.writeText("Subject: " + draft.subject + "\n\n" + draft.body).then(
      function () {
        showMessage("Quote request summary copied.", false);
      },
      function () {
        showMessage("Copy did not go through. You can still use the email draft button.", true);
      }
    );
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
      "Prepared file loaded from the White Border Builder. You can download it here, request a custom quote, or adjust the order details before sending.",
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
        "Prepared file loaded from the White Border Builder. You can download it here, request a custom quote, or adjust the order details before sending.",
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

  function closeDialog() {
    elements.emailDialog.classList.add("is-hidden");
  }

  function buildExportFilename(estimate) {
    const baseName = state.file ? state.file.name.replace(/\.[^.]+$/, "") : "custom-print";
    return (
      baseName +
      "-" +
      formatDimension(estimate.width) +
      "x" +
      formatDimension(estimate.height) +
      "in-prep.jpg"
    );
  }

  function loadExportImage() {
    if (elements.previewImage.complete && elements.previewImage.naturalWidth) {
      return Promise.resolve(elements.previewImage);
    }

    return new Promise(function (resolve, reject) {
      const image = new Image();
      image.onload = function () {
        resolve(image);
      };
      image.onerror = function () {
        reject(new Error("Image did not load."));
      };
      image.src = state.objectUrl;
    });
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

  function handleDownload() {
    const estimate = calculateEstimate();
    const exportInfo = getExportInfo(estimate);

    if (!exportInfo) {
      showMessage("Upload artwork and enter a size before downloading the cropped JPEG.", true);
      return;
    }

    loadExportImage()
      .then(function (image) {
        const canvas = document.createElement("canvas");
        canvas.width = exportInfo.exportWidth;
        canvas.height = exportInfo.exportHeight;
        const context = canvas.getContext("2d");

        if (!context) {
          throw new Error("Canvas export is unavailable.");
        }

        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";
        context.drawImage(
          image,
          exportInfo.cropBounds.x,
          exportInfo.cropBounds.y,
          exportInfo.cropBounds.width,
          exportInfo.cropBounds.height,
          0,
          0,
          exportInfo.exportWidth,
          exportInfo.exportHeight
        );

        canvas.toBlob(
          function (blob) {
            if (!blob) {
              showMessage("The JPEG export could not be created in this browser.", true);
              return;
            }

            triggerBlobDownload(blob, buildExportFilename(estimate));
            showMessage("Print JPEG downloaded. Attach it to the email request you send to the studio.", false);
          },
          "image/jpeg",
          0.92
        );
      })
      .catch(function () {
        showMessage("The JPEG export did not complete. Try again after the image finishes loading.", true);
      });
  }

  function handleEmailLinkClick() {
    window.setTimeout(function () {
      showMessage(
        "If your desktop email app does not open, copy the summary and paste it into your preferred email app.",
        false
      );
    }, 250);
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

  function getPointerDistance() {
    const pointers = Array.from(state.activePointers.values());
    if (pointers.length < 2) {
      return 0;
    }

    const deltaX = pointers[0].x - pointers[1].x;
    const deltaY = pointers[0].y - pointers[1].y;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  }

  function setCropFromClientPoint(clientX, clientY) {
    const estimate = calculateEstimate();
    if (!isCropPreviewActive(estimate.width, estimate.height)) {
      return;
    }

    const rect = elements.previewFrame.getBoundingClientRect();
    const x = clamp(((clientX - rect.left) / rect.width) * 100, 0, 100);
    const y = clamp(((clientY - rect.top) / rect.height) * 100, 0, 100);

    elements.cropXInput.value = String(Math.round(x));
    elements.cropYInput.value = String(Math.round(y));
    render();
  }

  function setupPreviewInteractions() {
    const clearPointer = function (event) {
      state.activePointers.delete(event.pointerId);
      if (state.activePointers.size < 2) {
        state.pinchStartDistance = null;
      }
      if (!state.activePointers.size) {
        elements.previewFrame.classList.remove("is-dragging");
      }
    };

    elements.previewFrame.addEventListener("pointerdown", function (event) {
      const estimate = calculateEstimate();
      if (!isCropPreviewActive(estimate.width, estimate.height)) {
        return;
      }

      state.activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (state.activePointers.size === 1) {
        elements.previewFrame.classList.add("is-dragging");
        setCropFromClientPoint(event.clientX, event.clientY);
      } else if (state.activePointers.size === 2) {
        state.pinchStartDistance = getPointerDistance();
        state.pinchStartScale = getCropScale();
      }
    });

    elements.previewFrame.addEventListener("pointermove", function (event) {
      if (!state.activePointers.has(event.pointerId)) {
        return;
      }

      state.activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

      if (state.activePointers.size >= 2 && state.pinchStartDistance) {
        const distance = getPointerDistance();
        const nextScale = clamp((distance / state.pinchStartDistance) * state.pinchStartScale, 1, 3);
        elements.cropZoomInput.value = nextScale.toFixed(2);
        const pointers = Array.from(state.activePointers.values());
        setCropFromClientPoint((pointers[0].x + pointers[1].x) / 2, (pointers[0].y + pointers[1].y) / 2);
        return;
      }

      setCropFromClientPoint(event.clientX, event.clientY);
    });

    ["pointerup", "pointercancel", "pointerleave"].forEach(function (eventName) {
      elements.previewFrame.addEventListener(eventName, clearPointer);
    });
  }
})();
