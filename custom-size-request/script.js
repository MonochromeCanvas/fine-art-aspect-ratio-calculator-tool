(function () {
  const STUDIO_EMAIL = "joelle@monochromecanvas.com";
  const WHITE_BORDER_BUILDER_URL = "../white-border-builder-tool/index.html";
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

  const projectTypes = [
    "Fine art reproduction",
    "Photography print",
    "Client order",
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
    sizeFieldsEdited: false
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
    projectTypeSelect: document.getElementById("projectTypeSelect"),
    notesInput: document.getElementById("notesInput"),
    artistToggle: document.getElementById("artistToggle"),
    nameInput: document.getElementById("nameInput"),
    emailInput: document.getElementById("emailInput"),
    qualityBadge: document.getElementById("qualityBadge"),
    estimateTotal: document.getElementById("estimateTotal"),
    estimateRange: document.getElementById("estimateRange"),
    previewFrame: document.querySelector(".wall-frame"),
    previewImage: document.getElementById("previewImage"),
    previewPlaceholder: document.getElementById("previewPlaceholder"),
    summaryContent: document.getElementById("summaryContent"),
    guidanceContent: document.getElementById("guidanceContent"),
    prepareButton: document.getElementById("prepareButton"),
    formMessage: document.getElementById("formMessage"),
    emailDialog: document.getElementById("emailDialog"),
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
    render();
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

  function bindEvents() {
    elements.fileInput.addEventListener("change", handleFileChange);
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
      elements.quantityInput,
      elements.projectTypeSelect,
      elements.notesInput,
      elements.artistToggle,
      elements.nameInput,
      elements.emailInput
    ].forEach((input) => {
      input.addEventListener("input", render);
      input.addEventListener("change", render);
    });

    elements.prepareButton.addEventListener("click", handlePrepare);
    elements.closeDialogButton.addEventListener("click", closeDialog);
    elements.emailDialog.addEventListener("click", function (event) {
      if (event.target === elements.emailDialog) {
        closeDialog();
      }
    });
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
      syncLinkedDimension(elements.widthInput);
    }

    render();
  }

  function handleFileChange(event) {
    const file = event.target.files && event.target.files[0];
    clearFile();

    if (!file) {
      render();
      return;
    }

    state.file = file;
    const objectUrl = URL.createObjectURL(file);
    state.objectUrl = objectUrl;

    const image = new Image();
    image.onload = function () {
      state.imageWidth = image.naturalWidth;
      state.imageHeight = image.naturalHeight;
      state.lockedRatio = getPreferredArtworkRatio();
      elements.previewImage.src = objectUrl;
      elements.previewImage.hidden = false;
      elements.previewPlaceholder.classList.add("is-hidden");
      autoFillDimensionsAt300Ppi();
      render();
    };
    image.onerror = function () {
      clearFile();
      showMessage("That file could not be read for a live quality preview.", true);
      render();
    };
    image.src = objectUrl;
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

  function calculateEstimate() {
    const material = getSelectedMaterial();
    const width = getNumericValue(elements.widthInput);
    const height = getNumericValue(elements.heightInput);
    const quantity = Math.max(1, Math.round(getNumericValue(elements.quantityInput) || 1));
    const productionDimensions = getProductionDimensions(material, width, height);
    const area = productionDimensions.width * productionDimensions.height;
    const unit = roundQuote(Math.max(material.minPrice, area * material.baseRate * getAreaMultiplier(area)));
    const subtotal = roundMoney(unit * quantity);
    const discountRate = getQuantityDiscount(quantity);
    const discountAmount = roundQuote(subtotal * discountRate);
    const total = roundQuote(subtotal - discountAmount);
    return {
      material: material,
      width: width,
      height: height,
      productionWidth: productionDimensions.width,
      productionHeight: productionDimensions.height,
      canvasOptions: productionDimensions.canvasOptions,
      quantity: quantity,
      unitPrice: unit,
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
          "The preview is cropping the uploaded artwork to fill this custom size. Use the crop sliders to choose the focus area, or link the size to keep the full image."
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

  function render() {
    const estimate = calculateEstimate();
    const feedback = getResolutionFeedback(estimate.width, estimate.height);
    const sizingFeedback = getSizingFeedback(estimate.width, estimate.height);
    const maxSizeFeedback = getMaxSizeFeedback(estimate);
    const maxWidthAt300 = state.imageWidth ? state.imageWidth / 300 : null;
    const maxHeightAt300 = state.imageHeight ? state.imageHeight / 300 : null;
    const selectedMaterial = getSelectedMaterial();

    elements.materialDescription.textContent = selectedMaterial.description;
    elements.materialLink.href = selectedMaterial.url;
    updateSizeInputLimits(selectedMaterial);
    renderCanvasOptions(estimate);
    renderPreviewShape(estimate);
    renderRatioControls(estimate, sizingFeedback);
    elements.estimateTotal.textContent =
      estimate.width > 0 && estimate.height > 0 ? formatMoney(estimate.total) : "$0.00";

    if (estimate.width > 0 && estimate.height > 0) {
      if (maxSizeFeedback.fits) {
        elements.estimateRange.textContent =
          "Includes material, finished size, quantity, and selected canvas finishing. Final invoice is confirmed after studio review.";
      } else {
        elements.estimateRange.textContent = maxSizeFeedback.message;
      }
    } else {
      elements.estimateRange.textContent = "Enter the size and quantity to see a custom quote estimate.";
    }

    elements.qualityBadge.textContent = feedback.label;
    elements.qualityBadge.className = "quality-badge is-" + feedback.status;

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

    elements.summaryContent.innerHTML = "";
    elements.guidanceContent.innerHTML = "";
    if (!(estimate.width > 0) || !(estimate.height > 0)) {
      elements.summaryContent.innerHTML =
        '<p class="summary-empty">The requested size, quantity, material, and file quality will appear here as you fill out the form.</p>';
      return;
    }

    const summaryItems = [
      ["Material", estimate.material.label],
      ["Requested size", formatDimensions(estimate.width, estimate.height)],
      ["Sizing mode", getSizingModeLabel(estimate.width, estimate.height)],
      ["Quantity", String(estimate.quantity)],
      ["Unit estimate", formatMoney(estimate.unitPrice)],
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

    if (projectType) {
      summaryItems.push(["Project type", projectType]);
    }

    if (elements.artistToggle.checked) {
      summaryItems.push(["Artist pricing", "Please review"]);
    }

    summaryItems.forEach(function (item) {
      const wrap = document.createElement("dl");
      wrap.className = "summary-item";
      wrap.innerHTML = "<dt>" + item[0] + "</dt><dd>" + item[1] + "</dd>";
      elements.summaryContent.appendChild(wrap);
    });

    if (sizingFeedback.cropPreview) {
      renderGuidanceCard({
        title: "Crop preview active",
        message: sizingFeedback.message,
        linkHref: WHITE_BORDER_BUILDER_URL,
        linkText: "Use borders instead"
      });
    } else if (sizingFeedback.needsPrep) {
      renderGuidanceCard({
        title: "Sizing prep recommended",
        message: sizingFeedback.message,
        linkHref: WHITE_BORDER_BUILDER_URL,
        linkText: "Open White Border Builder"
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

    if (!cropControlsVisible) {
      elements.cropControlsNote.textContent =
        "Unlink the size if you want to enter a custom crop instead of preserving the uploaded artwork proportions.";
    } else if (!state.file) {
      elements.cropControlsNote.textContent =
        "Upload artwork to preview the crop. The sliders will activate when the requested shape differs from the file.";
    } else if (cropPreviewActive) {
      elements.cropControlsNote.textContent =
        "Use the sliders to choose which part of the artwork stays centered in this custom crop.";
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

    elements.previewFrame.style.setProperty("--preview-frame-width", scaledSize.width + "px");
    elements.previewFrame.style.setProperty("--preview-frame-ratio", previewWidth + " / " + previewHeight);
    elements.previewFrame.style.setProperty("--crop-position-x", cropX);
    elements.previewFrame.style.setProperty("--crop-position-y", cropY);
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
    if (!elements.nameInput.value.trim() || !elements.emailInput.value.trim()) {
      return "Please enter your name and email so the studio knows where to send the invoice.";
    }
    return "";
  }

  function buildEmailDraft() {
    const estimate = calculateEstimate();
    const feedback = getResolutionFeedback(estimate.width, estimate.height);
    const sizingFeedback = getSizingFeedback(estimate.width, estimate.height);
    const maxSizeFeedback = getMaxSizeFeedback(estimate);
    const customerName = elements.nameInput.value.trim();
    const customerEmail = elements.emailInput.value.trim();
    const subject =
      "Custom size quote request | " +
      estimate.material.label +
      " | " +
      formatDimensions(estimate.width, estimate.height) +
      " | Qty " +
      estimate.quantity;
    const bodyLines = [
      "Hi Joelle,",
      "",
      "I would like a custom size quote from Monochrome Canvas for the request below.",
      "",
      "Customer name: " + customerName,
      "Customer email: " + customerEmail,
      "Artwork file: " + (state.file ? state.file.name + " (attach before sending)" : "Will attach before sending"),
      "Material: " + estimate.material.label,
      "Requested size: " + formatDimensions(estimate.width, estimate.height),
      "Production size: " + formatDimensions(estimate.productionWidth, estimate.productionHeight),
      "Sizing mode: " + getSizingModeLabel(estimate.width, estimate.height),
      "Quantity: " + estimate.quantity,
      "Unit estimate: " + formatMoney(estimate.unitPrice),
      "Quote estimate: " + formatMoney(estimate.total),
      "Resolution check: " + formatQualityValue(feedback),
      "Artwork fit: " +
        (sizingFeedback.cropPreview
          ? "Crop preview active."
          : sizingFeedback.needsPrep
          ? "Sizing prep recommended in the White Border Builder before printing."
          : sizingFeedback.message || "Not checked")
    ];

    if (sizingFeedback.cropPreview) {
      bodyLines.push("Crop position: " + getCropPositionText());
    }

    if (estimate.canvasOptions.canAddBorder) {
      bodyLines.push("Canvas stretching border: " + formatEdgeStyle(estimate.canvasOptions));
    }

    if (estimate.discountRate) {
      bodyLines.push("Quantity pricing: " + Math.round(estimate.discountRate * 100) + "% applied");
    }

    if (elements.projectTypeSelect.value) {
      bodyLines.push("Project type: " + elements.projectTypeSelect.value);
    }

    if (elements.artistToggle.checked) {
      bodyLines.push("Artist pricing review requested: Yes");
    }

    if (elements.notesInput.value.trim()) {
      bodyLines.push("Notes: " + elements.notesInput.value.trim());
    }

    bodyLines.push("");
    bodyLines.push("Please send the invoice to the customer email listed above if the file is approved for printing.");
    bodyLines.push("");
    bodyLines.push("Thank you,");
    bodyLines.push(customerName);

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

  function closeDialog() {
    elements.emailDialog.classList.add("is-hidden");
  }
})();
