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

test("mural first look stays low-commitment and exploratory", () => {
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

  assert.equal(estimate.projectLabel, "Mural first look");
  assert.equal(estimate.low, 300);
  assert.ok(estimate.high <= 500);
  assert.ok(estimate.factors.includes("First look is a low-commitment direction test; full wall-photo mockup begins with the complete mural design package"));
  assert.ok(estimate.factors.includes("Use this to choose the direction; usage rights and production files begin with an approved design package"));
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
    onSiteHours: 4,
    usage: "public-art",
    timeline: "priority",
    siteReadiness: "approval-process",
    deliverables: ["paint-guide", "vendor-files", "installation-coordination"],
    notes: "Committee review and opening date are already set."
  });
  const summary = calculator.buildSummary(estimate);

  assert.ok(estimate.low >= 12000);
  assert.ok(estimate.high <= 40000);
  assert.ok(estimate.high > estimate.low);
  assert.equal(estimate.onSiteDirectionAmount, 400);
  assert.match(summary, /Please note/);
  assert.match(summary, /Painting labor, wall prep/);
  assert.match(summary, /wall-photo site mockup/);
  assert.match(summary, /Joëlle does not provide on-site painting labor/);
  assert.match(summary, /On-site direction hours: 4 at \$100\/hour \(\$400\)/);
  assert.match(summary, /outside 35 miles of Akron, Ohio/);
  assert.match(summary, /Exterior civic wall with neighborhood imagery/);
  assert.match(summary, /Production-ready files/);
});

test("public mural labels separate scope from visibility and hourly direction", () => {
  const calculator = loadCalculator();
  const estimate = calculator.calculateEstimate({
    projectType: "public-art-system",
    wallScale: "exterior-public",
    complexity: "premium-public",
    team: "client-team",
    usage: "public-art",
    timeline: "standard",
    siteReadiness: "ready",
    onSiteHours: 2,
    deliverables: []
  });

  assert.equal(estimate.projectLabel, "Public art, campaign, or institution-scale mural");
  assert.equal(estimate.labels.complexity, "Narrative concept or complex mural system");
  assert.equal(estimate.labels.team, "Work with client's painter or production team");
  assert.ok(!estimate.labels.complexity.includes("public-facing"));
  assert.ok(estimate.factors.includes("On-site direction: 2 hours at $100/hour"));
});

test("painter-ready handoff does not imply on-site painting labor", () => {
  const calculator = loadCalculator();
  const estimate = calculator.calculateEstimate({
    projectType: "art-direction-handoff",
    wallScale: "large",
    complexity: "illustrative",
    team: "client-team",
    usage: "business-public",
    timeline: "standard",
    siteReadiness: "ready",
    onSiteHours: 2,
    deliverables: ["paint-guide", "vendor-files"]
  });
  const summary = calculator.buildSummary(estimate);

  assert.equal(estimate.projectLabel, "Mural artwork + painter-ready handoff");
  assert.equal(estimate.onSiteDirectionAmount, 200);
  assert.match(summary, /Joëlle does not provide on-site painting labor/);
});
