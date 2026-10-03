import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  X,
  ShieldCheck,
  Tag,
  MapPin,
  Calendar,
  IndianRupee,
  Send,
  Wheat,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from "lucide-react";

const ProposalModal = ({ isOpen, onClose, listing, user, onSubmit }) => {
  const [submitting, setSubmitting] = useState(false);

  const [offer, setOffer] = useState({
    offerPrice: "",
    quantity: "",
    unit: "Qtl",
    deliveryAddress: "",
    pickupDate: "",
    note: "",
  });

  /* 🔒 PREFILL & RESET */
  useEffect(() => {
    if (listing) {
      setOffer((prev) => ({
        ...prev,
        offerPrice: listing.price || "",
        quantity: listing.quantity ? String(listing.quantity).split(" ")[0] : "",
        deliveryAddress: user?.deliveryAddress || prev.deliveryAddress || "",
      }));
      setSubmitting(false);
    }
  }, [listing, user, isOpen]);

  if (!isOpen || !listing) return null;

  /* QUICK NEGOTIATION BUTTONS */
  const applyNegotiation = (diff) => {
    if (!listing.negotiationAllowed) return;
    setOffer((prev) => ({
      ...prev,
      offerPrice: Math.max(0, Number(listing.price) - diff),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      listingId: listing._id || listing.id,
      listing: {
        commodity: listing.commodity,
        quantity: listing.quantity,
        price: listing.price,
        quality: listing.quality,
        farmAddress: listing.farmAddress || listing.location,
      },
      negotiation: listing.negotiationAllowed,

      buyerId: user?.id || "b1",
      buyerName: user?.name || "Demo Buyer",

      farmerId: listing.farmerId,
      farmerName: listing.farmerName || "Demo Farmer",

      offerPrice: Number(offer.offerPrice),
      quantity: offer.quantity,
      unit: offer.unit,
      deliveryAddress: offer.deliveryAddress,
      pickupDate: offer.pickupDate,
      note: offer.note,

      status: "pending",
    };

    try {
      await onSubmit(payload);
      setSubmitting(false);

      // Trigger Toastify success notification
      toast.success(
        `🎉 Proposal sent successfully to ${listing.farmerName || "Farmer"} for ${listing.commodity}!`,
        {
          position: "top-right",
          autoClose: 3500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );

      // Close the modal upon success
      onClose();
    } catch (err) {
      console.error("Failed to submit proposal:", err);
      toast.error(
        err?.response?.data?.message || "Failed to submit proposal. Please try again.",
        {
          position: "top-right",
          autoClose: 4000,
        }
      );
      setSubmitting(false);
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="relative bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar p-6 text-slate-100 animate-fadeIn">
        {/* ================= PROPOSAL FORM MODAL ================= */}
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Wheat size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Submit Contract Offer
              </h3>
              <p className="text-xs text-slate-400">
                Direct proposal for <span className="text-emerald-300 font-semibold">{listing.commodity}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* LISTING SNAPSHOT BANNER */}
        <div className="mb-5 bg-slate-950/70 border border-white/10 p-4 rounded-2xl space-y-2 text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <span className="text-slate-400 font-medium">Farmer / Seller:</span>
            <span className="font-semibold text-white">{listing.farmerName || "Verified Farmer"}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <span className="text-slate-400">Listing Price: </span>
              <span className="font-bold text-emerald-400 text-sm">₹{listing.price}</span> / Quintal
            </div>
            <div>
              <span className="text-slate-400">Available Qty: </span>
              <span className="font-semibold text-slate-200">{listing.quantity}</span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-400 truncate max-w-[200px]">📍 {listing.farmAddress || listing.location || "Central Storage"}</span>
            <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
              listing.negotiationAllowed
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                : "bg-slate-800 text-slate-400 border border-white/10"
            }`}>
              {listing.negotiationAllowed ? "Negotiable" : "Fixed Price"}
            </span>
          </div>
        </div>

        {/* PROPOSAL FORM */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          {/* OFFER PRICE */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="font-bold uppercase tracking-wider text-slate-300 text-xs">
                Your Offer Price (₹ / Quintal)
              </label>
              {!listing.negotiationAllowed && (
                <span className="text-[11px] text-amber-400">Fixed seller price</span>
              )}
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
              <input
                required
                type="number"
                disabled={!listing.negotiationAllowed}
                className={`w-full pl-8 pr-4 py-2.5 rounded-xl agri-input-dark font-semibold text-base ${
                  !listing.negotiationAllowed ? "opacity-60 cursor-not-allowed bg-slate-950" : ""
                }`}
                value={offer.offerPrice}
                onChange={(e) =>
                  setOffer({ ...offer, offerPrice: e.target.value })
                }
              />
            </div>

            {listing.negotiationAllowed && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[11px] text-slate-400">Quick counter:</span>
                {[50, 100, 200].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => applyNegotiation(val)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-white/10 transition cursor-pointer"
                  >
                    -₹{val}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* QUANTITY & UNIT */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block font-bold uppercase tracking-wider text-slate-300 text-xs mb-1.5">
                Quantity Needed
              </label>
              <input
                required
                type="text"
                placeholder="e.g. 100"
                className="w-full px-3.5 py-2.5 rounded-xl agri-input-dark"
                value={offer.quantity}
                onChange={(e) =>
                  setOffer({ ...offer, quantity: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-300 text-xs mb-1.5">
                Unit
              </label>
              <select
                className="w-full px-3 py-2.5 rounded-xl agri-input-dark"
                value={offer.unit}
                onChange={(e) =>
                  setOffer({ ...offer, unit: e.target.value })
                }
              >
                <option value="Qtl">Quintal</option>
                <option value="Tons">Tons</option>
                <option value="Kg">Kg</option>
              </select>
            </div>
          </div>

          {/* DELIVERY ADDRESS */}
          <div>
            <label className="block font-bold uppercase tracking-wider text-slate-300 text-xs mb-1.5">
              Buyer Delivery Address
            </label>
            <input
              required
              type="text"
              placeholder="Full warehouse or delivery destination address"
              className="w-full px-3.5 py-2.5 rounded-xl agri-input-dark"
              value={offer.deliveryAddress}
              onChange={(e) =>
                setOffer({ ...offer, deliveryAddress: e.target.value })
              }
            />
          </div>

          {/* PICKUP / DELIVERY DATE */}
          <div>
            <label className="block font-bold uppercase tracking-wider text-slate-300 text-xs mb-1.5">
              Expected Delivery / Pickup Date
            </label>
            <input
              required
              type="date"
              className="w-full px-3.5 py-2.5 rounded-xl agri-input-dark"
              value={offer.pickupDate}
              onChange={(e) =>
                setOffer({ ...offer, pickupDate: e.target.value })
              }
            />
          </div>

          {/* NOTE */}
          <div>
            <label className="block font-bold uppercase tracking-wider text-slate-300 text-xs mb-1.5">
              Message to Farmer (Optional)
            </label>
            <textarea
              rows="2"
              placeholder="Add contract requirements, packaging requests, or logistics notes..."
              className="w-full px-3.5 py-2.5 rounded-xl agri-input-dark resize-none"
              value={offer.note}
              onChange={(e) =>
                setOffer({ ...offer, note: e.target.value })
              }
            />
          </div>

          {/* ESCROW ASSURANCE */}
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
            <span>Escrow protection activates once the farmer accepts your offer.</span>
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl font-semibold transition text-xs cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className={`px-6 py-2.5 rounded-xl font-bold text-white transition-all shadow-lg inline-flex items-center gap-2 text-xs cursor-pointer ${
                submitting
                  ? "bg-emerald-600 opacity-75 cursor-not-allowed"
                  : "bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/25 hover:scale-[1.02]"
              }`}
            >
              <Send size={15} />
              {submitting ? "Submitting Offer..." : "Send Proposal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProposalModal;
