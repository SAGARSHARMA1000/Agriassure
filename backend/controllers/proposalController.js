
const Proposal = require("../models/Proposal");
const Contract = require("../models/Contract");

exports.createProposal = async (req, res) => {
  try {
    const {
      listingId,
      listing,
      commodity,
      negotiation,
      buyerId,
      buyerName,
      farmerId,
      farmerName,
      offerPrice,
      quantity,
      unit,
      deliveryAddress,
      pickupDate,
      note
    } = req.body;

    // 🛑 BASIC VALIDATION
    if (!buyerId || !buyerName || !offerPrice || !listing) {
      return res.status(400).json({
        message: "Missing required proposal fields"
      });
    }

    const proposal = await Proposal.create({
      listingId,
      listing,
      commodity,
      negotiation,
      buyerId,
      buyerName,
      buyerId,
      farmerId,
      farmerName: req.body.farmerName?.trim(),
      offerPrice,
      quantity,
      unit,
      deliveryAddress,
      pickupDate,
      note,
      status: "pending"
    });

    res.status(201).json({
      success: true,
      proposal
    });

  } catch (err) {
    console.error("❌ Proposal creation error:", err);
    res.status(500).json({
      message: "Proposal creation failed",
      error: err.message
    });
  }
};


exports.getFarmerProposals = async (req, res) => {
  try {
    const rawName = req.query.farmerName;

    const farmerName = rawName?.trim(); // ✅ FIX

    const proposals = await Proposal.find({
      sellerName: farmerName
    });

 //   console.log("📦 Found proposals:", proposals.length);

    res.json(proposals);
  } catch (err) {
    console.error("❌ Error fetching proposals:", err);
    res.status(500).json({ message: "Failed to fetch proposals" });
  }
};


exports.updateProposalStatus = async (req, res) => {
  //console.log("🔥 PATCH HIT");
  //console.log("ID:", req.params.id);
  //console.log("BODY:", req.body);
  try {
    const { status } = req.body;

    const proposal = await Proposal.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!proposal) {
      return res.status(404).json({ message: "Proposal not found" });
    }

    res.json({ proposal });
  } catch (err) {
    console.error("Update proposal error:", err);
    res.status(500).json({ message: "Failed to update proposal" });
  }
};

exports.getAllProposals = async (req, res) => {
  try {
    const proposals = await Proposal.find().sort({ createdAt: -1 });

    res.status(200).json(proposals);
  } catch (err) {
    console.error("❌ getAllProposals error:", err);
    res.status(500).json({ message: "Failed to fetch proposals" });
  }
};


exports.createContractFromProposal = async (req, res) => {
  try {
    const { proposalId } = req.params;

   // console.log("📌 Creating contract for proposal:", proposalId);

    const proposal = await Proposal.findById(proposalId);
    if (!proposal) {
      return res.status(404).json({ message: "Proposal not found" });
    }

    if (proposal.status !== "accepted") {
      return res.status(400).json({
        message: "Proposal must be accepted before contract creation"
      });
    }

    // 🚫 Prevent duplicate contracts
    const existing = await Contract.findOne({ proposalId });
    if (existing) {
      return res.json(existing);
    }

    const contract = await Contract.create({
      proposalId: proposal._id,

      buyerId: proposal.buyerId,
      buyerName: proposal.buyerName,

      farmerId: proposal.farmerId,
      farmerName: proposal.farmerName,

      commodity: proposal.listing?.commodity,
      price:proposal.listing?.price,

      quantity: proposal.quantity,
      unit: proposal.unit,
      offerPrice: proposal.offerPrice,
      deliveryAddress:proposal.deliveryAddress,
      pickupDate: proposal.pickupDate,
      farmAddress: proposal.listing?.farmAddress
    });

    res.status(201).json(contract);
  } catch (err) {
    console.error("❌ Contract creation failed:", err);
    res.status(500).json({ error: "Server error" });
  }
};
