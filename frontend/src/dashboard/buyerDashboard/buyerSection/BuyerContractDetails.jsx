import React, { useEffect, useState, useMemo } from "react";
import {
  FileText,
  Download,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  IndianRupee,
  User,
  Package,
  ArrowRight,
  ExternalLink,
  Search,
  Filter,
  CreditCard,
  FileSignature,
  Loader2,
  AlertCircle,
  Truck,
  Sparkles,
  ChevronRight
} from "lucide-react";
import api from "../../../services/api";
import { useNavigate, useOutletContext, Link } from "react-router-dom";

export default function BuyerContractDetails() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'active' | 'pending' | 'draft'
  const { user } = useOutletContext();
  const navigate = useNavigate();

  /* ---------------- FETCH BUYER CONTRACTS ---------------- */
  useEffect(() => {
    const fetchContracts = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const res = await api.getBuyerContracts(user.id);
        setContracts(res.data || []);
      } catch (err) {
        console.error("❌ Failed to fetch contracts", err);
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, [user?.id]);

  /* ---------------- COMPUTED METRICS ---------------- */
  const activeContracts = useMemo(
    () => contracts.filter((c) => c.status === "active" || c.status === "farmer_signed"),
    [contracts]
  );

  const pendingFarmerContracts = useMemo(
    () => contracts.filter((c) => c.status === "sent_to_farmer"),
    [contracts]
  );

  const totalContractValue = useMemo(() => {
    return contracts.reduce(
      (sum, c) => sum + (Number(c.quantity || 0) * Number(c.offerPrice || c.price || 0)),
      0
    );
  }, [contracts]);

  /* ---------------- FILTERED CONTRACTS ---------------- */
  const filteredContracts = useMemo(() => {
    return contracts.filter((c) => {
      // Tab filter
      if (activeTab === "active" && c.status !== "active" && c.status !== "farmer_signed") return false;
      if (activeTab === "pending" && c.status !== "sent_to_farmer") return false;
      if (activeTab === "draft" && c.status !== "draft") return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const commodity = (c.commodity || "").toLowerCase();
        const farmer = (c.farmerName || "").toLowerCase();
        const farmAddr = (c.farmAddress || "").toLowerCase();
        const delAddr = (c.deliveryAddress || "").toLowerCase();
        const idMatch = String(c._id || "").toLowerCase().includes(q);
        return commodity.includes(q) || farmer.includes(q) || farmAddr.includes(q) || delAddr.includes(q) || idMatch;
      }

      return true;
    });
  }, [contracts, activeTab, searchQuery]);

  /* ---------------- HELPERS ---------------- */
  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
      case "farmer_signed":
        return {
          label: "Active & Legally Binding",
          class: "bg-emerald-100 text-emerald-800 border-emerald-200",
          icon: <ShieldCheck size={13} className="text-emerald-600" />,
        };
      case "sent_to_farmer":
        return {
          label: "Awaiting Farmer Signature",
          class: "bg-amber-100 text-amber-800 border-amber-200",
          icon: <Clock size={13} className="text-amber-600" />,
        };
      case "draft":
        return {
          label: "Draft Agreement",
          class: "bg-slate-100 text-slate-700 border-slate-200",
          icon: <FileText size={13} className="text-slate-500" />,
        };
      case "completed":
        return {
          label: "Completed & Fulfilled",
          class: "bg-blue-100 text-blue-800 border-blue-200",
          icon: <CheckCircle2 size={13} className="text-blue-600" />,
        };
      default:
        return {
          label: String(status || "Contract").replaceAll("_", " ").toUpperCase(),
          class: "bg-slate-100 text-slate-600 border-slate-200",
          icon: <FileText size={13} />,
        };
    }
  };

  /* ---------------- STATES ---------------- */
  if (loading) {
    return (
      <div className="min-h-96 flex flex-col items-center justify-center gap-3 p-8 text-slate-600 font-sans">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
        <p className="font-semibold text-sm">Loading Signed Contracts & Legal Agreements...</p>
      </div>
    );
  }

  /* ---------------- EMPTY STATE ---------------- */
  if (!contracts.length) {
    return (
      <div className="max-w-4xl mx-auto p-12 bg-white rounded-2xl border border-slate-200 text-center shadow-xs font-sans">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-4">
          <FileSignature size={36} />
        </div>
        <h3 className="text-2xl font-black text-slate-900 mb-2">No Contracts Created Yet</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mb-8">
          Once a farmer accepts your crop proposal in the Orders section, you can draft, customize, and digitally sign binding farming contracts.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate("/dashboard/buyer/orders")}
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-xs transition cursor-pointer"
          >
            View Proposals & Orders
          </button>
          <Link
            to="/market"
            className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition"
          >
            Explore Crop Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 font-sans animate-fade-in">
      {/* ================= TOP HEADER RIBBON ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-1.5">
            <ShieldCheck size={14} className="text-emerald-600" /> Legally Binding Smart Agreements
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            My Digital Contracts & Agreements
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Manage two-party digitally signed farming agreements, escrow lock triggers, and PDF legal copies.
          </p>
        </div>

        <button
          onClick={() => navigate("/dashboard/buyer/payments")}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition self-start sm:self-auto cursor-pointer"
        >
          <CreditCard size={15} className="text-emerald-400" />
          <span>Escrow Payments Hub</span>
        </button>
      </div>

      {/* ================= 📊 METRIC STAT CARDS ================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div
          onClick={() => setActiveTab("all")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "all"
              ? "bg-slate-900 text-white border-slate-900 shadow-sm"
              : "bg-white text-slate-800 border-slate-200 hover:border-slate-300"
          }`}
        >
          <span className="text-xs font-medium text-slate-400 block mb-0.5">Total Contracts</span>
          <div className="text-2xl font-black">{contracts.length}</div>
          <span className="text-[10px] text-slate-400 mt-1 block">All drafted & signed</span>
        </div>

        <div
          onClick={() => setActiveTab("active")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "active"
              ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
              : "bg-white text-slate-800 border-slate-200 hover:border-slate-300"
          }`}
        >
          <span className={`text-xs font-medium block mb-0.5 ${activeTab === "active" ? "text-emerald-200" : "text-emerald-700"}`}>
            Active & Signed
          </span>
          <div className={`text-2xl font-black ${activeTab === "active" ? "text-white" : "text-emerald-700"}`}>
            {activeContracts.length}
          </div>
          <span className={`text-[10px] mt-1 block ${activeTab === "active" ? "text-emerald-200" : "text-slate-400"}`}>
            Ready for Escrow Deposit
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
            {pendingFarmerContracts.length}
          </div>
          <span className={`text-[10px] mt-1 block ${activeTab === "pending" ? "text-amber-200" : "text-slate-400"}`}>
            Farmer Signature Pending
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 block mb-0.5">Total Value</span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 truncate">
            ₹{totalContractValue.toLocaleString()}
          </div>
          <span className="text-[10px] text-emerald-700 font-bold mt-1 block">100% Escrow Protected</span>
        </div>
      </div>

      {/* ================= 🔍 FILTER BAR ================= */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer shrink-0 ${
              activeTab === "all" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All ({contracts.length})
          </button>
          <button
            onClick={() => setActiveTab("active")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer shrink-0 ${
              activeTab === "active" ? "bg-white text-emerald-700 shadow-2xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Active & Signed ({activeContracts.length})
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer shrink-0 ${
              activeTab === "pending" ? "bg-white text-amber-700 shadow-2xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Awaiting Farmer ({pendingFarmerContracts.length})
          </button>
        </div>

        <div className="relative grow sm:max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search crop, farmer, or address..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-600 bg-slate-50 focus:bg-white transition"
          />
        </div>
      </div>

      {/* ================= 📄 CONTRACTS LIST ================= */}
      {filteredContracts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <FileText size={36} className="mx-auto text-slate-300 mb-3" />
          <h3 className="font-bold text-slate-800 text-base">No matching contracts found</h3>
          <p className="text-xs text-slate-400 mt-1">Try modifying your search or filter options.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredContracts.map((c) => {
            const last4 = c._id ? String(c._id).slice(-4).toUpperCase() : "0000";
            const badge = getStatusBadge(c.status);
            const totalVal = Number(c.quantity || 0) * Number(c.offerPrice || c.price || 0);
            const pickupDateStr = c.pickupDate
              ? new Date(c.pickupDate).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "As per schedule";

            const isSignedByBoth = c.status === "active" || c.status === "farmer_signed";
            const targetProposalId = c.proposalId?._id || c.proposalId || c._id;

            return (
              <div
                key={c._id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-xs p-5 sm:p-6 transition-all space-y-4"
              >
                {/* 1. HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 shrink-0">
                      <Package size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                          {c.commodity} Agreement
                        </h3>
                        <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md border border-slate-200">
                          CTR-...{last4}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                        <span>Farmer: <b className="text-slate-800">{c.farmerName || "Verified Producer"}</b></span>
                        <span>•</span>
                        <span>Created: {c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-IN") : "Recent"}</span>
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badge.class}`}
                    >
                      {badge.icon}
                      {badge.label}
                    </span>
                  </div>
                </div>

                {/* 2. SPECIFICATIONS GRID */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-1 text-xs sm:text-sm">
                  <div>
                    <span className="text-slate-400 block text-xs mb-0.5">Agreed Quantity</span>
                    <span className="font-bold text-slate-900">
                      {c.quantity} {c.unit || "Qtl"}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-xs mb-0.5">Agreed Price</span>
                    <span className="font-bold text-slate-900">
                      ₹{c.offerPrice || c.price} <span className="text-xs text-slate-400 font-normal">/ {c.unit || "Qtl"}</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-xs mb-0.5">Total Settlement</span>
                    <span className="font-extrabold text-emerald-700 text-base">
                      ₹{totalVal.toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-xs mb-0.5">Scheduled Pickup</span>
                    <span className="font-medium text-slate-700 flex items-center gap-1">
                      <Calendar size={13} className="text-slate-400" /> {pickupDateStr}
                    </span>
                  </div>
                </div>

                {/* 3. LOCATIONS & ADDRESSES */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-2">
                    <MapPin size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-700 block">Farm Origin / Mandi:</span>
                      <span className="text-slate-600 text-[11px]">{c.farmAddress || "Regional Producer Hub"}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-2">
                    <MapPin size={15} className="text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-700 block">Buyer Destination Hub:</span>
                      <span className="text-slate-600 text-[11px]">{c.deliveryAddress || "Buyer Central Warehouse"}</span>
                    </div>
                  </div>
                </div>

                {/* 4. DIGITAL SIGNATURES STATUS */}
                <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 size={14} className="text-emerald-600" />
                      <span className="text-slate-700">
                        Buyer Signed: <b>{c.signatures?.buyerName || user?.name || "Signed"}</b>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {c.signatures?.farmerSignatureUrl || isSignedByBoth ? (
                        <>
                          <CheckCircle2 size={14} className="text-emerald-600" />
                          <span className="text-slate-700">
                            Farmer Signed: <b>{c.signatures?.farmerName || c.farmerName || "Signed"}</b>
                          </span>
                        </>
                      ) : (
                        <>
                          <Clock size={14} className="text-amber-500" />
                          <span className="text-amber-700">
                            Farmer Signature: <b>Awaiting Farmer</b>
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                    <ShieldCheck size={13} /> Digital Contract Verification
                  </span>
                </div>

                {/* 5. ACTION BUTTONS */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-slate-400 flex items-center gap-1">
                    <ShieldCheck size={14} className="text-emerald-600" />
                    Backed by AgriAssure 4-step escrow protection protocol
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap">
                    {/* View Full Contract Document */}
                    <button
                      onClick={() => navigate(`/dashboard/buyer/contracts/${targetProposalId}`)}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
                    >
                      <FileText size={14} />
                      <span>Review Contract</span>
                    </button>

                    {/* Download PDF if available */}
                    {c.pdf?.url && (
                      <a
                        href={c.pdf.url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 flex items-center gap-1.5 transition shadow-2xs"
                      >
                        <Download size={14} />
                        <span>PDF Agreement</span>
                      </a>
                    )}

                    {/* If Active & Signed -> Deposit Escrow Action */}
                    {isSignedByBoth && (
                      <button
                        onClick={() => navigate(`/dashboard/buyer/payments/${c._id}`)}
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <CreditCard size={14} />
                        <span>Fund Escrow Vault</span>
                        <ChevronRight size={14} />
                      </button>
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
}
