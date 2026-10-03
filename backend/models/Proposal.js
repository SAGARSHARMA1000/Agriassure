
const mongoose = require("mongoose");

const proposalSchema = new mongoose.Schema({
  // 🔗 Listing reference (optional for now)
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Listing"
  },

  // Snapshot of listing (VERY IMPORTANT for UI)
  listing: {
    commodity: String,
    quantity: String,
    price: Number,
    quality: String,
    farmAddress: String,
    
  },
  negotiation:{type:Boolean},

  // BUYER INFO
  buyerId: { type: String, required: true },
  buyerName: { type: String, required: true },

  // FARMER INFO
  farmerId: { type: String, required:true },
  farmerName: { type: String, required:true },

  // OFFER DETAILS
  offerPrice: { type: Number, required: true },
  quantity: { type: String },
  unit: { type: String, default: "Qtl" },
  deliveryAddress: { type: String },
  pickupDate: { type: String },
  note: { type: String },

  // WORKFLOW
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "escrow_funded"],
    default: "pending"
  },

  signatures: {
    farmer: { type: Boolean, default: false },
    buyer: { type: Boolean, default: false }
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Proposal", proposalSchema);
