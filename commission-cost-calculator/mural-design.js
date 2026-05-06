(function (root) {
  const STUDIO_EMAIL = "mnchrmcnvs@gmail.com";

  const projectProfiles = {
    "concept-study": {
      label: "Concept study or early direction",
      base: 900,
      floor: 900,
      weeks: [3, 5],
      note: "Best fit for early mural ideas, visual exploration, and deciding whether a wall concept should move forward."
    },
    "mural-design-package": {
      label: "Complete mural design package",
      base: 2600,
      floor: 1800,
      weeks: [4, 7],
      note: "Best fit for a fully designed mural concept with enough direction for a painter or production team to execute."
    },
    "art-direction-handoff": {
      label: "Art direction + painter handoff",
      base: 4200,
      floor: 3000,
      weeks: [6, 10],
      note: "Best fit when the studio is shaping the visual direction and preparing a painter, vendor, or facilities team for execution."
    },
    "public-art-system": {
      label: "Public art, campaign, or institution-scale mural",
      base: 5500,
      floor: 5000,
      weeks: [8, 14],
      note: "Best fit for public-facing walls, exterior work, institutional review, press visibility, community projects, or high-stakes creative direction."
    }
  };

  const wallScaleProfiles = {
    small: {
      label: "Small feature wall or accent area",
      multiplier: 0.9,
      weeks: 0,
      factor: "Small feature wall or accent area"
    },
    medium: {
      label: "Standard interior wall",
      multiplier: 1.05,
      weeks: 1,
      factor: "Standard interior wall"
    },
    large: {
      label: "Large interior or prominent business wall",
      multiplier: 1.15,
      weeks: 1,
      factor: "Large interior or prominent business wall"
    },
    oversized: {
      label: "Oversized multi-wall or large exterior",
      multiplier: 1.25,
      weeks: 3,
      factor: "Oversized multi-wall or large exterior"
    },
    "exterior-public": {
      label: "Exterior, public-facing, or high-visibility wall",
      multiplier: 1.25,
      weeks: 3,
      factor: "Exterior, public-facing, or high-visibility wall"
    }
  };

  const complexityProfiles = {
    graphic: {
      label: "Simple graphic treatment or pattern",
      multiplier: 0.85,
      weeks: 0,
      factor: "Simple graphic treatment, pattern, or clean visual mark",
      guideTitle: "Choose Graphic when the mural is bold and direct.",
      guide: "Example: simple shapes, type-led artwork, decorative pattern, restrained palette, or a direct wall treatment with limited subject detail."
    },
    illustrative: {
      label: "Illustrative mural concept",
      multiplier: 1.1,
      weeks: 1,
      factor: "Illustrative mural concept",
      guideTitle: "Choose Illustrative for most designed mural concepts.",
      guide: "Example: a custom composition, image-led wall, illustrated subject, brand-adjacent artwork, or a design that needs taste, hierarchy, and painter-friendly planning."
    },
    "detailed-scene": {
      label: "Detailed scene or many elements",
      multiplier: 1.2,
      weeks: 2,
      factor: "Detailed scene, many elements, or architectural planning",
      guideTitle: "Choose Detailed when the wall has a lot to solve.",
      guide: "Example: multiple subjects, architecture, community references, layered storytelling, perspective, vehicles, buildings, or many details that need to work at scale."
    },
    "premium-public": {
      label: "Premium public-facing artwork",
      multiplier: 1.25,
      weeks: 3,
      factor: "Premium public-facing artwork or complex creative direction",
      guideTitle: "Choose Premium for high-visibility work.",
      guide: "Example: exterior public art, press-facing campaigns, institutional projects, landmark walls, committee review, or artwork expected to carry a major public space."
    }
  };

  const teamProfiles = {
    "client-team": {
      label: "Client has a painter or installation team",
      flat: 0,
      weeks: 0,
      factor: "Client has a painter or installation team",
      guideTitle: "Client has a painter or installation team",
      guide: "Choose this when someone else is responsible for painting, wall prep, materials, access, and installation."
    },
    referral: {
      label: "Studio recommends a professional painting team",
      flat: 450,
      weeks: 1,
      factor: "Studio recommends a professional painting team",
      guideTitle: "Studio recommends a professional painting team",
      guide: "Choose this if you want the studio to suggest painters or fabricators who may be a good fit. Their labor and materials are quoted separately."
    },
    coordination: {
      label: "Studio coordinates with client or painting team",
      flat: 900,
      weeks: 2,
      factor: "Studio coordination with client or painting team",
      guideTitle: "Studio coordinates with client or painting team",
      guide: "Choose this when the studio should help clarify files, color notes, handoff details, or execution questions with the person or team painting the mural."
    },
    "art-direction-onsite": {
      label: "Limited on-site art direction during painting",
      flat: 1800,
      weeks: 3,
      factor: "Limited on-site art direction during painting",
      guideTitle: "Limited on-site art direction during painting",
      guide: "Choose this when Joëlle is not the mural painter, but may be present for a limited site visit or scheduled check-in to guide placement, color, and interpretation during execution."
    }
  };

  const usageProfiles = {
    "private-interior": {
      label: "Private interior or limited display",
      percent: 0,
      flat: 0,
      factor: "Private interior or limited display"
    },
    "business-public": {
      label: "Business, restaurant, retail, or lobby display",
      percent: 0.08,
      flat: 500,
      factor: "Business, restaurant, retail, or lobby display"
    },
    institution: {
      label: "Institutional, donor, or community-facing use",
      percent: 0.12,
      flat: 900,
      factor: "Institutional, donor, or community-facing use"
    },
    "public-art": {
      label: "Public art, exterior, campaign, or press-facing use",
      percent: 0.15,
      flat: 1500,
      factor: "Public art, exterior, campaign, or press-facing use"
    },
    "broad-license": {
      label: "Reproduction, merch, licensing, or broad usage",
      percent: 0.35,
      flat: 2500,
      factor: "Reproduction, merchandise, licensing, or broad usage"
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
      label: "Rush or fixed opening date",
      multiplier: 1.65,
      weekShift: [-1, -3],
      factor: "Rush or fixed opening date"
    }
  };

  const siteProfiles = {
    ready: {
      label: "Measurements, photos, and direction are ready",
      flat: 0,
      weeks: 0,
      factor: "Measurements, photos, and direction are ready"
    },
    "measurements-needed": {
      label: "Measurements or wall photos needed",
      flat: 300,
      weeks: 1,
      factor: "Measurements or wall photos needed"
    },
    "site-complex": {
      label: "Complex site, approvals, or production constraints",
      flat: 800,
      weeks: 1,
      factor: "Complex site, approvals, or production constraints"
    },
    "approval-process": {
      label: "Public, institutional, or committee approval process",
      flat: 1200,
      weeks: 3,
      factor: "Public, institutional, or committee approval process"
    }
  };

  const deliverableProfiles = {
    "site-mockup": {
      label: "Site mockup based on supplied photos and dimensions",
      flat: 0,
      weeks: 0
    },
    "color-palette": {
      label: "Color palette, paint notes, or material direction",
      flat: 400,
      weeks: 0
    },
    "paint-guide": {
      label: "Detailed paint guide, grid, or installation map",
      flat: 650,
      weeks: 1
    },
    "vendor-files": {
      label: "Production-ready files, projector files, or stencil/vendor handoff",
      flat: 750,
      weeks: 1
    },
    "installation-coordination": {
      label: "Coordination notes for painters, vendors, or facilities teams",
      flat: 900,
      weeks: 1
    }
  };

  function clampWallCount(value) {
    const parsed = Number.parseInt(value, 10);

    if (Number.isNaN(parsed)) {
      return 1;
    }

    return Math.min(Math.max(parsed, 1), 8);
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
    const projectType = options.projectType || "mural-design-package";
    const profile = getProfile(projectProfiles, projectType, "mural-design-package");
    const wallScale = getProfile(wallScaleProfiles, options.wallScale, "medium");
    const complexity = getProfile(complexityProfiles, options.complexity, "illustrative");
    const team = getProfile(teamProfiles, options.team, "client-team");
    const usage = getProfile(usageProfiles, options.usage, "private-interior");
    const timeline = getProfile(timelineProfiles, options.timeline, "standard");
    const site = getProfile(siteProfiles, options.siteReadiness, "ready");
    const deliverables = Array.isArray(options.deliverables) ? options.deliverables : [];
    const siteDetails = typeof options.siteDetails === "string" ? options.siteDetails.trim() : "";
    const notes = typeof options.notes === "string" ? options.notes.trim() : "";
    const wallCount = clampWallCount(options.wallCount);
    const wallCountMultiplier = wallCount > 1 ? 1 + (wallCount - 1) * 0.15 : 1;
    const creativeBase = profile.base * wallScale.multiplier * complexity.multiplier * wallCountMultiplier;
    const usageAmount = Math.max(creativeBase * usage.percent, usage.flat);
    const deliverableAmount = deliverables.reduce((total, key) => {
      const deliverable = deliverableProfiles[key];
      return total + (deliverable ? deliverable.flat : 0);
    }, 0);
    const deliverableWeeks = deliverables.reduce((total, key) => {
      const deliverable = deliverableProfiles[key];
      return total + (deliverable ? deliverable.weeks : 0);
    }, 0);
    const subtotal = creativeBase + usageAmount + team.flat + site.flat + deliverableAmount;
    const adjustedSubtotal = subtotal * timeline.multiplier;
    const increment = adjustedSubtotal >= 10000 ? 250 : adjustedSubtotal >= 2500 ? 100 : 50;
    const low = Math.max(profile.floor, roundToIncrement(adjustedSubtotal * 0.85, increment));
    const high = Math.max(low + 250, roundToIncrement(adjustedSubtotal * 1.25, increment));
    const depositLow = roundToIncrement(low * 0.5, increment);
    const depositHigh = roundToIncrement(high * 0.5, increment);
    const timelineLow = Math.max(
      2,
      profile.weeks[0] +
        wallScale.weeks +
        complexity.weeks +
        team.weeks +
        site.weeks +
        deliverableWeeks +
        timeline.weekShift[0]
    );
    const timelineHigh = Math.max(
      timelineLow + 1,
      profile.weeks[1] +
        wallScale.weeks +
        complexity.weeks +
        team.weeks +
        site.weeks +
        deliverableWeeks +
        timeline.weekShift[1]
    );
    const selectedDeliverables = deliverables
      .map((key) => deliverableProfiles[key])
      .filter(Boolean)
      .map((item) => item.label);
    const factors = [
      siteDetails ? "Site details: " + siteDetails : "Site details not provided yet",
      wallCount > 1 ? wallCount + " walls or panels" : "1 wall or panel",
      "Site mockup included with supplied photos and dimensions",
      wallScale.factor,
      complexity.factor,
      team.factor,
      usage.factor,
      site.factor,
      timeline.factor
    ];

    selectedDeliverables.forEach((label) => factors.push(label));

    return {
      projectType,
      projectLabel: profile.label,
      projectNote: profile.note,
      wallCount,
      low,
      high,
      depositLow,
      depositHigh,
      timelineLow,
      timelineHigh,
      factors,
      selectedDeliverables,
      siteDetails,
      notes,
      teamGuideTitle: team.guideTitle,
      teamGuide: team.guide,
      complexityGuideTitle: complexity.guideTitle,
      complexityGuide: complexity.guide,
      labels: {
        wallScale: wallScale.label,
        complexity: complexity.label,
        team: team.label,
        usage: usage.label,
        timeline: timeline.label,
        siteReadiness: site.label
      }
    };
  }

  function buildSummary(estimate) {
    const deliverables =
      estimate.selectedDeliverables.length > 0
        ? estimate.selectedDeliverables.join(", ")
        : "No additional deliverables selected";

    return [
      "Mural design inquiry estimate",
      "",
      "Project type: " + estimate.projectLabel,
      "Wall / site details: " + (estimate.siteDetails || "Not provided"),
      "Wall or panel count: " + estimate.wallCount,
      "Wall scale: " + estimate.labels.wallScale,
      "Visual complexity: " + estimate.labels.complexity,
      "Painting / installation path: " + estimate.labels.team,
      "Visibility / rights: " + estimate.labels.usage,
      "Timeline: " + estimate.labels.timeline,
      "Site readiness: " + estimate.labels.siteReadiness,
      "Additional deliverables: " + deliverables,
      "",
      "Planning range: " + formatMoney(estimate.low) + " - " + formatMoney(estimate.high),
      "Typical deposit: " + formatMoney(estimate.depositLow) + " - " + formatMoney(estimate.depositHigh),
      "Likely timeline: " + estimate.timelineLow + "-" + estimate.timelineHigh + " weeks",
      "",
      "Please note:",
      "This estimate covers mural design, a site mockup based on supplied photos and dimensions, and art direction only. Painting labor, wall prep, lift or scaffold rental, materials, permits, travel, insurance, contractor fees, and installation costs are separate unless specifically scoped in a final proposal.",
      "",
      "Additional details:",
      estimate.notes || ""
    ].join("\n");
  }

  function getFormOptions(elements) {
    const checkedDeliverables = Array.from(
      elements.form.querySelectorAll('input[name="muralDeliverables"]:checked')
    ).map((input) => input.value);

    return {
      projectType: elements.projectSelect.value,
      siteDetails: elements.detailsInput.value,
      wallCount: elements.wallCountInput.value,
      wallScale: elements.wallScaleSelect.value,
      complexity: elements.complexitySelect.value,
      usage: elements.usageSelect.value,
      team: elements.teamSelect.value,
      timeline: elements.timelineSelect.value,
      siteReadiness: elements.siteReadinessSelect.value,
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
    if (elements.teamGuide) {
      elements.teamGuide.innerHTML =
        "<strong>" +
        escapeHtml(estimate.teamGuideTitle) +
        "</strong><span>" +
        escapeHtml(estimate.teamGuide) +
        "</span>";
    }
    const notesPreview = estimate.notes.length > 140 ? estimate.notes.slice(0, 137) + "..." : estimate.notes;
    elements.notesPreview.classList.toggle("is-hidden", !estimate.notes);
    elements.notesPreview.innerHTML = estimate.notes
      ? "<strong>Details included</strong><span>" + escapeHtml(notesPreview) + "</span>"
      : "";
    elements.emailLink.href =
      "mailto:" +
      STUDIO_EMAIL +
      "?subject=" +
      encodeURIComponent("Mural design inquiry - " + estimate.projectLabel) +
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
      form: root.document.getElementById("muralCalculatorForm"),
      projectSelect: root.document.getElementById("muralProjectSelect"),
      detailsInput: root.document.getElementById("muralDetailsInput"),
      wallCountInput: root.document.getElementById("wallCountInput"),
      wallScaleSelect: root.document.getElementById("wallScaleSelect"),
      complexitySelect: root.document.getElementById("muralComplexitySelect"),
      complexityGuide: root.document.getElementById("muralComplexityGuide"),
      usageSelect: root.document.getElementById("muralUsageSelect"),
      teamSelect: root.document.getElementById("teamSelect"),
      teamGuide: root.document.getElementById("teamGuide"),
      timelineSelect: root.document.getElementById("muralTimelineSelect"),
      siteReadinessSelect: root.document.getElementById("siteReadinessSelect"),
      notesInput: root.document.getElementById("muralNotesInput"),
      estimateRange: root.document.getElementById("muralEstimateRange"),
      estimateNote: root.document.getElementById("muralEstimateNote"),
      depositRange: root.document.getElementById("muralDepositRange"),
      timelineValue: root.document.getElementById("muralTimelineValue"),
      summaryContent: root.document.getElementById("muralSummaryContent"),
      factorList: root.document.getElementById("muralFactorList"),
      notesPreview: root.document.getElementById("muralNotesPreview"),
      copyButton: root.document.getElementById("muralCopyButton"),
      emailLink: root.document.getElementById("muralEmailLink"),
      copyStatus: root.document.getElementById("muralCopyStatus")
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
    wallScaleProfiles,
    complexityProfiles,
    teamProfiles,
    usageProfiles,
    deliverableProfiles
  };

  root.mcMuralDesignCalculator = api;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  init();
})(typeof window !== "undefined" ? window : globalThis);
