const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema(
  {
    commodity: {
      type: String,
      required: [true, "Commodity name is required"],
      trim: true,
    },

    cropCategory: {
      type: String,
      enum: ["Grains", "Pulses", "Oilseeds", "Vegetables", "Fruits", "Commercial", "Other"],
      default: "Grains",
    },

    variety: {
      type: String,
      trim: true,
    },

    quantity: {
      type: String,
      required: [true, "Quantity is required"],
    },

    unit: {
      type: String,
      default: "quintal",
    },

    price: {
      type: Number,
      required: [true, "Price per unit is required"],
    },

    quality: {
      type: String,
      default: "Grade A",
    },

    farmAddress: {
      type: String,
      required: [true, "Farm address/location is required"],
      trim: true,
    },

    // Farmer identity
    farmerId: {
      type: String,
      required: [true, "Farmer ID is required"],
    },

    farmerName: {
      type: String,
      required: [true, "Farmer Name is required"],
    },

    // Price Negotiation
    negotiationAllowed: {
      type: Boolean,
      default: false,
    },
    minPrice: { type: Number },
    maxPrice: { type: Number },

    // Crop Image - STRICTLY REQUIRED
    image: {
      type: String,
      required: [true, "Crop image is strictly required"],
    },

    // Extended Agricultural Metadata
    harvestDate: {
      type: String,
    },
    organicCertified: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["active", "booked", "closed"],
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Listing", listingSchema);
