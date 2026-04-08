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

  const elements = {
    originalWidth: document.getElementById("originalWidth"),
    originalHeight: document.getElementById("originalHeight"),
    borderSize: document.getElementById("borderSize"),
    artworkUpload: document.getElementById("artworkUpload"),
    targetWidth: document.getElementById("targetWidth"),
    targetHeight: document.getElementById("targetHeight"),
    clearButton: document.getElementById("clearButton"),
    downloadButton: document.getElementById("downloadButton"),
    liveStatus: document.getElementById("liveStatus"),
    ratioHeading: document.getElementById("ratioHeading"),
    ratioBody: document.getElementById("ratioBody"),
    frameHeading: document.getElementById("frameHeading"),
    frameBody: document.getElementById("frameBody"),
    resizeHeading: document.getElementById("resizeHeading"),
    resizeBody: document.getElementById("resizeBody"),
    qualityHeading: document.getElementById("qualityHeading"),
    qualityBody: document.getElementById("qualityBody"),
    matchesList: document.getElementById("matchesList"),
    previewPaper: document.getElementById("previewPaper"),
    previewArt: document.getElementById("previewArt"),
    previewEmpty: document.getElementById("previewEmpty"),
    downloadNote: document.getElementById("downloadNote"),
    exportCanvas: document.getElementById("exportCanvas")
  };

  const state = {
    image: null,
    imageUrl: "",
    fileName: "bordered-artwork"
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

  function getBorderInches() {
    return parseFloat(elements.borderSize.value || "0") || 0;
  }

  function getDimensions() {
    return {
      width: getNumericValue(elements.originalWidth),
      height: getNumericValue(elements.originalHeight)
    };
  }

  function getTargetValues() {
    return {
      width: getNumericValue(elements.targetWidth),
      height: getNumericValue(elements.targetHeight)
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

  function getFrameMatches(outerWidth, outerHeight) {
    const exact = [];
    const nearby = [];
    const outerRatio = outerWidth / outerHeight;

    STANDARD_SIZES.forEach(function (size) {
      const directMatch = Math.abs(size.width - outerWidth) < 0.02 && Math.abs(size.height - outerHeight) < 0.02;
      const rotatedMatch = Math.abs(size.height - outerWidth) < 0.02 && Math.abs(size.width - outerHeight) < 0.02;
      if (directMatch || rotatedMatch) {
        exact.push(size);
        return;
      }

      nearby.push({
        size: size,
        score: ratioDifference(outerRatio, size.width / size.height)
      });
    });

    nearby.sort(function (left, right) {
      return left.score - right.score;
    });

    return {
      exact: exact,
      nearby: nearby.slice(0, 4).map(function (entry) {
        return entry.size;
      })
    };
  }

  function setText(headingElement, bodyElement, heading, body) {
    headingElement.textContent = heading;
    bodyElement.textContent = body;
  }

  function renderRatioCard(width, height) {
    if (!(width > 0) || !(height > 0)) {
      setText(
        elements.ratioHeading,
        elements.ratioBody,
        "Waiting for dimensions",
        "Your artwork ratio and its closest common family will appear here."
      );
      return null;
    }

    const ratio = width / height;
    const closest = getClosestRatio(ratio);
    const ratioText = formatNumber(width) + ":" + formatNumber(height);
    setText(
      elements.ratioHeading,
      elements.ratioBody,
      ratioText + " artwork",
      "Closest common family: " + closest.label + ". " + closest.note
    );
    return ratio;
  }

  function renderFrameCard(width, height, border) {
    if (!(width > 0) || !(height > 0)) {
      setText(
        elements.frameHeading,
        elements.frameBody,
        "No frame calculation yet",
        "Add artwork dimensions first, then use the white border menu to see how the final outer size changes."
      );
      elements.matchesList.innerHTML = "<li>Enter artwork dimensions to see matching frame sizes.</li>";
      return null;
    }

    const outerWidth = width + (border * 2);
    const outerHeight = height + (border * 2);
    const frameMatches = getFrameMatches(outerWidth, outerHeight);

    if (border > 0) {
      if (frameMatches.exact.length > 0) {
        setText(
          elements.frameHeading,
          elements.frameBody,
          formatSize(outerWidth, outerHeight) + " outer size",
          formatSize(width, height) +
            " artwork fits nicely in a " +
            frameMatches.exact[0].label +
            " frame with a " +
            formatNumber(border) +
            "\" white border."
        );
      } else {
        setText(
          elements.frameHeading,
          elements.frameBody,
          formatSize(outerWidth, outerHeight) + " outer size",
          "A " +
            formatNumber(border) +
            "\" white border makes the overall size " +
            formatSize(outerWidth, outerHeight) +
            ". This looks like a custom frame or mat size rather than a direct standard match."
        );
      }
    } else if (frameMatches.exact.length > 0) {
      setText(
        elements.frameHeading,
        elements.frameBody,
        frameMatches.exact[0].label + " is an exact fit",
        "Your artwork already lines up with a common frame size without adding a border."
      );
    } else {
      setText(
        elements.frameHeading,
        elements.frameBody,
        "No exact standard fit",
        "Your artwork does not currently land on a common frame size. A border, mat, or custom frame may give you a cleaner final presentation."
      );
    }

    const listItems = [];

    if (frameMatches.exact.length > 0) {
      frameMatches.exact.forEach(function (match) {
        listItems.push(
          "<li><strong>Exact fit:</strong> " +
            match.label +
            " frame" +
            (border > 0 ? " with the selected border applied." : ".")
        );
      });
    } else {
      listItems.push(
        "<li><strong>Outer size:</strong> " +
          formatSize(outerWidth, outerHeight) +
          " inches.</li>"
      );
    }

    frameMatches.nearby.forEach(function (match) {
      listItems.push(
        "<li><strong>Compare:</strong> " +
          match.label +
          " (" +
          match.family +
          " family)</li>"
      );
    });

    elements.matchesList.innerHTML = listItems.join("");

    return {
      outerWidth: outerWidth,
      outerHeight: outerHeight
    };
  }

  function renderResizeCard(width, height) {
    const target = getTargetValues();

    if (!(width > 0) || !(height > 0)) {
      setText(
        elements.resizeHeading,
        elements.resizeBody,
        "No resize target yet",
        "Use one target field to calculate a proportional size."
      );
      return;
    }

    if (!(target.width > 0) && !(target.height > 0)) {
      setText(
        elements.resizeHeading,
        elements.resizeBody,
        "No resize target yet",
        "Enter either a target width or a target height to calculate a new proportional size."
      );
      return;
    }

    if (target.width > 0 && target.height > 0) {
      const originalRatio = width / height;
      const targetRatio = target.width / target.height;
      const difference = Math.abs(originalRatio - targetRatio) / originalRatio;

      if (difference < 0.015) {
        setText(
          elements.resizeHeading,
          elements.resizeBody,
          formatSize(target.width, target.height),
          "These dimensions stay very close to the original ratio, so the resize should feel natural."
        );
      } else {
        setText(
          elements.resizeHeading,
          elements.resizeBody,
          formatSize(target.width, target.height),
          "These dimensions change the original proportion. Expect cropping, extra border, or visible shape changes."
        );
      }
      return;
    }

    if (target.width > 0) {
      const newHeight = target.width * (height / width);
      setText(
        elements.resizeHeading,
        elements.resizeBody,
        formatSize(target.width, newHeight),
        "Based on a target width of " + formatNumber(target.width) + " inches."
      );
      return;
    }

    const newWidth = target.height * (width / height);
    setText(
      elements.resizeHeading,
      elements.resizeBody,
      formatSize(newWidth, target.height),
      "Based on a target height of " + formatNumber(target.height) + " inches."
    );
  }

  function renderQualityCard(width, height, outerSize) {
    if (!state.image) {
      setText(
        elements.qualityHeading,
        elements.qualityBody,
        "Upload optional",
        "Upload a file to preview the artwork with a border and estimate print quality."
      );
      return;
    }

    if (!(width > 0) || !(height > 0)) {
      setText(
        elements.qualityHeading,
        elements.qualityBody,
        state.image.width + " x " + state.image.height + " px",
        "Add artwork dimensions in inches to estimate effective print resolution."
      );
      return;
    }

    const ppiX = state.image.width / width;
    const ppiY = state.image.height / height;
    const effectivePpi = Math.floor(Math.min(ppiX, ppiY));
    const enteredRatio = width / height;
    const imageRatio = state.image.width / state.image.height;
    const ratioMismatch = Math.abs(enteredRatio - imageRatio) / enteredRatio;
    let qualityNote = "Good for many print uses.";

    if (effectivePpi >= 300) {
      qualityNote = "Excellent detail for fine art printing.";
    } else if (effectivePpi >= 240) {
      qualityNote = "Very workable, with only slight softening in fine detail.";
    } else if (effectivePpi < 180) {
      qualityNote = "This may print softly at the entered size. Consider a smaller print or a higher-resolution file.";
    }

    const paperText = outerSize
      ? "Outer paper size with border: " + formatSize(outerSize.outerWidth, outerSize.outerHeight) + " inches."
      : "No border added yet.";
    const ratioText =
      ratioMismatch > 0.02
        ? " The uploaded file and entered artwork size do not share the same ratio, so border/export results may need a quick double-check."
        : "";

    setText(
      elements.qualityHeading,
      elements.qualityBody,
      effectivePpi + " PPI at artwork size",
      state.image.width +
        " x " +
        state.image.height +
        " px upload. " +
        qualityNote +
        " " +
        paperText +
        ratioText
    );
  }

  function updatePreview(width, height, border, outerSize) {
    const hasImage = Boolean(state.imageUrl);
    elements.previewArt.hidden = !hasImage;
    elements.previewEmpty.hidden = hasImage;

    const previewWidth = outerSize ? outerSize.outerWidth : width || 4;
    const previewHeight = outerSize ? outerSize.outerHeight : height || 5;

    elements.previewPaper.style.aspectRatio = previewWidth + " / " + previewHeight;

    if (!hasImage || !(width > 0) || !(height > 0)) {
      elements.previewPaper.style.setProperty("--preview-top", "10%");
      elements.previewPaper.style.setProperty("--preview-side", "10%");
      elements.downloadNote.textContent =
        "Download is enabled after you upload artwork and enter valid artwork dimensions.";
      return;
    }

    const horizontalInset = previewWidth > 0 ? ((border / previewWidth) * 100) + 8 : 8;
    const verticalInset = previewHeight > 0 ? ((border / previewHeight) * 100) + 8 : 8;

    elements.previewArt.style.backgroundImage = 'url("' + state.imageUrl + '")';
    elements.previewPaper.style.setProperty("--preview-side", horizontalInset + "%");
    elements.previewPaper.style.setProperty("--preview-top", verticalInset + "%");
    elements.downloadNote.textContent =
      border > 0
        ? "Your download will keep the uploaded resolution and add a " + formatNumber(border) + "\" white border."
        : "Your download will preserve the uploaded artwork without adding a border.";
  }

  function updateDownloadState(width, height, border) {
    const enabled = Boolean(state.image) && width > 0 && height > 0;
    elements.downloadButton.disabled = !enabled;
    elements.downloadButton.textContent = border > 0 ? "Download bordered PNG" : "Download PNG";
  }

  function renderAll() {
    const dimensions = getDimensions();
    const border = getBorderInches();

    renderRatioCard(dimensions.width, dimensions.height);
    const outerSize = renderFrameCard(dimensions.width, dimensions.height, border);
    renderResizeCard(dimensions.width, dimensions.height);
    renderQualityCard(dimensions.width, dimensions.height, outerSize);
    updatePreview(dimensions.width, dimensions.height, border, outerSize);
    updateDownloadState(dimensions.width, dimensions.height, border);

    if (dimensions.width > 0 && dimensions.height > 0) {
      elements.liveStatus.textContent =
        "Live update: " +
        formatSize(dimensions.width, dimensions.height) +
        " artwork" +
        (border > 0 ? " with a " + formatNumber(border) + "\" white border." : " with no border.");
    } else {
      elements.liveStatus.textContent = "Enter your artwork size to see live frame-fit guidance.";
    }

    postHeight();
  }

  function clearTool() {
    elements.originalWidth.value = "";
    elements.originalHeight.value = "";
    elements.borderSize.value = "0";
    elements.targetWidth.value = "";
    elements.targetHeight.value = "";
    elements.artworkUpload.value = "";

    if (state.imageUrl) {
      URL.revokeObjectURL(state.imageUrl);
    }

    state.image = null;
    state.imageUrl = "";
    state.fileName = "bordered-artwork";
    elements.previewArt.style.backgroundImage = "";
    renderAll();
  }

  function loadArtwork(file) {
    if (!file) {
      if (state.imageUrl) {
        URL.revokeObjectURL(state.imageUrl);
      }
      state.image = null;
      state.imageUrl = "";
      state.fileName = "bordered-artwork";
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
      state.fileName = (file.name || "bordered-artwork").replace(/\.[^.]+$/, "");
      renderAll();
    };

    image.onerror = function () {
      URL.revokeObjectURL(imageUrl);
      elements.liveStatus.textContent = "The uploaded file could not be previewed. Please try another image.";
    };

    image.src = imageUrl;
  }

  function exportBorderedImage() {
    const dimensions = getDimensions();

    if (!state.image || !(dimensions.width > 0) || !(dimensions.height > 0)) {
      return;
    }

    const border = getBorderInches();
    const scaleX = state.image.width / dimensions.width;
    const scaleY = state.image.height / dimensions.height;
    const borderPixelsX = Math.round(scaleX * border);
    const borderPixelsY = Math.round(scaleY * border);

    const canvas = elements.exportCanvas;
    const context = canvas.getContext("2d");
    const canvasWidth = state.image.width + (borderPixelsX * 2);
    const canvasHeight = state.image.height + (borderPixelsY * 2);

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvasWidth, canvasHeight);
    context.drawImage(state.image, borderPixelsX, borderPixelsY, state.image.width, state.image.height);

    const link = document.createElement("a");
    const suffix = border > 0 ? "-with-" + formatNumber(border).replace(".", "-") + "in-border" : "-clean";
    link.download = state.fileName + suffix + ".png";
    link.href = canvas.toDataURL("image/png");
    link.click();
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

  [elements.originalWidth, elements.originalHeight, elements.borderSize, elements.targetWidth, elements.targetHeight].forEach(
    function (element) {
      element.addEventListener("input", renderAll);
      element.addEventListener("change", renderAll);
    }
  );

  document.getElementById("ratioTool").addEventListener("submit", function (event) {
    event.preventDefault();
  });

  elements.artworkUpload.addEventListener("change", function (event) {
    loadArtwork(event.target.files[0]);
  });

  elements.clearButton.addEventListener("click", clearTool);
  elements.downloadButton.addEventListener("click", exportBorderedImage);

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
