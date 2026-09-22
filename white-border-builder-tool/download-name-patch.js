(function () {
  const OLD_SUFFIX = "-white-border.jpg";

  function getFinalSizeLabel() {
    const items = Array.from(document.querySelectorAll("#summaryContent .summary-item"));
    const finalSizeItem = items.find(function (item) {
      const label = item.querySelector("dt");
      return label && label.textContent.trim().toLowerCase() === "final paper size";
    });
    const value = finalSizeItem && finalSizeItem.querySelector("dd");
    const match = value && value.textContent.match(/([\d.]+)\s*x\s*([\d.]+)\s*in/i);

    if (!match) {
      return "";
    }

    return match[1] + "x" + match[2] + "in-300ppi";
  }

  function renamePreparedFile(filename) {
    if (!filename || !filename.toLowerCase().endsWith(OLD_SUFFIX)) {
      return filename;
    }

    const finalSize = getFinalSizeLabel();
    if (!finalSize) {
      return filename;
    }

    return filename.slice(0, -OLD_SUFFIX.length) + "-" + finalSize + ".jpg";
  }

  const originalClick = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function () {
    if (this.download) {
      this.download = renamePreparedFile(this.download);
    }

    return originalClick.apply(this, arguments);
  };

  if (typeof File === "function") {
    window.File = new Proxy(File, {
      construct(target, args) {
        if (typeof args[1] === "string") {
          args[1] = renamePreparedFile(args[1]);
        }

        return Reflect.construct(target, args);
      }
    });
  }
})();
