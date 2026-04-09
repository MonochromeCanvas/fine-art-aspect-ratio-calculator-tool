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
    { label: "1:1", ratio: 1, note: "a square artwork shape" },
    { label: "4:5", ratio: 4 / 5, note: "a common wall art ratio" },
    { label: "2:3", ratio: 2 / 3, note: "a classic photo and poster ratio" },
    { label: "3:4", ratio: 3 / 4, note: "a balanced illustration and print ratio" },
    { label: "5:7", ratio: 5 / 7, note: "a standard gift-print ratio" },
    { label: "11:14", ratio: 11 / 14, note: "a common frame size family" },
    { label: "16:9", ratio: 16 / 9, note: "a wide panoramic ratio" }
  ];

  const TARGET_PPI = 300;
  const EXACT_RATIO_THRESHOLD = 0.012;

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
    return Number.isFinite(value) && value > 0 ? value : 0;
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
      return ratioDifference(ratio, left.ratio) - ratioDifference(ratio, right.ratio);
    })[0];
  }

  function getExactMatches(width, height) {
    return STANDARD_SIZES.filter(function (size) {
      const direct = Math.abs(size.width - width) < 0.02 && Math.abs(size.height - height) < 0.02;
      const rotated = Math.abs(size.width - height) < 0.02 && Math.abs(size.height - width) < 0.02;
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
    state.activeTask = task || null;
    const hasTask = Boolean(state.activeTask);

    elements.chooserCard.hidden = hasTask;
    elements.workspaceCard.hidden = !hasTask;
    elements.taskRatio.hidden = state.activeTask !== "ratio";
    elements.taskResize.hidden = state.activeTask !== "resize";
    elements.taskQuality.hidden = state.activeTask !== "quality";

    elements.taskCards.forEach(function (button) {
      const isActive = button.dataset.task === state.activeTask;
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    renderAll();
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
    const closestGap = ratioDifference(ratio, closest.ratio);
    const exactMatches = getExactMatches(width, height);
    const familyMatches = getFamilyMatches(closest.label).map(function (size) {
      return size.label;
    });

    elements.ratioResult.hidden = false;
    elements.ratioResultTitle.textContent =
      closestGap < EXACT_RATIO_THRESHOLD
        ? "Your artwork is in the " + closest.label + " ratio family."
        : "Your artwork is closest to the " + closest.label + " ratio family.";

    elements.ratioResultIntro.textContent =
      "Using " + formatSize(width, height) + ' inches, that shape lines up with ' + closest.note + ".";

    if (exactMatches.length > 0) {
      const directFit = exactMatches[0].label;
      const additionalMatches = familyMatches.filter(function (item) {
        return item !== directFit;
      }).slice(0, 5);

      elements.ratioResultFit.textContent =
        "It already matches " + directFit + ", which is a common ready-made frame size.";

      elements.ratioResultNext.textContent =
        additionalMatches.length > 0
          ? "If you want to print the same shape at other sizes, this ratio also works well in " + additionalMatches.join(", ") + "."
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
      renderChips(elements.ratioMatches, familyMatches.slice(0, 6));
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

      elements.resizeResultTitle.textContent = "Your new size would be " + formatSize(targetWidth, targetHeight) + ".";
      elements.resizeResultBody.textContent = isClose
        ? "Those dimensions stay very close to the original shape."
        : "Those dimensions change the original shape of the artwork.";
      elements.resizeResultNote.textContent = isClose
        ? "That resize should feel natural if you are keeping the same composition."
        : "If you want a proportional resize instead, clear one of the new size fields and keep only the width or only the height.";
      return;
    }

    if (targetWidth > 0) {
      const newHeight = targetWidth * (height / width);
      elements.resizeResultTitle.textContent = "A proportional resize would be " + formatSize(targetWidth, newHeight) + ".";
      elements.resizeResultBody.textContent = "That keeps the same aspect ratio while setting the width to " + formatNumber(targetWidth) + ' inches.';
      elements.resizeResultNote.textContent = "If you need a standard frame after resizing, you can run that new size through the frame check above.";
      return;
    }

    const newWidth = targetHeight * (width / height);
    elements.resizeResultTitle.textContent = "A proportional resize would be " + formatSize(newWidth, targetHeight) + ".";
    elements.resizeResultBody.textContent = "That keeps the same aspect ratio while setting the height to " + formatNumber(targetHeight) + ' inches.';
    elements.resizeResultNote.textContent = "If you need a standard frame after resizing, you can run that new size through the frame check above.";
  }

  function hideQualityResult() {
    elements.qualityExtras.hidden = true;
    elements.qualityResult.hidden = true;
    elements.useUploadSizeButton.disabled = true;
  }

  function renderQualityTask() {
    const desiredWidthInput = getNumericValue(elements.qualityWidth);
    const desiredHeightInput = getNumericValue(elements.qualityHeight);

    if (!state.image) {
      hideQualityResult();
      return;
    }

    elements.qualityExtras.hidden = false;
    elements.qualityResult.hidden = false;
    elements.useUploadSizeButton.disabled = false;

    const ratio = state.image.width / state.image.height;
    let desiredWidth = desiredWidthInput;
    let desiredHeight = desiredHeightInput;
    let sizeNote = "";

    if (desiredWidth > 0 && !(desiredHeight > 0)) {
      desiredHeight = desiredWidth / ratio;
      sizeNote = "Using that width, the matching proportional height would be " + formatNumber(desiredHeight) + ' inches.';
    } else if (desiredHeight > 0 && !(desiredWidth > 0)) {
      desiredWidth = desiredHeight * ratio;
      sizeNote = "Using that height, the matching proportional width would be " + formatNumber(desiredWidth) + ' inches.';
    }

    elements.qualityResultMeta.textContent =
      "File size: " +
      state.image.width +
      " x " +
      state.image.height +
      " px. At 300 PPI, that is about " +
      formatSize(state.uploadWidthInches, state.uploadHeightInches) +
      " inches.";

    if (!(desiredWidth > 0) || !(desiredHeight > 0)) {
      elements.qualityResultTitle.textContent =
        "This file can print up to about " + formatSize(state.uploadWidthInches, state.uploadHeightInches) + " at 300 PPI.";
      elements.qualityResultBody.textContent =
        "That is a strong reference point for giclee printing. Add a desired print size below if you want a more specific quality check.";
      return;
    }

    const effectivePpiX = state.image.width / desiredWidth;
    const effectivePpiY = state.image.height / desiredHeight;
    const effectivePpi = Math.floor(Math.min(effectivePpiX, effectivePpiY));
    const ratioChange = ratioDifference(ratio, desiredWidth / desiredHeight);
    const cropNote = ratioChange >= EXACT_RATIO_THRESHOLD
      ? " These proportions are different from the uploaded file, so this would involve cropping or extra white space."
      : "";

    elements.qualityResultTitle.textContent =
      effectivePpi + " PPI at " + formatSize(desiredWidth, desiredHeight);

    if (effectivePpi >= TARGET_PPI) {
      elements.qualityResultBody.textContent =
        "This is strong for giclee printing." +
        (sizeNote ? " " + sizeNote : "") +
        cropNote;
      return;
    }

    if (effectivePpi >= 240) {
      elements.qualityResultBody.textContent =
        "This should still be workable, though a little softer than the ideal 300 PPI target." +
        (sizeNote ? " " + sizeNote : "") +
        cropNote;
      return;
    }

    elements.qualityResultBody.textContent =
      "This file is low resolution for that print size. For stronger print quality, reduce the size or use a higher-resolution file." +
      (sizeNote ? " " + sizeNote : "") +
      cropNote;
  }

  function renderAll() {
    renderRatioTask();
    renderResizeTask();
    renderQualityTask();
    postHeight();
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
      hideQualityResult();
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
      hideQualityResult();
    };

    image.src = imageUrl;
  }

  function useUploadDimensions() {
    if (!state.image) {
      return;
    }

    elements.ratioWidth.value = formatNumber(state.uploadWidthInches);
    elements.ratioHeight.value = formatNumber(state.uploadHeightInches);
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

  hideRatioResult();
  hideResizeResult();
  hideQualityResult();
  setActiveTask(null);
});
