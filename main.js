const imageInput = document.getElementById("imageInput");

const canvas = document.getElementById("imageCanvas");
const ctx = canvas.getContext("2d");

imageInput.onchange = (event) => {
  if (event.target.files.length != 1) {
    console.error("1 file must be provided");
    return;
  }

  const file = event.target.files[0];

  if (!isValidMimeType(file.type)) {
    console.error("Invalid mime type");
  }

  loadImageToCanvas(file).then(convertCanvasToGrayscale).catch(console.error);
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

function convertCanvasToGrayscale() {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const grayValue = rgbToGrayscale(data[i], data[i + 1], data[i + 2]);

    data[i] = grayValue; // red
    data[i + 1] = grayValue; // green
    data[i + 2] = grayValue; // blue
  }

  ctx.putImageData(imageData, 0, 0);
}

function rgbToGrayscale(red, green, blue) {
  // https://github.com/image-js/image-js/blob/9ab86a86f6c13a9a7d14c62566c1396c3c6f54f4/src/image/transform/greyAlgorithms.js
  return (red * 6966 + green * 23436 + blue * 2366) >> 15;
}
