const form = document.getElementById("imageForm");

const canvas = document.getElementById("imageCanvas");
const ctx = canvas.getContext("2d");

const asciiContainer = document.getElementById("asciiContainer");

const CHARACTERS = " .,:;ox%#@";
const DEFAULT_KERNEL_SIZE = 10;

form.onsubmit = (event) => {
  event.preventDefault();

  const formData = new FormData(event.target);
  const image = formData.get("image");
  let kernelSize = +formData.get("kernelSize");

  if (kernelSize == 0) {
    kernelSize = DEFAULT_KERNEL_SIZE;
  }

  loadImageToCanvas(image)
    .then(() => convertCanvasToAscii(kernelSize))
    .catch(console.error);
};

function loadImageToCanvas(imageFile) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = URL.createObjectURL(imageFile);

    image.onerror = () => {
      URL.revokeObjectURL(this.src);
      console.error("Cannot load image");
      reject("Cannot load image");
    };

    image.onload = () => {
      URL.revokeObjectURL(this.src);
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0, image.width, image.height);
      resolve();
    };
  });
}

function convertCanvasToAscii(kernelSize) {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const grayValue = rgbToGrayscale(data[i], data[i + 1], data[i + 2]);

    data[i] = grayValue; // red
    data[i + 1] = grayValue; // green
    data[i + 2] = grayValue; // blue
  }

  const kernelWidth = kernelSize * 0.6;
  const kernelHeight = kernelSize;
  let ascii = "";

  for (let y = 0; y < canvas.height; y += kernelHeight) {
    for (let x = 0; x < canvas.width; x += kernelWidth) {
      const brightness = calculateKernelBrightness(imageData, x, y, kernelWidth, kernelHeight);
      const characterIndex = Math.floor((brightness / 256) * CHARACTERS.length);
      ascii += CHARACTERS[characterIndex];
    }

    ascii += "\n";
  }

  asciiContainer.innerText = ascii;
}

function calculateKernelBrightness(imageData, xStart, yStart, kernelWidth, kernelHeight) {
  const xEnd = xStart + kernelWidth;
  const yEnd = yStart + kernelHeight;
  const pixelCount = kernelWidth * kernelHeight;
  let sum = 0;

  for (let y = yStart; y < yEnd; y++) {
    for (let x = xStart; x < xEnd; x++) {
      if (x < canvas.width && y < canvas.height) {
        sum += imageData.data[coordinateToPixelIndex(x, y, imageData.width)];
      }
    }
  }

  return sum / pixelCount;
}

function coordinateToPixelIndex(x, y, imageWidth) {
  return 4 * (y * imageWidth + x);
}

function rgbToGrayscale(red, green, blue) {
  // https://github.com/image-js/image-js/blob/9ab86a86f6c13a9a7d14c62566c1396c3c6f54f4/src/image/transform/greyAlgorithms.js
  return (red * 6966 + green * 23436 + blue * 2366) >> 15;
}
