(function () {
  const DPI = 300;
  const JPEG_QUALITY = 0.95;
  const MAX_EXPORT_SIDE = 12000;
  const MAX_EXPORT_PIXELS = 100000000;
  const INVOICE_TOOL_IMPORT_QUERY_VALUE = "invoice-my-client";
  const INVOICE_TOOL_FILE_KEY = "invoice-my-client-to-white-border-builder";
  const INCOMING_FILE_MAX_AGE_MS = 1000 * 60 * 60 * 24;
  const CUSTOM_SIZE_REQUEST_URL = "../custom-size-request/index.html";
  const CUSTOM_SIZE_REQUEST_IMPORT_URL = CUSTOM_SIZE_REQUEST_URL + "?import=white-border-builder";
  const CUSTOM_SIZE_REQUEST_WINDOW_NAME = "monochromeCanvasCustomQuote";
  const CUSTOM_SIZE_REQUEST_READY_ACTION = "monochrome-custom-size-request-ready";
  const PREPARED_ARTWORK_TRANSFER_ACTION = "monochrome-transfer-prepared-artwork";
  const PREPARED_ARTWORK_RECEIVED_ACTION = "monochrome-transfer-received";
  const PREPARED_ARTWORK_ERROR_ACTION = "monochrome-transfer-error";
  const CUSTOM_QUOTE_HANDOFF_TIMEOUT_MS = 12000;
  const PREPARED_FILE_DB_NAME = "monochrome-canvas-prep";
  const PREPARED_FILE_STORE = "prepared-files";
  const PREPARED_FILE_KEY = "white-border-builder-to-custom-size-request";
  const FRAME_PRESETS = [
    [4, 6],
    [5, 5],
    [5, 7],
    [6, 6],
    [8, 8],
    [8, 10],
    [8.5, 11],
    [9, 12],
    [10, 10],
    [11, 14],
    [12, 12],
    [12, 16],
    [12, 18],
    [16, 16],
    [16, 20],
    [16, 24],
    [18, 18],
    [18, 24],
    [20, 20],
    [20, 24],
    [20, 30],
    [24, 24],
    [24, 30],
    [24, 36],
    [30, 30],
    [30, 40]
  ];

  const MODE_COPY = {
    matting: {
      title: "Add white border for matting",
      body:
        "Use this when you want more paper around the artwork without shrinking or cropping the image itself."
    },
    "fit-frame": {
      title: "Fit into a common frame size",
      body:
        "Use this when you want the full artwork to stay visible inside a ready-made frame size while keeping at least a small white margin on every side."
    },
    "even-border": {
      title: "Fit a frame with an even border",
      body:
        "Use this when you want the border to stay even all the way around and you want control over where the crop happens."
    }
  };

  const state = {
    mode: "matting",
    file: null,
    image: null,
    pixelsWidth: 0,
    pixelsHeight: 0,
    output: null,
    cropFocusX: 0.5,
    cropFocusY: 0.5,
    syncingArtworkInputs: false
  };

  const elements = {
    fileInput: document.getElementById("fileInput"),
    fileMeta: document.getElementById("fileMeta"),
    selectedModeCopy: document.getElementById("selectedModeCopy"),
    artWidth: document.getElementById("artWidth"),
    artHeight: document.getElementById("artHeight"),
    sameBorderToggle: document.getElementById("sameBorderToggle"),
    evenBorderFields: document.getElementById("evenBorderFields"),
    customBorderFields: document.getElementById("customBorderFields"),
    borderAll: document.getElementById("borderAll"),
    borderTop: document.getElementById("borderTop"),
    borderRight: document.getElementById("borderRight"),
    borderBottom: document.getElementById("borderBottom"),
    borderLeft: document.getElementById("borderLeft"),
    fitFramePreset: document.getElementById("fitFramePreset"),
    fitFrameWidth: document.getElementById("fitFrameWidth"),
    fitFrameHeight: document.getElementById("fitFrameHeight"),
    fitMinBorder: document.getElementById("fitMinBorder"),
    fitSwap: document.getElementById("fitSwap"),
    evenFramePreset: document.getElementById("evenFramePreset"),
    evenFrameWidth: document.getElementById("evenFrameWidth"),
    evenFrameHeight: document.getElementById("evenFrameHeight"),
    evenSwap: document.getElementById("evenSwap"),
    evenBorder: document.getElementById("evenBorder"),
    cropAdjustBlock: document.getElementById("cropAdjustBlock"),
    cropHorizontalGroup: document.getElementById("cropHorizontalGroup"),
    cropVerticalGroup: document.getElementById("cropVerticalGroup"),
    cropX: document.getElementById("cropX"),
    cropY: document.getElementById("cropY"),
    previewCanvas: document.getElementById("previewCanvas"),
    previewPlaceholder: document.getElementById("previewPlaceholder"),
    summaryContent: document.getElementById("summaryContent"),
    qualityBadge: document.getElementById("qualityBadge"),
    warningPanel: document.getElementById("warningPanel"),
    downloadButton: document.getElementById("downloadButton"),
    sendToQuoteButton: document.getElementById("sendToQuoteButton"),
    downloadToast: document.getElementById("downloadToast"),
    dismissToast: document.getElementById("dismissToast"),
    modeCards: Array.from(document.querySelectorAll("[data-mode]")),
    modePanels: Array.from(document.querySelectorAll("[data-mode-panel]"))
  };

  init();

  function init() {
    populatePresetSelect(elements.fitFramePreset, [11, 14]);
    populatePresetSelect(elements.evenFramePreset, [11, 14]);
    applySelectedModeCopy();
    bindEvents();
    syncModeButtons();
    syncModePanels();
    updateCropControls(null);
    render();
    reportHeight();
    importIncomingArtworkIfRequested();
  }

  function bindEvents() {
    elements.modeCards.forEach((button) => {
      button.addEventListener("click", () => {
        state.mode = button.dataset.mode;
        syncModeButtons();
        syncModePanels();
        applySelectedModeCopy();
        render();
      });
    });

    elements.fileInput.addEventListener("change", onFileChange);

    elements.sameBorderToggle.addEventListener("change", () => {
      elements.evenBorderFields.classList.toggle("is-hidden", !elements.sameBorderToggle.checked);
      elements.customBorderFields.classList.toggle("is-hidden", elements.sameBorderToggle.checked);
      render();
    });

    elements.artWidth.addEventListener("input", () => {
      syncArtworkDimensions("width");
    });

    elements.artHeight.addEventListener("input", () => {
      syncArtworkDimensions("height");
    });

    [
      elements.borderAll,
      elements.borderTop,
      elements.borderRight,
      elements.borderBottom,
      elements.borderLeft,
      elements.fitFrameWidth,
      elements.fitFrameHeight,
      elements.fitMinBorder,
      elements.evenFrameWidth,
      elements.evenFrameHeight,
      elements.evenBorder
    ].forEach((input) => {
      input.addEventListener("input", render);
    });

    [elements.fitFrameWidth, elements.fitFrameHeight].forEach((input) => {
      input.addEventListener("input", () => {
        elements.fitFramePreset.value = "custom";
      });
    });

    [elements.evenFrameWidth, elements.evenFrameHeight].forEach((input) => {
      input.addEventListener("input", () => {
        elements.evenFramePreset.value = "custom";
      });
    });

    elements.fitFramePreset.addEventListener("change", () => {
      applyPresetToFields(elements.fitFramePreset, elements.fitFrameWidth, elements.fitFrameHeight);
      autoOrientFrameFields(elements.fitFrameWidth, elements.fitFrameHeight, elements.fitFramePreset);
      render();
    });

    elements.evenFramePreset.addEventListener("change", () => {
      applyPresetToFields(elements.evenFramePreset, elements.evenFrameWidth, elements.evenFrameHeight);
      autoOrientFrameFields(elements.evenFrameWidth, elements.evenFrameHeight, elements.evenFramePreset);
      render();
    });

    elements.fitSwap.addEventListener("click", () => {
      swapFieldValues(elements.fitFrameWidth, elements.fitFrameHeight);
      elements.fitFramePreset.value = "custom";
      render();
    });

    elements.evenSwap.addEventListener("click", () => {
      swapFieldValues(elements.evenFrameWidth, elements.evenFrameHeight);
      elements.evenFramePreset.value = "custom";
      render();
    });

    elements.cropX.addEventListener("input", () => {
      state.cropFocusX = Number(elements.cropX.value) / 100;
      render();
    });

    elements.cropY.addEventListener("input", () => {
      state.cropFocusY = Number(elements.cropY.value) / 100;
      render();
    });

    elements.dismissToast.addEventListener("click", hideDownloadToast);
    elements.downloadButton.addEventListener("click", downloadOutput);
    elements.sendToQuoteButton.addEventListener("click", sendOutputToCustomQuote);
    window.addEventListener("message", onParentMessage);
    window.addEventListener("resize", debounce(reportHeight, 80));
  }

  async function onFileChange(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) {
      return;
    }

    try {
      await loadFileIntoBuilder(file);
    } catch (error) {
      elements.fileMeta.classList.remove("is-muted");
      elements.fileMeta.textContent = "That file could not be opened. Try a PNG, JPG, or WebP image.";
      state.file = null;
      state.image = null;
      render();
    }
  }

  async function loadFileIntoBuilder(file) {
    const image = await loadImage(file);
    state.file = file;
    state.image = image;
    state.pixelsWidth = image.naturalWidth;
    state.pixelsHeight = image.naturalHeight;
    state.cropFocusX = 0.5;
    state.cropFocusY = 0.5;
    elements.cropX.value = "50";
    elements.cropY.value = "50";
    hideDownloadToast();

    const maxWidthIn = roundTo(state.pixelsWidth / DPI, 2);
    const maxHeightIn = roundTo(state.pixelsHeight / DPI, 2);

    setArtworkInputs(maxWidthIn, maxHeightIn);
    autoOrientFrameFields(elements.fitFrameWidth, elements.fitFrameHeight, elements.fitFramePreset);
    autoOrientFrameFields(elements.evenFrameWidth, elements.evenFrameHeight, elements.evenFramePreset);

    elements.fileMeta.classList.remove("is-muted");
    elements.fileMeta.innerHTML =
      "<strong>Loaded file:</strong> " +
      escapeHtml(file.name) +
      "<br>" +
      formatPixels(state.pixelsWidth, state.pixelsHeight) +
      "<br>" +
      "Maximum recommended print size at 300 PPI: " +
      formatInches(maxWidthIn, maxHeightIn);

    render();
  }

  function syncModeButtons() {
    elements.modeCards.forEach((button) => {
      const isActive = button.dataset.mode === state.mode;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  }

  function syncModePanels() {
    elements.modePanels.forEach((panel) => {
      panel.classList.toggle("is-hidden", panel.dataset.modePanel !== state.mode);
    });
  }

  function applySelectedModeCopy() {
    const copy = MODE_COPY[state.mode];
    elements.selectedModeCopy.innerHTML =
      "<h3>" + copy.title + "</h3>" +
      '<p class="support-copy">' + copy.body + "</p>";
  }

  function syncArtworkDimensions(changedAxis) {
    if (!state.image || state.syncingArtworkInputs) {
      render();
      return;
    }

    const imageRatio = state.pixelsWidth / state.pixelsHeight;
    const width = readPositiveNumber(elements.artWidth);
    const height = readPositiveNumber(elements.artHeight);

    if (changedAxis === "width" && width) {
      setArtworkInputs(width, roundTo(width / imageRatio, 2));
    }

    if (changedAxis === "height" && height) {
      setArtworkInputs(roundTo(height * imageRatio, 2), height);
    }

    render();
  }

  function setArtworkInputs(width, height) {
    state.syncingArtworkInputs = true;
    elements.artWidth.value = trimNumber(width);
    elements.artHeight.value = trimNumber(height);
    state.syncingArtworkInputs = false;
  }

  function render() {
    if (!state.image) {
      state.output = null;
      updateCropControls(null);
      elements.previewPlaceholder.classList.remove("is-hidden");
      clearCanvas();
      elements.summaryContent.innerHTML =
        '<p class="summary-empty">Once a file is loaded, this area will show the final paper size, border sizes, crop notes, and quality guidance.</p>';
      setQualityBadge("Waiting for file", "");
      hideWarning();
      elements.downloadButton.disabled = true;
      elements.sendToQuoteButton.disabled = true;
      reportHeight();
      return;
    }

    const output = calculateOutput();
    state.output = output;
    updateCropControls(output);

    if (!output.ok) {
      elements.previewPlaceholder.classList.remove("is-hidden");
      clearCanvas();
      elements.summaryContent.innerHTML =
        '<p class="summary-empty">' + escapeHtml(output.error) + "</p>";
      setQualityBadge("Needs input", "is-warn");
      showWarning(output.error, "warn");
      elements.downloadButton.disabled = true;
      elements.sendToQuoteButton.disabled = true;
      reportHeight();
      return;
    }

    elements.previewPlaceholder.classList.add("is-hidden");
    drawPreview(output);
    renderSummary(output);
    renderWarnings(output);
    elements.downloadButton.disabled = false;
    elements.sendToQuoteButton.disabled = false;
    reportHeight();
  }

  function calculateOutput() {
    if (!state.image) {
      return { ok: false, error: "Upload a file to start building the print-ready version." };
    }

    const imageRatio = state.pixelsWidth / state.pixelsHeight;
    const output = {
      ok: true,
      mode: state.mode,
      imageRatio,
      pixelsWidth: state.pixelsWidth,
      pixelsHeight: state.pixelsHeight
    };

    if (state.mode === "matting") {
      const artWidth = readPositiveNumber(elements.artWidth);
      const artHeight = readPositiveNumber(elements.artHeight);

      if (!artWidth || !artHeight) {
        return { ok: false, error: "Enter the artwork width and height in inches." };
      }

      const borders = getMattingBorders();
      if (!borders) {
        return { ok: false, error: "Border sizes must be between 0 and 10 inches." };
      }

      const finalWidth = artWidth + borders.left + borders.right;
      const finalHeight = artHeight + borders.top + borders.bottom;

      Object.assign(output, {
        finalWidth,
        finalHeight,
        imageAreaWidth: artWidth,
        imageAreaHeight: artHeight,
        imagePlacement: {
          x: borders.left,
          y: borders.top,
          width: artWidth,
          height: artHeight
        },
        exportMode: "contain",
        borders,
        crop: null,
        fitNote: "The full artwork stays exactly as it is. This option only adds paper around it."
      });
    }

    if (state.mode === "fit-frame") {
      const frameWidth = readPositiveNumber(elements.fitFrameWidth);
      const frameHeight = readPositiveNumber(elements.fitFrameHeight);
      const minBorder = readBorderNumber(elements.fitMinBorder);

      if (!frameWidth || !frameHeight) {
        return { ok: false, error: "Enter the final frame width and height." };
      }

      if (minBorder === null) {
        return { ok: false, error: "The minimum border must be between 0 and 10 inches." };
      }

      const availableWidth = roundTo(frameWidth - minBorder * 2, 3);
      const availableHeight = roundTo(frameHeight - minBorder * 2, 3);

      if (availableWidth <= 0 || availableHeight <= 0) {
        return {
          ok: false,
          error: "The minimum border is too large for the selected frame size. Reduce the border or choose a larger frame."
        };
      }

      const fit = fitInside(availableWidth, availableHeight, imageRatio);
      const borders = {
        top: roundTo((frameHeight - fit.height) / 2, 3),
        right: roundTo((frameWidth - fit.width) / 2, 3),
        bottom: roundTo((frameHeight - fit.height) / 2, 3),
        left: roundTo((frameWidth - fit.width) / 2, 3)
      };

      Object.assign(output, {
        finalWidth: frameWidth,
        finalHeight: frameHeight,
        imageAreaWidth: fit.width,
        imageAreaHeight: fit.height,
        imagePlacement: {
          x: borders.left,
          y: borders.top,
          width: fit.width,
          height: fit.height
        },
        exportMode: "contain",
        borders,
        crop: null,
        requestedMinBorder: minBorder,
        fitNote:
          "You asked for at least " +
          trimNumber(minBorder) +
          ' in of white space. The smaller border stays there, and the other side grows as needed to keep the full image visible.'
      });
    }

    if (state.mode === "even-border") {
      const frameWidth = readPositiveNumber(elements.evenFrameWidth);
      const frameHeight = readPositiveNumber(elements.evenFrameHeight);
      const border = readBorderNumber(elements.evenBorder);

      if (!frameWidth || !frameHeight) {
        return { ok: false, error: "Enter the final frame width and height." };
      }

      if (border === null) {
        return { ok: false, error: "The even border must be between 0 and 10 inches." };
      }

      const innerWidth = roundTo(frameWidth - border * 2, 3);
      const innerHeight = roundTo(frameHeight - border * 2, 3);

      if (innerWidth <= 0 || innerHeight <= 0) {
        return {
          ok: false,
          error: "The border is too large for the selected frame size. Reduce the border or choose a larger frame."
        };
      }

      const crop = calculateCrop(
        state.pixelsWidth,
        state.pixelsHeight,
        innerWidth / innerHeight,
        state.cropFocusX,
        state.cropFocusY
      );

      Object.assign(output, {
        finalWidth: frameWidth,
        finalHeight: frameHeight,
        imageAreaWidth: innerWidth,
        imageAreaHeight: innerHeight,
        imagePlacement: {
          x: border,
          y: border,
          width: innerWidth,
          height: innerHeight
        },
        exportMode: "cover",
        borders: { top: border, right: border, bottom: border, left: border },
        crop,
        fitNote: crop ? crop.message : "The artwork ratio already matches the opening, so no crop is needed."
      });
    }

    const quality = calculateQuality(output);
    const finalPixelWidth = Math.round(output.finalWidth * DPI);
    const finalPixelHeight = Math.round(output.finalHeight * DPI);
    const exportPixels = finalPixelWidth * finalPixelHeight;

    output.quality = quality;
    output.finalPixelWidth = finalPixelWidth;
    output.finalPixelHeight = finalPixelHeight;
    output.exportTooLarge =
      finalPixelWidth > MAX_EXPORT_SIDE ||
      finalPixelHeight > MAX_EXPORT_SIDE ||
      exportPixels > MAX_EXPORT_PIXELS;

    return output;
  }

  function getMattingBorders() {
    if (elements.sameBorderToggle.checked) {
      const border = readBorderNumber(elements.borderAll);
      if (border === null) return null;
      return { top: border, right: border, bottom: border, left: border };
    }

    const top = readBorderNumber(elements.borderTop);
    const right = readBorderNumber(elements.borderRight);
    const bottom = readBorderNumber(elements.borderBottom);
    const left = readBorderNumber(elements.borderLeft);

    if ([top, right, bottom, left].some((value) => value === null)) {
      return null;
    }

    return { top, right, bottom, left };
  }

  function fitInside(frameWidth, frameHeight, imageRatio) {
    const frameRatio = frameWidth / frameHeight;
    if (imageRatio >= frameRatio) {
      return {
        width: frameWidth,
        height: roundTo(frameWidth / imageRatio, 3)
      };
    }

    return {
      width: roundTo(frameHeight * imageRatio, 3),
      height: frameHeight
    };
  }

  function calculateCrop(sourceWidth, sourceHeight, targetRatio, focusX, focusY) {
    const sourceRatio = sourceWidth / sourceHeight;

    if (Math.abs(sourceRatio - targetRatio) < 0.0005) {
      return null;
    }

    if (sourceRatio > targetRatio) {
      const keptWidth = sourceHeight * targetRatio;
      const trimmedPixels = sourceWidth - keptWidth;
      const sourceX = trimmedPixels * focusX;
      return {
        axis: "width",
        sourceX,
        sourceY: 0,
        sourceWidth: keptWidth,
        sourceHeight,
        percentTrimmed: (trimmedPixels / sourceWidth) * 100,
        positionLabel: describeHorizontalPosition(focusX),
        message:
          "To keep the border even, the tool trims about " +
          roundTo((trimmedPixels / sourceWidth) * 100, 1) +
          "% of the width in total. Use the slider to choose where that crop happens."
      };
    }

    const keptHeight = sourceWidth / targetRatio;
    const trimmedPixels = sourceHeight - keptHeight;
    const sourceY = trimmedPixels * focusY;
    return {
      axis: "height",
      sourceX: 0,
      sourceY,
      sourceWidth: sourceWidth,
      sourceHeight: keptHeight,
      percentTrimmed: (trimmedPixels / sourceHeight) * 100,
      positionLabel: describeVerticalPosition(focusY),
      message:
        "To keep the border even, the tool trims about " +
        roundTo((trimmedPixels / sourceHeight) * 100, 1) +
        "% of the height in total. Use the slider to choose where that crop happens."
    };
  }

  function describeHorizontalPosition(value) {
    if (value <= 0.33) return "Left";
    if (value >= 0.67) return "Right";
    return "Center";
  }

  function describeVerticalPosition(value) {
    if (value <= 0.33) return "Top";
    if (value >= 0.67) return "Bottom";
    return "Center";
  }

  function calculateQuality(output) {
    const effectivePpiX = output.pixelsWidth / output.imageAreaWidth;
    const effectivePpiY = output.pixelsHeight / output.imageAreaHeight;
    const effectivePpi = Math.min(effectivePpiX, effectivePpiY);

    let label = "Great for print";
    let tone = "is-good";

    if (effectivePpi < 180) {
      label = "May print soft";
      tone = "is-danger";
    } else if (effectivePpi < 240) {
      label = "Use caution";
      tone = "is-warn";
    } else if (effectivePpi < 300) {
      label = "Probably fine";
      tone = "is-warn";
    }

    return {
      effectivePpi: roundTo(effectivePpi, 0),
      label,
      tone
    };
  }

  function updateCropControls(output) {
    const showControls =
      output &&
      output.ok &&
      output.mode === "even-border" &&
      output.crop;

    elements.cropAdjustBlock.classList.toggle("is-hidden", !showControls);
    elements.cropHorizontalGroup.classList.add("is-hidden");
    elements.cropVerticalGroup.classList.add("is-hidden");

    if (!showControls) {
      reportHeight();
      return;
    }

    if (output.crop.axis === "width") {
      elements.cropHorizontalGroup.classList.remove("is-hidden");
    } else if (output.crop.axis === "height") {
      elements.cropVerticalGroup.classList.remove("is-hidden");
    }
  }

  function drawPreview(output) {
    const canvas = elements.previewCanvas;
    const ctx = canvas.getContext("2d");
    const ratio = output.finalWidth / output.finalHeight;
    const maxDimension = 1400;

    if (ratio >= 1) {
      canvas.width = maxDimension;
      canvas.height = Math.max(1, Math.round(maxDimension / ratio));
    } else {
      canvas.height = maxDimension;
      canvas.width = Math.max(1, Math.round(maxDimension * ratio));
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const scaleX = canvas.width / output.finalWidth;
    const scaleY = canvas.height / output.finalHeight;
    const drawX = output.imagePlacement.x * scaleX;
    const drawY = output.imagePlacement.y * scaleY;
    const drawWidth = output.imagePlacement.width * scaleX;
    const drawHeight = output.imagePlacement.height * scaleY;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    if (output.exportMode === "cover" && output.crop) {
      ctx.drawImage(
        state.image,
        output.crop.sourceX,
        output.crop.sourceY,
        output.crop.sourceWidth,
        output.crop.sourceHeight,
        drawX,
        drawY,
        drawWidth,
        drawHeight
      );
    } else {
      ctx.drawImage(state.image, drawX, drawY, drawWidth, drawHeight);
    }

    ctx.strokeStyle = "rgba(33, 51, 55, 0.16)";
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
  }

  function renderSummary(output) {
    const borderText = formatBorderSummary(output.borders, output.mode);
    const imageAreaText = formatInches(output.imageAreaWidth, output.imageAreaHeight);
    const paperText = formatInches(output.finalWidth, output.finalHeight);
    const maxPrintText = formatInches(roundTo(output.pixelsWidth / DPI, 2), roundTo(output.pixelsHeight / DPI, 2));
    const cropText = output.crop
      ? output.crop.message + " Current crop position: " + output.crop.positionLabel + "."
      : "No crop is needed for this setup.";

    let summaryHtml =
      createSummaryItem("Uploaded file", formatPixels(output.pixelsWidth, output.pixelsHeight) + " | up to " + maxPrintText + " at 300 PPI") +
      createSummaryItem("Final paper size", paperText + " | " + formatPixels(output.finalPixelWidth, output.finalPixelHeight)) +
      createSummaryItem("Image area inside the file", imageAreaText) +
      createSummaryItem("White border", borderText);

    if (output.mode === "fit-frame" && output.requestedMinBorder !== undefined) {
      summaryHtml += createSummaryItem("Requested minimum border", trimNumber(output.requestedMinBorder) + " in");
    }

    summaryHtml +=
      createSummaryItem(output.mode === "even-border" ? "Crop note" : "Fit note", output.mode === "even-border" ? cropText : output.fitNote) +
      createSummaryItem("Download format", "High-quality JPEG") +
      createSummaryItem("Effective print quality", output.quality.effectivePpi + " PPI at the image area");

    elements.summaryContent.innerHTML = summaryHtml;
    setQualityBadge(output.quality.label, output.quality.tone);
  }

  function renderWarnings(output) {
    const warnings = [];
    let tone = "warn";

    if (output.quality.effectivePpi < 300 && output.quality.effectivePpi >= 240) {
      warnings.push("This file should still print well, but it will be below a full 300 PPI at the chosen image size.");
    }

    if (output.quality.effectivePpi < 240 && output.quality.effectivePpi >= 180) {
      warnings.push("This file may start to look softer at the chosen image size. Consider printing a little smaller if you want a sharper result.");
    }

    if (output.quality.effectivePpi < 180) {
      tone = "danger";
      warnings.push("This file is fairly low for the selected image size. The result may look soft in print.");
    }

    if (output.exportTooLarge) {
      tone = tone === "danger" ? "danger" : "warn";
      warnings.push("The final file will be very large. Your browser may take longer to build the download.");
    }

    if (warnings.length) {
      showWarning(warnings.join(" "), tone);
    } else {
      hideWarning();
    }
  }

  async function downloadOutput() {
    if (!state.output || !state.output.ok || !state.image) {
      return;
    }

    try {
      setActionBusy(elements.downloadButton, "Preparing file...");
      const exportFile = await buildPreparedOutputFile();
      const blob = exportFile.blob;
      downloadBlob(blob, buildDownloadName());
      showDownloadToast();
    } catch (error) {
      showWarning("The browser could not build that download. Try a slightly smaller final size.", "danger");
    } finally {
      clearActionBusy(elements.downloadButton);
      reportHeight();
    }
  }

  async function sendOutputToCustomQuote() {
    if (!state.output || !state.output.ok || !state.image) {
      return;
    }

    hideDownloadToast();
    const quoteWindow = openCustomQuoteWindow();
    const handoff = quoteWindow ? createCustomQuoteHandoff(quoteWindow) : null;

    try {
      setActionBusy(elements.sendToQuoteButton, "Opening quote...");
      const exportFile = await buildPreparedOutputFile();
      const handoffCompleted = handoff ? await handoff.deliver(exportFile) : false;

      if (!handoffCompleted) {
        if (quoteWindow && !quoteWindow.closed) {
          quoteWindow.close();
        }
        await savePreparedFileForQuote(exportFile);
        window.location.href = CUSTOM_SIZE_REQUEST_IMPORT_URL;
        return;
      }
    } catch (error) {
      if (quoteWindow && !quoteWindow.closed) {
        quoteWindow.close();
      }
      showWarning(
        "The prepared file could not be handed off automatically. You can still download it here and upload it in the Custom Size Request tool.",
        "warn"
      );
    } finally {
      clearActionBusy(elements.sendToQuoteButton);
      reportHeight();
    }
  }

  function openCustomQuoteWindow() {
    const quoteWindow = window.open(CUSTOM_SIZE_REQUEST_URL, CUSTOM_SIZE_REQUEST_WINDOW_NAME);
    if (!quoteWindow) {
      return null;
    }

    if (typeof quoteWindow.focus === "function") {
      quoteWindow.focus();
    }

    return quoteWindow;
  }

  function createCustomQuoteHandoff(quoteWindow) {
    let deliveryPayload = null;
    let deliveryResolved = false;
    let timeoutId = null;
    let postPreparedArtwork = function () {};

    const deliveryPromise = new Promise((resolve) => {
      timeoutId = window.setTimeout(function () {
        finish(false);
      }, CUSTOM_QUOTE_HANDOFF_TIMEOUT_MS);

      window.addEventListener("message", handleMessage);

      function finish(result) {
        if (deliveryResolved) {
          return;
        }

        deliveryResolved = true;
        window.clearTimeout(timeoutId);
        window.removeEventListener("message", handleMessage);
        resolve(result);
      }

      postPreparedArtwork = function () {
        if (!deliveryPayload || !quoteWindow || quoteWindow.closed) {
          return;
        }

        quoteWindow.postMessage(
          {
            action: PREPARED_ARTWORK_TRANSFER_ACTION,
            preparedFile: deliveryPayload
          },
          "*"
        );
      };

      function handleMessage(event) {
        if (event.source !== quoteWindow || !event.data || typeof event.data.action !== "string") {
          return;
        }

        if (event.data.action === CUSTOM_SIZE_REQUEST_READY_ACTION) {
          postPreparedArtwork();
          return;
        }

        if (event.data.action === PREPARED_ARTWORK_RECEIVED_ACTION) {
          finish(true);
          return;
        }

        if (event.data.action === PREPARED_ARTWORK_ERROR_ACTION) {
          finish(false);
        }
      }
    });

    return {
      async deliver(exportFile) {
        const preparedFile = new File([exportFile.blob], exportFile.filename, {
          type: exportFile.blob.type || "image/jpeg",
          lastModified: exportFile.createdAt || Date.now()
        });

        deliveryPayload = {
          transferId: buildTransferId(),
          source: "white-border-builder",
          filename: exportFile.filename,
          createdAt: exportFile.createdAt,
          finalWidth: exportFile.finalWidth,
          finalHeight: exportFile.finalHeight,
          pixelsWidth: exportFile.pixelsWidth,
          pixelsHeight: exportFile.pixelsHeight,
          file: preparedFile
        };

        if (typeof quoteWindow.focus === "function") {
          quoteWindow.focus();
        }

        postPreparedArtwork();
        return deliveryPromise;
      }
    };
  }

  function buildTransferId() {
    return "prepared-" + Date.now() + "-" + Math.round(Math.random() * 1000000);
  }

  async function buildPreparedOutputFile() {
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = state.output.finalPixelWidth;
    exportCanvas.height = state.output.finalPixelHeight;

    const ctx = exportCanvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const drawX = Math.round(state.output.imagePlacement.x * DPI);
    const drawY = Math.round(state.output.imagePlacement.y * DPI);
    const drawWidth = Math.round(state.output.imagePlacement.width * DPI);
    const drawHeight = Math.round(state.output.imagePlacement.height * DPI);

    if (state.output.exportMode === "cover" && state.output.crop) {
      ctx.drawImage(
        state.image,
        state.output.crop.sourceX,
        state.output.crop.sourceY,
        state.output.crop.sourceWidth,
        state.output.crop.sourceHeight,
        drawX,
        drawY,
        drawWidth,
        drawHeight
      );
    } else {
      ctx.drawImage(state.image, drawX, drawY, drawWidth, drawHeight);
    }

    return {
      blob: await canvasToJpegBlob(exportCanvas, JPEG_QUALITY),
      filename: buildDownloadName(),
      createdAt: Date.now(),
      finalWidth: state.output.finalWidth,
      finalHeight: state.output.finalHeight,
      pixelsWidth: state.output.finalPixelWidth,
      pixelsHeight: state.output.finalPixelHeight
    };
  }

  function buildDownloadName() {
    const base = state.file && state.file.name
      ? state.file.name.replace(/\.[^.]+$/, "")
      : "monochrome-canvas-border-file";
    return base + "-white-border.jpg";
  }

  function setActionBusy(button, label) {
    button.dataset.originalLabel = button.textContent;
    button.textContent = label;
    button.disabled = true;
  }

  function clearActionBusy(button) {
    if (button.dataset.originalLabel) {
      button.textContent = button.dataset.originalLabel;
      delete button.dataset.originalLabel;
    }

    button.disabled = !state.output || !state.output.ok || !state.image;
  }

  function populatePresetSelect(select, defaultPair) {
    select.innerHTML = "";

    FRAME_PRESETS.forEach((pair) => {
      const option = document.createElement("option");
      option.value = pair[0] + "x" + pair[1];
      option.textContent = pair[0] + " x " + pair[1];
      if (pair[0] === defaultPair[0] && pair[1] === defaultPair[1]) {
        option.selected = true;
      }
      select.appendChild(option);
    });

    const custom = document.createElement("option");
    custom.value = "custom";
    custom.textContent = "Custom";
    select.appendChild(custom);

    if (select === elements.fitFramePreset) {
      elements.fitFrameWidth.value = defaultPair[0];
      elements.fitFrameHeight.value = defaultPair[1];
    }

    if (select === elements.evenFramePreset) {
      elements.evenFrameWidth.value = defaultPair[0];
      elements.evenFrameHeight.value = defaultPair[1];
    }
  }

  function applyPresetToFields(select, widthField, heightField) {
    if (select.value === "custom") {
      return;
    }

    const pair = parsePresetValue(select.value);
    if (!pair) {
      return;
    }

    widthField.value = trimNumber(pair[0]);
    heightField.value = trimNumber(pair[1]);
  }

  function autoOrientFrameFields(widthField, heightField, presetSelect) {
    if (!state.image) {
      return;
    }

    const pair = parsePresetValue(presetSelect.value) || [readPositiveNumber(widthField), readPositiveNumber(heightField)];
    if (!pair || !pair[0] || !pair[1]) {
      return;
    }

    const imageIsLandscape = state.pixelsWidth >= state.pixelsHeight;
    const pairIsLandscape = pair[0] >= pair[1];
    const oriented = imageIsLandscape === pairIsLandscape ? pair : [pair[1], pair[0]];

    widthField.value = trimNumber(oriented[0]);
    heightField.value = trimNumber(oriented[1]);
  }

  function parsePresetValue(value) {
    if (!value || value === "custom") {
      return null;
    }

    const parts = value.split("x").map(Number);
    if (parts.length !== 2 || parts.some((part) => Number.isNaN(part))) {
      return null;
    }

    return parts;
  }

  function swapFieldValues(first, second) {
    const current = first.value;
    first.value = second.value;
    second.value = current;
  }

  function readPositiveNumber(input) {
    const value = Number.parseFloat(input.value);
    if (!Number.isFinite(value) || value <= 0) {
      return null;
    }
    return roundTo(value, 3);
  }

  function readBorderNumber(input) {
    const value = Number.parseFloat(input.value);
    if (!Number.isFinite(value) || value < 0 || value > 10) {
      return null;
    }
    return roundTo(value, 3);
  }

  function formatInches(width, height) {
    return trimNumber(width) + " x " + trimNumber(height) + " in";
  }

  function formatPixels(width, height) {
    return width.toLocaleString() + " x " + height.toLocaleString() + " px";
  }

  function formatBorderSummary(borders, mode) {
    if (mode === "matting" && borders.top === borders.right && borders.top === borders.bottom && borders.top === borders.left) {
      return trimNumber(borders.top) + " in on all sides";
    }

    if (mode === "even-border") {
      return trimNumber(borders.top) + " in on all sides";
    }

    if (borders.top === borders.right && borders.top === borders.bottom && borders.top === borders.left) {
      return trimNumber(borders.top) + " in on all sides";
    }

    return (
      "Top " + trimNumber(borders.top) +
      ' in, right ' + trimNumber(borders.right) +
      ' in, bottom ' + trimNumber(borders.bottom) +
      ' in, left ' + trimNumber(borders.left) + ' in'
    );
  }

  function createSummaryItem(label, value) {
    return (
      '<dl class="summary-item">' +
      "<dt>" + escapeHtml(label) + "</dt>" +
      "<dd>" + escapeHtml(value) + "</dd>" +
      "</dl>"
    );
  }

  function setQualityBadge(label, toneClass) {
    elements.qualityBadge.textContent = label;
    elements.qualityBadge.className = "quality-badge";
    if (toneClass) {
      elements.qualityBadge.classList.add(toneClass);
    }
  }

  function showWarning(message, tone) {
    elements.warningPanel.classList.remove("is-hidden", "is-danger");
    if (tone === "danger") {
      elements.warningPanel.classList.add("is-danger");
    }
    elements.warningPanel.textContent = message;
  }

  function hideWarning() {
    elements.warningPanel.classList.add("is-hidden");
    elements.warningPanel.classList.remove("is-danger");
    elements.warningPanel.textContent = "";
  }

  function showDownloadToast() {
    elements.downloadToast.classList.remove("is-hidden");
    reportHeight();
  }

  function hideDownloadToast() {
    elements.downloadToast.classList.add("is-hidden");
    reportHeight();
  }

  function clearCanvas() {
    const canvas = elements.previewCanvas;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function roundTo(value, decimals) {
    const factor = 10 ** decimals;
    return Math.round(value * factor) / factor;
  }

  function trimNumber(value) {
    if (!Number.isFinite(value)) {
      return "";
    }
    return Number(value).toLocaleString(undefined, {
      maximumFractionDigits: 2
    });
  }

  function loadImage(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const image = new Image();
      image.onload = function () {
        URL.revokeObjectURL(url);
        resolve(image);
      };
      image.onerror = function () {
        URL.revokeObjectURL(url);
        reject(new Error("Could not load image"));
      };
      image.src = url;
    });
  }

  function canvasToJpegBlob(canvas, quality) {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Could not create JPEG blob"));
            return;
          }
          resolve(blob);
        },
        "image/jpeg",
        quality
      );
    });
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function openPreparedFileDatabase() {
    return new Promise((resolve, reject) => {
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

  function shouldImportIncomingArtwork() {
    const params = new URLSearchParams(window.location.search);
    return params.get("import") === INVOICE_TOOL_IMPORT_QUERY_VALUE;
  }

  function stripIncomingArtworkQueryFlag() {
    const url = new URL(window.location.href);
    url.searchParams.delete("import");
    const nextUrl = url.pathname + (url.search ? url.search : "") + (url.hash ? url.hash : "");
    window.history.replaceState({}, "", nextUrl);
  }

  async function readIncomingArtworkRecord() {
    const database = await openPreparedFileDatabase();

    try {
      return await new Promise((resolve, reject) => {
        const transaction = database.transaction(PREPARED_FILE_STORE, "readonly");
        const store = transaction.objectStore(PREPARED_FILE_STORE);
        const request = store.get(INVOICE_TOOL_FILE_KEY);

        request.onsuccess = function () {
          resolve(request.result || null);
        };

        request.onerror = function () {
          reject(request.error || new Error("Could not read incoming artwork"));
        };
      });
    } finally {
      database.close();
    }
  }

  async function clearIncomingArtworkRecord() {
    const database = await openPreparedFileDatabase();

    try {
      await new Promise((resolve, reject) => {
        const transaction = database.transaction(PREPARED_FILE_STORE, "readwrite");
        const store = transaction.objectStore(PREPARED_FILE_STORE);
        store.delete(INVOICE_TOOL_FILE_KEY);

        transaction.oncomplete = function () {
          resolve();
        };

        transaction.onerror = function () {
          reject(transaction.error || new Error("Could not clear incoming artwork"));
        };

        transaction.onabort = function () {
          reject(transaction.error || new Error("Incoming artwork clear was aborted"));
        };
      });
    } finally {
      database.close();
    }
  }

  async function importIncomingArtworkIfRequested() {
    if (!shouldImportIncomingArtwork()) {
      return;
    }

    try {
      const record = await readIncomingArtworkRecord();
      if (!record || !record.blob) {
        showWarning("The artwork did not carry over automatically. You can still upload it here.", "warn");
        return;
      }

      if (record.createdAt && Date.now() - record.createdAt > INCOMING_FILE_MAX_AGE_MS) {
        showWarning("That artwork handoff expired. Please reopen the Invoice My Client tool and try again.", "warn");
        return;
      }

      const importedFile = new File([record.blob], record.filename || "invoice-artwork", {
        type: record.blob.type || "image/jpeg",
        lastModified: record.createdAt || Date.now()
      });

      await loadFileIntoBuilder(importedFile);
    } catch (error) {
      showWarning("The artwork could not be loaded automatically in this browser. You can still upload it here.", "warn");
    } finally {
      try {
        await clearIncomingArtworkRecord();
      } catch (error) {
        // Ignore cleanup issues so the builder still opens normally.
      }
      stripIncomingArtworkQueryFlag();
    }
  }

  async function savePreparedFileForQuote(exportFile) {
    const database = await openPreparedFileDatabase();

    try {
      await new Promise((resolve, reject) => {
        const transaction = database.transaction(PREPARED_FILE_STORE, "readwrite");
        const store = transaction.objectStore(PREPARED_FILE_STORE);
        store.put(
          {
            source: "white-border-builder",
            filename: exportFile.filename,
            blob: exportFile.blob,
            createdAt: exportFile.createdAt,
            finalWidth: exportFile.finalWidth,
            finalHeight: exportFile.finalHeight,
            pixelsWidth: exportFile.pixelsWidth,
            pixelsHeight: exportFile.pixelsHeight
          },
          PREPARED_FILE_KEY
        );

        transaction.oncomplete = function () {
          resolve();
        };

        transaction.onerror = function () {
          reject(transaction.error || new Error("Could not save prepared file"));
        };

        transaction.onabort = function () {
          reject(transaction.error || new Error("Prepared file save was aborted"));
        };
      });
    } finally {
      database.close();
    }
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function onParentMessage(event) {
    if (!event.data || event.data.action !== "getHeight") {
      return;
    }
    reportHeight();
  }

  function reportHeight() {
    const height = document.documentElement.scrollHeight;
    window.parent.postMessage({ height }, "*");
  }

  function debounce(fn, delay) {
    let timeout = null;
    return function () {
      window.clearTimeout(timeout);
      timeout = window.setTimeout(fn, delay);
    };
  }
})();
