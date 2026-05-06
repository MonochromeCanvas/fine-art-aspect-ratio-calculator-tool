import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const scriptPath = path.resolve(__dirname, "../mural-design.js");
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

test("mural concept study keeps a professional design floor", () => {
  const calculator = loadCalculator();
  const estimate = calculator.calculateEstimate({
    projectType: "concept-study",
    wallScale: "small",
    complexity: "graphic",
    team: "client-team",
    usage: "private-interior",
    timeline: "flexible",
    siteReadiness: "ready",
    deliverables: []
  });

  assert.equal(estimate.low, 900);
  assert.ok(estimate.high >= 1000);
});

test("public mural with handoff and approvals moves into premium territory", () => {
  const calculator = loadCalculator();
  const estimate = calculator.calculateEstimate({
    projectType: "public-art-system",
    siteDetails: "Exterior civic wall with neighborhood imagery",
    wallCount: 2,
    wallScale: "exterior-public",
    complexity: "premium-public",
    team: "coordination",
    usage: "public-art",
    timeline: "priority",
    siteReadiness: "approval-process",
    deliverables: ["paint-guide", "vendor-files", "installation-coordination"],
    notes: "Committee review and opening date are already set."
  });
  const summary = calculator.buildSummary(estimate);

  assert.ok(estimate.low >= 12000);
  assert.ok(estimate.high <= 30000);
  assert.ok(estimate.high > estimate.low);
  assert.match(summary, /Please note/);
  assert.match(summary, /Painting labor, wall prep/);
  assert.match(summary, /site mockup/);
  assert.match(summary, /Exterior civic wall with neighborhood imagery/);
  assert.match(summary, /Production-ready files/);
});
