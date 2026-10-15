const imageInput = document.getElementById("imageInput");
const kernelInput = document.getElementById("kernelSize");

const canvas = document.getElementById("imageCanvas");
const ctx = canvas.getContext("2d");

const asciiContainer = document.getElementById("asciiContainer");

const CHARACTERS = " .,:;ox%#@";

imageInput.onchange = (event) => {
  if (event.target.files.length != 1) {
    console.error("1 file must be provided");
    return;
  }

  const file = event.target.files[0];

  if (!isValidMimeType(file.type)) {
    console.error("Invalid mime type");
  }

  loadImageToCanvas(file).then(convertCanvasToAscii).catch(console.error);
};

function isValidMimeType(mimeType) {
  if (!mimeType?.startsWith("image/")) {
    return false;
  }

  return ["jpeg", "png", "webp"].includes(mimeType.substring(6).toLowerCase());
}

function loadImageToCanvas(imageFile) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = URL.createObjectURL(imageFile);

    image.onerror = () => {
      URL.revokeObjectURL(this.src);
      console.error("cannot load image");
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

function convertCanvasToAscii() {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const grayValue = rgbToGrayscale(data[i], data[i + 1], data[i + 2]);

    data[i] = grayValue; // red
    data[i + 1] = grayValue; // green
    data[i + 2] = grayValue; // blue
  }

  // TODO: ensure this is a number
  const kernelSize = Math.min(+kernelInput.value, Math.min(canvas.width, canvas.height));

  if (kernelSize <= 0) {
    console.error("Invalid kernel size");
    return;
  }

  let ascii = "";

  for (let y = 0; y < canvas.height; y += kernelSize) {
    for (let x = 0; x < canvas.width; x += kernelSize) {
      const brightness = calculateKernelBrightness(imageData, x, y, kernelSize);
      const characterIndex = Math.floor((brightness / 256) * CHARACTERS.length);
      ascii += CHARACTERS[characterIndex];
    }

    ascii += "\n";
  }

  asciiContainer.innerText = ascii;
}

function calculateKernelBrightness(imageData, xStart, yStart, kernelSize) {
  const xEnd = xStart + kernelSize;
  const yEnd = yStart + kernelSize;
  const pixelCount = kernelSize * kernelSize;
  let sum = 0;
  let test = 0;

  for (let y = yStart; y < yEnd; y++) {
    for (let x = xStart; x < xEnd; x++) {
      if (x < canvas.width && y < canvas.height) {
        sum += imageData.data[coordinateToPixelIndex(x, y, imageData.width)];
      }
      test++;
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
