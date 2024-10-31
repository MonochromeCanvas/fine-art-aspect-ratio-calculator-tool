document.addEventListener('DOMContentLoaded', function () {
  const modeRadios = document.getElementsByName('mode');
  const newSizeFields = document.getElementById('newSizeFields');
  const resultDiv = document.getElementById('result');

  // Toggle new size fields based on selected mode
  modeRadios.forEach(radio => {
    radio.addEventListener('change', function () {
      const isResizeMode = this.value === 'resize';
      newSizeFields.style.display = isResizeMode ? 'block' : 'none';
      resultDiv.innerHTML = '';
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
    let message = `<strong>Aspect Ratio:</strong> ${originalWidth} : ${originalHeight} (${originalAspectRatio} : 1)<br>`;

    if (mode === 'suggest') {
      const suggestedFrames = getSuggestedFrames(originalAspectRatio);

      if (suggestedFrames.length === 0) {
        message += `<strong>No exact match found.</strong> Consider custom framing options.`;
      } else {
        message += `<strong>Suggested Frame Sizes:</strong> ${suggestedFrames.join(", ")}`;
      }
    } else if (mode === 'resize') {
      const newWidth = parseFloat(document.getElementById('newWidth').value);
      const newHeight = parseFloat(document.getElementById('newHeight').value);

      if (newWidth && !newHeight) {
        const calculatedHeight = (newWidth / originalAspectRatio).toFixed(2);
        message += `<strong>New Dimensions:</strong> ${newWidth}" (W) x ${calculatedHeight}" (H)`;
      } else if (!newWidth && newHeight) {
        const calculatedWidth = (newHeight * originalAspectRatio).toFixed(2);
        message += `<strong>New Dimensions:</strong> ${calculatedWidth}" (W) x ${newHeight}" (H)`;
      } else {
        message += `<strong>Please enter either a new width or a new height.</strong>`;
      }
    }

    resultDiv.innerHTML = message;
  });

  function getSuggestedFrames(aspectRatio) {
    const standardFrames = [
      { size: "4x6 inches", ratio: (4 / 6).toFixed(2) },
      { size: "5x7 inches", ratio: (5 / 7).toFixed(2) },
      { size: "8x10 inches", ratio: (8 / 10).toFixed(2) },
      { size: "8.5x11 inches", ratio: (8.5 / 11).toFixed(2) },
      { size: "10x13 inches", ratio: (10 / 13).toFixed(2) },
      { size: "10x20 inches", ratio: (10 / 20).toFixed(2) },
      { size: "11x14 inches", ratio: (11 / 14).toFixed(2) },
      { size: "11x17 inches", ratio: (11 / 17).toFixed(2) },
      { size: "12x12 inches", ratio: (12 / 12).toFixed(2) },
      { size: "12x16 inches", ratio: (12 / 16).toFixed(2) },
      { size: "12x36 inches", ratio: (12 / 36).toFixed(2) },
      { size: "16x20 inches", ratio: (16 / 20).toFixed(2) },
      { size: "18x24 inches", ratio: (18 / 24).toFixed(2) },
      { size: "24x36 inches", ratio: (24 / 36).toFixed(2) },
      { size: "27x40 inches", ratio: (27 / 40).toFixed(2) }
    ];

    const tolerance = 0.01;
    return standardFrames
      .filter(frame => Math.abs(frame.ratio - aspectRatio) < tolerance)
      .map(frame => frame.size);
  }
});
