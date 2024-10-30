document.getElementById('aspectRatioForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const mode = document.querySelector('input[name="mode"]:checked').value;
  const originalWidth = parseFloat(document.getElementById('originalWidth').value);
  const originalHeight = parseFloat(document.getElementById('originalHeight').value);

  if (isNaN(originalWidth) || isNaN(originalHeight) || originalWidth <= 0 || originalHeight <= 0) {
    document.getElementById('result').innerHTML = 'Please enter valid dimensions.';
    return;
  }

  const originalAspectRatio = (originalWidth / originalHeight).toFixed(2);
  let result = `Aspect Ratio: ${originalWidth} : ${originalHeight} (${originalAspectRatio} : 1)<br>`;

  if (mode === 'resize') {
    const newWidth = parseFloat(document.getElementById('newWidth').value);
    const newHeight = parseFloat(document.getElementById('newHeight').value);

    if (newWidth) {
      const calculatedHeight = (newWidth / originalAspectRatio).toFixed(2);
      result += `New Dimensions: ${newWidth} x ${calculatedHeight}`;
    } else if (newHeight) {
      const calculatedWidth = (newHeight * originalAspectRatio).toFixed(2);
      result += `New Dimensions: ${calculatedWidth} x ${newHeight}`;
    } else {
      result += 'Please enter either a new width or height.';
    }
  } else {
    result += 'Suggested frame sizes: 8x10, 11x14, 16x20, 24x36.';
  }

  document.getElementById('result').innerHTML = result;
});

