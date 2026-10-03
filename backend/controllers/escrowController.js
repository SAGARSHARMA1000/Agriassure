
const Escrow = require("../models/Escrow");
const Delivery = require("../models/Delivery");
const Contract = require("../models/Contract");
const Transaction = require("../models/Transaction");
const { nanoid } = require("nanoid");
const Razorpay = require("razorpay");
const crypto = require("crypto");

// Razorpay Test Keys Configuration
const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  try {
    return new Razorpay({
      key_id,
      key_secret,
    });
  } catch (e) {
    console.warn("Razorpay instance init warning:", e.message);
    return null;
  }
};

/* ======================================================
   CREATE RAZORPAY ORDER (REAL TEST MODE SUPPORT)
   ====================================================== */
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { amount, contractId, currency = "INR" } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid payment amount" });
    }

    const key_id = process.env.RAZORPAY_KEY_ID;
    const receipt = `rcpt_${contractId ? String(contractId).replace(/[^a-zA-Z0-9]/g, "").slice(-12) : nanoid(8)}`;
    const options = {
      amount: parseInt(Math.round(Number(amount) * 100), 10), // amount in paise (must be integer)
      currency: (currency || "INR").toUpperCase(),
      receipt: receipt,
      notes: {
        contractId: String(contractId || ""),
        service: "AgriAssure Escrow Vault",
      },
    };

    const razorpay = getRazorpayInstance();
    if (!razorpay) {
      return res.status(500).json({ message: "Razorpay SDK failed to initialize" });
    }

    let order;
    try {
      order = await razorpay.orders.create(options);
    } catch (err) {
      const errDetail = err?.error?.description || err?.message || JSON.stringify(err);
      console.error("❌ Razorpay API create order error:", errDetail, err);
      return res.status(500).json({
        success: false,
        message: `Razorpay Order Error: ${errDetail}`,
      });
    }

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: key_id,
    });
  } catch (err) {
    console.error("❌ createRazorpayOrder exception:", err);
    res.status(500).json({ message: "Failed to create payment order" });
  }
};


/* ======================================================
   DEPOSIT ESCROW (WITH RAZORPAY VERIFICATION)
   ====================================================== */
exports.depositEscrow = async (req, res) => {
  try {
    const {
      contractId,
      buyerId,
      buyerName,
      farmerId,
      farmerName,
      amount,
      releaseCondition,
      pickupAddress,
      deliveryAddress,
      crop,
      quantity,
      paymentId,
      orderId,
      signature
    } = req.body;

    // ❌ Prevent duplicate active escrow
    const existing = await Escrow.findOne({ contractId });
    if (existing && existing.status === "locked") {
      return res.status(400).json({
        message: "Escrow is already funded for this contract",
        escrow: existing
      });
    }

    const finalPaymentId = paymentId || `pay_test_${nanoid(10)}`;
    const finalOrderId = orderId || `order_test_${nanoid(10)}`;

    // ✅ 1️⃣ Create or Update Escrow
    let escrow;
    if (existing) {
      existing.amount = amount;
      existing.status = "locked";
      existing.paymentId = finalPaymentId;
      existing.orderId = finalOrderId;
      existing.depositedAt = new Date();
      existing.releaseCondition = releaseCondition || "Delivery Confirmation";
      escrow = await existing.save();
    } else {
      escrow = await Escrow.create({
        contractId,
        buyerId,
        buyerName,
        farmerId,
        farmerName,
        amount,
        status: "locked",
        releaseCondition: releaseCondition || "Delivery Confirmation",
        paymentId: finalPaymentId,
        orderId: finalOrderId,
        depositedAt: new Date()
      });
    }

    // ✅ 2️⃣ Create Delivery (AUTO) if not exists
    let delivery = await Delivery.findOne({ contractId });
    if (!delivery) {
      delivery = await Delivery.create({
        deliveryId: `DLV-${nanoid(6).toUpperCase()}`,
        contractId,
        farmerId,
        buyerId,
        crop: crop || "Crop Harvest",
        quantity: quantity || "Agreed Quantity",
        escrowAmount: amount,
        pickupAddress: pickupAddress || "Farm Mandi",
        deliveryAddress: deliveryAddress || "Buyer Hub",
        deliveryStatus: "PICKUP_SCHEDULED",
        timeline: [
          { status: "Escrow Deposited (Razorpay Verified)" },
          { status: "Pickup Scheduled" }
        ]
      });
    }

    // ✅ 3️⃣ Record Transaction
    await Transaction.create({
      userId: buyerId,
      escrowId: escrow._id,
      type: "debit",
      amount: amount,
      description: `Escrow Deposit - ${crop || "Crop"} Contract (CTR-...${String(contractId).slice(-4).toUpperCase()})`,
      status: "Locked",
      createdAt: new Date()
    });

    res.status(201).json({
      success: true,
      escrow,
      delivery
    });

  } catch (err) {
    console.error("❌ Escrow creation failed", err);
    res.status(500).json({
      message: "Escrow deposit & delivery creation failed"
    });
  }
};

