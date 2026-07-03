const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// Store uploaded images directly on Cloudinary — no local disk, works on Render
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "propvista/properties",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1200, height: 750, crop: "fill", quality: "auto" }],
  },
});

const upload = multer({ storage });

module.exports = upload;
