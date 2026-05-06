(function (root) {
  const STUDIO_EMAIL = "mnchrmcnvs@gmail.com";

  const projectProfiles = {
    "private-keepsake": {
      label: "Loose personal artwork",
      base: 375,
      floor: 300,
      weeks: [3, 6],
      note: "Best fit for loose drawings, minimal color, simple personal gifts, and clear references.",
      guideTitle: "Loose personal artwork",
      guide: "Choose this for a lighter, personal piece with a simple subject, clear reference, and limited revision needs."
    },
    "refined-portrait": {
      label: "Developed private commission",
      base: 1100,
      floor: 950,
      weeks: [4, 8],
      note: "Best fit for pets, people, homes, couples, and personal work that needs a more finished hand.",
      guideTitle: "Developed private commission",
      guide: "Choose this for most finished personal commissions, including portraits, pets, homes, couples, and meaningful gifts."
    },
    "detailed-scene": {
      label: "Detailed place, architecture, or scene",
      base: 4000,
      floor: 3200,
      weeks: [6, 10],
      note: "Best fit for homes, harbor towns, venues, streetscapes, boats, architecture, or scenes with many important details.",
      guideTitle: "Detailed place, architecture, or scene",
      guide: "Choose this when the artwork has buildings, interiors, landscapes, boats, venues, streets, or many small details that need careful drawing."
    },
    "premium-scale": {
      label: "Premium large-scale custom artwork",
      base: 6500,
      floor: 6000,
      weeks: [10, 18],
      note: "Best fit for oversized files, public-facing artwork, complex scenes, mural-ready concepts, and projects where scale and detail drive the fee.",
      guideTitle: "Premium large-scale custom artwork",
      guide: "Choose this when the file needs to hold up very large, the reference is difficult, the project is public-facing, or the scope needs a formal studio quote after review."
    },
    "institutional-portrait": {
      label: "Institutional or public-facing work",
      base: 7000,
      floor: 5000,
      weeks: [8, 14],
      note: "Best fit for universities, organizations, public display, donor-facing presentation, and formal portraiture.",
      guideTitle: "Institutional or public-facing work",
      guide: "Choose this for organizations, donor-facing work, public display, formal portraits, or artwork that represents a group rather than only a private gift."
    },
    "commercial-campaign": {
      label: "Commercial or campaign artwork",
      base: 5600,
      floor: 4000,
      weeks: [8, 14],
      note: "Best fit for campaign visuals, branded artwork, publication needs, and organization-wide assets.",
      guideTitle: "Commercial or campaign artwork",
      guide: "Choose this when the artwork supports a business, event, campaign, publication, brand story, or larger public communication."
    },
    "public-license": {
      label: "Licensing, merchandise, or broad use",
      base: 9000,
      floor: 7000,
      weeks: [10, 18],
      note: "Best fit for published, reproduced, sold, or broadly distributed artwork.",
      guideTitle: "Licensing, merchandise, or broad use",
      guide: "Choose this when the artwork may be reproduced, sold, licensed, printed on products, used for fundraising, or distributed beyond one private display."
    }
  };

  const complexityProfiles = {
    simple: {
      label: "Simple subject or direct study",
      multiplier: 0.9,
      weeks: 0,
      factor: "Simple subject, direct composition, or light study",
      guideTitle: "Choose Simple when the structure is straightforward.",
      guide: "Example: one pet, one person, one house, a clean background, strong reference photos, and few details that need invention."
    },
    standard: {
      label: "Developed artwork",
      multiplier: 1.15,
      weeks: 1,
      factor: "Developed composition with a more finished hand",
      guideTitle: "Choose Developed for most private commissions.",
      guide: "Example: a portrait, pet, couple, family, or place with thoughtful composition, light cleanup, normal detail, and a finished color approach."
    },
    complex: {
      label: "Detailed subject, setting, or multiple elements",
      multiplier: 1.45,
      weeks: 2,
      factor: "Multiple subjects, detailed setting, or heavy refinement",
      guideTitle: "Choose Detailed when the piece has more moving parts.",
      guide: "Example: multiple people or animals, architecture, detailed setting, several reference images, heavy retouching, or a more formal finish."
    },
    "premium-scene": {
      label: "Premium complex scene",
      multiplier: 1.85,
      weeks: 3,
      factor: "Premium scene with architecture, boats, vehicles, docks, or many important details",
      guideTitle: "Choose Premium Scene when the artwork must be interpreted and built.",
      guide: "Example: harbor towns, streetscapes, boats, multiple buildings, docks, interiors, or large files where weak reference material requires artist interpretation."
    },
    custom: {
      label: "Concept-led or public-facing artwork",
      multiplier: 2.1,
      weeks: 4,
      factor: "Concept development, narrative, or unusual scope",
      guideTitle: "Choose Concept-led when the idea still needs to be designed.",
      guide: "Example: symbolic imagery, campaign concepts, brand direction, narrative scenes, public-facing work, or anything that needs sketches and art direction before production."
    }
  };

  const sizeProfiles = {
    small: {
      label: "Small or simple display",
      multiplier: 0.9,
      weeks: 0,
      guideTitle: "Choose Small for simple personal display.",
      guide: "Example: a small framed gift, shelf-size print, simple home display, or artwork that does not need to carry a room."
    },
    medium: {
      label: "Standard display size",
      multiplier: 1,
      weeks: 0,
      guideTitle: "Choose Standard for most commissions.",
      guide: "Example: a finished piece meant for normal wall display, a framed gift, an office, or a polished print in a common size range."
    },
    large: {
      label: "Large display or detailed wall piece",
      multiplier: 1.22,
      weeks: 1,
      guideTitle: "Choose Large when scale affects the work.",
      guide: "Example: a prominent wall piece, formal presentation, larger portrait, or artwork where detail and viewing distance matter."
    },
    installation: {
      label: "Oversized, installation, or multi-format",
      multiplier: 1.55,
      weeks: 3,
      guideTitle: "Choose Oversized when the project has production needs.",
      guide: "Example: multiple sizes, installation planning, public display, files for several formats, or artwork that needs to work beyond one framed piece."
    },
    "exhibition-scale": {
      label: "Exhibition scale / about 4' x 6' or larger",
      multiplier: 1.8,
      weeks: 2,
      guideTitle: "Choose Exhibition Scale when the file has to hold up very large.",
      guide: "Example: a 4' x 6' print, mural-scale design file, large scenic artwork, or a piece where small drawing decisions become visible at full size."
    }
  };

  const subjectProfiles = {
    animal: {
      label: "Animal or pet",
      multiplier: 1,
      weeks: 0,
      factor: "Animal or pet subject"
    },
    person: {
      label: "Person or portrait",
      multiplier: 1.05,
      weeks: 0,
      factor: "Person or portrait subject"
    },
    "couple-family": {
      label: "Couple or family",
      multiplier: 1.18,
      weeks: 1,
      factor: "Couple, family, or multiple figure subject"
    },
    "house-building": {
      label: "House or building",
      multiplier: 1.16,
      weeks: 1,
      factor: "House, building, or architectural subject"
    },
    "place-event": {
      label: "Place, venue, or event",
      multiplier: 1.22,
      weeks: 1,
      factor: "Place, venue, or event subject"
    },
    "architecture-landscape": {
      label: "Architecture, landscape, town, or harbor scene",
      multiplier: 1.35,
      weeks: 1,
      factor: "Architecture, landscape, town, or harbor scene"
    },
    "vehicle-boat-scene": {
      label: "Vehicle, boat, dock, or detailed object scene",
      multiplier: 1.38,
      weeks: 1,
      factor: "Vehicle, boat, dock, or detailed object scene"
    },
    "mural-public-art": {
      label: "Mural, public art, or installation concept",
      multiplier: 1.45,
      weeks: 2,
      factor: "Mural, public art, or installation concept"
    },
    "business-brand": {
      label: "Business, brand, or campaign",
      multiplier: 1.3,
      weeks: 1,
      factor: "Business, brand, or campaign subject"
    },
    other: {
      label: "Something else",
      multiplier: 1.15,
      weeks: 1,
      factor: "Custom subject matter"
    }
  };

  const finishProfiles = {
    "loose-minimal": {
      label: "Loose drawing / minimal color",
      multiplier: 0.85,
      weeks: 0,
      factor: "Loose drawing or minimal color finish"
    },
    "watercolor-loose": {
      label: "Loose sketch with watercolor",
      multiplier: 1.05,
      weeks: 0,
      factor: "Loose sketch with watercolor finish"
    },
    "developed-color": {
      label: "Developed color artwork",
      multiplier: 1.25,
      weeks: 1,
      factor: "Developed color artwork finish"
    },
    "rendered-oil": {
      label: "Rendered digital oil painting look",
      multiplier: 1.65,
      weeks: 3,
      factor: "Rendered digital oil painting finish"
    }
  };

  const usageProfiles = {
    personal: {
      label: "Personal display only",
      percent: 0,
      flat: 0,
      factor: "No commercial or public usage rights"
    },
    "family-prints": {
      label: "Personal gift with small print reproduction",
      percent: 0.08,
      flat: 75,
      factor: "Small private reproduction or gift prints"
    },
    "internal-business": {
      label: "Business or organization internal display",
      percent: 0.25,
      flat: 500,
      factor: "Internal business or institutional usage"
    },
    "public-marketing": {
      label: "Public marketing, publication, donor, or event use",
      percent: 0.55,
      flat: 1000,
      factor: "Public-facing use, publication, donor, or event visibility"
    },
    merchandise: {
      label: "Merchandise, fundraising, or broad licensing use",
      percent: 1,
      flat: 2000,
      factor: "Merchandise, resale, fundraising, or broad licensing"
    }
  };

  const timelineProfiles = {
    flexible: {
      label: "Flexible timing",
      multiplier: 0.95,
      weekShift: [1, 3],
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
      weekShift: [-1, -2],
      factor: "Priority schedule"
    },
    rush: {
      label: "Rush or immovable event date",
      multiplier: 1.55,
      weekShift: [-2, -4],
      factor: "Rush or fixed event deadline"
    }
  };

  const referenceProfiles = {
    ready: {
      label: "References are clear and ready",
      flat: 0,
      weeks: 0,
      factor: "References are clear and ready"
    },
    mixed: {
      label: "References need cleanup or selection help",
      flat: 175,
      weeks: 1,
      factor: "Reference cleanup or selection support"
    },
    "limited-reference": {
      label: "Small, blurry, or incomplete reference requiring interpretation",
      flat: 1800,
      weeks: 2,
      factor: "Small, blurry, or incomplete reference requiring artist interpretation"
    },
    research: {
      label: "Studio research or source gathering needed",
      flat: 550,
      weeks: 2,
      factor: "Studio research or source gathering"
    },
    "art-direction": {
      label: "Brand, art direction, or concept work needed",
      flat: 900,
      weeks: 3,
      factor: "Brand, art direction, or concept support"
    }
  };

  const deliverableProfiles = {
    "archival-print": {
      label: "Archival print or printed proof",
      flat: 125,
      weeks: 0
    },
    "edition-package": {
      label: "Edition, print run, or collector package planning",
      flat: 450,
      weeks: 1
    },
    "production-assets": {
      label: "Production-ready files for campaign, publication, or vendor use",
      flat: 900,
      weeks: 1
    },
    "large-format-production": {
      label: "Large-format print file prep, proofing, or production coordination",
      flat: 1600,
      weeks: 1
    },
    "merch-adaptation": {
      label: "Merchandise or apparel adaptation",
      flat: 1250,
      weeks: 2
    }
  };

  function clampArtworkCount(value) {
    const parsed = Number.parseInt(value, 10);

    if (Number.isNaN(parsed)) {
      return 1;
    }

    return Math.min(Math.max(parsed, 1), 12);
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
    const projectType = options.projectType || "private-keepsake";
    const profile = getProfile(projectProfiles, projectType, "private-keepsake");
    const complexity = getProfile(complexityProfiles, options.complexity, "standard");
    const finish = getProfile(finishProfiles, options.finish, "watercolor-loose");
    const size = getProfile(sizeProfiles, options.size, "medium");
    const subjectProfile = getProfile(subjectProfiles, options.subject, "animal");
    const usage = getProfile(usageProfiles, options.usage, "personal");
    const timeline = getProfile(timelineProfiles, options.timeline, "standard");
    const reference = getProfile(referenceProfiles, options.reference, "ready");
    const deliverables = Array.isArray(options.deliverables) ? options.deliverables : [];
    const subject = subjectProfile.label;
    const subjectDetails = typeof options.subjectDetails === "string" ? options.subjectDetails.trim() : "";
    const details = typeof options.details === "string" ? options.details.trim() : "";
    const artworkCount = clampArtworkCount(options.artworkCount);
    const additionalArtworkMultiplier = artworkCount > 1 ? 1 + (artworkCount - 1) * 0.7 : 1;
    const creativeBase =
      profile.base *
      subjectProfile.multiplier *
      complexity.multiplier *
      finish.multiplier *
      size.multiplier *
      additionalArtworkMultiplier;
    const usageAmount = Math.max(creativeBase * usage.percent, usage.flat);
    const deliverableAmount = deliverables.reduce((total, key) => {
      const deliverable = deliverableProfiles[key];
      return total + (deliverable ? deliverable.flat : 0);
    }, 0);
    const deliverableWeeks = deliverables.reduce((total, key) => {
      const deliverable = deliverableProfiles[key];
      return total + (deliverable ? deliverable.weeks : 0);
    }, 0);
    const subtotal = creativeBase + usageAmount + reference.flat + deliverableAmount;
    const adjustedSubtotal = subtotal * timeline.multiplier;
    const increment = adjustedSubtotal >= 10000 ? 250 : adjustedSubtotal >= 2500 ? 100 : 25;
    const depositIncrement = increment >= 250 ? 250 : 50;
    const low = Math.max(profile.floor, roundToIncrement(adjustedSubtotal * 0.85, increment));
    const high = Math.max(low + 100, roundToIncrement(adjustedSubtotal * 1.25, increment));
    const depositLow = roundToIncrement(low * 0.5, depositIncrement);
    const depositHigh = roundToIncrement(high * 0.5, depositIncrement);
    const timelineLow = Math.max(
      2,
      profile.weeks[0] +
        subjectProfile.weeks +
        complexity.weeks +
        finish.weeks +
        size.weeks +
        reference.weeks +
        deliverableWeeks +
        timeline.weekShift[0]
    );
    const timelineHigh = Math.max(
      timelineLow + 1,
      profile.weeks[1] +
        subjectProfile.weeks +
        complexity.weeks +
        finish.weeks +
        size.weeks +
        reference.weeks +
        deliverableWeeks +
        timeline.weekShift[1]
    );
    const selectedDeliverables = deliverables
      .map((key) => deliverableProfiles[key])
      .filter(Boolean)
      .map((item) => item.label);
    const factors = [
      "Subject matter: " + (subjectDetails ? subject + " - " + subjectDetails : subject),
      subjectProfile.factor,
      complexity.factor,
      finish.factor,
      size.label,
      usage.factor,
      reference.factor,
      timeline.factor
    ];

    if (artworkCount > 1) {
      factors.unshift(artworkCount + " finished artworks");
    }

    selectedDeliverables.forEach((label) => factors.push(label));
    const premiumScope = adjustedSubtotal >= 15000 || projectType === "premium-scale";

    if (premiumScope) {
      factors.push("Premium scope: final quote may exceed this range after studio review");
    }

    return {
      projectType,
      projectLabel: profile.label,
      projectNote:
        profile.note +
        (premiumScope
          ? " This is a premium custom scope; final pricing may move above the calculator range after reference, usage, print scale, and schedule review."
          : ""),
      artworkCount,
      low,
      high,
      depositLow,
      depositHigh,
      timelineLow,
      timelineHigh,
      factors,
      selectedDeliverables,
      subject,
      subjectDetails,
      details,
      projectGuideTitle: profile.guideTitle,
      projectGuide: profile.guide,
      complexityGuideTitle: complexity.guideTitle,
      complexityGuide: complexity.guide,
      sizeGuideTitle: size.guideTitle,
      sizeGuide: size.guide,
      labels: {
        complexity: complexity.label,
        finish: finish.label,
        size: size.label,
        usage: usage.label,
        timeline: timeline.label,
        reference: reference.label
      }
    };
  }

  function buildSummary(estimate) {
    const deliverables =
      estimate.selectedDeliverables.length > 0
        ? estimate.selectedDeliverables.join(", ")
        : "No additional deliverables selected";

    return [
      "Commission inquiry estimate",
      "",
      "Project type: " + estimate.projectLabel,
      "Subject matter: " + estimate.subject,
      "Subject details: " + (estimate.subjectDetails || "Not provided"),
      "Finished artwork count: " + estimate.artworkCount,
      "Creative complexity: " + estimate.labels.complexity,
      "Finish direction: " + estimate.labels.finish,
      "Display size: " + estimate.labels.size,
      "Intended use: " + estimate.labels.usage,
      "Timeline: " + estimate.labels.timeline,
      "Reference readiness: " + estimate.labels.reference,
      "Additional deliverables: " + deliverables,
      "",
      "Planning range: " + formatMoney(estimate.low) + " - " + formatMoney(estimate.high),
      "Typical deposit: " + formatMoney(estimate.depositLow) + " - " + formatMoney(estimate.depositHigh),
      "Likely timeline: " + estimate.timelineLow + "-" + estimate.timelineHigh + " weeks",
      "",
      "Additional details:",
      estimate.details || ""
    ].join("\n");
  }

  function getFormOptions(elements) {
    const checkedDeliverables = Array.from(
      elements.form.querySelectorAll('input[name="deliverables"]:checked')
    ).map((input) => input.value);

    return {
      projectType: elements.projectTypeSelect.value,
      subject: elements.subjectSelect ? elements.subjectSelect.value : "animal",
      subjectDetails: elements.subjectDetailsInput ? elements.subjectDetailsInput.value : "",
      artworkCount: elements.artworkCountInput.value,
      size: elements.sizeSelect.value,
      complexity: elements.complexitySelect.value,
      finish: elements.finishSelect ? elements.finishSelect.value : "watercolor-loose",
      usage: elements.usageSelect.value,
      timeline: elements.timelineSelect.value,
      reference: elements.referenceSelect.value,
      deliverables: checkedDeliverables,
      details: elements.detailsInput ? elements.detailsInput.value : ""
    };
  }

  function setText(element, value) {
    if (element) {
      element.textContent = value;
    }
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
    if (elements.complexityGuide) {
      elements.complexityGuide.innerHTML =
        "<strong>" +
        escapeHtml(estimate.complexityGuideTitle) +
        "</strong><span>" +
        escapeHtml(estimate.complexityGuide) +
        "</span>";
    }
    if (elements.projectTypeGuide) {
      elements.projectTypeGuide.innerHTML =
        "<strong>" +
        escapeHtml(estimate.projectGuideTitle) +
        "</strong><span>" +
        escapeHtml(estimate.projectGuide) +
        "</span>";
    }
    if (elements.sizeGuide) {
      elements.sizeGuide.innerHTML =
        "<strong>" +
        escapeHtml(estimate.sizeGuideTitle) +
        "</strong><span>" +
        escapeHtml(estimate.sizeGuide) +
        "</span>";
    }
    if (elements.detailsPreview) {
      const detailsPreview = estimate.details.length > 140 ? estimate.details.slice(0, 137) + "..." : estimate.details;
      elements.detailsPreview.classList.toggle("is-hidden", !estimate.details);
      elements.detailsPreview.innerHTML = estimate.details
        ? "<strong>Details included</strong><span>" + escapeHtml(detailsPreview) + "</span>"
        : "";
    }
    elements.emailLink.href =
      "mailto:" +
      STUDIO_EMAIL +
      "?subject=" +
      encodeURIComponent("Commission inquiry - " + estimate.projectLabel) +
      "&body=" +
      encodeURIComponent(summary);
    elements.copyButton.dataset.summary = summary;
    setText(elements.copyStatus, "");
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
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
      form: root.document.getElementById("calculatorForm"),
      projectTypeSelect: root.document.getElementById("projectTypeSelect"),
      projectTypeGuide: root.document.getElementById("projectTypeGuide"),
      subjectSelect: root.document.getElementById("subjectSelect"),
      subjectDetailsInput: root.document.getElementById("subjectDetailsInput"),
      artworkCountInput: root.document.getElementById("artworkCountInput"),
      sizeSelect: root.document.getElementById("sizeSelect"),
      sizeGuide: root.document.getElementById("sizeGuide"),
      complexitySelect: root.document.getElementById("complexitySelect"),
      complexityGuide: root.document.getElementById("complexityGuide"),
      finishSelect: root.document.getElementById("finishSelect"),
      usageSelect: root.document.getElementById("usageSelect"),
      timelineSelect: root.document.getElementById("timelineSelect"),
      referenceSelect: root.document.getElementById("referenceSelect"),
      detailsInput: root.document.getElementById("detailsInput"),
      estimateRange: root.document.getElementById("estimateRange"),
      estimateNote: root.document.getElementById("estimateNote"),
      depositRange: root.document.getElementById("depositRange"),
      timelineValue: root.document.getElementById("timelineValue"),
      summaryContent: root.document.getElementById("summaryContent"),
      factorList: root.document.getElementById("factorList"),
      detailsPreview: root.document.getElementById("detailsPreview"),
      copyButton: root.document.getElementById("copyButton"),
      emailLink: root.document.getElementById("emailLink"),
      copyStatus: root.document.getElementById("copyStatus")
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
    subjectProfiles,
    finishProfiles,
    usageProfiles,
    deliverableProfiles
  };

  root.mcCommissionCalculator = api;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  init();
})(typeof window !== "undefined" ? window : globalThis);
