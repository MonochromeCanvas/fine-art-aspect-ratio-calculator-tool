import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const htmlPath = path.resolve(__dirname, "../index.html");
const scriptPath = path.resolve(__dirname, "../script.js");
const html = fs.readFileSync(htmlPath, "utf8");
const script = fs.readFileSync(scriptPath, "utf8");

class FakeClassList {
  constructor() {
    this.values = new Set();
  }

  add(...classNames) {
    classNames.forEach((className) => this.values.add(className));
  }

  remove(...classNames) {
    classNames.forEach((className) => this.values.delete(className));
  }

  toggle(className, force) {
    if (force === undefined) {
      if (this.values.has(className)) {
        this.values.delete(className);
        return false;
      }
      this.values.add(className);
      return true;
    }

    if (force) {
      this.values.add(className);
      return true;
    }

    this.values.delete(className);
    return false;
  }

  contains(className) {
    return this.values.has(className);
  }
}

class FakeElement {
  constructor(id = "") {
    this.id = id;
    this.value = "";
    this.checked = false;
    this.disabled = false;
    this.hidden = false;
    this.textContent = "";
    this._innerHTML = "";
    this.children = [];
    this.listeners = {};
    this.className = "";
    this.classList = new FakeClassList();
    this.style = { setProperty() {} };
    this.href = "#";
    this.src = "";
    this.title = "";
    this.download = "";
  }

  get innerHTML() {
    return this._innerHTML;
  }

  set innerHTML(value) {
    this._innerHTML = value;
    this.children = [];
  }

  appendChild(child) {
    this.children.push(child);
    return child;
  }

  removeChild(child) {
    this.children = this.children.filter((item) => item !== child);
  }

  addEventListener(type, handler) {
    this.listeners[type] = handler;
  }

  setAttribute(name, value) {
    this[name] = value;
  }

  removeAttribute(name) {
    delete this[name];
  }

  click() {
    return this.dispatch("click");
  }

  dispatch(type, event = {}) {
    if (!this.listeners[type]) {
      return undefined;
    }

    return this.listeners[type]({
      currentTarget: this,
      target: this,
      preventDefault() {},
      ...event
    });
  }

  getBoundingClientRect() {
    return { left: 0, top: 0, width: 220, height: 280 };
  }
}

