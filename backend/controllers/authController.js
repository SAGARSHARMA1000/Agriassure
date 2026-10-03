const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// REGISTER
exports.register = async (req, res, next) => {
  //console.log("📩 REGISTRATION REQUEST BODY:", req.body);
  try {
    const {
      name,
      phone,
      password,
      role,
      location,
      businessName,
      cropSpecialty,
    } = req.body;

    if (!name || !phone || !password)
      return res
        .status(400)
        .json({ message: "Name, phone & password required" });

    // Check duplicate phone
    let existing = await User.findOne({ phone });
    if (existing)
      return res
        .status(400)
        .json({ message: "Phone number already registered" });

    // Create user
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      phone,
      role: role,
      location,
      businessName,
      cropSpecialty,
      passwordHash: hash,
    });

    const token = signToken(user);

    return res.json({
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        location: user.location,
      },
      token,
    });
  } catch (err) {
    console.error("Registration error:", err);
    return res
      .status(500)
      .json({ message: "Server error during registration" });
  }
};

// LOGIN
exports.login = async (req, res, next) => {
  try {
    const { phone, password } = req.body;
    // console.log("📩 login REQUEST BODY:", req.body);

    if (!phone || !password)
      return res.status(400).json({ message: "Phone & password required" });

    const user = await User.findOne({ phone });
    if (!user) return res.status(401).json({ message: "Invalid phone" });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ message: "Incorrect password" });

    const token = signToken(user);

    res.json({
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        phone: user.phone,
        location: user.location,
      },
      token,
    });
  } catch (err) {
    next(err);
  }
};
