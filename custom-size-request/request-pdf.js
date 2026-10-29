/* Browser-only request reference sheets. Pages are rendered at 150 PPI so text,
 * Unicode filenames, and artwork previews remain consistent across devices.
 * No artwork or request data leaves the browser when creating the PDF.
 */
(function (global) {
  "use strict";
  const WIDTH = 1275, HEIGHT = 1650, MARGIN = 80, BOTTOM = 1520;
  const INK = "#213337", GREEN = "#325547", MUTED = "#526460", RED = "#b42318";
  const money = value => new Intl.NumberFormat("en-US", {style: "currency", currency: "USD"}).format(value);

  async function create(data, options = {}) {
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
      ctx.fillText("Print planning · Not a submitted order", MARGIN, 100);
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
      const scale = Math.min(width / crop.width, height / crop.height);
      const w = crop.width * scale, h = crop.height * scale;
      const left = x + (width - w) / 2, upper = top + (height - h) / 2;
      ctx.fillStyle = "white"; ctx.fillRect(left, upper, w, h);
      ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, left, upper, w, h);
      ctx.strokeStyle = "#d3ded6"; ctx.strokeRect(left, upper, w, h);
    }
    newPage();
    text("YOUR ORDER HAS NOT", {size: 49, bold: true, color: RED});
    text("BEEN SUBMITTED", {size: 49, bold: true, color: RED});
    text("Creating or downloading this PDF does not send anything to Monochrome Canvas or add your project to our order queue.", {size: 30, bold: true, color: RED});
    rule();
    heading("Ordering website sizes and quantities?");
    text("Please place your order through website checkout so it reaches our order queue.", {size: 29, bold: true});
    text("monochromecanvas.com/collections/order-giclee-prints", {size: 26, color: GREEN});
    text("You’re welcome to use this tool and keep this PDF for planning, even when you order through the website.");
    rule();
    heading("Need a custom quote?");
    text("For a size or quantity the website doesn’t offer, email BOTH:", {size: 29, bold: true, color: RED});
    text("1. This PDF\n2. Every full-resolution, print-ready artwork file", {size: 30, bold: true, color: RED});
    text("Send to joelle@monochromecanvas.com", {size: 30, bold: true, color: RED});
    text("This PDF contains reference previews only. It does not replace your print-ready artwork files. The studio must review your request and confirm pricing and next steps before it becomes an order.");
    rule();
    text("Your planned print details follow on the next pages.", {size: 25, color: MUTED});
    newPage();
    heading("Your print plan / quote request");
    text("Prepared " + new Date().toLocaleString("en-US", {timeZone: "America/New_York", dateStyle: "medium", timeStyle: "short"}) + " Eastern", {size: 23, color: MUTED});
    label("Customer", data.contact.name); label("Email", data.contact.email);
    label("Customer pricing", data.customerType.charAt(0).toUpperCase() + data.customerType.slice(1));
    label("Production timing", data.timing); label("Requested deadline", data.deadline);
    text("Studio hours: Monday-Friday, 9 AM-4 PM Eastern. Weekends and time outside studio hours are not production time.", {size: 25, color: MUTED});
    rule();
    label("Combined print estimate", money(data.total));
    text("Estimates are subject to studio review and exclude shipping, tax, rush fees, proofs, editing, and special finishing. Rush orders receive no discounts.", {size: 25, color: MUTED});
    text("Quantity discounts apply to multiple copies of the same artwork, printed at the same size on the same material. Each different artwork requires its own setup, so quantities from different artworks are not added together to reach a discount tier.", {size: 25, color: MUTED});
    rule();
    text("Artwork overview", {size: 30, bold: true});
    data.entries.forEach(item => text(item.number + ". " + item.filename + " · " + item.width + " × " + item.height + " in · Qty " + item.quantity + " · " + money(item.total), {size: 25}));
    if (data.projectType) { rule(); label("Project type", data.projectType); }
    if (data.notes) { rule(); text("Request notes", {size: 30, bold: true}); text(data.notes); }
    rule();
    text("Attach this PDF AND every full-resolution, print-ready artwork file to your email to joelle@monochromecanvas.com. This PDF contains reference previews only; it is not a production file or a confirmed order.", {size: 26, bold: true});

    for (const item of data.entries) {
      newPage();
      heading("Artwork " + item.number);
      text(item.filename, {size: 29, bold: true});
      const image = new Image(); image.src = item.url; await image.decode();
      ensure(500);
      ctx.fillStyle = MUTED; ctx.font = "23px Arial";
      ctx.fillText("Print preview", MARGIN, y);
      y += 20;
      imageInBox(image, {x:0, y:0, width:item.pixelWidth, height:item.pixelHeight}, MARGIN, y, WIDTH - MARGIN * 2, 420);
      y += 462;
      text("Uploaded print file shown as prepared. Reference preview only; use the full-resolution file for production.", {size:23, color:MUTED});
      rule();
      label("Material", item.material);
      label("Finished print size", item.width + " × " + item.height + " inches");
      label("Quantity", item.quantity);
      label("Base price per print", money(item.unitPrice));
      label("Item discount savings", money(item.savings));
      label("Item estimate", money(item.total));
      label("Sizing mode", item.sizingMode);
      label("Uploaded file", item.pixelWidth + " × " + item.pixelHeight + " pixels");
      label("File quality", item.quality);
      if (item.canvas) label("Canvas stretching edge", item.canvas);
      label("Production timing", data.timing);
      label("Requested deadline", data.deadline);
    }
    finishPage();
    const blob = encodePdf(images);
    return options.preview ? {blob: blob, pages: images.map(function (bytes) { return new Blob([bytes], {type: "image/jpeg"}); })} : blob;
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