function createHarness() {
  const ids = [...html.matchAll(/id="([^"]+)"/g)].map((match) => match[1]);
  const elements = new Map(ids.map((id) => [id, new FakeElement(id)]));
  const previewFrame = new FakeElement("previewFrame");
  const body = new FakeElement("body");
  let nextImageDimensions = { width: 4800, height: 6000 };

  const document = {
    body,
    getElementById(id) {
      return elements.get(id) || null;
    },
    querySelector(selector) {
      return selector === ".wall-frame" ? previewFrame : null;
    },
    createElement(tag) {
      return new FakeElement(tag);
    }
  };

  const fakeWindow = {
    document,
    opener: null,
    location: {
      href: "file:///invoice-my-client/index.html",
      pathname: "/invoice-my-client/index.html",
      search: "",
      hash: ""
    },
    history: { replaceState() {} },
    addEventListener() {},
    removeEventListener() {},
    matchMedia() {
      return {
        matches: false,
        addEventListener() {},
        addListener() {}
      };
    },
    setTimeout,
    open() {
      return null;
    }
  };

  class FakeImage {
    set src(_value) {
      this.naturalWidth = nextImageDimensions.width;
      this.naturalHeight = nextImageDimensions.height;
      queueMicrotask(() => {
        if (typeof this.onload === "function") {
          this.onload();
        }
      });
    }
  }

  const context = {
    window: fakeWindow,
    document,
    console,
    navigator: {
      clipboard: {
        writeText() {
          return Promise.resolve();
        }
      }
    },
    URL: {
      createObjectURL(file) {
        return "blob:" + (file.name || "file");
      },
      revokeObjectURL() {}
    },
    Image: FakeImage,
    File: class FakeFile {
      constructor(parts, name, options = {}) {
        this.parts = parts;
        this.name = name;
        this.type = options.type || "image/jpeg";
        this.lastModified = options.lastModified || Date.now();
      }
    },
    Blob: class FakeBlob {},
    indexedDB: undefined,
    setTimeout,
    clearTimeout,
    Intl,
    Math,
    Date,
    Map,
    Set,
    URLSearchParams,
    Error,
    Promise,
    encodeURIComponent,
    decodeURIComponent
  };

  context.global = context;
  context.globalThis = context;
  fakeWindow.indexedDB = undefined;

  vm.createContext(context);
  vm.runInContext(script, context);

  async function flush() {
    await Promise.resolve();
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  async function uploadFile(name, { width = 4800, height = 6000, type = "image/jpeg" } = {}) {
    nextImageDimensions = { width, height };
    const fileInput = get("fileInput");
    const result = fileInput.dispatch("change", {
      target: {
        files: [{ name, type }]
      }
    });
    await result;
    await flush();
  }

  function get(id) {
    return elements.get(id);
  }

  async function input(id, value) {
    const element = get(id);
    element.value = value;
    const result = element.dispatch("input");
    await result;
    await flush();
  }

  async function change(id, value) {
    const element = get(id);
    if (value !== undefined) {
      element.value = value;
    }
    const result = element.dispatch("change");
    await result;
    await flush();
  }

  async function setChecked(id, checked) {
    const element = get(id);
    element.checked = checked;
    const result = element.dispatch("change");
    await result;
    await flush();
  }

  async function click(id) {
    const result = get(id).click();
    await result;
    await flush();
  }

  async function clickArtworkTab(index) {
    const tab = get("artworkTabs").children[index];
    const result = tab.click();
    await result;
    await flush();
  }

  return {
    get,
    input,
    change,
    setChecked,
    click,
    clickArtworkTab,
    uploadFile,
    flush
  };
}

test("per-artwork invoice amounts stay separate and sum into the order total", async () => {
  const harness = createHarness();

  await harness.uploadFile("one.jpg");
  await harness.input("clientInvoiceAmountInput", "50");
  await harness.click("addArtworkButton");
  await harness.uploadFile("two.jpg");
  await harness.input("clientInvoiceAmountInput", "120");

  assert.equal(harness.get("orderInvoiceTotalValue").textContent, "$170.00");
  assert.match(harness.get("clientMessageBody").value, /totaling \$50\.00\./);
  assert.match(harness.get("clientMessageBody").value, /totaling \$120\.00\./);
  assert.match(harness.get("clientMessageBody").value, /Total invoice amount: \$170\.00\./);
});

test("switching artwork tabs restores the saved invoice amount for that artwork", async () => {
  const harness = createHarness();

  await harness.uploadFile("one.jpg");
  await harness.input("clientInvoiceAmountInput", "42");
  await harness.click("addArtworkButton");
  await harness.uploadFile("two.jpg");
  await harness.input("clientInvoiceAmountInput", "88");

  await harness.clickArtworkTab(0);
  assert.equal(harness.get("clientInvoiceAmountInput").value, "42");

  await harness.clickArtworkTab(1);
  assert.equal(harness.get("clientInvoiceAmountInput").value, "88");
});

test("removing an artwork updates the combined invoice total", async () => {
  const harness = createHarness();

  await harness.uploadFile("one.jpg");
  await harness.input("clientInvoiceAmountInput", "50");
  await harness.click("addArtworkButton");
  await harness.uploadFile("two.jpg");
  await harness.input("clientInvoiceAmountInput", "120");

  assert.equal(harness.get("orderInvoiceTotalValue").textContent, "$170.00");

  await harness.click("removeArtworkButton");

  assert.equal(harness.get("orderInvoiceTotalValue").textContent, "$50.00");
  assert.match(harness.get("clientMessageBody").value, /totaling \$50\.00\./);
});

test("studio email removes crop position instructions and asks for finalized attached files instead", async () => {
  const harness = createHarness();

  await harness.uploadFile("crop-test.jpg", { width: 4800, height: 6000 });
  await harness.setChecked("ratioLockToggle", false);
  await harness.input("widthInput", "16");
  await harness.input("heightInput", "16");
  await harness.input("artistNameInput", "Artist Name");
  await harness.input("artistEmailInput", "artist@example.com");
  await harness.input("clientNameInput", "Client Name");
  await harness.input("clientEmailInput", "client@example.com");
  await harness.change("payoutMethodSelect", "PayPal");
  await harness.input("payoutHandleInput", "@artist");
  await harness.click("prepareButton");

  const emailBody = harness.get("emailBody").textContent;
  const prepareNote = harness.get("prepareFieldNote").textContent;

  assert.doesNotMatch(emailBody, /Crop position:/);
  assert.match(emailBody, /finalized cropped file I want printed/);
  assert.match(emailBody, /please print from the finalized attached file/i);
  assert.match(prepareNote, /Attach the finalized cropped or prepared JPEG/i);
});

test("every script element id resolves against the invoice tool HTML", () => {
  const htmlIds = new Set([...html.matchAll(/id="([^"]+)"/g)].map((match) => match[1]));
  const scriptIds = [...script.matchAll(/getElementById\("([^"]+)"\)/g)].map((match) => match[1]);

  assert.deepEqual(
    scriptIds.filter((id) => !htmlIds.has(id)),
    []
  );
});
