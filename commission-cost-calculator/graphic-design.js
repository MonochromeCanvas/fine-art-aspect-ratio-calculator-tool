(function (root) {
  const STUDIO_EMAIL = "mnchrmcnvs@gmail.com";

  const projectProfiles = {
    "design-support": {
      label: "Print or digital design support",
      base: 650,
      floor: 500,
      weeks: [2, 4],
      note: "Best fit for a clearly defined layout, print piece, digital asset, or production-supported design task."
    },
    "campaign-collateral": {
      label: "Campaign or event collateral",
      base: 1400,
      floor: 1000,
      weeks: [3, 6],
      note: "Best fit for event graphics, small campaigns, announcements, posters, invitations, or coordinated public materials."
    },
    "logo-mark": {
      label: "Logo, mark, or identity refresh",
      base: 2500,
      floor: 1800,
      weeks: [4, 8],
      note: "Best fit for a thoughtful mark, refinement of an existing identity, or a small visual identity foundation."
    },
    "identity-system": {
      label: "Identity system or art direction",
      base: 5200,
      floor: 4000,
      weeks: [6, 12],
      note: "Best fit for visual systems, brand direction, launch materials, and projects that need a considered creative lead."
    },
    "packaging-public": {
      label: "Packaging, launch, or public-facing system",
      base: 7600,
      floor: 6000,
      weeks: [8, 14],
      note: "Best fit for packaging, retail use, public campaigns, launch systems, or high-visibility design work."
    }
  };

  const complexityProfiles = {
    production: {
      label: "Clean layout or production support",
      multiplier: 0.9,
      weeks: 0,
      factor: "Clean layout, adaptation, or production support",
      guideTitle: "Choose this when the visual direction is mostly set.",
      guide: "Example: a defined flyer, simple print piece, digital graphic, or layout task with supplied copy, images, and size requirements."
    },
    "designed-piece": {
      label: "Designed piece with art direction",
      multiplier: 1.18,
      weeks: 1,
      factor: "Designed piece with art direction",
      guideTitle: "Choose this for a designed piece that needs taste and judgment.",
      guide: "Example: a poster, invitation, campaign graphic, small launch asset, or design piece that needs composition, hierarchy, and art direction."
    },
    "small-system": {
      label: "Small coordinated system",
      multiplier: 1.62,
      weeks: 2,
      factor: "Small coordinated design system",
      guideTitle: "Choose this when the project has multiple related parts.",
      guide: "Example: a small identity suite, event system, matching print and digital assets, or a set of templates that need to feel cohesive."
    },
    "full-direction": {
      label: "Full visual direction",
      multiplier: 2.2,
      weeks: 4,
      factor: "Full visual direction or creative lead",
      guideTitle: "Choose this when the project needs creative direction.",
      guide: "Example: a brand system, packaging direction, campaign look, public-facing launch, or work that needs discovery and visual strategy."
    }
  };

  const usageProfiles = {
    internal: {
      label: "Internal or limited local use",
      percent: 0,
      flat: 0,
      factor: "Internal, private, or limited local use"
    },
    "small-public": {
      label: "Small business public use",
      percent: 0.18,
      flat: 250,
      factor: "Small business public use"
    },
    campaign: {
      label: "Campaign, event, or publication use",
      percent: 0.42,
      flat: 750,
      factor: "Campaign, event, publication, or public promotion"
    },
    packaging: {
      label: "Packaging, retail, or product use",
      percent: 0.72,
      flat: 1500,
      factor: "Packaging, retail, or product use"
    },
    "broad-license": {
      label: "Broad licensing, resale, or buyout request",
      percent: 1.35,
      flat: 3000,
      factor: "Broad licensing, resale, or buyout request"
    }
  };

  const timelineProfiles = {
    flexible: {
      label: "Flexible timing",
      multiplier: 0.95,
      weekShift: [1, 2],
      factor: "Flexible timeline"
    },
    standard: {
      label: "Standard schedule",
      multiplier: 1,
      weekShift: [0, 0],
      factor: "Standard scheduling"
    },
    priority: {
      label: "Priority timeline",
      multiplier: 1.25,
      weekShift: [-1, -1],
      factor: "Priority schedule"
    },
    rush: {
      label: "Rush or fixed launch date",
      multiplier: 1.6,
      weekShift: [-1, -3],
      factor: "Rush or fixed launch date"
    }
  };

  const assetProfiles = {
    ready: {
      label: "Assets and copy are ready",
      flat: 0,
      weeks: 0,
      factor: "Assets and copy are ready"
    },
    messy: {
      label: "Some cleanup or organization needed",
      flat: 250,
      weeks: 1,
      factor: "Asset cleanup or organization"
    },
    "create-assets": {
      label: "Studio needs to create supporting assets",
      flat: 850,
      weeks: 2,
      factor: "Supporting asset creation"
    },
    strategy: {
      label: "Discovery, strategy, or art direction needed",
      flat: 1400,
      weeks: 3,
      factor: "Discovery, strategy, or art direction"
    }
  };

  const deliverableProfiles = {
    "print-ready": {
      label: "Print-ready files or vendor handoff",
      flat: 250,
      weeks: 0
    },
    "template-suite": {
      label: "Reusable templates or layout system",
      flat: 750,
      weeks: 1
    },
    "brand-guide": {
      label: "Mini brand guide or usage notes",
      flat: 1100,
      weeks: 1
    },
    "artwork-integration": {
      label: "Custom illustration, artwork, or image direction",
      flat: 1200,
      weeks: 2
    }
  };

  function clampCount(value) {
    const parsed = Number.parseInt(value, 10);

    if (Number.isNaN(parsed)) {
      return 1;
    }

    return Math.min(Math.max(parsed, 1), 30);
  }

  function roundToIncrement(value, increment) {
    return Math.round(value / increment) * increment;
  }

  function formatMoney(value) {
    return "$" + Math.round(value).toLocaleString("en-US");
  }

  function getProfile(collection, key, fallback) {
    return collection[key] || collection[fallback];
  }

  function calculateEstimate(options) {
    const projectType = options.projectType || "design-support";
    const profile = getProfile(projectProfiles, projectType, "design-support");
    const complexity = getProfile(complexityProfiles, options.complexity, "designed-piece");
    const usage = getProfile(usageProfiles, options.usage, "internal");
    const timeline = getProfile(timelineProfiles, options.timeline, "standard");
    const assets = getProfile(assetProfiles, options.assetReadiness, "ready");
    const deliverables = Array.isArray(options.deliverables) ? options.deliverables : [];
    const projectDetails = typeof options.projectDetails === "string" ? options.projectDetails.trim() : "";
    const notes = typeof options.notes === "string" ? options.notes.trim() : "";
    const deliverableCount = clampCount(options.deliverableCount);
    const deliverableMultiplier = deliverableCount > 1 ? 1 + (deliverableCount - 1) * 0.28 : 1;
    const creativeBase = profile.base * complexity.multiplier * deliverableMultiplier;
    const usageAmount = Math.max(creativeBase * usage.percent, usage.flat);
    const deliverableAmount = deliverables.reduce((total, key) => {
      const deliverable = deliverableProfiles[key];
      return total + (deliverable ? deliverable.flat : 0);
    }, 0);
    const deliverableWeeks = deliverables.reduce((total, key) => {
      const deliverable = deliverableProfiles[key];
      return total + (deliverable ? deliverable.weeks : 0);
    }, 0);
    const subtotal = creativeBase + usageAmount + assets.flat + deliverableAmount;
    const adjustedSubtotal = subtotal * timeline.multiplier;
    const low = Math.max(profile.floor, roundToIncrement(adjustedSubtotal * 0.85, 50));
    const high = Math.max(low + 250, roundToIncrement(adjustedSubtotal * 1.28, 50));
    const depositLow = roundToIncrement(low * 0.5, 50);
    const depositHigh = roundToIncrement(high * 0.5, 50);
    const timelineLow = Math.max(
      1,
      profile.weeks[0] + complexity.weeks + assets.weeks + deliverableWeeks + timeline.weekShift[0]
    );
    const timelineHigh = Math.max(
      timelineLow + 1,
      profile.weeks[1] + complexity.weeks + assets.weeks + deliverableWeeks + timeline.weekShift[1]
    );
    const selectedDeliverables = deliverables
      .map((key) => deliverableProfiles[key])
      .filter(Boolean)
      .map((item) => item.label);
    const factors = [
      projectDetails ? "Project details: " + projectDetails : "Project details not provided yet",
      complexity.factor,
      usage.factor,
      assets.factor,
      timeline.factor
    ];

    if (deliverableCount > 1) {
      factors.unshift(deliverableCount + " final deliverables");
    }

    selectedDeliverables.forEach((label) => factors.push(label));

    return {
      projectType,
      projectLabel: profile.label,
      projectNote: profile.note,
      deliverableCount,
      low,
      high,
      depositLow,
      depositHigh,
      timelineLow,
      timelineHigh,
      factors,
      selectedDeliverables,
      projectDetails,
      notes,
      complexityGuideTitle: complexity.guideTitle,
      complexityGuide: complexity.guide,
      labels: {
        complexity: complexity.label,
        usage: usage.label,
        timeline: timeline.label,
        assetReadiness: assets.label
      }
    };
  }

  function buildSummary(estimate) {
    const deliverables =
      estimate.selectedDeliverables.length > 0
        ? estimate.selectedDeliverables.join(", ")
        : "No additional deliverables selected";

    return [
      "Graphic design inquiry estimate",
      "",
      "Project type: " + estimate.projectLabel,
      "Project details: " + (estimate.projectDetails || "Not provided"),
      "Final deliverable count: " + estimate.deliverableCount,
      "Creative depth: " + estimate.labels.complexity,
      "Visibility / rights: " + estimate.labels.usage,
      "Timeline: " + estimate.labels.timeline,
      "Assets / copy readiness: " + estimate.labels.assetReadiness,
      "Additional deliverables: " + deliverables,
      "",
      "Planning range: " + formatMoney(estimate.low) + " - " + formatMoney(estimate.high),
      "Typical deposit: " + formatMoney(estimate.depositLow) + " - " + formatMoney(estimate.depositHigh),
      "Likely timeline: " + estimate.timelineLow + "-" + estimate.timelineHigh + " weeks",
      "",
      "Additional details:",
      estimate.notes || ""
    ].join("\n");
  }

  function getFormOptions(elements) {
    const checkedDeliverables = Array.from(
      elements.form.querySelectorAll('input[name="designDeliverables"]:checked')
    ).map((input) => input.value);

    return {
      projectType: elements.projectSelect.value,
      projectDetails: elements.detailsInput.value,
      deliverableCount: elements.deliverableCountInput.value,
      complexity: elements.complexitySelect.value,
      usage: elements.usageSelect.value,
      timeline: elements.timelineSelect.value,
      assetReadiness: elements.assetReadinessSelect.value,
      deliverables: checkedDeliverables,
      notes: elements.notesInput.value
    };
  }

  function setText(element, value) {
    if (element) {
      element.textContent = value;
    }
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function render(elements) {
    const estimate = calculateEstimate(getFormOptions(elements));
    const summary = buildSummary(estimate);
    const estimateRange = formatMoney(estimate.low) + " - " + formatMoney(estimate.high);
    const depositRange = formatMoney(estimate.depositLow) + " - " + formatMoney(estimate.depositHigh);
    const timelineValue = estimate.timelineLow + "-" + estimate.timelineHigh + " weeks";

    setText(elements.estimateRange, estimateRange);
    setText(elements.depositRange, depositRange);
    setText(elements.timelineValue, timelineValue);
    setText(elements.estimateNote, estimate.projectNote);
    elements.summaryContent.innerHTML =
      "<strong>" +
      escapeHtml(estimate.projectLabel) +
      "</strong>" +
      "<span>" +
      escapeHtml(estimateRange + " planning range with a typical " + depositRange + " deposit.") +
      "</span>";
    elements.factorList.innerHTML = estimate.factors
      .map((factor) => "<span>" + escapeHtml(factor) + "</span>")
      .join("");
    elements.complexityGuide.innerHTML =
      "<strong>" +
      escapeHtml(estimate.complexityGuideTitle) +
      "</strong><span>" +
      escapeHtml(estimate.complexityGuide) +
      "</span>";
    const notesPreview = estimate.notes.length > 140 ? estimate.notes.slice(0, 137) + "..." : estimate.notes;
    elements.notesPreview.classList.toggle("is-hidden", !estimate.notes);
    elements.notesPreview.innerHTML = estimate.notes
      ? "<strong>Details included</strong><span>" + escapeHtml(notesPreview) + "</span>"
      : "";
    elements.emailLink.href =
      "mailto:" +
      encodeURIComponent(STUDIO_EMAIL) +
      "?subject=" +
      encodeURIComponent("Graphic design inquiry - " + estimate.projectLabel) +
      "&body=" +
      encodeURIComponent(summary);
    elements.copyButton.dataset.summary = summary;
    setText(elements.copyStatus, "");
  }

  function bindEvents(elements) {
    elements.form.addEventListener("input", () => render(elements));
    elements.form.addEventListener("change", () => render(elements));
    elements.copyButton.addEventListener("click", () => copySummary(elements));
  }

  function copySummary(elements) {
    const summary = elements.copyButton.dataset.summary || "";

    if (!summary) {
      return;
    }

    if (root.navigator && root.navigator.clipboard && root.navigator.clipboard.writeText) {
      root.navigator.clipboard
        .writeText(summary)
        .then(() => setText(elements.copyStatus, "Inquiry summary copied."))
        .catch(() => fallbackCopy(elements, summary));
      return;
    }

    fallbackCopy(elements, summary);
  }

  function fallbackCopy(elements, summary) {
    const textarea = root.document.createElement("textarea");
    textarea.value = summary;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "-999px";
    root.document.body.appendChild(textarea);
    textarea.select();

    try {
      root.document.execCommand("copy");
      setText(elements.copyStatus, "Inquiry summary copied.");
    } catch (_error) {
      setText(elements.copyStatus, "Copy failed. You can still use the email button.");
    }

    root.document.body.removeChild(textarea);
  }

  function getElements() {
    return {
      form: root.document.getElementById("designCalculatorForm"),
      projectSelect: root.document.getElementById("designProjectSelect"),
      detailsInput: root.document.getElementById("designDetailsInput"),
      deliverableCountInput: root.document.getElementById("deliverableCountInput"),
      complexitySelect: root.document.getElementById("designComplexitySelect"),
      complexityGuide: root.document.getElementById("designComplexityGuide"),
      usageSelect: root.document.getElementById("designUsageSelect"),
      timelineSelect: root.document.getElementById("designTimelineSelect"),
      assetReadinessSelect: root.document.getElementById("assetReadinessSelect"),
      notesInput: root.document.getElementById("designNotesInput"),
      estimateRange: root.document.getElementById("designEstimateRange"),
      estimateNote: root.document.getElementById("designEstimateNote"),
      depositRange: root.document.getElementById("designDepositRange"),
      timelineValue: root.document.getElementById("designTimelineValue"),
      summaryContent: root.document.getElementById("designSummaryContent"),
      factorList: root.document.getElementById("designFactorList"),
      notesPreview: root.document.getElementById("designNotesPreview"),
      copyButton: root.document.getElementById("designCopyButton"),
      emailLink: root.document.getElementById("designEmailLink"),
      copyStatus: root.document.getElementById("designCopyStatus")
    };
  }

  function init() {
    if (!root.document) {
      return;
    }

    const elements = getElements();

    if (!elements.form) {
      return;
    }

    bindEvents(elements);
    render(elements);
  }

  const api = {
    calculateEstimate,
    buildSummary,
    formatMoney,
    projectProfiles,
    usageProfiles,
    deliverableProfiles
  };

  root.mcGraphicDesignCalculator = api;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  init();
})(typeof window !== "undefined" ? window : globalThis);
