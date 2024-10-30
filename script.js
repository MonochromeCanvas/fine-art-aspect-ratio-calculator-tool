document.addEventListener('DOMContentLoaded', function () {
  const modeRadios = document.getElementsByName('mode');
  const newSizeFields = document.getElementById('newSizeFields');
  const resultDiv = document.getElementById('result');

  modeRadios.forEach(radio => {
    radio.addEventListener('change', function () {
      newSizeFields.classList.toggle('hidden', this.value !== 'resize');
    });
  });

  document.getElementById('aspectRatioForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const mode = document.querySelector('input[name="mode"]:checked').value;
    const originalWidth = parseFloat(document.getElementById('originalWidth').value);
    const originalHeight = parseFloat(document.getElementById('originalHeight').value);

    if (isNaN(originalWidth) || isNaN(originalHeight) || originalWidth <= 0 || originalHeight <= 0) {
      resultDiv.innerHTML = '<strong>Please enter valid dimensions.</strong>';
      return;
    }

    const originalAspectRatio = (originalWidth / originalHeight).toFixed(2);
    let message = `Aspect Ratio: ${originalWidth} : ${originalHeight} (${originalAspectRatio} : 1)<br>`;

    if (mode === 'resize') {
      const newWidth = parseFloat(document.getElementById('newWidth').value);
      const newHeight = parseFloat(document.getElementById('newHeight').value);

      if (newWidth) {
        const calculatedHeight = (newWidth / originalAspectRatio).toFixed(2);
        message += `New Dimensions: ${newWidth}" x ${calculatedHeight}"`;
      } else if (newHeight) {
        const calculatedWidth = (newHeight * originalAspectRatio).toFixed(2);
        message += `New Dimensions: ${calculatedWidth}" x ${newHeight}"`;
      } else {
        message += 'Please enter a new width or height.';
      }
    } else {
      message += 'Suggested Frame Sizes: 8x10, 11x14, 16x20, 24x36';
    }

    resultDiv.innerHTML = message;
  });
});
