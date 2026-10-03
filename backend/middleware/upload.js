const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/Cloudinary");

// Storage configuration for crop images
const cropStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "agriassure/cropImages",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

// Storage configuration for buyer & farmer signatures
const signatureStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "agriassure/signatures",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

// Multer upload instances
const upload = multer({
  storage: cropStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const signatureUpload = multer({
  storage: signatureStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Attach named properties for flexible importing
upload.cropUpload = upload;
upload.signatureUpload = signatureUpload;

module.exports = upload;
module.exports.upload = upload;
module.exports.cropUpload = upload;
module.exports.signatureUpload = signatureUpload;