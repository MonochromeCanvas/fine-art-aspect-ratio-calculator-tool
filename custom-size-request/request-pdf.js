/* Browser-only request reference sheets. Pages are rendered at 150 PPI so text,
 * Unicode filenames, and artwork previews remain consistent across devices.
 * No artwork or request data leaves the browser when creating the PDF.
 */
(function (global) {
  "use strict";
  const WIDTH = 1275, HEIGHT = 1650, MARGIN = 80, BOTTOM = 1520;
  const INK = "#213337", GREEN = "#325547", MUTED = "#526460";
  const money = value => new Intl.NumberFormat("en-US", {style: "currency", currency: "USD"}).format(value);

  async function create(data) {
    const images = [];
    let canvas, ctx, y;
    function finishPage() {
      if (!canvas) return;
      ctx.fillStyle = MUTED; ctx.font = "21px Arial";
      ctx.fillText("Monochrome Canvas · Reference only · Page " + (images.length + 1), MARGIN, HEIGHT - 56);
      const encoded = atob(canvas.toDataURL("image/jpeg", 0.93).split(",")[1]);
      const bytes = new Uint8Array(encoded.length);
      for (let i = 0; i < encoded.length; i++) bytes[i] = encoded.charCodeAt(i);
      images.push(bytes);
      canvas.width = 1; canvas.height = 1;
    }
    function newPage() {
      finishPage();
      canvas = document.createElement("canvas"); canvas.width = WIDTH; canvas.height = HEIGHT;
      ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas is unavailable");
      ctx.fillStyle = "white"; ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.fillStyle = GREEN; ctx.font = "bold 23px Arial";
      ctx.fillText("MONOCHROME CANVAS", MARGIN, 65);
      ctx.fillStyle = MUTED; ctx.font = "21px Arial";
      ctx.fillText("Custom print request · Studio review required", MARGIN, 100);
      ctx.strokeStyle = "#d3ded6"; ctx.beginPath(); ctx.moveTo(MARGIN, 123); ctx.lineTo(WIDTH - MARGIN, 123); ctx.stroke();
      y = 178;
    }
    function ensure(height) { if (y + height > BOTTOM) newPage(); }
    function wrapped(text, size, bold) {
      ctx.font = (bold ? "bold " : "") + size + "px Arial";
      const maxWidth = WIDTH - MARGIN * 2;
      const lines = [];
      String(text).split(/\r?\n/).forEach(function (paragraph) {
        let line = "";
        paragraph.split(/\s+/).forEach(function (word) {
          if (line && ctx.measureText(line + " " + word).width > maxWidth) { lines.push(line); line = ""; }
          while (ctx.measureText(word).width > maxWidth) {
            let split = 1;
            while (split < word.length && ctx.measureText(word.slice(0, split + 1)).width <= maxWidth) split++;
            lines.push(word.slice(0, split)); word = word.slice(split);
          }
          line += (line ? " " : "") + word;
        });
        lines.push(line);
      });
      return lines;
    }
    function text(value, options) {
      const {size = 27, bold = false, color = INK} = options || {};
      const lines = wrapped(value, size, bold);
      for (const line of lines) {
        ensure(size * 1.5);
        ctx.fillStyle = color; ctx.font = (bold ? "bold " : "") + size + "px Arial";
        ctx.fillText(line, MARGIN, y); y += size * 1.45;
      }
      y += 8;
    }
    function heading(value) { text(value, {size: 43, bold: true, color: GREEN}); y += 8; }
    function rule() { ensure(30); ctx.strokeStyle = "#d3ded6"; ctx.beginPath(); ctx.moveTo(MARGIN, y); ctx.lineTo(WIDTH - MARGIN, y); ctx.stroke(); y += 32; }
    function label(name, value) { text(name + ": " + value); }
    function imageInBox(image, crop, x, top, width, height) {
      ctx.fillStyle = "#f1f3ee"; ctx.fillRect(x, top, width, height);
      const scale = Math.min(width / crop.width, height / crop.height);
      const w = crop.width * scale, h = crop.height * scale;
      ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, x + (width - w) / 2, top + (height - h) / 2, w, h);
    }
    newPage();
    heading("Your print request");
    text("Prepared " + new Date().toLocaleString("en-US", {timeZone: "America/New_York", dateStyle: "medium", timeStyle: "short"}) + " Eastern", {size: 23, color: MUTED});
    label("Customer", data.contact.name); label("Email", data.contact.email);
    label("Customer pricing", data.customerType.charAt(0).toUpperCase() + data.customerType.slice(1));
    label("Production timing", data.timing); label("Requested deadline", data.deadline);
    text("Studio hours: Monday-Friday, 9 AM-4 PM Eastern. Weekends and time outside studio hours are not production time.", {size: 25, color: MUTED});
    rule();
    label("Combined print estimate", money(data.total));
    text("Estimates are subject to studio review and exclude shipping, tax, rush fees, proofs, editing, and special finishing. Rush orders receive no discounts. Uncertain deadlines are estimated without discounts until reviewed.", {size: 25, color: MUTED});
    text("Quantity discounts apply separately per artwork, size, and material. Quantities from different artworks are not combined.", {size: 25, color: MUTED});
    rule();
    text("Artwork overview", {size: 30, bold: true});
    data.entries.forEach(item => text(item.number + ". " + item.filename + " · " + item.width + " × " + item.height + " in · Qty " + item.quantity + " · " + money(item.total), {size: 25}));
    if (data.projectType) { rule(); label("Project type", data.projectType); }
    if (data.notes) { rule(); text("Request notes", {size: 30, bold: true}); text(data.notes); }
    rule();
    text("Attach this PDF AND every original print-quality artwork file to your email to joelle@monochromecanvas.com. This PDF contains reference previews only; it is not a production file or a confirmed order.", {size: 26, bold: true});

    for (const item of data.entries) {
      newPage();
      heading("Artwork " + item.number);
      text(item.filename, {size: 29, bold: true});
      const image = new Image(); image.src = item.url; await image.decode();
      ensure(420);
      ctx.fillStyle = MUTED; ctx.font = "23px Arial";
      ctx.fillText("Original artwork", MARGIN, y);
      ctx.fillText("Requested print crop", 675, y);
      y += 20;
      imageInBox(image, {x:0, y:0, width:item.pixelWidth, height:item.pixelHeight}, MARGIN, y, 520, 340);
      imageInBox(image, item.crop || {x:0, y:0, width:item.pixelWidth, height:item.pixelHeight}, 675, y, 520, 340);
      y += 382;
      text("Reference previews only. Confirm the final crop with the studio before printing.", {size:23, color:MUTED});
      rule();
      label("Material", item.material);
      label("Finished print size", item.width + " × " + item.height + " inches");
      label("Quantity", item.quantity);
      label("Base price per print", money(item.unitPrice));
      label("Item discount savings", money(item.savings));
      label("Item estimate", money(item.total));
      label("Sizing mode", item.sizingMode);
      label("Original file", item.pixelWidth + " × " + item.pixelHeight + " pixels");
      label("File quality", item.quality);
      if (item.canvas) label("Canvas stretching edge", item.canvas);
      if (item.crop) label("Preview crop (original pixels)", "x " + Math.round(item.crop.x) + ", y " + Math.round(item.crop.y) + ", width " + Math.round(item.crop.width) + ", height " + Math.round(item.crop.height));
      label("Production timing", data.timing);
      label("Requested deadline", data.deadline);
    }
    finishPage();
    return encodePdf(images);
  }

  // A small PDF 1.4 container for the reference pages. Stream lengths and xref
  // offsets use encoded byte counts, including the binary JPEG streams.
  function encodePdf(images) {
    const encoder = new TextEncoder(), chunks = [], offsets = [0];
    let length = 0;
    function append(value) { const bytes = typeof value === "string" ? encoder.encode(value) : value; chunks.push(bytes); length += bytes.length; }
    function object(id, value) { offsets[id] = length; append(id + " 0 obj\n" + value + "\nendobj\n"); }
    append("%PDF-1.4\n"); append(new Uint8Array([37,226,227,207,211,10]));
    object(1, "<< /Type /Catalog /Pages 2 0 R >>");
    object(2, "<< /Type /Pages /Count " + images.length + " /Kids [" + images.map((_, i) => (3 + i * 3) + " 0 R").join(" ") + "] >>");
    images.forEach(function (bytes, index) {
      const id = 3 + index * 3;
      object(id, "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /XObject << /Im " + (id + 1) + " 0 R >> >> /Contents " + (id + 2) + " 0 R >>");
      offsets[id + 1] = length;
      append((id + 1) + " 0 obj\n<< /Type /XObject /Subtype /Image /Width " + WIDTH + " /Height " + HEIGHT + " /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length " + bytes.length + " >>\nstream\n");
      append(bytes); append("\nendstream\nendobj\n");
      const content = "q\n612 0 0 792 0 0 cm\n/Im Do\nQ\n";
      object(id + 2, "<< /Length " + encoder.encode(content).length + " >>\nstream\n" + content + "endstream");
    });
    const start = length, count = images.length * 3 + 3;
    append("xref\n0 " + count + "\n0000000000 65535 f \n");
    for (let id = 1; id < count; id++) append(String(offsets[id]).padStart(10, "0") + " 00000 n \n");
    append("trailer\n<< /Size " + count + " /Root 1 0 R >>\nstartxref\n" + start + "\n%%EOF\n");
    return new Blob(chunks, {type: "application/pdf"});
  }
  global.MonochromeRequestPdf = {create: create};
})(window);
