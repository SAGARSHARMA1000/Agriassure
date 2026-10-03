const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  //name
  name: { type: String, required: true },

  // Phone REQUIRED for your app
  phone: {
    type: String,
    required: true,
    unique: true, // ⭐ ensure no duplicate phone numbers
  },
  location: { type: String },
  // 🔹 NEW (role-specific)
  farmAddress: { type: String }, // for farmers
  deliveryAddress: { type: String }, // for buyers

  role: {
    type: String,
    enum: ["farmer", "buyer", "admin"],
    default: "farmer",
  },

  businessName: { type: String },
  cropSpecialty: { type: String },
  passwordHash: { type: String, required: true },

  kyc: {
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    documents: [{ url: String, filename: String }],
  },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
