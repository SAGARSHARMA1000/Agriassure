const express = require('express');
const router = express.Router();
const { signatureUpload } = require("../middleware/upload");
const {
  getContractByProposal,
  buyerSignContract,
  getFarmerContracts, 
  farmerSignContract,
  getContractById,
  getBuyerContracts,
  rejectContract
} = require('../controllers/contractController');

// Safe upload wrapper for signatures
const handleSignatureUpload = (fieldName) => (req, res, next) => {
  signatureUpload.single(fieldName)(req, res, (err) => {
    if (err) {
      console.error(`❌ [Multer/Cloudinary Signature Upload Error on field '${fieldName}']:`, err);
      return res.status(400).json({
        success: false,
        message: `Signature Upload Failed: ${err.message || "Cloudinary upload error"}`,
      });
    }
    next();
  });
};

router.get("/proposal/:proposalId", getContractByProposal);
router.post("/:contractId/buyer-sign", handleSignatureUpload("signature"), buyerSignContract);
router.get("/farmer/:farmerId", getFarmerContracts);
router.post("/:contractId/farmer-sign", handleSignatureUpload("signature"), farmerSignContract);
router.get("/:contractId", getContractById);
router.get("/buyer/:buyerId", getBuyerContracts);
router.post("/:contractId/reject", rejectContract);

module.exports = router;

