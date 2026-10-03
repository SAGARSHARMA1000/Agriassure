
const mongoose = require("mongoose");

const escrowSchema = new mongoose.Schema({
  contractId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Contract",
    required: true
  },

  buyerId: { type: String, required: true },
  buyerName: { type: String, required: true },
  farmerId: { type: String, required: true },
  farmerName: { type: String, required: true },

  amount: { type: Number, required: true },

  status: {
    type: String,
    enum: ["pending","locked", "released"],
    default: "Pending"
  },

  releaseCondition: {
    type: String,
    default: "Delivery Confirmation"
  },

  depositedAt: {
    type: Date,
    //default: Date.now
  },
  deliveryConfirmed: {
  type: Boolean,
  default: false
},

  paymentId: String,
  orderId: String,
  paymentGateway: {
    type: String,
    default: "Razorpay"
  },

  releasedAt: Date
});

module.exports = mongoose.model("Escrow", escrowSchema);