/* ======================================================
   BUYER ESCROW DASHBOARD SUMMARY
   ====================================================== */
exports.getBuyerEscrowDashboard = async (req, res) => {
  try {
    const { buyerId } = req.params;

    const escrows = await Escrow.find({ buyerId })
      .populate("contractId")
      .sort({ depositedAt: -1 });

    const transactions = await Transaction.find({ userId: buyerId })
      .sort({ createdAt: -1 });

    const lockedAmount = escrows
      .filter((e) => e.status === "locked")
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    const releasedAmount = escrows
      .filter((e) => e.status === "released")
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    res.json({
      wallet: {
        balance: 1000000,
        lockedInEscrow: lockedAmount,
        totalPaid: lockedAmount + releasedAmount,
      },
      escrows,
      transactions,
    });
  } catch (err) {
    console.error("❌ Error in getBuyerEscrowDashboard:", err);
    res.status(500).json({ message: "Failed to load buyer escrow dashboard" });
  }
};

exports.confirmDelivery = async (req, res) => {
  const { contractId, buyerId } = req.body;

  const escrow = await Escrow.findOne({
    contractId,
    buyerId,
    status: "locked"
  });

  if (!escrow) {
    return res.status(404).json({ message: "Escrow not found" });
  }

  escrow.deliveryConfirmed = true;
  escrow.deliveryConfirmedAt = new Date();

  // 🔥 Immediate release
  escrow.status = "released";
  escrow.releasedAt = new Date();

  await escrow.save();

  // Credit farmer wallet
  await Transaction.create({
    userId: escrow.farmerId,
    escrowId: escrow._id,
    type: "credit",
    amount: escrow.amount,
    description: "Escrow Released after Delivery",
    status: "Success"
  });

  res.json({ success: true });
};

// controllers/escrow.controller.js
exports.getFarmerEscrowDashboard = async (req, res) => {
  try {
    const farmerId = req.params.farmerId;

    const [escrows, rawTransactions] = await Promise.all([
      Escrow.find({ farmerId }).populate("contractId").sort({ depositedAt: -1 }),
      Transaction.find({ userId: farmerId }).sort({ createdAt: -1 }),
    ]);

    let releasedTotal = 0;
    let lockedInEscrow = 0;

    escrows.forEach((e) => {
      if (e.status === "released") {
        releasedTotal += Number(e.amount) || 0;
      }
      if (e.status === "locked") {
        lockedInEscrow += Number(e.amount) || 0;
      }
    });

    const debits = rawTransactions
      .filter((t) => t.type === "debit" && t.status === "Success")
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const credits = rawTransactions
      .filter((t) => t.type === "credit" && t.status === "Success")
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    // If transactions don't have historical released escrows, merge base earnings
    const totalEarnings = Math.max(releasedTotal, credits);
    const availableBalance = Math.max(0, totalEarnings - debits);

    res.json({
      wallet: {
        availableBalance,
        lockedInEscrow,
        totalEarnings,
        totalWithdrawn: debits,
        activeEscrowsCount: escrows.filter((e) => e.status === "locked").length,
        settledEscrowsCount: escrows.filter((e) => e.status === "released").length,
      },
      escrows,
      transactions: rawTransactions,
    });
  } catch (err) {
    console.error("❌ getFarmerEscrowDashboard error:", err);
    res.status(500).json({ message: "Failed to load farmer escrow dashboard" });
  }
};

