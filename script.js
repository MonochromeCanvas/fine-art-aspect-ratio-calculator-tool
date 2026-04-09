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
    taskCards: Array.from(document.querySelectorAll(".task-card")),
    emptyState: document.getElementById("emptyState"),
    taskRatio: document.getElementById("task-ratio"),
    taskResize: document.getElementById("task-resize"),
    taskQuality: document.getElementById("task-quality"),
    ratioWidth: document.getElementById("ratioWidth"),
    ratioHeight: document.getElementById("ratioHeight"),
    ratioStatus: document.getElementById("ratioStatus"),
    ratioHeading: document.getElementById("ratioHeading"),
    ratioBody: document.getElementById("ratioBody"),
    fitHeading: document.getElementById("fitHeading"),
    fitBody: document.getElementById("fitBody"),
    nextHeading: document.getElementById("nextHeading"),
    nextBody: document.getElementById("nextBody"),
    ratioMatches: document.getElementById("ratioMatches"),
    resizeWidth: document.getElementById("resizeWidth"),
    resizeHeight: document.getElementById("resizeHeight"),
    targetWidth: document.getElementById("targetWidth"),
    targetHeight: document.getElementById("targetHeight"),
    resizeStatus: document.getElementById("resizeStatus"),
    resizeHeading: document.getElementById("resizeHeading"),
    resizeBody: document.getElementById("resizeBody"),
    resizeNoteHeading: document.getElementById("resizeNoteHeading"),
    resizeNoteBody: document.getElementById("resizeNoteBody"),
    artworkUpload: document.getElementById("artworkUpload"),
    qualityWidth: document.getElementById("qualityWidth"),
    qualityHeight: document.getElementById("qualityHeight"),
    useUploadSizeButton: document.getElementById("useUploadSizeButton"),
    clearButton: document.getElementById("clearButton"),
    qualityStatus: document.getElementById("qualityStatus"),
    uploadHeading: document.getElementById("uploadHeading"),
    uploadBody: document.getElementById("uploadBody"),
    qualityHeading: document.getElementById("qualityHeading"),
    qualityBody: document.getElementById("qualityBody")
  };

  const state = {
    activeTask: null,
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

  function describeBorders(borderX, borderY) {
    if (Math.abs(borderX - borderY) < 0.06) {
      return "about " + formatNumber(borderX) + '" on all sides';
    }

    return formatNumber(borderX) + '" left and right, and ' + formatNumber(borderY) + '" top and bottom';
  }

  function setActiveTask(task) {
    state.activeTask = task;

    elements.taskCards.forEach(function (button) {
      const isActive = button.dataset.task === task;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    elements.emptyState.hidden = Boolean(task);
    elements.taskRatio.hidden = task !== "ratio";
    elements.taskResize.hidden = task !== "resize";
    elements.taskQuality.hidden = task !== "quality";

    postHeight();
  }

  function renderRatioTask() {
    const width = getNumericValue(elements.ratioWidth);
    const height = getNumericValue(elements.ratioHeight);

    if (!(width > 0) || !(height > 0)) {
      elements.ratioStatus.textContent = "Enter your artwork size to see the ratio and the closest frame guidance.";
      elements.ratioHeading.textContent = "Waiting for dimensions";
      elements.ratioBody.textContent = "Your artwork ratio and closest common ratio family will appear here.";
      elements.fitHeading.textContent = "No frame match yet";
      elements.fitBody.textContent = "We will check whether your artwork already matches a common frame size.";
      elements.nextHeading.textContent = "No recommendation yet";
      elements.nextBody.textContent = "If it does not match a common frame size, we will suggest a simple next step.";
      elements.ratioMatches.innerHTML = '<span class="chip chip--muted">Common size suggestions will appear here.</span>';
      return;
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

    if (exactMatches.length > 0) {
      elements.fitHeading.textContent = exactMatches[0].label + " is a direct fit";
      elements.fitBody.textContent =
        "Your artwork already matches a common frame size, so you can usually move forward without adding white space just to make it fit.";
      elements.nextHeading.textContent = "You are in a good spot";
      elements.nextBody.textContent =
        "Because your artwork already matches a common frame size, your next step is mostly choosing the print size you want. Other sizes in this same ratio family include " +
        familyMatches.slice(0, 4).filter(function (label) { return label !== exactMatches[0].label; }).join(", ") +
        ".";
      elements.ratioStatus.textContent =
        "Your artwork measures " + formatSize(width, height) + " and already matches " + exactMatches[0].label + ".";
    } else {
      const bestFrame = getBestContainingFrame(width, height);
      elements.fitHeading.textContent = "Not a direct common frame size";
      elements.fitBody.textContent =
        "Your artwork does not match one of the most common ready-made frame sizes exactly. That does not mean anything is wrong, just that you may want a border, mat, or custom sizing plan.";

      if (bestFrame) {
        elements.nextHeading.textContent = "Closest ready-made frame: " + bestFrame.size.label;
        elements.nextBody.textContent =
          "If you want to keep the full artwork without cropping, it would fit inside a " +
          bestFrame.size.label +
          " frame with " +
          describeBorders(bestFrame.borderX, bestFrame.borderY) +
          " of white space. If that feels like more border than you want, a custom frame or custom print size may look cleaner.";
        elements.ratioStatus.textContent =
          "Your artwork measures " + formatSize(width, height) + ". It is not a direct common frame size, but it would fit inside " + bestFrame.size.label + " with added white space.";
      } else {
        elements.nextHeading.textContent = "Custom sizing may be best";
        elements.nextBody.textContent =
          "Your artwork sits outside the common size list used here, so a custom frame or custom print size is likely the cleanest next step.";
        elements.ratioStatus.textContent =
          "Your artwork measures " + formatSize(width, height) + ". A custom frame or custom print size may be the cleanest option.";
      }
    }

    elements.ratioMatches.innerHTML = familyMatches.slice(0, 6).map(function (item) {
      return '<span class="chip">' + item + "</span>";
    }).join("");
  }

  function renderResizeTask() {
    const width = getNumericValue(elements.resizeWidth);
    const height = getNumericValue(elements.resizeHeight);
    const targetWidth = getNumericValue(elements.targetWidth);
    const targetHeight = getNumericValue(elements.targetHeight);

    if (!(width > 0) || !(height > 0)) {
      elements.resizeStatus.textContent = "Enter the current size first, then one new dimension.";
      elements.resizeHeading.textContent = "No resize result yet";
      elements.resizeBody.textContent = "Your matching proportional size will appear here.";
      elements.resizeNoteHeading.textContent = "No note yet";
      elements.resizeNoteBody.textContent = "We will let you know if your inputs change the original shape instead of keeping the same ratio.";
      return;
    }

    if (!(targetWidth > 0) && !(targetHeight > 0)) {
      elements.resizeStatus.textContent = "Now enter either a new width or a new height.";
      elements.resizeHeading.textContent = "No resize result yet";
      elements.resizeBody.textContent = "Enter one target dimension to calculate the matching side.";
      elements.resizeNoteHeading.textContent = "Keep it simple";
      elements.resizeNoteBody.textContent = "Using one target field is the easiest way to keep the artwork proportional.";
      return;
    }

    if (targetWidth > 0 && targetHeight > 0) {
      const originalRatio = width / height;
      const targetRatio = targetWidth / targetHeight;
      const difference = Math.abs(originalRatio - targetRatio) / originalRatio;

      elements.resizeHeading.textContent = formatSize(targetWidth, targetHeight);
      elements.resizeBody.textContent = "These are the exact dimensions you entered.";
      elements.resizeNoteHeading.textContent = difference < 0.015 ? "Very close to the original ratio" : "This changes the original shape";
      elements.resizeNoteBody.textContent =
        difference < 0.015
          ? "These dimensions stay very close to the original ratio, so the resize should feel natural."
          : "These dimensions do not keep the same proportions. If you want a true proportional resize, enter only one target field.";
      elements.resizeStatus.textContent = "You entered both new dimensions. Review the note below to see whether they stay proportional.";
      return;
    }

    if (targetWidth > 0) {
      const newHeight = targetWidth * (height / width);
      elements.resizeHeading.textContent = formatSize(targetWidth, newHeight);
      elements.resizeBody.textContent = "Based on a target width of " + formatNumber(targetWidth) + " inches.";
      elements.resizeNoteHeading.textContent = "Proportional resize";
      elements.resizeNoteBody.textContent = "This keeps the original aspect ratio intact.";
      elements.resizeStatus.textContent = "A new width of " + formatNumber(targetWidth) + '" gives you a proportional size of ' + formatSize(targetWidth, newHeight) + ".";
      return;
    }

    const newWidth = targetHeight * (width / height);
    elements.resizeHeading.textContent = formatSize(newWidth, targetHeight);
    elements.resizeBody.textContent = "Based on a target height of " + formatNumber(targetHeight) + " inches.";
    elements.resizeNoteHeading.textContent = "Proportional resize";
    elements.resizeNoteBody.textContent = "This keeps the original aspect ratio intact.";
    elements.resizeStatus.textContent = "A new height of " + formatNumber(targetHeight) + '" gives you a proportional size of ' + formatSize(newWidth, targetHeight) + ".";
  }

  function renderQualityTask() {
    const desiredWidth = getNumericValue(elements.qualityWidth);
    const desiredHeight = getNumericValue(elements.qualityHeight);

    if (!state.image) {
      elements.qualityStatus.textContent = "Upload a file to check how large it can print at 300 PPI.";
      elements.uploadHeading.textContent = "No file uploaded";
      elements.uploadBody.textContent = "Upload a file to see its pixel dimensions and max recommended print size at 300 PPI.";
      elements.qualityHeading.textContent = "No resolution check yet";
      elements.qualityBody.textContent = "If your uploaded file is too small for the size you want, we will warn you here.";
      elements.useUploadSizeButton.disabled = true;
      return;
    }

    elements.useUploadSizeButton.disabled = false;
    elements.uploadHeading.textContent = state.image.width + " x " + state.image.height + " px";
    elements.uploadBody.textContent =
      "At 300 PPI, this file prints up to about " + formatSize(state.uploadWidthInches, state.uploadHeightInches) + " inches.";

    if (!(desiredWidth > 0) || !(desiredHeight > 0)) {
      elements.qualityStatus.textContent = "Your file is uploaded. Add a desired print width and height if you want a more specific quality check.";
      elements.qualityHeading.textContent = "300 PPI reference ready";
      elements.qualityBody.textContent =
        "This file can print up to " + formatSize(state.uploadWidthInches, state.uploadHeightInches) + " at 300 PPI, which is a strong target for giclee printing.";
      return;
    }

    const effectivePpiX = state.image.width / desiredWidth;
    const effectivePpiY = state.image.height / desiredHeight;
    const effectivePpi = Math.floor(Math.min(effectivePpiX, effectivePpiY));

    elements.qualityStatus.textContent =
      "Checking " + formatSize(desiredWidth, desiredHeight) + " against the uploaded file.";

    if (effectivePpi >= TARGET_PPI) {
      elements.qualityHeading.textContent = effectivePpi + " PPI at your desired size";
      elements.qualityBody.textContent =
        "This is strong for giclee printing. Your uploaded file has enough resolution for " + formatSize(desiredWidth, desiredHeight) + ".";
      return;
    }

    if (effectivePpi >= 240) {
      elements.qualityHeading.textContent = effectivePpi + " PPI at your desired size";
      elements.qualityBody.textContent =
        "This is workable, but a little softer than the ideal 300 PPI target for giclee printing.";
      return;
    }

    elements.qualityHeading.textContent = effectivePpi + " PPI at your desired size";
    elements.qualityBody.textContent =
      "Warning: this file is low resolution for " + formatSize(desiredWidth, desiredHeight) + ". For stronger giclee print quality, reduce the print size or use a higher-resolution file.";
  }

  function renderAll() {
    renderRatioTask();
    renderResizeTask();
    renderQualityTask();
    postHeight();
  }

  function clearTool() {
    elements.ratioWidth.value = "";
    elements.ratioHeight.value = "";
    elements.resizeWidth.value = "";
    elements.resizeHeight.value = "";
    elements.targetWidth.value = "";
    elements.targetHeight.value = "";
    elements.artworkUpload.value = "";
    elements.qualityWidth.value = "";
    elements.qualityHeight.value = "";

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
      elements.qualityStatus.textContent = "Please upload a valid image file.";
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
      elements.qualityStatus.textContent = "The uploaded file could not be read. Please try another image.";
    };

    image.src = imageUrl;
  }

  function useUploadDimensions() {
    if (!state.image) {
      return;
    }

    setActiveTask("ratio");
    elements.ratioWidth.value = formatNumber(state.uploadWidthInches);
    elements.ratioHeight.value = formatNumber(state.uploadHeightInches);
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

  elements.taskCards.forEach(function (button) {
    button.addEventListener("click", function () {
      setActiveTask(button.dataset.task);
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
  ].forEach(function (element) {
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
