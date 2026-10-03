
const mongoose = require("mongoose");
const Delivery = require("../models/Delivery");
const Escrow = require("../models/Escrow");
const Contract = require("../models/Contract");

module.exports = async () => {
  //const session = await mongoose.startSession();

  try {
   

    const cutoff = new Date(Date.now() - 1 * 60 * 1000);

    const deliveries = await Delivery.find({
      deliveryStatus: "DELIVERED_TO_BUYER",
      deliveredAt: { $lte: cutoff }
    });

    for (const delivery of deliveries) {
      if (delivery.deliveryStatus === "ESCROW_RELEASED") continue;
      delivery.deliveryStatus = "AUTO_CONFIRMED";
      delivery.timeline.push({ status: "Auto Confirmed" });
      delivery.deliveryStatus = "ESCROW_RELEASED";
      delivery.timeline.push({ status: "Escrow is released by plaform" });

      const escrow = await Escrow.findOne({
        contractId: delivery.contractId
      });

      const contract = await Contract.findById(delivery.contractId);

      escrow.status = "released";
      escrow.releasedAt = new Date();

      contract.status = "closed";
      contract.closedAt = new Date();

      await delivery.save();
      await escrow.save();
      await contract.save();
    }

    console.log("✅ Auto-confirm cron executed");

  } catch (err) {
   
    console.error("❌ Auto-confirm cron failed", err);
  }
};
