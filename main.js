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

  loadImageToCanvas(file);
};

function isValidMimeType(mimeType) {
  if (!mimeType?.startsWith("image/")) {
    return false;
  }

  return ["jpeg", "png", "webp"].includes(mimeType.substring(6).toLowerCase());
}

function loadImageToCanvas(file) {
  const image = new Image();
  image.src = URL.createObjectURL(file);

  image.onerror = () => {
    URL.revokeObjectURL(this.src);
    console.error("cannot load image");
  };

  image.onload = () => {
    URL.revokeObjectURL(this.src);
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0, image.width, image.height);
  };
}
