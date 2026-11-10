(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const fields = ['width', 'height', 'ppi'].map($);
  const format = number => number.toLocaleString('en-US', { maximumFractionDigits: 4 });
  const inputNumber = number => String(Number(number.toPrecision(14)));
  const roundedPixels = number => Math.ceil(number - Math.min(1e-9, Number.EPSILON * Math.abs(number)));
  let direction = 'inches';
  let current = null;
  let copyGeneration = 0;

  function parseMeasurement(text) {
    const value = text.trim();
    if (/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(value)) return Number(value);
    if (direction === 'inches') {
      const fraction = value.match(/^(?:(\d+)\s+)?(\d+)\s*\/\s*(\d+)$/);
      if (fraction && Number(fraction[3]) > 0) return Number(fraction[1] || 0) + Number(fraction[2]) / Number(fraction[3]);
    }
    return NaN;
  }

  function read() {
    const width = parseMeasurement($('width').value);
    const hasHeight = $('height').value.trim() !== '';
    const height = hasHeight ? parseMeasurement($('height').value) : null;
    const ppi = Number($('ppi').value);
    const validDimension = number => Number.isFinite(number) && number > 0 && number <= Number.MAX_SAFE_INTEGER && (direction === 'inches' || Number.isSafeInteger(number));
    const invalid = [!validDimension(width), hasHeight && !validDimension(height), !Number.isFinite(ppi) || ppi <= 0 || ppi > Number.MAX_SAFE_INTEGER];
    fields.forEach((field, index) => field.setAttribute('aria-invalid', String(Boolean(invalid[index]))));
    if (invalid.some(Boolean)) return null;
    const source = hasHeight ? [width, height] : [width];
    const output = source.map(value => direction === 'inches' ? roundedPixels(value * ppi) : value / ppi);
    if (!output.every(value => Number.isFinite(value) && value > 0 && value <= Number.MAX_SAFE_INTEGER)) return null;
    return { source, output, ppi };
  }

  function render() {
    copyGeneration++;
    $('copy-status').textContent = '';
    document.querySelectorAll('[data-ppi]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.ppi) === Number($('ppi').value))));
    current = read();
    const valid = Boolean(current);
    $('error').hidden = valid;
    $('copy').disabled = !valid;
    $('swap').disabled = !valid || current.source.length < 2;
    $('paper').hidden = !valid || current.source.length < 2;
    $('result-label').textContent = direction === 'inches' ? 'Your file dimensions' : 'Your print dimensions';
    if (!valid) {
      $('error').textContent = 'Enter a positive width and PPI. Height can be blank. Pixels must be whole numbers. If your numbers are very large, try smaller values.';
      $('result').textContent = 'Check your measurements';
      $('result-context').textContent = 'Your result will appear as you type.';
      $('rounding').textContent = '';
      $('preview-note').textContent = 'Enter valid dimensions to see the proportions.';
      return;
    }
    const { source, output, ppi } = current;
    const show = number => number < 0.0001 ? '< 0.0001' : format(number);
    $('result').replaceChildren(document.createTextNode(output.map(show).join(' × ')), Object.assign(document.createElement('span'), { textContent: direction === 'inches' ? 'pixels' : 'inches' }));
    $('result-context').textContent = source.map(show).join(' × ') + (direction === 'inches' ? ' inches' : ' pixels') + ' at ' + show(ppi) + ' PPI';
    $('rounding').textContent = direction === 'inches' ? 'Pixel requirements round up to whole pixels.' : 'Inch results show up to four decimal places.';
    $('preview-note').textContent = source.length > 1 ? 'Proportions preview · not actual size' : 'Add a height to preview the proportions.';
    if (source.length > 1) {
      const ratio = source[0] / source[1];
      // Bound extreme shapes so the preview remains visible, without implying accuracy.
      const boundedRatio = Math.max(1 / 12, Math.min(12, ratio));
      $('paper').style.width = (boundedRatio >= 1 ? 160 : 160 * boundedRatio) + 'px';
      $('paper').style.height = (boundedRatio >= 1 ? 160 / boundedRatio : 160) + 'px';
      $('paper-caption').textContent = ratio >= 0.4 && ratio <= 2.5 ? source.map(show).join(' × ') + (direction === 'inches' ? ' in' : ' px') : '';
      if (ratio !== boundedRatio) $('preview-note').textContent = 'Extreme proportions · preview compressed to fit';
    }
  }

  function updateLabels() {
    const unit = direction === 'inches' ? 'inches' : 'pixels';
    $('width-label').textContent = 'Width (' + unit + ')';
    $('height-label').textContent = 'Height (' + unit + ', optional)';
    $('measurement-help').textContent = direction === 'inches' ? 'Use decimals or fractions, like 8.5 or 8 1/2. Leave height blank for one measurement.' : 'Enter whole pixel dimensions. Leave height blank for one measurement.';
    [$('width'), $('height')].forEach(field => field.inputMode = direction === 'inches' ? 'decimal' : 'numeric');
  }

  fields.forEach(field => field.addEventListener('input', () => {
    if (field.id !== 'ppi') $('preset').value = '';
    render();
  }));
  $('direction').addEventListener('change', () => {
    const values = current?.output;
    direction = $('direction').value;
    if (values) {
      $('width').value = inputNumber(values[0]);
      $('height').value = values.length > 1 ? inputNumber(values[1]) : '';
    }
    $('preset').value = '';
    updateLabels();
    render();
  });
  document.querySelectorAll('[data-ppi]').forEach(button => button.addEventListener('click', () => {
    $('ppi').value = button.dataset.ppi;
    render();
  }));
  $('preset').addEventListener('change', () => {
    if (!$('preset').value) return;
    direction = 'inches';
    $('direction').value = direction;
    [$('width').value, $('height').value] = $('preset').value.split(',');
    updateLabels();
    render();
  });
  $('swap').addEventListener('click', () => {
    [$('width').value, $('height').value] = [$('height').value, $('width').value];
    $('preset').value = '';
    render();
  });
  $('reset').addEventListener('click', () => {
    direction = 'inches';
    $('direction').value = direction;
    $('width').value = '8';
    $('height').value = '10';
    $('ppi').value = '300';
    $('preset').value = '8,10';
    updateLabels();
    render();
  });
  $('copy').addEventListener('click', async () => {
    if (!current) return;
    const generation = copyGeneration;
    const { output, ppi } = current;
    // Retain enough precision for small inch values rather than copying a rounded zero.
    const dimensions = output.map(value => direction === 'inches' ? String(value) : inputNumber(value)).join(' × ');
    const text = dimensions + (direction === 'inches' ? ' px' : ' in') + ' at ' + inputNumber(ppi) + ' PPI';
    try {
      await navigator.clipboard.writeText(text);
      if (generation === copyGeneration) $('copy-status').textContent = 'Copied: ' + text;
    } catch {
      if (generation === copyGeneration) $('copy-status').textContent = 'Copy unavailable. Select the result above and copy it manually.';
    }
  });

  // Match the existing suite's Shopify embed height contract.
  let lastHeight = 0;
  function postHeight(force = false) {
    const height = Math.ceil(document.documentElement.getBoundingClientRect().height);
    if (window.parent !== window && (force || height !== lastHeight)) {
      lastHeight = height;
      window.parent.postMessage({ type: 'monochrome-canvas-calculator-height', height }, '*');
    }
  }
  window.addEventListener('message', event => { if (event.source === window.parent && (event.data === 'getHeight' || event.data?.type === 'getHeight')) postHeight(true); });
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(() => postHeight()).observe(document.documentElement);
  window.addEventListener('load', () => postHeight(true));
  render();
})();
