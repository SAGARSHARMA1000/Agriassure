const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  userId: String, // buyer or farmer
  escrowId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Escrow"
  },

  type: {
    type: String,
    enum: ["credit", "debit"]
  },

  amount: Number,

  description: String,

  payoutId: String,
  payoutMode: String,
  beneficiary: String,

  status: {
    type: String,
    default: "Success"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Transaction", transactionSchema);
