const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const {
  createListing,
  getAllListings,
  getListing,
  deleteListing,
  updateListing,
  getFarmerListings,
} = require("../controllers/listingController");

// Safe Multer upload handler to catch Cloudinary upload errors gracefully
const handleMulterUpload = (fieldName) => (req, res, next) => {
  upload.single(fieldName)(req, res, (err) => {
    if (err) {
      console.error(`❌ [Multer/Cloudinary Upload Error on field '${fieldName}']:`, err);
      return res.status(400).json({
        success: false,
        message: `Image Upload Failed: ${err.message || "Cloudinary upload error"}`,
      });
    }
    next();
  });
};

router.get("/", getAllListings);
router.get("/farmer", getFarmerListings);
router.get("/:id", getListing);

router.post("/", handleMulterUpload("image"), createListing);
router.put("/:id", handleMulterUpload("image"), updateListing);
router.delete("/:id", deleteListing);

module.exports = router;
