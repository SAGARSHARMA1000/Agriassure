
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  MapPin,
  IndianRupee,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  MessageSquare,
  Wheat,
  FileSignature,
  Loader2,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Minus
} from "lucide-react";

const FarmerProposalCard = ({ proposal = {}, onAccept, onReject, isProcessing = false }) => {
  const navigate = useNavigate();
  const [confirmReject, setConfirmReject] = useState(false);

  if (!proposal || (!proposal._id && !proposal.id)) {
    return null;
  }


  const {
    _id,
    buyerName,
    listing = {},
    offerPrice,
    unit = "Qtl",
    status = "pending",
    deliveryAddress,
    quantity,
    pickupDate,
    note,
    createdAt
  } = proposal;


  const numQuantity = parseFloat(quantity) || 0;
  const numOfferPrice = parseFloat(offerPrice) || 0;
  const numListingPrice = parseFloat(listing?.price) || 0;
  const totalDealValue = numQuantity * numOfferPrice;

  // Price difference compared to listing price
  const priceDiff = numOfferPrice - numListingPrice;

  return (
    <div
      className={`
        bg-white border rounded-2xl p-5 sm:p-6 space-y-5
        shadow-xs transition-all duration-300
        hover:shadow-md
        ${
          status === "pending"
            ? "border-amber-200/80 hover:border-amber-300"
            : status === "accepted"
            ? "border-emerald-200/80 hover:border-emerald-300 bg-linear-to-b from-white to-emerald-50/20"
            : "border-slate-200 hover:border-slate-300 bg-slate-50/40 opacity-90"
        }
      `}
    >
      {/* 🌾 TOP HEADER: Crop Name & Status Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5">
            <Wheat size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                {listing?.commodity || "Agricultural Commodity"}
              </h3>
              {listing?.quality && (
                <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                  {listing.quality}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
              <span>Quantity: <b className="text-slate-800">{quantity} {unit}</b></span>
              {createdAt && (
                <>
                  <span>•</span>
                  <span>Received: {new Date(createdAt).toLocaleDateString()}</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div>
          {status === "pending" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 shadow-2xs">
              <Clock size={13} className="animate-spin text-amber-600" />
              Action Required
            </span>
          )}
          {status === "accepted" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <CheckCircle size={13} className="text-emerald-600" />
              Accepted & Active
            </span>
          )}
          {status === "rejected" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">
              <XCircle size={13} className="text-rose-600" />
              Declined
            </span>
          )}
        </div>
      </div>

      {/* 💰 MIDDLE SECTION: Price, Total Value & Deal Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Box 1: Offer & Total Payout */}
        <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Buyer's Price Offer
          </span>
          <div className="flex items-baseline justify-between gap-2">
            <div>
              <span className="text-2xl font-black text-emerald-700">
                ₹{numOfferPrice.toLocaleString()}
              </span>
              <span className="text-xs text-slate-500 font-medium"> / {unit}</span>
            </div>

            {/* Total Estimated Payout */}
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Total Payout</span>
              <span className="text-base font-extrabold text-slate-900">
                ₹{totalDealValue.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Comparison with listing price */}
          {numListingPrice > 0 && (
            <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
              <span className="text-slate-500">Your Listing Price: ₹{numListingPrice}/{unit}</span>
              {priceDiff === 0 ? (
                <span className="text-slate-600 font-medium flex items-center gap-1">
                  <Minus size={12} /> Exact match
                </span>
              ) : priceDiff > 0 ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <TrendingUp size={12} /> +₹{priceDiff} higher
                </span>
              ) : (
                <span className="text-amber-700 font-semibold flex items-center gap-1">
                  <TrendingDown size={12} /> -₹{Math.abs(priceDiff)} counter
                </span>
              )}
            </div>
          )}
        </div>

        {/* Box 2: Buyer & Logistics Details */}
        <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 space-y-2.5 text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <User size={15} className="text-emerald-600 shrink-0" />
            <span className="text-slate-500">Buyer:</span>
            <span className="font-bold text-slate-900">{buyerName || "Verified Buyer"}</span>
          </div>

          <div className="flex items-start gap-2">
            <MapPin size={15} className="text-emerald-600 shrink-0 mt-0.5" />
            <span className="text-slate-500 shrink-0">Delivery:</span>
            <span className="font-medium text-slate-800 line-clamp-1" title={deliveryAddress}>
              {deliveryAddress || "Address provided in contract"}
            </span>
          </div>

          {pickupDate && (
            <div className="flex items-center gap-2">
              <Calendar size={15} className="text-emerald-600 shrink-0" />
              <span className="text-slate-500">Expected Date:</span>
              <span className="font-semibold text-slate-800">{pickupDate}</span>
            </div>
          )}
        </div>
      </div>

      {/* 💬 OPTIONAL BUYER NOTE */}
      {note && (
        <div className="bg-amber-50/60 border border-amber-200/60 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2.5">
          <MessageSquare size={16} className="text-amber-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-800 block text-[11px] uppercase tracking-wider mb-0.5">
              Buyer Note:
            </span>
            <p className="italic text-slate-700">"{note}"</p>
          </div>
        </div>
      )}

      {/* 🔘 ACTION BUTTONS */}
      <div className="pt-2">
        {status === "pending" && (
          <div>
            {confirmReject ? (
              <div className="flex items-center justify-between gap-3 p-3 bg-rose-50 border border-rose-200 rounded-xl">
                <span className="text-xs font-semibold text-rose-800">
                  Are you sure you want to decline this proposal?
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setConfirmReject(false)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => onReject(_id, listing?.commodity)}
                    disabled={isProcessing}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition cursor-pointer"
                  >
                    Yes, Reject
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmReject(true)}
                  disabled={isProcessing}
                  className="
                    w-full sm:w-auto px-4 py-2.5 rounded-xl
                    border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50/50
                    font-semibold text-xs sm:text-sm transition cursor-pointer
                  "
                >
                  Decline Offer
                </button>

                <button
                  type="button"
                  onClick={() => onAccept(_id, listing?.commodity)}
                  disabled={isProcessing}
                  className="
                    w-full sm:w-auto px-6 py-2.5 rounded-xl
                    bg-emerald-600 hover:bg-emerald-700 active:scale-98
                    text-white font-bold text-xs sm:text-sm
                    shadow-md shadow-emerald-600/20
                    flex items-center justify-center gap-2 transition cursor-pointer
                    disabled:opacity-60 disabled:cursor-not-allowed
                  "
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Processing Contract...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      Accept & Create Contract
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {status === "accepted" && (
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-emerald-800 font-medium">
              ✅ Contract generated. Waiting for signatures and escrow deposit.
            </span>
            <button
              onClick={() => navigate("/dashboard/farmer/contracts")}
              className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <FileSignature size={14} /> Go to Contracts <ChevronRight size={14} />
            </button>
          </div>
        )}

        {status === "rejected" && (
          <p className="text-xs text-slate-400 italic">
            This proposal offer was declined.
          </p>
        )}
      </div>
    </div>
  );
};

export default FarmerProposalCard;