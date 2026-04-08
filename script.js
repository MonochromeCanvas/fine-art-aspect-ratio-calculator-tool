document.addEventListener("DOMContentLoaded", function () {
  const STANDARD_SIZES = [
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
    { width: 24, height: 36, label: "24 x 36", family: "2:3" },
    { width: 24, height: 42, label: "24 x 42", family: "16:9" }
  ];

  const KNOWN_RATIOS = [
    { label: "1:1", ratio: 1, note: "Square artwork and gallery walls." },
    { label: "4:5", ratio: 4 / 5, note: "Popular for standard wall art sizes like 8 x 10 and 16 x 20." },
    { label: "2:3", ratio: 2 / 3, note: "Common for photography and poster-style prints." },
    { label: "3:4", ratio: 3 / 4, note: "A balanced format for illustration and traditional print sizes." },
    { label: "5:7", ratio: 5 / 7, note: "A classic gift-print and tabletop frame ratio." },
    { label: "11:14", ratio: 11 / 14, note: "A standard frame size with its own distinct proportions." },
    { label: "16:9", ratio: 16 / 9, note: "A wide ratio for panoramic or cinematic work." }
  ];

  const TARGET_PPI = 300;

  const elements = {
    originalWidth: document.getElementById("originalWidth"),
    originalHeight: document.getElementById("originalHeight"),
    artworkUpload: document.getElementById("artworkUpload"),
    useUploadSizeButton: document.getElementById("useUploadSizeButton"),
    clearButton: document.getElementById("clearButton"),
    liveStatus: document.getElementById("liveStatus"),
    ratioHeading: document.getElementById("ratioHeading"),
    ratioBody: document.getElementById("ratioBody"),
    fitHeading: document.getElementById("fitHeading"),
    fitBody: document.getElementById("fitBody"),
    nextHeading: document.getElementById("nextHeading"),
    nextBody: document.getElementById("nextBody"),
    ratioMatches: document.getElementById("ratioMatches"),
    uploadHeading: document.getElementById("uploadHeading"),
    uploadBody: document.getElementById("uploadBody"),
    qualityHeading: document.getElementById("qualityHeading"),
    qualityBody: document.getElementById("qualityBody")
  };

  const state = {
    image: null,
    imageUrl: "",
    uploadWidthInches: 0,
    uploadHeightInches: 0
  };

  function formatNumber(value) {
    if (!Number.isFinite(value)) return "0";
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
    const parsed = parseFloat(input.value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  }

  function getDimensions() {
    return {
      width: getNumericValue(elements.originalWidth),
      height: getNumericValue(elements.originalHeight)
    };
  }

  function normalizedSize(width, height) {
    return {
      width: Math.min(width, height),
      height: Math.max(width, height)
    };
  }

  function ratioDifference(a, b) {
    return Math.abs(Math.log(a / b));
  }

  function getClosestRatio(ratio) {
    const ranked = KNOWN_RATIOS.slice().sort(function (left, right) {
      return ratioDifference(ratio, left.ratio) - ratioDifference(ratio, right.ratio);
    });
    return ranked[0];
  }

  function getExactMatches(width, height) {
    return STANDARD_SIZES.filter(function (size) {
      const direct = Math.abs(size.width - width) < 0.02 && Math.abs(size.height - height) < 0.02;
      const rotated = Math.abs(size.height - width) < 0.02 && Math.abs(size.width - height) < 0.02;
      return direct || rotated;
    });
  }

  function getFamilyMatches(family) {
    return STANDARD_SIZES.filter(function (size) {
      return size.family === family;
    });
  }

  function getBestContainingFrame(width, height) {
    const normalizedArtwork = normalizedSize(width, height);
    let best = null;

    STANDARD_SIZES.forEach(function (size) {
      const directFits = size.width >= width && size.height >= height;
      const rotatedFits = size.height >= width && size.width >= height;

      if (!directFits && !rotatedFits) {
        return;
      }

      const orientedWidth = directFits ? size.width : size.height;
      const orientedHeight = directFits ? size.height : size.width;
      const borderX = (orientedWidth - width) / 2;
      const borderY = (orientedHeight - height) / 2;
      const areaDelta = (orientedWidth * orientedHeight) - (width * height);
      const borderBalance = Math.abs(borderX - borderY);
      const normalizedFrame = normalizedSize(size.width, size.height);
      const ratioGap = ratioDifference(
        normalizedArtwork.width / normalizedArtwork.height,
        normalizedFrame.width / normalizedFrame.height
      );

      const candidate = {
        size: size,
        orientedWidth: orientedWidth,
        orientedHeight: orientedHeight,
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

    return best;
  }

  function setChipList(items) {
    if (!items.length) {
      elements.ratioMatches.innerHTML = '<span class="chip chip--muted">Common size suggestions will appear here.</span>';
      return;
    }

    elements.ratioMatches.innerHTML = items.map(function (item) {
      return '<span class="chip">' + item + "</span>";
    }).join("");
  }

  function renderRatioCard(width, height) {
    if (!(width > 0) || !(height > 0)) {
      elements.ratioHeading.textContent = "Waiting for dimensions";
      elements.ratioBody.textContent = "Your artwork ratio and its closest common family will appear here.";
      setChipList([]);
      return null;
    }

    const ratio = width / height;
    const closest = getClosestRatio(ratio);
    const exactMatches = getExactMatches(width, height);
    const familyMatches = getFamilyMatches(closest.label).map(function (size) {
      return size.label;
    });

    elements.ratioHeading.textContent = formatNumber(width) + ":" + formatNumber(height) + " artwork";
    elements.ratioBody.textContent =
      "Closest common family: " + closest.label + ". " + closest.note +
      (exactMatches.length ? " Your dimensions already match " + exactMatches[0].label + "." : "");

    setChipList(familyMatches.slice(0, 6));
    return {
      closest: closest,
      exactMatches: exactMatches
    };
  }

  function renderFitCard(width, height, ratioInfo) {
    if (!(width > 0) || !(height > 0)) {
      elements.fitHeading.textContent = "No frame match yet";
      elements.fitBody.textContent = "We will check whether your artwork already matches a common frame size.";
      return;
    }

    if (ratioInfo.exactMatches.length > 0) {
      elements.fitHeading.textContent = ratioInfo.exactMatches[0].label + " is a direct fit";
      elements.fitBody.textContent =
        "Your artwork already matches a common frame size, so you can usually move forward without adding white space just to make it fit.";
      return;
    }

    elements.fitHeading.textContent = "Not a direct common frame size";
    elements.fitBody.textContent =
      "Your artwork does not match one of the most common ready-made frame sizes exactly. That does not mean there is a problem, just that you may want a border, mat, or custom sizing plan.";
  }

  function describeBorders(borderX, borderY) {
    if (Math.abs(borderX - borderY) < 0.06) {
      return 'about ' + formatNumber(borderX) + '" on all sides';
    }

    return formatNumber(borderX) + '" left and right, and ' + formatNumber(borderY) + '" top and bottom';
  }

  function renderNextStepCard(width, height, ratioInfo) {
    if (!(width > 0) || !(height > 0)) {
      elements.nextHeading.textContent = "No recommendation yet";
      elements.nextBody.textContent = "If your artwork does not match a common frame size, we will suggest the cleanest next step.";
      return;
    }

    if (ratioInfo.exactMatches.length > 0) {
      const familyMatches = getFamilyMatches(ratioInfo.closest.label)
        .map(function (size) { return size.label; })
        .filter(function (label) { return label !== ratioInfo.exactMatches[0].label; });

      elements.nextHeading.textContent = "You are already in a good spot";
      elements.nextBody.textContent =
        "Because your artwork already matches a common frame size, your next step is mostly choosing the print size you want. Other sizes in this same ratio family include " +
        familyMatches.slice(0, 4).join(", ") +
        ".";
      return;
    }

    const bestFrame = getBestContainingFrame(width, height);

    if (!bestFrame) {
      elements.nextHeading.textContent = "Custom sizing may be best";
      elements.nextBody.textContent =
        "Your artwork sits outside the common size list used here, so a custom frame or custom print size is likely the cleanest next step.";
      return;
    }

    elements.nextHeading.textContent = "Closest ready-made frame: " + bestFrame.size.label;
    elements.nextBody.textContent =
      "If you want to keep the full artwork without cropping, it would fit inside a " +
      bestFrame.size.label +
      " frame with " +
      describeBorders(bestFrame.borderX, bestFrame.borderY) +
      " of white space. If those borders feel awkward, a custom frame or custom print size may look cleaner.";
  }

  function renderUploadCard(width, height) {
    if (!state.image) {
      elements.uploadHeading.textContent = "No file uploaded";
      elements.uploadBody.textContent = "Upload a file to see its pixel dimensions and max recommended print size at 300 PPI.";
      elements.qualityHeading.textContent = "No resolution check yet";
      elements.qualityBody.textContent = "If your uploaded file is too small for the size you want, we will warn you here.";
      elements.useUploadSizeButton.disabled = true;
      return;
    }

    elements.uploadHeading.textContent = state.image.width + " x " + state.image.height + " px";
    elements.uploadBody.textContent =
      "At 300 PPI, this file prints up to about " +
      formatSize(state.uploadWidthInches, state.uploadHeightInches) +
      " inches.";

    elements.useUploadSizeButton.disabled = false;

    if (!(width > 0) || !(height > 0)) {
      elements.qualityHeading.textContent = "300 PPI reference ready";
      elements.qualityBody.textContent =
        "If you want, you can use the button above to fill the calculator with this file's recommended size at 300 PPI.";
      return;
    }

    const effectivePpiX = state.image.width / width;
    const effectivePpiY = state.image.height / height;
    const effectivePpi = Math.floor(Math.min(effectivePpiX, effectivePpiY));

    if (effectivePpi >= TARGET_PPI) {
      elements.qualityHeading.textContent = effectivePpi + " PPI at your entered size";
      elements.qualityBody.textContent =
        "This is strong for giclee printing. Your uploaded file has enough resolution for the size currently entered.";
      return;
    }

    if (effectivePpi >= 240) {
      elements.qualityHeading.textContent = effectivePpi + " PPI at your entered size";
      elements.qualityBody.textContent =
        "This is workable, but a little softer than the ideal 300 PPI target for giclee printing.";
      return;
    }

    elements.qualityHeading.textContent = effectivePpi + " PPI at your entered size";
    elements.qualityBody.textContent =
      "Warning: this file is low resolution for the size currently entered. For stronger giclee print quality, reduce the print size or use a higher-resolution file.";
  }

  function renderLiveStatus(width, height, ratioInfo) {
    if (!(width > 0) || !(height > 0)) {
      elements.liveStatus.textContent = "Enter your artwork size to see your aspect ratio and frame guidance.";
      return;
    }

    if (ratioInfo.exactMatches.length > 0) {
      elements.liveStatus.textContent =
        "Your artwork measures " + formatSize(width, height) + " and already matches " + ratioInfo.exactMatches[0].label + ".";
      return;
    }

    const bestFrame = getBestContainingFrame(width, height);
    if (bestFrame) {
      elements.liveStatus.textContent =
        "Your artwork measures " +
        formatSize(width, height) +
        ". It is not a direct common frame size, but it would fit inside " +
        bestFrame.size.label +
        " with added white space.";
      return;
    }

    elements.liveStatus.textContent =
      "Your artwork measures " + formatSize(width, height) + ". A custom frame or custom print size may be the cleanest option.";
  }

  function renderAll() {
    const dimensions = getDimensions();
    const ratioInfo = renderRatioCard(dimensions.width, dimensions.height) || {
      closest: null,
      exactMatches: []
    };

    renderFitCard(dimensions.width, dimensions.height, ratioInfo);
    renderNextStepCard(dimensions.width, dimensions.height, ratioInfo);
    renderUploadCard(dimensions.width, dimensions.height);
    renderLiveStatus(dimensions.width, dimensions.height, ratioInfo);
    postHeight();
  }

  function clearTool() {
    elements.originalWidth.value = "";
    elements.originalHeight.value = "";
    elements.artworkUpload.value = "";

    if (state.imageUrl) {
      URL.revokeObjectURL(state.imageUrl);
    }

    state.image = null;
    state.imageUrl = "";
    state.uploadWidthInches = 0;
    state.uploadHeightInches = 0;

    renderAll();
  }

  function loadArtwork(file) {
    if (!file) {
      if (state.imageUrl) {
        URL.revokeObjectURL(state.imageUrl);
      }
      state.image = null;
      state.imageUrl = "";
      state.uploadWidthInches = 0;
      state.uploadHeightInches = 0;
      renderAll();
      return;
    }

    if (!file.type || file.type.indexOf("image/") !== 0) {
      elements.liveStatus.textContent = "Please upload a valid image file.";
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = function () {
      if (state.imageUrl) {
        URL.revokeObjectURL(state.imageUrl);
      }

      state.image = image;
      state.imageUrl = imageUrl;
      state.uploadWidthInches = image.width / TARGET_PPI;
      state.uploadHeightInches = image.height / TARGET_PPI;
      renderAll();
    };

    image.onerror = function () {
      URL.revokeObjectURL(imageUrl);
      elements.liveStatus.textContent = "The uploaded file could not be read. Please try another image.";
    };

    image.src = imageUrl;
  }

  function useUploadDimensions() {
    if (!state.image) {
      return;
    }

    elements.originalWidth.value = formatNumber(state.uploadWidthInches);
    elements.originalHeight.value = formatNumber(state.uploadHeightInches);
    renderAll();
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

  [elements.originalWidth, elements.originalHeight].forEach(function (element) {
    element.addEventListener("input", renderAll);
    element.addEventListener("change", renderAll);
  });

  elements.artworkUpload.addEventListener("change", function (event) {
    loadArtwork(event.target.files[0]);
  });

  elements.useUploadSizeButton.addEventListener("click", useUploadDimensions);
  elements.clearButton.addEventListener("click", clearTool);

  window.addEventListener("message", function (event) {
    if (event.data && event.data.action === "getHeight") {
      postHeight();
    }
  });

  if (window.ResizeObserver) {
    const observer = new ResizeObserver(function () {
      postHeight();
    });
    observer.observe(document.body);
  }

  renderAll();
});
