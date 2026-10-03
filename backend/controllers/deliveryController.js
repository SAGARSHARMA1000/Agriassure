const mongoose = require("mongoose");
const Delivery = require("../models/Delivery");
const Escrow = require("../models/Escrow");
const Contract = require("../models/Contract");

/* PLATFORM */
exports.getAllDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.find()
      .sort({ createdAt: -1 })
      .populate("farmerId", "name phone farmAddress")
      .populate("buyerId", "name phone deliveryAddress");

    res.status(200).json({
      success: true,
      count: deliveries.length,
      deliveries
    });
  } catch (error) {
    console.error("❌ Failed to fetch deliveries (admin)", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch deliveries"
    });
  }
};


exports.schedulePickup = async (req, res) => {
  const d = await Delivery.findById(req.body.deliveryId);
  d.deliveryStatus = "PICKUP_SCHEDULED";
  d.timeline.push({ status: "Pickup Scheduled" });
  await d.save();
  res.json(d);
};

exports.collectedFromFarmer = async (req, res) => {
  const d = await Delivery.findById(req.body.deliveryId);
  d.deliveryStatus = "COLLECTED_FROM_FARMER";
  d.timeline.push({ status: "Collected from Farmer" });
  await d.save();
  res.json(d);
};

exports.markInTransit = async (req, res) => {
  const d = await Delivery.findById(req.body.deliveryId);
  d.deliveryStatus = "IN_TRANSIT";
  d.timeline.push({ status: "In Transit" });
  await d.save();
  res.json(d);
};



exports.deliveredToBuyer = async (req, res) => {
  try {
    const { deliveryId } = req.body;

    const d = await Delivery.findById(deliveryId);
    if (!d) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    // ✅ Prevent duplicate marking
    if (d.deliveryStatus === "DELIVERED_TO_BUYER") {
      return res.status(400).json({ message: "Already marked as delivered" });
    }

    d.deliveryStatus = "DELIVERED_TO_BUYER";
    d.deliveredAt = new Date(); // ⭐ START POINT
    d.timeline.push({
      status: "Delivered to Buyer",
      at: new Date()
    });

    await d.save();

    res.json({
      success: true,
      message: "Delivery marked as delivered. Auto-confirm will trigger after 24 hours.",
      delivery: d
    });

  } catch (err) {
    console.error("❌ Admin deliveredToBuyer failed", err);
    res.status(500).json({ message: "Failed to mark delivery" });
  }
};


exports.buyerConfirm = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    //session.startTransaction();

    const { deliveryId } = req.body;

    /* ================= 1. DELIVERY ================= */

    const delivery = await Delivery.findById(deliveryId).session(session);
    if (!delivery)
      throw new Error("Delivery not found");

    if (delivery.deliveryStatus !== "DELIVERED_TO_BUYER")
      throw new Error("Delivery not eligible for confirmation");

    delivery.deliveryStatus = "CONFIRMED_BY_BUYER";
    delivery.timeline.push({ status: "Buyer Confirmed" });
    delivery.deliveryStatus = "ESCROW_RELEASED";
    delivery.timeline.push({ status: "Escrow Released" });

    /* ================= 2. ESCROW ================= */

    const escrow = await Escrow.findOne({
      contractId: delivery.contractId
    });

    if (!escrow)
      throw new Error("Escrow not found");

    escrow.status = "released";
    escrow.releasedAt = new Date();

    /* ================= 3. CONTRACT ================= */

    const contract = await Contract.findById(delivery.contractId).session(session);
    if (!contract)
      throw new Error("Contract not found");

    contract.status = "closed";
    contract.closedAt = new Date();

    /* ================= SAVE ALL ================= */

    await delivery.save({ session });
    await escrow.save({ session });
    await contract.save({ session });

    //await session.commitTransaction();
    //session.endSession();

    res.json({
      success: true,
      message: "Delivery confirmed, escrow released, contract closed"
    });

  } catch (err) {
   // await session.abortTransaction();
   // session.endSession();

    console.error("❌ Buyer confirm failed", err);
    res.status(500).json({
      success: false,
      message: err.message || "Buyer confirmation failed"
    });
  }
};

exports.reportIssue = async (req, res) => {
  const d = await Delivery.findById(req.body.deliveryId);

  d.deliveryStatus = "ISSUE_REPORTED";
  d.issue = {
    description: req.body.description,
    createdAt: new Date()
  };

  d.timeline.push({ status: "Issue Reported" });
  await d.save();
  res.json({ message: "Issue reported" });
};

/* FETCH */

exports.getFarmerDeliveries = async (req, res) => {
  const data = await Delivery.find({ farmerId: req.params.farmerId });
  res.json(data);
};

exports.getBuyerDeliveries = async (req, res) => {
  const data = await Delivery.find({ buyerId: req.params.buyerId });
  res.json(data);
};
