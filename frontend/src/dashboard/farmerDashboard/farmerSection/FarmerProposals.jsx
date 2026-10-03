import React, { useState, useMemo } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Bell,
  Search,
  SlidersHorizontal,
  CheckCircle2,
  Clock,
  XCircle,
  Wheat,
  IndianRupee,
  TrendingUp,
  RotateCcw,
  PlusCircle,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  FileSignature
} from "lucide-react";
import FarmerProposalCard from "./FarmerProposalCard";

const FarmerProposals = () => {
  const navigate = useNavigate();
  /* 🔁 Get data from FarmerDashboard <Outlet context /> */
  const {
    proposals = [],
    handleAccept,
    handleReject,
    user
  } = useOutletContext() || {};

  // Interactive UI State
  const [activeTab, setActiveTab] = useState("all"); // "all" | "pending" | "accepted" | "rejected"
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCrop, setSelectedCrop] = useState("all");
  const [sortBy, setSortBy] = useState("newest"); // "newest" | "highest-offer" | "highest-total" | "quantity-high"
  const [processingId, setProcessingId] = useState(null);

  // Safe proposals list
  const allProposals = useMemo(() => {
    return Array.isArray(proposals) ? proposals : [];
  }, [proposals]);

  // Derived counts
  const pendingProposals = useMemo(() => {
    return allProposals.filter((p) => p.status === "pending");
  }, [allProposals]);

  const acceptedProposals = useMemo(() => {
    return allProposals.filter((p) => p.status === "accepted");
  }, [allProposals]);

  const rejectedProposals = useMemo(() => {
    return allProposals.filter((p) => p.status === "rejected");
  }, [allProposals]);

  // Total Monetary Value of all proposals
  const totalPotentialPayout = useMemo(() => {
    return allProposals.reduce((sum, p) => {
      const q = parseFloat(p.quantity) || 0;
      const price = parseFloat(p.offerPrice) || 0;
      return sum + q * price;
    }, 0);
  }, [allProposals]);

  // Unique crop names for filter
  const uniqueCrops = useMemo(() => {
    const crops = allProposals
      .map((p) => p.listing?.commodity?.trim())
      .filter(Boolean);
    return [...new Set(crops)];
  }, [allProposals]);

  // Filtered & Sorted Proposals List
  const filteredProposals = useMemo(() => {
    let result = [...allProposals];

    // 1. Tab Status Filter
    if (activeTab === "pending") {
      result = result.filter((p) => p.status === "pending");
    } else if (activeTab === "accepted") {
      result = result.filter((p) => p.status === "accepted");
    } else if (activeTab === "rejected") {
      result = result.filter((p) => p.status === "rejected");
    }

    // 2. Crop Filter
    if (selectedCrop !== "all") {
      result = result.filter(
        (p) =>
          p.listing?.commodity?.toLowerCase() === selectedCrop.toLowerCase()
      );
    }

    // 3. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((p) => {
        const crop = p.listing?.commodity?.toLowerCase() || "";
        const buyer = p.buyerName?.toLowerCase() || "";
        const address = p.deliveryAddress?.toLowerCase() || "";
        const note = p.note?.toLowerCase() || "";
        return (
          crop.includes(q) ||
          buyer.includes(q) ||
          address.includes(q) ||
          note.includes(q)
        );
      });
    }

    // 4. Sorting
    result.sort((a, b) => {
      const priceA = parseFloat(a.offerPrice) || 0;
      const priceB = parseFloat(b.offerPrice) || 0;
      const totalA = (parseFloat(a.quantity) || 0) * priceA;
      const totalB = (parseFloat(b.quantity) || 0) * priceB;
      const qtyA = parseFloat(a.quantity) || 0;
      const qtyB = parseFloat(b.quantity) || 0;

      if (sortBy === "highest-offer") return priceB - priceA;
      if (sortBy === "highest-total") return totalB - totalA;
      if (sortBy === "quantity-high") return qtyB - qtyA;
      // Default: newest
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    return result;
  }, [allProposals, activeTab, selectedCrop, searchQuery, sortBy]);

  // Accept Proposal Handler with Toast Feedback
  const handleAcceptProposal = async (proposalId, cropName = "Crop") => {
    try {
      setProcessingId(proposalId);
      if (handleAccept) {
        await handleAccept(proposalId);
      }
      toast.success(
        `🎉 Proposal accepted for ${cropName}! A legal contract agreement has been generated.`,
        {
          position: "top-right",
          autoClose: 4000,
        }
      );
    } catch (err) {
      console.error("Failed to accept proposal:", err);
      toast.error(
        err?.response?.data?.message || "Failed to accept proposal. Please try again.",
        {
          position: "top-right",
        }
      );
    } finally {
      setProcessingId(null);
    }
  };

  // Reject Proposal Handler with Toast Feedback
  const handleRejectProposal = async (proposalId, cropName = "Crop") => {
    try {
      setProcessingId(proposalId);
      if (handleReject) {
        await handleReject(proposalId);
      }
      toast.info(`Offer declined for ${cropName}.`, {
        position: "top-right",
        autoClose: 3500,
      });
    } catch (err) {
      console.error("Failed to reject proposal:", err);
      toast.error(
        err?.response?.data?.message || "Failed to decline proposal. Please try again.",
        {
          position: "top-right",
        }
      );
    } finally {
      setProcessingId(null);
    }
  };

  const resetFilters = () => {
    setActiveTab("all");
    setSearchQuery("");
    setSelectedCrop("all");
    setSortBy("newest");
  };

  return (
    <div className="space-y-6">
      {/* ================= 🌾 PAGE HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
              <Bell size={20} />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Buyer Crop Proposals
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review buyer bids, negotiate pricing, and accept contracts with guaranteed escrow protection.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/dashboard/farmer/add")}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-xs flex items-center gap-2 transition cursor-pointer"
          >
            <PlusCircle size={16} />
            <span>List More Crops</span>
          </button>
        </div>
      </div>

      {/* ================= 📊 QUICK METRICS BAR ================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* 1. Total Proposals */}
        <div
          onClick={() => setActiveTab("all")}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            activeTab === "all"
              ? "bg-slate-900 text-white border-slate-900 shadow-sm"
              : "bg-white border-slate-200/90 text-slate-800 hover:border-emerald-300"
          }`}
        >
          <span className={`text-[11px] font-bold uppercase tracking-wider block mb-1 ${activeTab === "all" ? "text-slate-400" : "text-slate-500"}`}>
            All Proposals
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black">{allProposals.length}</span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${activeTab === "all" ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"}`}>
              Total Bids
            </span>
          </div>
        </div>

        {/* 2. Action Required / Pending */}
        <div
          onClick={() => setActiveTab("pending")}
          className={`p-4 rounded-2xl border transition cursor-pointer relative overflow-hidden ${
            activeTab === "pending"
              ? "bg-amber-500 text-white border-amber-500 shadow-sm"
              : "bg-amber-50/50 border-amber-200/80 text-amber-900 hover:border-amber-300"
          }`}
        >
          <span className={`text-[11px] font-bold uppercase tracking-wider block mb-1 ${activeTab === "pending" ? "text-amber-100" : "text-amber-700"}`}>
            Action Required
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black">{pendingProposals.length}</span>
            {pendingProposals.length > 0 && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${activeTab === "pending" ? "bg-amber-600 text-white" : "bg-amber-200/80 text-amber-900 animate-pulse"}`}>
                <Clock size={11} /> Needs Approval
              </span>
            )}
          </div>
        </div>

        {/* 3. Accepted Proposals */}
        <div
          onClick={() => setActiveTab("accepted")}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            activeTab === "accepted"
              ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
              : "bg-emerald-50/50 border-emerald-200/80 text-emerald-900 hover:border-emerald-300"
          }`}
        >
          <span className={`text-[11px] font-bold uppercase tracking-wider block mb-1 ${activeTab === "accepted" ? "text-emerald-100" : "text-emerald-700"}`}>
            Accepted Deals
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black">{acceptedProposals.length}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${activeTab === "accepted" ? "bg-emerald-700 text-white" : "bg-emerald-200/80 text-emerald-900"}`}>
              <CheckCircle2 size={11} /> In Contract
            </span>
          </div>
        </div>

        {/* 4. Total Potential Payout */}
        <div className="p-4 rounded-2xl border border-slate-200/90 bg-white text-slate-800">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Total Deal Value
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-emerald-700">
              ₹{totalPotentialPayout > 0 ? (totalPotentialPayout >= 100000 ? `${(totalPotentialPayout / 100000).toFixed(2)} Lakh` : totalPotentialPayout.toLocaleString()) : "0"}
            </span>
            <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-0.5">
              <ShieldCheck size={11} /> Escrow
            </span>
          </div>
        </div>
      </div>

      {/* ================= 🔍 SEARCH, FILTER TABS & SORT ================= */}
      <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 space-y-4">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex p-1 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === "all"
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              All ({allProposals.length})
            </button>

            <button
              onClick={() => setActiveTab("pending")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "pending"
                  ? "bg-amber-500 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Clock size={13} />
              Pending ({pendingProposals.length})
              {pendingProposals.length > 0 && (
                <span className={`w-2 h-2 rounded-full ${activeTab === "pending" ? "bg-white" : "bg-amber-500"}`} />
              )}
            </button>

            <button
              onClick={() => setActiveTab("accepted")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "accepted"
                  ? "bg-emerald-600 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <CheckCircle2 size={13} />
              Accepted ({acceptedProposals.length})
            </button>

            <button
              onClick={() => setActiveTab("rejected")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "rejected"
                  ? "bg-rose-600 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <XCircle size={13} />
              Declined ({rejectedProposals.length})
            </button>
          </div>

          {/* Reset Filters button if any filter is active */}
          {(activeTab !== "all" || searchQuery || selectedCrop !== "all" || sortBy !== "newest") && (
            <button
              onClick={resetFilters}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 transition cursor-pointer"
            >
              <RotateCcw size={13} /> Reset Filters
            </button>
          )}
        </div>

        {/* Search & Secondary Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Box */}
          <div className="relative sm:col-span-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by crop, buyer, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Crop Filter Dropdown */}
          <div>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="all">🌾 All Crop Varieties ({uniqueCrops.length})</option>
              {uniqueCrops.map((crop) => (
                <option key={crop} value={crop}>
                  {crop}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="newest">🕒 Sort: Newest Bids First</option>
              <option value="highest-offer">💰 Sort: Highest Offer Price</option>
              <option value="highest-total">💵 Sort: Highest Total Deal Value</option>
              <option value="quantity-high">📦 Sort: Largest Quantity</option>
            </select>
          </div>
        </div>
      </div>

      {/* ================= 📋 PROPOSALS LIST ================= */}
      <div className="space-y-4">
        {filteredProposals.length === 0 ? (
          <div className="text-center py-16 px-6 bg-slate-50/50 rounded-2xl border border-slate-200/80">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto mb-3">
              <Wheat size={28} />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">
              {allProposals.length === 0
                ? "No Proposals Received Yet"
                : "No Matching Proposals Found"}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-5 leading-relaxed">
              {allProposals.length === 0
                ? "When buyers make price offers on your live crop harvest listings, they will appear here with instant accept and contract generation tools."
                : "Try adjusting your search keywords, clearing status filters, or selecting all crops to see more offers."}
            </p>

            {allProposals.length === 0 ? (
              <button
                onClick={() => navigate("/dashboard/farmer/add")}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition inline-flex items-center gap-2 cursor-pointer"
              >
                <PlusCircle size={15} /> Create a Crop Listing
              </button>
            ) : (
              <button
                onClick={resetFilters}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw size={14} /> Clear All Filters
              </button>
            )}
          </div>
        ) : (
          filteredProposals.map((proposal) => (
            <FarmerProposalCard
              key={proposal._id}
              proposal={proposal}
              onAccept={handleAcceptProposal}
              onReject={handleRejectProposal}
              isProcessing={processingId === proposal._id}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default FarmerProposals;

