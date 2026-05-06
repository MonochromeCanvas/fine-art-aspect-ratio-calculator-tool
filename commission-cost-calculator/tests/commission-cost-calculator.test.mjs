import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const scriptPath = path.resolve(__dirname, "../script.js");
const script = fs.readFileSync(scriptPath, "utf8");

function loadCalculator() {
  const context = {
    module: { exports: {} },
    exports: {},
    console,
    Intl,
    Math,
    Number,
    String,
    Array,
    Object,
    encodeURIComponent,
    globalThis: {}
  };

  context.globalThis = context;
  vm.createContext(context);
  vm.runInContext(script, context);
  return context.module.exports;
}

test("loose personal artwork estimates keep the studio floor", () => {
  const calculator = loadCalculator();
  const estimate = calculator.calculateEstimate({
    projectType: "private-keepsake",
    artworkCount: 1,
    size: "small",
    complexity: "simple",
    finish: "loose-minimal",
    usage: "personal",
    timeline: "flexible",
    reference: "ready",
    deliverables: []
  });

  assert.equal(estimate.low, 300);
  assert.equal(estimate.high, 400);
  assert.equal(estimate.depositLow, 150);
  assert.equal(estimate.timelineLow, 4);
});

test("commercial usage materially increases the planning range", () => {
  const calculator = loadCalculator();
  const personal = calculator.calculateEstimate({
    projectType: "refined-portrait",
    artworkCount: 1,
    size: "medium",
    complexity: "standard",
    finish: "watercolor-loose",
    usage: "personal",
    timeline: "standard",
    reference: "ready",
    deliverables: []
  });
  const commercial = calculator.calculateEstimate({
    projectType: "refined-portrait",
    artworkCount: 1,
    size: "medium",
    complexity: "standard",
    finish: "watercolor-loose",
    usage: "public-marketing",
    timeline: "standard",
    reference: "ready",
    deliverables: ["production-assets"]
  });

  assert.ok(commercial.low > personal.low * 1.7);
  assert.ok(commercial.high > personal.high * 1.7);
  assert.ok(commercial.selectedDeliverables.includes("Production-ready files for campaign, publication, or vendor use"));
});

test("summary includes the estimate and selected scope", () => {
  const calculator = loadCalculator();
  const estimate = calculator.calculateEstimate({
    projectType: "institutional-portrait",
    subject: "business-brand",
    subjectDetails: "Founder portrait for main lobby",
    artworkCount: 2,
    size: "large",
    complexity: "complex",
    finish: "developed-color",
    usage: "internal-business",
    timeline: "priority",
    reference: "mixed",
    deliverables: ["archival-print"],
    details: "Needed for a board presentation."
  });
  const summary = calculator.buildSummary(estimate);

  assert.match(summary, /Institutional or public-facing work/);
  assert.match(summary, /Business, brand, or campaign/);
  assert.match(summary, /Founder portrait for main lobby/);
  assert.match(summary, /Finished artwork count: 2/);
  assert.match(summary, /Archival print or printed proof/);
  assert.match(summary, /Planning range: \$[0-9,]+ - \$[0-9,]+/);
  assert.match(summary, /Needed for a board presentation/);
});

test("large harbor scene with weak reference moves into premium territory", () => {
  const calculator = loadCalculator();
  const looseWatercolor = calculator.calculateEstimate({
    projectType: "detailed-scene",
    subject: "architecture-landscape",
    subjectDetails: "Harbor town with buildings, docks, and boats",
    artworkCount: 1,
    size: "exhibition-scale",
    complexity: "premium-scene",
    finish: "watercolor-loose",
    usage: "personal",
    timeline: "standard",
    reference: "limited-reference",
    deliverables: ["large-format-production"]
  });
  const renderedOil = calculator.calculateEstimate({
    projectType: "detailed-scene",
    subject: "architecture-landscape",
    subjectDetails: "Harbor town with buildings, docks, and boats",
    artworkCount: 1,
    size: "exhibition-scale",
    complexity: "premium-scene",
    finish: "rendered-oil",
    usage: "personal",
    timeline: "standard",
    reference: "limited-reference",
    deliverables: ["large-format-production"]
  });
  const summary = calculator.buildSummary(looseWatercolor);

  assert.ok(looseWatercolor.low >= 17000);
  assert.ok(looseWatercolor.high >= 20000);
  assert.ok(renderedOil.low > looseWatercolor.low);
  assert.ok(renderedOil.high > 30000);
  assert.match(summary, /Harbor town with buildings, docks, and boats/);
  assert.match(summary, /Large-format print file prep/);
});
