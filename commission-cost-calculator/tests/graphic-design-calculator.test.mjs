import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const scriptPath = path.resolve(__dirname, "../graphic-design.js");
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

test("defined design support keeps the studio floor", () => {
  const calculator = loadCalculator();
  const estimate = calculator.calculateEstimate({
    projectType: "design-support",
    deliverableCount: 1,
    complexity: "production",
    usage: "internal",
    timeline: "flexible",
    assetReadiness: "ready",
    deliverables: []
  });

  assert.equal(estimate.low, 500);
  assert.ok(estimate.high > estimate.low);
  assert.equal(estimate.depositLow, 250);
});

test("public packaging and broad usage move into a higher range", () => {
  const calculator = loadCalculator();
  const internal = calculator.calculateEstimate({
    projectType: "campaign-collateral",
    deliverableCount: 1,
    complexity: "designed-piece",
    usage: "internal",
    timeline: "standard",
    assetReadiness: "ready",
    deliverables: []
  });
  const packaging = calculator.calculateEstimate({
    projectType: "packaging-public",
    deliverableCount: 4,
    complexity: "full-direction",
    usage: "broad-license",
    timeline: "priority",
    assetReadiness: "strategy",
    deliverables: ["print-ready", "brand-guide", "artwork-integration"]
  });

  assert.ok(packaging.low > internal.low * 8);
  assert.ok(packaging.high > internal.high * 8);
  assert.ok(packaging.selectedDeliverables.includes("Mini brand guide or usage notes"));
});

test("summary includes design scope and pricing range", () => {
  const calculator = loadCalculator();
  const estimate = calculator.calculateEstimate({
    projectType: "identity-system",
    projectDetails: "Gallery launch identity",
    deliverableCount: 3,
    complexity: "small-system",
    usage: "campaign",
    timeline: "standard",
    assetReadiness: "messy",
    deliverables: ["template-suite"],
    notes: "Needs print and digital event materials."
  });
  const summary = calculator.buildSummary(estimate);

  assert.match(summary, /Identity system or art direction/);
  assert.match(summary, /Gallery launch identity/);
  assert.match(summary, /Final deliverable count: 3/);
  assert.match(summary, /Reusable templates or layout system/);
  assert.match(summary, /Planning range: \$[0-9,]+ - \$[0-9,]+/);
  assert.match(summary, /Needs print and digital event materials/);
});
