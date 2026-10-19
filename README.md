# Monochrome Canvas Aspect Ratio & Print Size Helper

A static, browser-only artwork sizing tool hosted on GitHub Pages at https://monochromecanvas.github.io/fine-art-aspect-ratio-calculator-tool/.

## What it does

- Reads JPG, PNG and WebP images locally, with file selection or drag-and-drop.
- Shows pixel dimensions, the exact width:height ratio, and maximum proportional dimensions at 300 PPI.
- Lists exact common-size matches that retain at least 300 PPI, in the image’s orientation.
- Checks a desired size, distinguishing fill/crop resolution from fit/white-border resolution.
- Preserves manual frame and proportional-dimension calculators.
- Links to the Monochrome Canvas print shop, studio contact, White Border Builder and Custom Size Request.

The helper does not upload, edit or resample artwork. The 100 MB file limit protects browser responsiveness. Pixels alone cannot establish sharpness or color accuracy. Common frame sizes are planning examples, not a catalog of available products. Shop sizes vary by material.

## Validation

`tests/browser-check.cjs` runs browser regression checks with Playwright and Node. Install Playwright in your development environment, then run `node tests/browser-check.cjs`. Set `CHROME_PATH` to use an existing Chrome executable, or install Playwright’s Chromium. `TOOL_URL` optionally targets the published page instead of the local HTML. Screenshots default to `/tmp/helper-desktop.png` and `/tmp/helper-mobile.png`.

Coverage includes file formats, portrait/landscape/square/uncommon/tiny dimensions, 300 PPI boundaries, crop versus border math, invalid files, replacement/reset, exact frame matches, proportional resizing, order links, mobile overflow and JavaScript errors.

## Custom Size Request

Clients can add up to 30 artwork entries to one request. Each entry keeps its own file, material, dimensions, quantity, and canvas options. Contact details, customer pricing, production timing, and deadline apply to the entire request. Quantity discounts are calculated separately per entry; rush and uncertain-timing requests are estimated without discounts.

The request PDF includes contact and timing details, a combined estimate, itemized specifications, and one print preview per artwork. Files must match their requested print proportions before a PDF can be created; clients are directed to White Border Builder for full-bleed cropping or borders. Quotes and email requests remain available while formatting is pending. PDF generation happens locally in the browser. Clients attach the PDF and their full-resolution, print-ready files manually in their email app. Work is held in this tab only and is cleared on reload.

Additional browser checks: `node tests/custom-size-multiple.cjs`, `node tests/custom-size-rush.cjs`, and `node tests/custom-size-linking.cjs`. These use the same `CHROME_PATH` setting as the other browser checks. `QUOTE_URL` can target the published tool for the multiple-artwork and rush checks. `node tests/custom-size-discounts.test.cjs` verifies the discount calculations.

## Publishing

The existing GitHub Pages deployment serves the root of `main`. Keep the HTML, script and stylesheet in the same release. The parent-page `getHeight` / `monochrome-canvas-calculator-height` message contract is preserved for Shopify embeds.

Print-shop and contact links use `utm_source=aspect_ratio_helper`, `utm_medium=tool`, and `utm_campaign=print_planning` so downstream analytics can attribute referrals. No artwork data or filename is included in these URLs, and no analytics script runs in this helper.
