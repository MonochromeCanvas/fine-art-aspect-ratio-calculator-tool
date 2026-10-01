document.addEventListener("DOMContentLoaded", function () {
  const STANDARD_SIZES = [
    { width: 4, height: 6, label: "4 x 6", family: "2:3" },
    { width: 5, height: 5, label: "5 x 5", family: "1:1" },
    { width: 5, height: 7, label: "5 x 7", family: "5:7" },
    { width: 8, height: 8, label: "8 x 8", family: "1:1" },
    { width: 8, height: 10, label: "8 x 10", family: "4:5" },
    { width: 8, height: 12, label: "8 x 12", family: "2:3" },
    { width: 9, height: 12, label: "9 x 12", family: "3:4" },
    { width: 10, height: 10, label: "10 x 10", family: "1:1" },
    { width: 10, height: 14, label: "10 x 14", family: "5:7" },
    { width: 11, height: 14, label: "11 x 14", family: "11:14" },
    { width: 12, height: 12, label: "12 x 12", family: "1:1" },
    { width: 12, height: 16, label: "12 x 16", family: "3:4" },
    { width: 12, height: 18, label: "12 x 18", family: "2:3" },
    { width: 16, height: 20, label: "16 x 20", family: "4:5" },
    { width: 16, height: 24, label: "16 x 24", family: "2:3" },
    { width: 18, height: 24, label: "18 x 24", family: "3:4" },
    { width: 20, height: 28, label: "20 x 28", family: "5:7" },
    { width: 20, height: 30, label: "20 x 30", family: "2:3" },
    { width: 22, height: 28, label: "22 x 28", family: "11:14" },
    { width: 24, height: 30, label: "24 x 30", family: "4:5" },
    { width: 24, height: 36, label: "24 x 36", family: "2:3" }
  ];

  const KNOWN_RATIOS = [
    { label: "1:1", ratio: 1, note: "a square artwork shape" },
    { label: "4:5", ratio: 4 / 5, note: "a common wall art ratio" },
    { label: "2:3", ratio: 2 / 3, note: "a classic photo and poster ratio" },
    { label: "3:4", ratio: 3 / 4, note: "a balanced illustration and print ratio" },
    { label: "5:7", ratio: 5 / 7, note: "a standard gift-print ratio" },
    { label: "11:14", ratio: 11 / 14, note: "a common frame size family" },
    { label: "16:9", ratio: 9 / 16, note: "a wide panoramic ratio" }
  ];

  const TARGET_PPI = 300;
  const EXACT_RATIO_THRESHOLD = 1e-8;

  const elements = {
    chooserCard: document.getElementById("chooserCard"),
    workspaceCard: document.getElementById("workspaceCard"),
    taskCards: Array.from(document.querySelectorAll(".task-card")),
    resetButtons: Array.from(document.querySelectorAll("[data-reset-view='true']")),
    taskRatio: document.getElementById("task-ratio"),
    taskResize: document.getElementById("task-resize"),
    taskQuality: document.getElementById("task-quality"),
    ratioWidth: document.getElementById("ratioWidth"),
    ratioHeight: document.getElementById("ratioHeight"),
    ratioResult: document.getElementById("ratioResult"),
    ratioResultTitle: document.getElementById("ratioResultTitle"),
    ratioResultIntro: document.getElementById("ratioResultIntro"),
    ratioResultFit: document.getElementById("ratioResultFit"),
    ratioResultNext: document.getElementById("ratioResultNext"),
    ratioMatchesWrap: document.getElementById("ratioMatchesWrap"),
    ratioMatches: document.getElementById("ratioMatches"),
    resizeWidth: document.getElementById("resizeWidth"),
    resizeHeight: document.getElementById("resizeHeight"),
    targetWidth: document.getElementById("targetWidth"),
    targetHeight: document.getElementById("targetHeight"),
    resizeResult: document.getElementById("resizeResult"),
    resizeResultTitle: document.getElementById("resizeResultTitle"),
    resizeResultBody: document.getElementById("resizeResultBody"),
    resizeResultNote: document.getElementById("resizeResultNote"),
    artworkUpload: document.getElementById("artworkUpload"),
    qualityExtras: document.getElementById("qualityExtras"),
    qualityWidth: document.getElementById("qualityWidth"),
    qualityHeight: document.getElementById("qualityHeight"),
    useUploadSizeButton: document.getElementById("useUploadSizeButton"),
    qualityResult: document.getElementById("qualityResult"),
    qualityResultTitle: document.getElementById("qualityResultTitle"),
    qualityResultMeta: document.getElementById("qualityResultMeta"),
    qualityResultBody: document.getElementById("qualityResultBody")
  };

  const state = {
    activeTask: null,
    image: null,
    imageUrl: "",
    uploadWidthInches: 0,
    uploadHeightInches: 0
  };

  function formatNumber(value) {
    if (!Number.isFinite(value)) {
      return "0";
    }

    if (value > 0 && value < 0.01) return value.toPrecision(2);
    const rounded = Math.round(value * 100) / 100;

    if (Math.abs(rounded - Math.round(rounded)) < 0.001) {
      return String(Math.round(rounded));
    }

    return rounded.toFixed(2).replace(/\.?0+$/, "");
  }

  function formatSize(width, height) {
    return formatNumber(width) + " x " + formatNumber(height);
  }

  function getNumericValue(input) {
    const value = parseFloat(input.value);
    return input.validity.valid && Number.isFinite(value) && value > 0 ? value : 0;
  }

  function ratioDifference(a, b) {
    return Math.abs(Math.log(a / b));
  }

  function normalizedSize(width, height) {
    return {
      width: Math.min(width, height),
      height: Math.max(width, height)
    };
  }

  function getClosestRatio(ratio) {
    return KNOWN_RATIOS.slice().sort(function (left, right) {
      return ratioDifference(Math.min(ratio, 1 / ratio), left.ratio) - ratioDifference(Math.min(ratio, 1 / ratio), right.ratio);
    })[0];
  }

  function getExactMatches(width, height) {
    return STANDARD_SIZES.filter(function (size) {
      const direct = Math.abs(size.width - width) < 1e-8 && Math.abs(size.height - height) < 1e-8;
      const rotated = Math.abs(size.width - height) < 1e-8 && Math.abs(size.height - width) < 1e-8;
      return direct || rotated;
    });
  }

  function getFamilyMatches(family) {
    return STANDARD_SIZES.filter(function (size) {
      return size.family === family;
    });
  }

  function getBestContainingFrame(width, height) {
    const artwork = normalizedSize(width, height);
    let best = null;

    STANDARD_SIZES.forEach(function (size) {
      const orientations = [
        { width: size.width, height: size.height, label: size.label },
        { width: size.height, height: size.width, label: size.label }
      ];

      orientations.forEach(function (frame) {
        if (frame.width < width || frame.height < height) {
          return;
        }

        const borderX = (frame.width - width) / 2;
        const borderY = (frame.height - height) / 2;
        const areaDelta = frame.width * frame.height - width * height;
        const borderBalance = Math.abs(borderX - borderY);
        const frameNormalized = normalizedSize(frame.width, frame.height);
        const ratioGap = ratioDifference(
          artwork.width / artwork.height,
          frameNormalized.width / frameNormalized.height
        );

        const candidate = {
          size: size,
          borderX: borderX,
          borderY: borderY,
          areaDelta: areaDelta,
          borderBalance: borderBalance,
          ratioGap: ratioGap
        };

        if (!best) {
          best = candidate;
          return;
        }

        if (candidate.areaDelta < best.areaDelta - 0.01) {
          best = candidate;
          return;
        }

        if (Math.abs(candidate.areaDelta - best.areaDelta) < 0.01 && candidate.borderBalance < best.borderBalance - 0.01) {
          best = candidate;
          return;
        }

        if (
          Math.abs(candidate.areaDelta - best.areaDelta) < 0.01 &&
          Math.abs(candidate.borderBalance - best.borderBalance) < 0.01 &&
          candidate.ratioGap < best.ratioGap
        ) {
          best = candidate;
        }
      });
    });

    return best;
  }

  function describeBorders(borderX, borderY) {
    if (Math.abs(borderX - borderY) < 0.06) {
      return "about " + formatNumber(borderX) + '" on all sides';
    }

    return formatNumber(borderX) + '" on the left and right, and ' + formatNumber(borderY) + '" on the top and bottom';
  }

  function renderChips(container, items) {
    container.innerHTML = items.map(function (item) {
      return '<span class="chip">' + item + "</span>";
    }).join("");
  }

  function setActiveTask(task) {
    if (task === "quality") {
      elements.artworkUpload.scrollIntoView({ behavior: "smooth", block: "center" });
      elements.artworkUpload.focus({ preventScroll: true });
      return;
    }
    state.activeTask = task || null;
    const hasTask = Boolean(state.activeTask);

    elements.chooserCard.hidden = hasTask;
    elements.workspaceCard.hidden = !hasTask;
    elements.taskRatio.hidden = state.activeTask !== "ratio";
    elements.taskResize.hidden = state.activeTask !== "resize";


    elements.taskCards.forEach(function (button) {
      const isActive = button.dataset.task === state.activeTask;
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    renderAll();
    const focusTarget = hasTask ? elements.workspaceCard.querySelector(".task-panel:not([hidden]) h2") : elements.chooserCard.querySelector("h2");
    if (focusTarget && (task || state.hasNavigated)) {
      focusTarget.tabIndex = -1;
      focusTarget.focus({ preventScroll: true });
      if (task || state.hasNavigated) focusTarget.scrollIntoView({ block: "start" });
    }
    state.hasNavigated = true;
  }

  function hideRatioResult() {
    elements.ratioResult.hidden = true;
    elements.ratioMatchesWrap.hidden = true;
    elements.ratioMatches.innerHTML = "";
  }

  function renderRatioTask() {
    const width = getNumericValue(elements.ratioWidth);
    const height = getNumericValue(elements.ratioHeight);

    if (!(width > 0) || !(height > 0)) {
      hideRatioResult();
      return;
    }

    const ratio = width / height;
    const closest = getClosestRatio(ratio);
    const closestGap = ratioDifference(Math.min(ratio, 1 / ratio), closest.ratio);
    const exactMatches = getExactMatches(width, height);
    const familyMatches = closestGap < EXACT_RATIO_THRESHOLD ? getFamilyMatches(closest.label).map(function (size) {
      return width > height ? formatSize(size.height, size.width) : size.label;
    }) : [];

    elements.ratioResult.hidden = false;
    elements.ratioResultTitle.textContent =
      closestGap < EXACT_RATIO_THRESHOLD
        ? "Your artwork is in the " + closest.label + " ratio family."
        : "Your artwork is closest to the " + closest.label + " ratio family.";

    elements.ratioResultIntro.textContent =
      "Using " + formatSize(width, height) + " inches (width × height). " + (closestGap < EXACT_RATIO_THRESHOLD ? "These proportions match that ratio in either orientation." : "This is a comparison, not an exact fit: that ratio would need cropping or borders.");

    if (exactMatches.length > 0) {
      const directFit = formatSize(width, height);
      const additionalMatches = familyMatches.filter(function (item) {
        return item !== directFit;
      }).slice(0, 5);

      elements.ratioResultFit.textContent =
        "It already matches " + formatSize(width, height) + " inches, a common ready-made frame size.";

      elements.ratioResultNext.textContent =
        additionalMatches.length > 0
          ? "Other sizes with these proportions include " + additionalMatches.join(", ") + " inches. Check your file’s pixels before enlarging."
          : "You can move forward with that frame size without needing extra white space just to make it fit.";
    } else {
      const bestFrame = getBestContainingFrame(width, height);

      elements.ratioResultFit.textContent =
        "It does not match one of the most common ready-made frame sizes exactly.";

      elements.ratioResultNext.textContent = bestFrame
        ? "If you want to keep the full artwork, it would sit nicely inside a " +
          bestFrame.size.label +
          " frame with " +
          describeBorders(bestFrame.borderX, bestFrame.borderY) +
          " of white border. If that feels too wide, a custom print size or custom frame may be a better choice."
        : "This sits outside the common frame list used here, so a custom print size or custom frame may be the cleanest next step.";
    }

    if (familyMatches.length > 0) {
      elements.ratioMatchesWrap.hidden = false;
      renderChips(elements.ratioMatches, familyMatches);
    } else {
      elements.ratioMatchesWrap.hidden = true;
      elements.ratioMatches.innerHTML = "";
    }
  }

  function hideResizeResult() {
    elements.resizeResult.hidden = true;
  }

  function renderResizeTask() {
    const width = getNumericValue(elements.resizeWidth);
    const height = getNumericValue(elements.resizeHeight);
    const targetWidth = getNumericValue(elements.targetWidth);
    const targetHeight = getNumericValue(elements.targetHeight);

    if (!(width > 0) || !(height > 0)) {
      hideResizeResult();
      return;
    }

    if (!(targetWidth > 0) && !(targetHeight > 0)) {
      hideResizeResult();
      return;
    }

    elements.resizeResult.hidden = false;

    if (targetWidth > 0 && targetHeight > 0) {
      const originalRatio = width / height;
      const newRatio = targetWidth / targetHeight;
      const isClose = ratioDifference(originalRatio, newRatio) < EXACT_RATIO_THRESHOLD;

      elements.resizeResultTitle.textContent = "Your new size would be " + formatSize(targetWidth, targetHeight) + " inches.";
      elements.resizeResultBody.textContent = isClose
        ? "Those dimensions keep the original shape."
        : "Those dimensions change the original shape of the artwork.";
      elements.resizeResultNote.textContent = isClose
        ? "The proportions match. Check your file resolution before printing."
        : "If you want a proportional resize instead, clear one of the new size fields and keep only the width or only the height.";
      return;
    }

    if (targetWidth > 0) {
      const newHeight = targetWidth * (height / width);
      elements.resizeResultTitle.textContent = "A proportional resize would be " + formatSize(targetWidth, newHeight) + " inches.";
      elements.resizeResultBody.textContent = "That keeps the same aspect ratio while setting the width to " + formatNumber(targetWidth) + ' inches.';
      elements.resizeResultNote.textContent = "If you need a standard frame after resizing, you can run that new size through the frame check.";
      return;
    }

    const newWidth = targetHeight * (width / height);
    elements.resizeResultTitle.textContent = "A proportional resize would be " + formatSize(newWidth, targetHeight) + " inches.";
    elements.resizeResultBody.textContent = "That keeps the same aspect ratio while setting the height to " + formatNumber(targetHeight) + ' inches.';
    elements.resizeResultNote.textContent = "If you need a standard frame after resizing, you can run that new size through the frame check.";
  }

  function hideQualityResult() {
    elements.qualityExtras.hidden = true;
    elements.qualityResult.hidden = true;
    elements.useUploadSizeButton.disabled = true;
  }

  function renderQualityTask() {
    if (!state.image) { hideQualityResult(); return; }
    elements.qualityExtras.hidden = false;
    elements.useUploadSizeButton.disabled = false;
    const guidance = document.getElementById("orderGuidance");
    guidance.textContent = "Choose a print size within the 300 PPI dimensions above, then explore our papers and loose canvas. Need a different size? We can help you plan it.";
    const widthInput = elements.qualityWidth;
    const heightInput = elements.qualityHeight;
    const invalid = [widthInput, heightInput].some(input => !input.validity.valid);
    elements.qualityResult.hidden = !invalid && !widthInput.value && !heightInput.value;
    if (elements.qualityResult.hidden) return;
    elements.qualityResultMeta.textContent = "";
    if (invalid) {
      elements.qualityResultTitle.textContent = "Enter a positive print size.";
      elements.qualityResultBody.textContent = "Use inches, or leave one dimension empty to calculate it proportionally.";
      return;
    }
    const ratio = state.image.width / state.image.height;
    let width = getNumericValue(widthInput);
    let height = getNumericValue(heightInput);
    let note = "";
    if (width && !height) { height = width / ratio; note = "The height is calculated to keep your artwork’s proportions. "; }
    if (height && !width) { width = height * ratio; note = "The width is calculated to keep your artwork’s proportions. "; }
    const fillPpi = Math.min(state.image.width / width, state.image.height / height);
    const fitPpi = Math.max(state.image.width / width, state.image.height / height);
    const sameShape = ratioDifference(ratio, width / height) < EXACT_RATIO_THRESHOLD;
    const ppi = Math.floor(fillPpi + 1e-8);
    elements.qualityResultTitle.textContent = ppi + " PPI at " + formatSize(width, height) + " inches" + (sameShape ? "" : " if cropped to fill");
    const resolution = ppi >= TARGET_PPI
      ? "This meets the 300 PPI resolution target. Check the original image for sharpness before ordering."
      : ppi >= 240
        ? "This is below the 300 PPI target. It may suit your artwork, but fine detail may look softer. Ask us if you’re unsure."
        : "This is below the 300 PPI target. Choose a smaller print, use a higher-resolution original, or ask the studio before ordering at this size.";
    elements.qualityResultBody.textContent = note + resolution;
    if (!sameShape) {
      const cropPercent = (1 - fillPpi / fitPpi) * 100;
      const cropText = cropPercent < 0.1 ? "less than 0.1" : formatNumber(cropPercent);
      elements.qualityResultMeta.textContent = "These shapes differ. Filling the print trims " + cropText + "% of the image area. Keeping the whole image with borders gives " + Math.floor(fitPpi + 1e-8) + " PPI at an artwork size of about " + formatSize(state.image.width / fitPpi, state.image.height / fitPpi) + " inches. Use the White Border Builder to prepare that version.";
      guidance.textContent = "Your chosen size needs a crop or borders. Prepare the composition before ordering, or ask us to help choose a size that keeps the full artwork.";
    } else if (ppi < TARGET_PPI) {
      guidance.textContent = "Your chosen size is below 300 PPI. You can order a smaller size from our print shop, or ask the studio whether the larger size will suit this image.";
    } else {
      guidance.textContent = "Your " + formatSize(width, height) + " inch plan meets the 300 PPI target. Choose your paper or canvas and upload the original file in our print shop.";
    }
  }

  function renderAll() {
    renderRatioTask();
    renderResizeTask();
    renderQualityTask();
    postHeight();
  }

  function renderStandardSuggestion(width, height) {
    // Only recommend families with actual common-frame examples in our list.
    const ratio = Math.min(width, height) / Math.max(width, height);
    const family = KNOWN_RATIOS.filter(item => getFamilyMatches(item.label).length)
      .sort((a, b) => ratioDifference(ratio, a.ratio) - ratioDifference(ratio, b.ratio))[0];
    const gap = ratioDifference(ratio, family.ratio);
    const exact = gap < EXACT_RATIO_THRESHOLD;
    const familySizes = getFamilyMatches(family.label).map(size => width > height
      ? { width: size.height, height: size.width } : size);
    const label = width > height ? family.label.split(":").reverse().join(":") : family.label;
    const supported = familySizes.filter(size => Math.min(width / size.width, height / size.height) + 1e-8 >= TARGET_PPI);
    document.getElementById("standardSuggestion").hidden = false;
    document.getElementById("standardSuggestionTitle").textContent = exact
      ? "Your picture already fits a standard shape: " + label
      : "For a standard frame, try the " + label + " shape";
    document.getElementById("standardSuggestionBody").textContent = exact
      ? "You can use this shape without trimming your picture. Choose a size your file can support below."
      : "This is the closest match among the common frame shapes we list. Printing in this shape can make it easier to find a ready-made frame. " +
        (1 - Math.exp(-gap) > 0.15 ? "It would cut off a noticeable part of your picture, so check the preview carefully. A border or custom size may suit it better." : "It needs some trimming at the edges. Check the preview to make sure the parts you love stay in the picture.");
    document.getElementById("standardFrameExamples").textContent = "Common frame sizes: " + familySizes.map(size => formatSize(size.width, size.height)).join(", ") + " inches (width × height).";
    document.getElementById("standardResolution").textContent = supported.length
      ? "For your file at 300 PPI or higher" + (exact ? ": " : ", after trimming: ") + supported.map(size => formatSize(size.width, size.height)).join(", ") + " inches. Larger examples above would be below 300 PPI."
      : "Your file is too small to fill these frame sizes at 300 PPI" + (exact ? ". " : " after trimming. ") + "Use a higher-resolution original, keep a smaller picture inside a border, or ask the studio for help.";
  }

  let uploadSequence = 0;
  function loadArtwork(file) {
    const sequence = ++uploadSequence;
    if (state.imageUrl) URL.revokeObjectURL(state.imageUrl);
    state.image = null;
    state.imageUrl = "";
    state.uploadWidthInches = state.uploadHeightInches = 0;
    const summary = document.getElementById("uploadSummary");
    const preview = document.getElementById("artworkPreview");
    const status = document.getElementById("uploadStatus");
    summary.hidden = true;
    document.getElementById("standardSuggestion").hidden = true;
    preview.removeAttribute("src");
    document.getElementById("clearArtwork").hidden = !file;
    elements.qualityWidth.value = "";
    elements.qualityHeight.value = "";
    document.getElementById("orderGuidance").textContent = "Explore fine art papers and loose canvas, choose your size and quantity, and upload your artwork with your order.";
    renderAll();
    status.textContent = "";
    if (!file) return;
    const allowedType = ["image/jpeg", "image/png", "image/webp"].includes(file.type);
    const missingType = !file.type && /\.(jpe?g|png|webp)$/i.test(file.name);
    if (!allowedType && !missingType) {
      status.textContent = "Please choose a JPG, PNG or WebP image. Export PDF, TIFF or HEIC artwork to one of these formats first.";
      postHeight();
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      status.textContent = "This file is over 100 MB. Export a high-quality JPG at the same pixel dimensions and try again.";
      return;
    }
    status.textContent = "Reading your artwork…";
    const imageUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = function () {
      if (sequence !== uploadSequence) { URL.revokeObjectURL(imageUrl); return; }
      const width = image.naturalWidth;
      const height = image.naturalHeight;
      state.image = { width, height };
      state.imageUrl = imageUrl;
      state.uploadWidthInches = width / TARGET_PPI;
      state.uploadHeightInches = height / TARGET_PPI;
      function gcd(a, b) { return b ? gcd(b, a % b) : a; }
      const divisor = gcd(width, height);
      document.getElementById("uploadRatio").textContent = (width / divisor) + ":" + (height / divisor) + " aspect ratio";
      document.getElementById("uploadOrientation").textContent = width + " × " + height + " pixels · " + (width === height ? "Square" : width > height ? "Landscape" : "Portrait");
      // Round down so a displayed maximum never exceeds the 300 PPI limit.
      const safe = value => value < 0.01 ? value : Math.floor((value + 1e-10) * 100) / 100;
      document.getElementById("uploadPrintSize").textContent = "Print up to " + formatSize(safe(width / 300), safe(height / 300)) + " inches at 300 PPI (approximately " + formatSize(safe(width / 300 * 2.54), safe(height / 300 * 2.54)) + " cm).";
      const sizes = STANDARD_SIZES.map(size => width > height ? { width: size.height, height: size.width } : size)
        .filter(size => Math.abs(width * size.height - height * size.width) < 0.001 && width / size.width >= 300 && height / size.height >= 300)
        .map(size => formatSize(size.width, size.height) + " in");
      const shape = width === height ? "Your picture is square." : width > height
        ? "Your picture is wider than it is tall." : "Your picture is taller than it is wide.";
      document.getElementById("uploadRatioHint").textContent = shape + " Keeping that shape lets you print the whole picture without stretching it or cutting off the edges.";
      const sizeList = document.getElementById("uploadSizes");
      if (sizes.length) renderChips(sizeList, sizes);
      else sizeList.textContent = "No exact common-size match at 300 PPI. Use the proportional print size above, add borders, or request a custom size.";
      renderStandardSuggestion(width, height);
      preview.src = imageUrl;
      summary.hidden = false;
      status.textContent = file.name + " — ready. Your file stays in your browser.";
      document.getElementById("clearArtwork").hidden = false;
      renderAll();
    };
    image.onerror = function () {
      URL.revokeObjectURL(imageUrl);
      if (sequence !== uploadSequence) return;
      status.textContent = "We could not read this image. Try another file or export a fresh JPG, PNG or WebP.";
      postHeight();
    };
    image.src = imageUrl;
  }

  function useUploadDimensions() {
    if (!state.image) {
      return;
    }

    elements.ratioWidth.value = String(state.uploadWidthInches);
    elements.ratioHeight.value = String(state.uploadHeightInches);
    setActiveTask("ratio");
  }

  function postHeight() {
    if (!window.parent || window.parent === window) {
      return;
    }

    window.parent.postMessage(
      {
        type: "monochrome-canvas-calculator-height",
        height: Math.max(
          document.body.scrollHeight,
          document.documentElement.scrollHeight,
          document.body.offsetHeight,
          document.documentElement.offsetHeight
        )
      },
      "*"
    );
  }

  elements.taskCards.forEach(function (button) {
    button.addEventListener("click", function () {
      setActiveTask(button.dataset.task);
    });
  });

  elements.resetButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      setActiveTask(null);
    });
  });

  [
    elements.ratioWidth,
    elements.ratioHeight,
    elements.resizeWidth,
    elements.resizeHeight,
    elements.targetWidth,
    elements.targetHeight,
    elements.qualityWidth,
    elements.qualityHeight
  ].forEach(function (input) {
    input.addEventListener("input", renderAll);
    input.addEventListener("change", renderAll);
  });

  elements.artworkUpload.addEventListener("change", function (event) {
    loadArtwork(event.target.files[0]);
  });

  elements.useUploadSizeButton.addEventListener("click", function () {
    useUploadDimensions();
  });

  document.getElementById("clearArtwork").addEventListener("click", function () {
    elements.artworkUpload.value = "";
    loadArtwork(null);
    elements.artworkUpload.focus();
  });
  const drop = document.getElementById("uploadDrop");
  ["dragenter", "dragover"].forEach(type => drop.addEventListener(type, event => {
    event.preventDefault(); drop.classList.add("is-dragging");
  }));
  ["dragleave", "drop"].forEach(type => drop.addEventListener(type, event => {
    event.preventDefault(); drop.classList.remove("is-dragging");
  }));
  drop.addEventListener("drop", event => {
    const files = event.dataTransfer.files;
    if (files.length !== 1) {
      document.getElementById("uploadStatus").textContent = "Please choose one artwork file at a time.";
      return;
    }
    elements.artworkUpload.files = files;
    loadArtwork(files[0]);
  });

  window.addEventListener("message", function (event) {
    if (event.data && event.data.action === "getHeight") {
      postHeight();
    }
  });

  window.addEventListener("resize", postHeight);

  if (window.ResizeObserver) {
    const observer = new ResizeObserver(function () {
      postHeight();
    });
    observer.observe(document.body);
  }

  // Independent print-planning conversion; upload and frame-check state stay separate.
  const converter = {
    direction: document.getElementById("converterDirection"),
    ppi: document.getElementById("converterPpi"),
    width: document.getElementById("converterWidth"),
    height: document.getElementById("converterHeight"),
    result: document.getElementById("converterResult"),
    note: document.getElementById("converterNote")
  };
  let converterDirection = "inches";
  const converterNumber = value => value.toLocaleString("en-US", { maximumFractionDigits: 4 });
  function readConverter() {
    const ppi = Number(converter.ppi.value);
    const width = Number(converter.width.value);
    const hasHeight = converter.height.value !== "" || converter.height.validity.badInput;
    const height = hasHeight ? Number(converter.height.value) : null;
    const values = hasHeight ? [width, height] : [width];
    const valid = ![converter.ppi, converter.width, converter.height].some(input => input.validity.badInput) &&
      Number.isFinite(ppi) && ppi > 0 && values.every(value => Number.isFinite(value) && value > 0) &&
      (converterDirection !== "pixels" || values.every(Number.isSafeInteger));
    return { ppi, values, valid };
  }
  function convertValues(data) {
    return data.values.map(value => converterDirection === "inches" ? Math.ceil(value * data.ppi - Number.EPSILON * Math.abs(value * data.ppi)) : value / data.ppi);
  }
  function renderConverter() {
    const data = readConverter();
    const output = data.valid ? convertValues(data) : [];
    const valid = data.valid && output.every(value => Number.isFinite(value) && value > 0 &&
      (converterDirection !== "inches" || Number.isSafeInteger(value)));
    if (!valid) {
      converter.result.textContent = "Check your measurements";
      converter.note.textContent = "Enter a positive width and PPI. Height can be blank. Pixel dimensions must be whole numbers; use smaller values if the result is too large.";
      return;
    }
    const unit = converterDirection === "inches" ? "pixels" : "inches";
    const format = value => value < 0.0001 ? "less than 0.0001" : converterNumber(value);
    converter.result.textContent = output.map(format).join(" × ") + " " + unit;
    converter.note.textContent = "At " + converterNumber(data.ppi) + " PPI. " +
      (converterDirection === "inches" ? "Use these pixel dimensions when setting up your artwork file." : "This is the print size at the chosen resolution.");
  }
  converter.direction.addEventListener("change", function () {
    const data = readConverter();
    const output = data.valid ? convertValues(data) : [];
    if (data.valid && output.every(value => Number.isFinite(value) && value > 0 && value <= Number.MAX_SAFE_INTEGER)) {
      converter.width.value = String(output[0]);
      converter.height.value = output.length > 1 ? String(output[1]) : "";
    } else {
      converter.width.value = ""; converter.height.value = "";
    }
    converterDirection = converter.direction.value;
    const inputUnit = converterDirection === "inches" ? "inches" : "pixels";
    document.getElementById("converterWidthLabel").textContent = "Width (" + inputUnit + ")";
    document.getElementById("converterHeightLabel").textContent = "Height (" + inputUnit + ", optional)";
    [converter.width, converter.height].forEach(input => {
      input.step = converterDirection === "inches" ? "any" : "1";
      input.inputMode = converterDirection === "inches" ? "decimal" : "numeric";
    });
    renderConverter();
  });
  [converter.width, converter.height, converter.ppi].forEach(input => input.addEventListener("input", renderConverter));
  renderConverter();

  hideRatioResult();
  hideResizeResult();
  hideQualityResult();
  setActiveTask(null);
});
