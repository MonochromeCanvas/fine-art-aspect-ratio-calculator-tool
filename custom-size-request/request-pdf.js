/* Browser-only print plans with embedded, selectable text and clickable links.
 * Canvas pages are used only for the in-tool preview.
 * No artwork or request data leaves the browser when creating the PDF.
 */
(function (global) {
  "use strict";
  const WIDTH = 1275, HEIGHT = 1650, MARGIN = 80, BOTTOM = 1520;
  const INK = "#213337", GREEN = "#325547", MUTED = "#526460", RED = "#b42318";
  const money = value => new Intl.NumberFormat("en-US", {style: "currency", currency: "USD"}).format(value);

  async function create(data, options = {}) {
    const images = [], pageOperations = [];
    const pdf = await PDFLib.PDFDocument.create();
    pdf.registerFontkit(fontkit);
    const fonts = {
      regular: await pdf.embedFont(MonochromeRequestFonts.regular, {subset: true}),
      bold: await pdf.embedFont(MonochromeRequestFonts.bold, {subset: true})
    };
    let canvas, ctx, y, operations;
    function drawText(value, x, top, size, bold, color, links = []) {
      ctx.fillStyle = color; ctx.font = (bold ? "bold " : "") + size + "px Arial";
      ctx.fillText(value, x, top);
      operations.push({type: "text", value, x, top, size, bold, color, links});
    }
    function drawRule(top) {
      ctx.strokeStyle = "#d3ded6"; ctx.beginPath(); ctx.moveTo(MARGIN, top); ctx.lineTo(WIDTH - MARGIN, top); ctx.stroke();
      operations.push({type: "rule", top});
    }
    function finishPage() {
      if (!canvas) return;
      drawText("Monochrome Canvas · Reference only · Page " + (images.length + 1), MARGIN, HEIGHT - 56, 21, false, MUTED);
      pageOperations.push(operations);
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
      operations = [];
      drawText("MONOCHROME CANVAS", MARGIN, 65, 23, true, GREEN);
      drawText("Print planning · Not a submitted order", MARGIN, 100, 21, false, MUTED);
      drawRule(123);
      y = 178;
    }
    function ensure(height) { if (y + height > BOTTOM) newPage(); }
    function wrapped(text, size, bold) {
      const font = bold ? fonts.bold : fonts.regular;
      const measure = value => font.widthOfTextAtSize(value, size);
      const maxWidth = WIDTH - MARGIN * 2;
      const lines = [];
      String(text).split(/\r?\n/).forEach(function (paragraph) {
        let line = "";
        paragraph.split(/\s+/).forEach(function (word) {
          if (line && measure(line + " " + word) > maxWidth) { lines.push(line); line = ""; }
          while (measure(word) > maxWidth) {
            let split = 1;
            while (split < word.length && measure(word.slice(0, split + 1)) <= maxWidth) split++;
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
      const normalized = String(value).replace(/\s+/g, " ").trim();
      const matches = Array.from(normalized.matchAll(/https?:\/\/[^\s<>]+|(?:www\.|monochromecanvas\.com\/)[^\s<>]+|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)).map(match => {
        const label = match[0].replace(/[.,;!?)]+$/, "");
        const uri = label.includes("@") && !/^https?:/i.test(label) ? "mailto:" + label : /^https?:/i.test(label) ? label : "https://" + label;
        return {start: match.index, end: match.index + label.length, uri};
      });
      const lines = wrapped(value, size, bold);
      let cursor = 0;
      for (const line of lines) {
        ensure(size * 1.5);
        const start = line ? normalized.indexOf(line, cursor) : cursor;
        const links = matches.filter(link => link.start < start + line.length && link.end > start).map(link => ({
          start: Math.max(0, link.start - start), end: Math.min(line.length, link.end - start), uri: link.uri
        }));
        drawText(line, MARGIN, y, size, bold, color, links);
        cursor = Math.max(cursor, start + line.length);
        y += size * 1.45;
      }
      y += 8;
    }
    function heading(value) { text(value, {size: 43, bold: true, color: GREEN}); y += 8; }
    function rule() { ensure(30); drawRule(y); y += 32; }
    function label(name, value) { text(name + ": " + value); }
    function imageInBox(image, crop, x, top, width, height) {
      const scale = Math.min(width / crop.width, height / crop.height);
      const w = crop.width * scale, h = crop.height * scale;
      const left = x + (width - w) / 2, upper = top + (height - h) / 2;
      ctx.fillStyle = "white"; ctx.fillRect(left, upper, w, h);
      ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, left, upper, w, h);
      ctx.strokeStyle = "#d3ded6"; ctx.strokeRect(left, upper, w, h);
      // Embed only the artwork bitmap; all document words remain real PDF text.
      const artwork = document.createElement("canvas");
      artwork.width = Math.max(1, Math.round(w)); artwork.height = Math.max(1, Math.round(h));
      const artworkContext = artwork.getContext("2d");
      artworkContext.fillStyle = "white"; artworkContext.fillRect(0, 0, artwork.width, artwork.height);
      artworkContext.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, artwork.width, artwork.height);
      operations.push({type: "image", data: artwork.toDataURL("image/jpeg", 0.93), x: left, top: upper, width: w, height: h});
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
      drawText("Print preview", MARGIN, y, 23, false, MUTED);
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
    const blob = await encodePdf(pdf, fonts, pageOperations);
    return options.preview ? {blob: blob, pages: images.map(function (bytes) { return new Blob([bytes], {type: "image/jpeg"}); })} : blob;
  }

  async function encodePdf(pdf, fonts, pages) {
    const {rgb, PDFName, PDFString} = PDFLib;
    const scale = 612 / WIDTH;
    const color = hex => rgb(parseInt(hex.slice(1, 3), 16) / 255, parseInt(hex.slice(3, 5), 16) / 255, parseInt(hex.slice(5, 7), 16) / 255);
    for (const operations of pages) {
      const page = pdf.addPage([612, 792]);
      const annotations = [];
      for (const op of operations) {
        if (op.type === "text") {
          const font = op.bold ? fonts.bold : fonts.regular;
          page.drawText(op.value, {x: op.x * scale, y: (HEIGHT - op.top) * scale, size: op.size * scale, font, color: color(op.color)});
          for (const link of op.links) {
            const x = op.x + font.widthOfTextAtSize(op.value.slice(0, link.start), op.size);
            const width = font.widthOfTextAtSize(op.value.slice(link.start, link.end), op.size);
            annotations.push(pdf.context.register(pdf.context.obj({
              Type: "Annot", Subtype: "Link", Border: [0, 0, 0],
              Rect: [x * scale, (HEIGHT - op.top - op.size * 0.25) * scale, (x + width) * scale, (HEIGHT - op.top + op.size) * scale],
              A: {Type: "Action", S: "URI", URI: PDFString.of(link.uri)}
            })));
          }
        } else if (op.type === "rule") {
          page.drawLine({start: {x: MARGIN * scale, y: (HEIGHT - op.top) * scale}, end: {x: (WIDTH - MARGIN) * scale, y: (HEIGHT - op.top) * scale}, thickness: scale, color: color("#d3ded6")});
        } else if (op.type === "image") {
          const image = await pdf.embedJpg(op.data);
          page.drawImage(image, {x: op.x * scale, y: (HEIGHT - op.top - op.height) * scale, width: op.width * scale, height: op.height * scale});
          page.drawRectangle({x: op.x * scale, y: (HEIGHT - op.top - op.height) * scale, width: op.width * scale, height: op.height * scale, borderWidth: scale, borderColor: color("#d3ded6")});
        }
      }
      if (annotations.length) page.node.set(PDFName.of("Annots"), pdf.context.obj(annotations));
    }
    return new Blob([await pdf.save()], {type: "application/pdf"});
  }
  global.MonochromeRequestPdf = {create: create};
})(window);
