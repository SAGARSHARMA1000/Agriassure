import React, { useState, useMemo } from "react";
import {
  CheckCircle,
  Clock,
  Package,
  User,
  MapPin,
  Calendar,
  IndianRupee,
  FileSignature,
  ArrowRight,
  ShieldCheck,
  Search,
  Filter,
  XCircle,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  ShoppingBag,
  ExternalLink
} from "lucide-react";
import { useOutletContext, useNavigate, Link } from "react-router-dom";

const BuyerOrders = () => {
  const { proposals, user } = useOutletContext();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'accepted' | 'pending' | 'funded'
  const [searchQuery, setSearchQuery] = useState("");

  if (!user || !user.id) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="font-semibold text-sm">Loading your orders & proposals...</p>
      </div>
    );
  }

  const myOrders = useMemo(() => {
    return Array.isArray(proposals)
      ? proposals.filter((p) => p.buyerId === user.id)
      : [];
  }, [proposals, user.id]);

  /* ---------------- METRIC COUNTS ---------------- */
  const acceptedCount = useMemo(
    () => myOrders.filter((p) => p.status === "accepted").length,
    [myOrders]
  );
  const pendingCount = useMemo(
    () => myOrders.filter((p) => p.status === "pending").length,
    [myOrders]
  );
  const fundedCount = useMemo(
    () => myOrders.filter((p) => p.status === "escrow_funded" || p.status === "active").length,
    [myOrders]
  );

  /* ---------------- FILTERED ORDERS ---------------- */
  const filteredOrders = useMemo(() => {
    return myOrders.filter((p) => {
      // Tab filter
      if (activeTab === "accepted" && p.status !== "accepted") return false;
      if (activeTab === "pending" && p.status !== "pending") return false;
      if (activeTab === "funded" && p.status !== "escrow_funded" && p.status !== "active") return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const commodity = (p.listing?.commodity || p.commodity || "").toLowerCase();
        const farmer = (p.farmerName || "").toLowerCase();
        const location = (p.listing?.farmAddress || "").toLowerCase();
        const idMatch = String(p._id || "").toLowerCase().includes(q);
        return commodity.includes(q) || farmer.includes(q) || location.includes(q) || idMatch;
      }

      return true;
    });
  }, [myOrders, activeTab, searchQuery]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 font-sans animate-fade-in">
      {/* ================= HEADER & STATS ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-1.5">
            <ShoppingBag size={14} className="text-emerald-600" /> Buyer Crop Procurement
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            My Orders & Crop Proposals
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Track price proposals sent to farmers, review accepted offers, and proceed to digital contracts.
          </p>
        </div>

        <Link
          to="/market"
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition self-start sm:self-auto"
        >
          <TrendingUp size={16} />
          <span>Explore Marketplace</span>
        </Link>
      </div>

      {/* ================= STAT SUMMARY CARDS ================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div
          onClick={() => setActiveTab("all")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "all"
              ? "bg-slate-900 text-white border-slate-900 shadow-sm"
              : "bg-white text-slate-800 border-slate-200 hover:border-slate-300"
          }`}
        >
          <span className="text-xs font-medium text-slate-400 block mb-0.5">Total Offers</span>
          <div className="text-2xl font-black">{myOrders.length}</div>
          <span className="text-[10px] text-slate-400 mt-1 block">All time submissions</span>
        </div>

        <div
          onClick={() => setActiveTab("accepted")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "accepted"
              ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
              : "bg-white text-slate-800 border-slate-200 hover:border-slate-300"
          }`}
        >
          <span className={`text-xs font-medium block mb-0.5 ${activeTab === "accepted" ? "text-emerald-200" : "text-emerald-700"}`}>
            Offers Accepted
          </span>
          <div className={`text-2xl font-black ${activeTab === "accepted" ? "text-white" : "text-emerald-700"}`}>
            {acceptedCount}
          </div>
          <span className={`text-[10px] mt-1 block ${activeTab === "accepted" ? "text-emerald-200" : "text-slate-400"}`}>
            Ready for Contract
          </span>
        </div>

        <div
          onClick={() => setActiveTab("pending")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "pending"
              ? "bg-amber-600 text-white border-amber-600 shadow-sm"
              : "bg-white text-slate-800 border-slate-200 hover:border-slate-300"
          }`}
        >
          <span className={`text-xs font-medium block mb-0.5 ${activeTab === "pending" ? "text-amber-200" : "text-amber-700"}`}>
            Awaiting Farmer
          </span>
          <div className={`text-2xl font-black ${activeTab === "pending" ? "text-white" : "text-amber-700"}`}>
            {pendingCount}
          </div>
          <span className={`text-[10px] mt-1 block ${activeTab === "pending" ? "text-amber-200" : "text-slate-400"}`}>
            Pending Response
          </span>
        </div>

        <div
          onClick={() => setActiveTab("funded")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "funded"
              ? "bg-blue-700 text-white border-blue-700 shadow-sm"
              : "bg-white text-slate-800 border-slate-200 hover:border-slate-300"
          }`}
        >
          <span className={`text-xs font-medium block mb-0.5 ${activeTab === "funded" ? "text-blue-200" : "text-blue-700"}`}>
            Escrow Funded
          </span>
          <div className={`text-2xl font-black ${activeTab === "funded" ? "text-white" : "text-blue-700"}`}>
            {fundedCount}
          </div>
          <span className={`text-[10px] mt-1 block ${activeTab === "funded" ? "text-blue-200" : "text-slate-400"}`}>
            Active Fulfillment
          </span>
        </div>
      </div>

      {/* ================= CONTROLS & SEARCH BAR ================= */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer shrink-0 ${
              activeTab === "all" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All ({myOrders.length})
          </button>
          <button
            onClick={() => setActiveTab("accepted")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer shrink-0 ${
              activeTab === "accepted" ? "bg-white text-emerald-700 shadow-2xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Accepted ({acceptedCount})
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer shrink-0 ${
              activeTab === "pending" ? "bg-white text-amber-700 shadow-2xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setActiveTab("funded")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer shrink-0 ${
              activeTab === "funded" ? "bg-white text-blue-700 shadow-2xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Escrow Funded ({fundedCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative grow sm:max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search crop, farmer, or city..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-600 bg-slate-50 focus:bg-white transition"
          />
        </div>
      </div>

      {/* ================= PROPOSALS LIST ================= */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
            <ShoppingBag size={28} />
          </div>
          <h3 className="font-bold text-slate-800 text-base">No orders found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-6">
            {searchQuery
              ? "No proposals match your search keyword. Try clearing the filter."
              : "You have not submitted any crop proposals yet. Browse our live mandi listings to make an offer."}
          </p>
          <Link
            to="/market"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
          >
            <span>Browse Crop Marketplace</span>
            <ChevronRight size={15} />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((p) => {
            const commodity = p.listing?.commodity || p.commodity || "Crop Commodity";
            const unit = p.unit || p.listing?.unit || "Qtl";
            const quantity = p.quantity || "—";
            const offerPrice = Number(p.offerPrice || 0);
            const totalValue = Number(quantity) * offerPrice;
            const pickupDateStr = p.pickupDate
              ? new Date(p.pickupDate).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "As per schedule";

            const isAccepted = p.status === "accepted";
            const isPending = p.status === "pending";
            const isFunded = p.status === "escrow_funded" || p.status === "active";
            const isRejected = p.status === "rejected";

            return (
              <div
                key={p._id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-xs p-5 transition-all"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 shrink-0">
                      <Package size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-base sm:text-lg text-slate-900">
                          {commodity}
                        </h3>
                        <span className="font-mono text-[11px] font-bold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded border border-slate-200">
                          ID: ...{String(p._id || "").slice(-6).toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Farmer: <span className="font-semibold text-slate-800">{p.farmerName || "Verified Producer"}</span>
                      </p>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div>
                    {isAccepted && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle size={14} className="text-emerald-600" />
                        Offer Accepted by Farmer
                      </span>
                    )}

                    {isPending && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        <Clock size={14} className="text-amber-600" />
                        Awaiting Farmer Review
                      </span>
                    )}

                    {isFunded && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                        <ShieldCheck size={14} className="text-blue-600" />
                        Contract Active & Escrow Protected
                      </span>
                    )}

                    {isRejected && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <XCircle size={14} className="text-rose-600" />
                        Offer Declined
                      </span>
                    )}
                  </div>
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 text-xs sm:text-sm border-b border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-xs mb-0.5">Offered Rate</span>
                    <span className="font-bold text-slate-900 text-base">
                      ₹{offerPrice.toLocaleString()}{" "}
                      <span className="text-xs font-normal text-slate-500">/ {unit}</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-xs mb-0.5">Quantity</span>
                    <span className="font-bold text-slate-800">
                      {quantity} {unit}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-xs mb-0.5">Est. Total Value</span>
                    <span className="font-extrabold text-emerald-700">
                      {totalValue > 0 ? `₹${totalValue.toLocaleString()}` : "—"}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-xs mb-0.5">Pickup / Delivery</span>
                    <span className="font-semibold text-slate-700 flex items-center gap-1">
                      <Calendar size={13} className="text-slate-400" /> {pickupDateStr}
                    </span>
                  </div>
                </div>

                {/* Footer Address & Action Buttons */}
                <div className="pt-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-1 text-slate-500 truncate">
                    <MapPin size={14} className="text-slate-400 shrink-0" />
                    <span className="truncate">
                      Location: {p.listing?.farmAddress || "Regional Producer Hub"}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2.5 self-end sm:self-auto">
                    {/* ACCEPTED -> PROCEED TO CONTRACT CTA (Clean & Smooth) */}
                    {isAccepted && (
                      <button
                        onClick={() => navigate(`/dashboard/buyer/contracts/${p._id}`)}
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-xs hover:shadow-emerald-600/20 flex items-center gap-1.5 transition-all cursor-pointer group"
                      >
                        <FileSignature size={16} />
                        <span>Proceed to Contract & Sign</span>
                        <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    )}

                    {/* FUNDED -> VIEW ESCROW DETAILS */}
                    {isFunded && (
                      <button
                        onClick={() => navigate("/dashboard/buyer/payments")}
                        className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                      >
                        <ShieldCheck size={14} />
                        <span>View Escrow Vault</span>
                      </button>
                    )}

                    {/* PENDING -> WAITING NOTICE */}
                    {isPending && (
                      <span className="text-slate-400 text-xs italic flex items-center gap-1">
                        <Clock size={13} /> Waiting for farmer acceptance
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BuyerOrders;