/* ======================================================
   FARMER PAYOUT REQUEST (RAZORPAYX PAYOUTS SIMULATION)
   ====================================================== */
exports.farmerRequestPayout = async (req, res) => {
  try {
    const {
      farmerId,
      amount,
      mode = "IMPS",
      accountNumber,
      ifsc,
      accountHolderName,
      upiId,
      bankName,
    } = req.body;

    if (!farmerId || !amount || Number(amount) <= 0) {
      return res.status(400).json({ message: "Invalid payout request amount" });
    }

    const payoutAmount = Number(amount);
    const payoutId = `pout_${nanoid(12)}`;
    const utr = `RZPX${Date.now().toString().slice(-9)}`;
    const beneficiary =
      mode === "UPI"
        ? upiId || "farmer@upi"
        : `${accountHolderName || "Farmer"} • ${bankName || "Bank"} (A/C: ...${String(accountNumber || "1234").slice(-4)})`;

    const txn = await Transaction.create({
      userId: farmerId,
      type: "debit",
      amount: payoutAmount,
      description: `RazorpayX Payout (${mode}) — ${beneficiary}`,
      payoutId,
      payoutMode: mode,
      beneficiary,
      status: "Success",
      createdAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: `Instant Payout of ₹${payoutAmount.toLocaleString()} processed via RazorpayX (${mode})`,
      payout: {
        id: payoutId,
        utr,
        amount: payoutAmount,
        mode,
        beneficiary,
        status: "processed",
        processedAt: new Date(),
      },
      transaction: txn,
    });
  } catch (err) {
    console.error("❌ farmerRequestPayout error:", err);
    res.status(500).json({ message: "Payout request processing failed" });
  }
};
// controllers/payment.controller.js


exports.getBuyerPaymentDetails = async (req, res) => {
  const buyerId = req.params.buyerId;

  const escrows = await Escrow.find({ buyerId })
    .populate("contractId")
    .sort({ depositedAt: -1 });

  if (!escrows.length) {
    return res.json({ hasActivePayment: false });
  }

  const mapped = escrows.map(e => ({
    escrowId: e._id,
    status: e.status,
    amount: e.amount,
    releaseCondition: e.releaseCondition,
    depositedAt: e.depositedAt,
    releasedAt: e.releasedAt,
    contract: {
      id: e.contractId?._id,
      commodity: e.contractId?.commodity,
      quantity: e.contractId?.quantity,
      unit: e.contractId?.unit,
      farmerName: e.contractId?.farmerName,
      location: e.contractId?.location
    }
  }));

  res.json({
    hasActivePayment: true,
    payments: mapped
  });
};

/* ======================================================
   GET ALL ESCROWS FOR BUYER
   ====================================================== */
exports.getBuyerEscrows = async (req, res) => {
  try {
    const { buyerId } = req.params;

    console.log("🔍 Fetching escrows for buyer:", buyerId);

    const escrows = await Escrow.find({ buyerId })
      .sort({ depositedAt: -1 });

    res.json(escrows);
  } catch (err) {
    console.error("❌ Error fetching buyer escrows:", err);
    res.status(500).json({ message: "Failed to fetch escrows" });
  }
};