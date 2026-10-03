const Listing = require('../models/Listing');

exports.createListing = async (req, res) => {
  try {
   // console.log("📦 [createListing] Received req.body:", req.body);
   // console.log("☁️ [createListing] Received Cloudinary file:", req.file ? req.file.path : "No file");

    const body = req.body || {};

    const {
      commodity,
      cropCategory,
      quantity,
      unit,
      price,
      quality,
      farmAddress,
      farmerId,
      farmerName,
      negotiationAllowed,
      minPrice,
      maxPrice,
      harvestDate,
      organicCertified,
      description,
      variety,
    } = body;

    // Clean boolean parses
    const isNegotiationAllowed = negotiationAllowed === "true" || negotiationAllowed === true;
    const isOrganicCertified = organicCertified === "true" || organicCertified === true;

    // Basic Validations
    if (!commodity || !quantity || !price || !farmAddress) {
      return res.status(400).json({
        success: false,
        message: "Commodity, Quantity, Price, and Farm Address are required fields.",
      });
    }

    // Negotiation Validations
    if (isNegotiationAllowed) {
      if (!minPrice || !maxPrice) {
        return res.status(400).json({
          success: false,
          message: "Min and Max price are required when negotiation is allowed.",
        });
      }

      if (Number(minPrice) > Number(maxPrice)) {
        return res.status(400).json({
          success: false,
          message: "Min price cannot be greater than max price.",
        });
      }
    }

    // ☁️ Extract Cloudinary Image URL
    if (!req.file || (!req.file.path && !req.file.secure_url)) {
      return res.status(400).json({
        success: false,
        message: "Crop image is strictly required and must be uploaded.",
      });
    }

    const imageUrl = req.file.path || req.file.secure_url;

    const listing = await Listing.create({
      commodity,
      cropCategory: cropCategory || "Grains",
      variety: variety || "",
      quantity: String(quantity),
      unit: unit || "quintal",
      price: Number(price),
      quality: quality || "Grade A",
      farmAddress: farmAddress.trim(),
      farmerId: farmerId || "f1",
      farmerName: farmerName || "Demo Farmer",
      negotiationAllowed: isNegotiationAllowed,
      ...(isNegotiationAllowed && {
        minPrice: Number(minPrice),
        maxPrice: Number(maxPrice),
      }),
      image: imageUrl,
      harvestDate: harvestDate || "",
      organicCertified: isOrganicCertified,
      description: description || "",
      status: "active",
    });

   // console.log("✅ [createListing] Successfully created Cloudinary listing:", listing._id, "URL:", imageUrl);

    return res.status(201).json({
      success: true,
      listing,
      data: listing,
    });
  } catch (err) {
    // console.error("❌ [createListing Error]:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Listing creation failed.",
    });
  }
};

exports.getFarmerListings = async (req, res) => {
  try {
    const { farmerId, farmerName } = req.query;

    if (!farmerId && !farmerName) {
      return res.status(400).json({
        success: false,
        message: "farmerId is required",
      });
    }

    const queryConditions = [];
    if (farmerId) {
      queryConditions.push({ farmerId: String(farmerId) });
    }
    if (farmerName) {
      queryConditions.push({ farmerName: String(farmerName) });
    }

    const listings = await Listing.find(
      queryConditions.length > 1 ? { $or: queryConditions } : queryConditions[0]
    ).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: listings,
    });
  } catch (error) {
    console.error("Get farmer listings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch farmer listings",
    });
  }
};

exports.getAllListings = async (req, res) => {
  try {
    const listings = await Listing.find({
      status: "active",
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: listings,
    });
  } catch (error) {
    console.error("❌ [Marketplace] getAllListings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch marketplace listings",
    });
  }
};

exports.getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Not found" });
    res.json(listing);
  } catch (err) {
    next(err);
  }
};

/* DELETE LISTING */
exports.deleteListing = async (req, res) => {
  try {
    await Listing.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Listing deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
};

/* UPDATE LISTING */
exports.updateListing = async (req, res) => {
  try {
    const updateData = { ...req.body };

    // If new image file uploaded via Cloudinary, update image URL
    if (req.file && (req.file.path || req.file.secure_url)) {
      updateData.image = req.file.path || req.file.secure_url;
    }

    // Clean boolean parse
    if (updateData.negotiationAllowed !== undefined) {
      updateData.negotiationAllowed = updateData.negotiationAllowed === "true" || updateData.negotiationAllowed === true;
    }
    if (updateData.organicCertified !== undefined) {
      updateData.organicCertified = updateData.organicCertified === "true" || updateData.organicCertified === true;
    }

    const updated = await Listing.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (err) {
    console.error("Update listing error:", err);
    res.status(500).json({ message: "Update failed" });
  }
};