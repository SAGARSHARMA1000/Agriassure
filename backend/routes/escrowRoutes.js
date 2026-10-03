const express = require('express');
const router = express.Router();
//const { authMiddleware } = require('../middleware/auth');
const {
  depositEscrow,
  createRazorpayOrder,
  getBuyerEscrowDashboard,
  getFarmerEscrowDashboard,
  confirmDelivery,
  getBuyerPaymentDetails,
  getBuyerEscrows,
  farmerRequestPayout,
} = require("../controllers/escrowController");

router.post("/create-order", createRazorpayOrder);
router.post("/deposit", depositEscrow);
router.post("/confirm-delivery", confirmDelivery);
router.get("/dashboard/:buyerId", getBuyerEscrowDashboard);
router.get("/buyer/:buyerId", getBuyerPaymentDetails);
router.get("/farmer/:farmerId", getFarmerEscrowDashboard);
router.get("/buyer/v1/:buyerId", getBuyerEscrows);
router.post("/farmer/payout", farmerRequestPayout);

module.exports = router;
