import React, { useEffect, useState, useMemo } from "react";
import api from "../../../services/api";
import {
  CheckCircle2,
  AlertTriangle,
  Truck,
  Clock,
  MapPin,
  Package,
  ShieldCheck,
  Calendar,
  IndianRupee,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  Loader2,
  Check,
  RefreshCw,
  XCircle,
  FileText,
  Boxes,
  HelpCircle,
  Send
} from "lucide-react";
import { useOutletContext, useNavigate, Link } from "react-router-dom";

/* ---------- STATUS LABELS & STYLES ---------- */
const STATUS_CONFIG = {
  PICKUP_SCHEDULED: {
    label: "Pickup Scheduled",
    step: 1,
    badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
    icon: Clock,
    desc: "Produce harvest packaged at farm; logistics pickup scheduled.",
  },
  COLLECTED_FROM_FARMER: {
    label: "Collected from Farm",
    step: 2,
    badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Package,
    desc: "AgriAssure logistics has collected crop from the farmer.",
  },
  IN_TRANSIT: {
    label: "In Transit",
    step: 3,
    badgeClass: "bg-indigo-100 text-indigo-800 border-indigo-200",
    icon: Truck,
    desc: "Consignment is on route to your delivery destination warehouse.",
  },
  DELIVERED_TO_BUYER: {
    label: "Delivered (Action Needed)",
    step: 4,
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300 font-extrabold animate-pulse",
    icon: CheckCircle2,
    desc: "Produce arrived at your facility. Please inspect and confirm receipt.",
  },
  CONFIRMED_BY_BUYER: {
    label: "Buyer Confirmed",
    step: 4,
    badgeClass: "bg-purple-100 text-purple-800 border-purple-200",
    icon: CheckCircle2,
    desc: "Quality verified. Escrow payment release in progress.",
  },
  AUTO_CONFIRMED: {
    label: "Auto Confirmed",
    step: 4,
    badgeClass: "bg-purple-100 text-purple-800 border-purple-200",
    icon: CheckCircle2,
    desc: "Auto-verified upon 48-hour delivery inspection window.",
  },
  ESCROW_RELEASED: {
    label: "Payment Released & Completed",
    step: 4,
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: ShieldCheck,
    desc: "Transaction closed. Funds released from escrow to the farmer.",
  },
  ISSUE_REPORTED: {
    label: "Issue Under Review",
    step: 4,
    badgeClass: "bg-rose-100 text-rose-800 border-rose-300",
    icon: AlertTriangle,
    desc: "A quality or quantity discrepancy is being reviewed by AgriAssure dispute team.",
  },
};

export default function BuyerDeliveryDashboard() {
  const { user } = useOutletContext();
  const navigate = useNavigate();

  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'transit' | 'action_needed' | 'completed'

  // Issue modal / collapse state per delivery
  const [reportingIssueId, setReportingIssueId] = useState(null);
  const [issueCategory, setIssueCategory] = useState("Quality Mismatch");
  const [issueText, setIssueText] = useState("");

  /* ---------------- FETCH DELIVERIES ---------------- */
  const fetchDeliveries = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const res = await api.getBuyerDeliveries(user.id);
      setDeliveries(res.data || []);
    } catch (err) {
      console.error("❌ Failed to load deliveries", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, [user?.id]);

  /* ---------------- CONFIRM DELIVERY ---------------- */
  const confirmDelivery = async (deliveryId) => {
    try {
      setActionLoading(true);
      setError("");
      await api.confirmBuyerDelivery(deliveryId);
      setSuccessMsg("🎉 Delivery confirmed! Funds are now released to the farmer.");
      setTimeout(() => setSuccessMsg(""), 5000);
      await fetchDeliveries();
    } catch (err) {
      console.error("❌ Confirm delivery failed", err);
      setError("Failed to confirm delivery. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  /* ---------------- REPORT ISSUE ---------------- */
  const reportIssue = async (deliveryId) => {
    if (!issueText || issueText.trim().length < 5) {
      setError("Please describe the issue with at least 5 characters.");
      return;
    }

    try {
      setActionLoading(true);
      setError("");
      const fullDescription = `[${issueCategory}] ${issueText.trim()}`;
      await api.reportDeliveryIssue(deliveryId, fullDescription);
      setSuccessMsg("⚠️ Issue submitted successfully. AgriAssure dispute team will mediate.");
      setTimeout(() => setSuccessMsg(""), 5000);
      setReportingIssueId(null);
      setIssueText("");
      await fetchDeliveries();
    } catch (err) {
      console.error("❌ Report issue failed", err);
      setError("Failed to report issue. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  /* ---------------- METRICS ---------------- */
  const inTransitCount = useMemo(
    () => deliveries.filter((d) => d.deliveryStatus === "IN_TRANSIT" || d.deliveryStatus === "COLLECTED_FROM_FARMER").length,
    [deliveries]
  );
  const actionNeededCount = useMemo(
    () => deliveries.filter((d) => d.deliveryStatus === "DELIVERED_TO_BUYER").length,
    [deliveries]
  );
  const completedCount = useMemo(
    () => deliveries.filter((d) => d.deliveryStatus === "ESCROW_RELEASED" || d.deliveryStatus === "CONFIRMED_BY_BUYER").length,
    [deliveries]
  );

  /* ---------------- FILTERING ---------------- */
  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((d) => {
      // Tab filter
      if (activeTab === "transit" && d.deliveryStatus !== "IN_TRANSIT" && d.deliveryStatus !== "COLLECTED_FROM_FARMER" && d.deliveryStatus !== "PICKUP_SCHEDULED") return false;
      if (activeTab === "action_needed" && d.deliveryStatus !== "DELIVERED_TO_BUYER") return false;
      if (activeTab === "completed" && d.deliveryStatus !== "ESCROW_RELEASED" && d.deliveryStatus !== "CONFIRMED_BY_BUYER") return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const crop = (d.crop || "").toLowerCase();
        const idMatch = String(d.deliveryId || "").toLowerCase().includes(q);
        const contractMatch = String(d.contractId || "").toLowerCase().includes(q);
        const pickupMatch = (d.pickupAddress || "").toLowerCase().includes(q);
        const destMatch = (d.deliveryAddress || "").toLowerCase().includes(q);
        return crop.includes(q) || idMatch || contractMatch || pickupMatch || destMatch;
      }

      return true;
    });
  }, [deliveries, activeTab, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-96 flex flex-col items-center justify-center gap-3 p-8 text-slate-600 font-sans">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
        <p className="font-semibold text-sm">Loading Live Cargo Shipments & Tracking Data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 font-sans animate-fade-in">
      {/* ================= TOP HEADER RIBBON ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-1.5">
            <Truck size={14} className="text-emerald-600" /> AgriAssure Logistics Network
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Cargo Delivery & Quality Confirmation
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Real-time farm-to-warehouse tracking, crop inspection verification, and escrow payment release.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchDeliveries}
            title="Refresh Tracking"
            className="p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
          >
            <RefreshCw size={15} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <Link
            to="/dashboard/buyer/payments"
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-xs transition"
          >
            <ShieldCheck size={16} className="text-emerald-400" />
            <span>Escrow Vault</span>
          </Link>
        </div>
      </div>

      {/* Alert Notices */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle size={16} className="text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

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
          <span className="text-xs font-medium text-slate-400 block mb-0.5">Total Shipments</span>
          <div className="text-2xl font-black">{deliveries.length}</div>
          <span className="text-[10px] text-slate-400 mt-1 block">All cargo consignments</span>
        </div>

        <div
          onClick={() => setActiveTab("transit")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "transit"
              ? "bg-indigo-700 text-white border-indigo-700 shadow-sm"
              : "bg-white text-slate-800 border-slate-200 hover:border-slate-300"
          }`}
        >
          <span className={`text-xs font-medium block mb-0.5 ${activeTab === "transit" ? "text-indigo-200" : "text-indigo-700"}`}>
            In Transit / Scheduled
          </span>
          <div className={`text-2xl font-black ${activeTab === "transit" ? "text-white" : "text-indigo-700"}`}>
            {inTransitCount}
          </div>
          <span className={`text-[10px] mt-1 block ${activeTab === "transit" ? "text-indigo-200" : "text-slate-400"}`}>
            On the way to Hub
          </span>
        </div>

        <div
          onClick={() => setActiveTab("action_needed")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "action_needed"
              ? "bg-amber-600 text-white border-amber-600 shadow-sm"
              : "bg-white text-slate-800 border-slate-200 hover:border-slate-300"
          }`}
        >
          <span className={`text-xs font-medium block mb-0.5 ${activeTab === "action_needed" ? "text-amber-200" : "text-amber-700"}`}>
            Action Required
          </span>
          <div className={`text-2xl font-black ${activeTab === "action_needed" ? "text-white" : "text-amber-700"}`}>
            {actionNeededCount}
          </div>
          <span className={`text-[10px] mt-1 block ${activeTab === "action_needed" ? "text-amber-200" : "text-slate-400"}`}>
            Awaiting Quality Sign-off
          </span>
        </div>

        <div
          onClick={() => setActiveTab("completed")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "completed"
              ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
              : "bg-white text-slate-800 border-slate-200 hover:border-slate-300"
          }`}
        >
          <span className={`text-xs font-medium block mb-0.5 ${activeTab === "completed" ? "text-emerald-200" : "text-emerald-700"}`}>
            Delivered & Settled
          </span>
          <div className={`text-2xl font-black ${activeTab === "completed" ? "text-white" : "text-emerald-700"}`}>
            {completedCount}
          </div>
          <span className={`text-[10px] mt-1 block ${activeTab === "completed" ? "text-emerald-200" : "text-slate-400"}`}>
            Escrow Released
          </span>
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
            All Shipments ({deliveries.length})
          </button>
          <button
            onClick={() => setActiveTab("transit")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer shrink-0 ${
              activeTab === "transit" ? "bg-white text-indigo-700 shadow-2xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            In Transit ({inTransitCount})
          </button>
          <button
            onClick={() => setActiveTab("action_needed")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer shrink-0 ${
              activeTab === "action_needed" ? "bg-white text-amber-700 shadow-2xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Action Needed ({actionNeededCount})
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer shrink-0 ${
              activeTab === "completed" ? "bg-white text-emerald-700 shadow-2xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>

        <div className="relative grow sm:max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search crop, tracking ID, contract..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-600 bg-slate-50 focus:bg-white transition"
          />
        </div>
      </div>

      {/* ================= 🚚 SHIPMENTS LIST ================= */}
      {filteredDeliveries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <Truck size={40} className="mx-auto text-slate-300 mb-3" />
          <h3 className="font-bold text-slate-800 text-base">No shipments match this criteria</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Once you deposit escrow for a signed contract, logistics are scheduled and real-time tracking will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredDeliveries.map((d) => {
            const config = STATUS_CONFIG[d.deliveryStatus] || STATUS_CONFIG.PICKUP_SCHEDULED;
            const StatusIcon = config.icon;
            const isDelivered = d.deliveryStatus === "DELIVERED_TO_BUYER";
            const isEscrowReleased = d.deliveryStatus === "ESCROW_RELEASED";
            const isAwaitingRelease = d.deliveryStatus === "CONFIRMED_BY_BUYER" || d.deliveryStatus === "AUTO_CONFIRMED";
            const isIssue = d.deliveryStatus === "ISSUE_REPORTED";
            const isReportingThis = reportingIssueId === d._id;

            const contractLast4 = d.contractId ? String(d.contractId).slice(-4).toUpperCase() : "0000";

            return (
              <div
                key={d._id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-xs p-5 sm:p-6 transition-all space-y-5"
              >
                {/* 1. SHIPMENT HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 shrink-0">
                      <Truck size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                          {d.crop || "Crop Consignment"}
                        </h3>
                        <span className="font-mono text-xs font-black bg-slate-900 text-white px-2.5 py-0.5 rounded-md">
                          {d.deliveryId || "DLV-CARGO"}
                        </span>
                        <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                          CTR-...{contractLast4}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {config.desc}
                      </p>
                    </div>
                  </div>

                  {/* Status Pill */}
                  <div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${config.badgeClass}`}
                    >
                      <StatusIcon size={14} />
                      {config.label}
                    </span>
                  </div>
                </div>

                {/* 2. PROGRESS STEPPER (4 STAGES) */}
                <div className="py-2">
                  <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-semibold text-slate-500 relative">
                    {/* Stepper Step 1 */}
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${
                        config.step >= 1 ? "bg-emerald-600 text-white shadow-xs" : "bg-slate-100 text-slate-400"
                      }`}>
                        {config.step > 1 ? <Check size={14} /> : "1"}
                      </div>
                      <span className={config.step >= 1 ? "text-slate-900 font-bold" : ""}>Pickup Scheduled</span>
                    </div>

                    {/* Stepper Step 2 */}
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${
                        config.step >= 2 ? "bg-emerald-600 text-white shadow-xs" : "bg-slate-100 text-slate-400"
                      }`}>
                        {config.step > 2 ? <Check size={14} /> : "2"}
                      </div>
                      <span className={config.step >= 2 ? "text-slate-900 font-bold" : ""}>Collected</span>
                    </div>

                    {/* Stepper Step 3 */}
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${
                        config.step >= 3 ? "bg-emerald-600 text-white shadow-xs" : "bg-slate-100 text-slate-400"
                      }`}>
                        {config.step > 3 ? <Check size={14} /> : "3"}
                      </div>
                      <span className={config.step >= 3 ? "text-slate-900 font-bold" : ""}>In Transit</span>
                    </div>

                    {/* Stepper Step 4 */}
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${
                        config.step >= 4
                          ? isIssue
                            ? "bg-rose-600 text-white"
                            : isEscrowReleased
                            ? "bg-emerald-600 text-white"
                            : "bg-amber-500 text-white animate-bounce"
                          : "bg-slate-100 text-slate-400"
                      }`}>
                        {isEscrowReleased ? <Check size={14} /> : "4"}
                      </div>
                      <span className={config.step >= 4 ? "text-slate-900 font-bold" : ""}>
                        {isEscrowReleased ? "Completed" : "Delivered"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. SPECIFICATIONS & TRANSIT LOCATIONS */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 text-xs">
                  <div>
                    <span className="text-slate-400 block text-xs mb-0.5">Cargo Quantity</span>
                    <span className="font-bold text-slate-800 text-sm">{d.quantity}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-xs mb-0.5">Escrow Protection</span>
                    <span className="font-extrabold text-emerald-700 text-sm">
                      ₹{Number(d.escrowAmount || d.totalValue || 0).toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-xs mb-0.5 items-center gap-1">
                      <MapPin size={12} className="text-emerald-600" /> Origin Mandi / Farm
                    </span>
                    <span className="font-medium text-slate-700 line-clamp-1">{d.pickupAddress || "Farmer Regional Hub"}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 text-xs mb-0.5 flex items-center gap-1">
                      <MapPin size={12} className="text-blue-600" /> Buyer Destination Hub
                    </span>
                    <span className="font-medium text-slate-700 line-clamp-1">{d.deliveryAddress || "Buyer Central Warehouse"}</span>
                  </div>
                </div>

                {/* 4. ISSUE BANNER IF REPORTED */}
                {isIssue && (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-rose-800">
                      <AlertTriangle size={15} className="text-rose-600" /> Dispute Case Under Review
                    </div>
                    <p className="text-rose-700">
                      <b>Reported Issue:</b> {d.issue?.description || "Quality discrepancy logged. Escrow release paused pending mediation."}
                    </p>
                  </div>
                )}

                {/* 5. AWAITING RELEASE STATUS */}
                {isAwaitingRelease && (
                  <div className="p-3.5 bg-purple-50 rounded-xl border border-purple-200 text-purple-900 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-purple-600" />
                      <span><b>Delivery Verified.</b> Funds clearing into farmer bank account...</span>
                    </div>
                    <span className="font-mono text-[11px] font-bold text-purple-700">Nodal Transfer</span>
                  </div>
                )}

                {/* 6. ESCROW RELEASED STATUS */}
                {isEscrowReleased && (
                  <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-600" />
                      <span><b>Fulfillment Completed.</b> Escrow payment successfully settled with farmer.</span>
                    </div>
                    <Link
                      to="/dashboard/buyer/wallet"
                      className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
                    >
                      View Receipt <ChevronRight size={13} />
                    </Link>
                  </div>
                )}

                {/* 7. ACTION PANEL: WHEN DELIVERED TO BUYER (ACTION REQUIRED) */}
                {isDelivered && (
                  <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/90 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="font-extrabold text-sm sm:text-base text-emerald-950 flex items-center gap-2">
                          <CheckCircle2 size={18} className="text-emerald-600" />
                          Consignment Received at Your Hub
                        </h4>
                        <p className="text-xs text-emerald-800 mt-0.5">
                          Please inspect the crop quantity & grade before approving the escrow release.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-md bg-white text-emerald-800 text-[11px] font-bold border border-emerald-200 shadow-2xs">
                          Quality Guarantee
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <button
                        disabled={actionLoading}
                        onClick={() => confirmDelivery(d._id)}
                        className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-emerald-600/25 flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
                      >
                        {actionLoading ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            <span>Confirming Settlement...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={17} />
                            <span>Confirm Quality & Release Escrow</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => setReportingIssueId(isReportingThis ? null : d._id)}
                        className="px-4 py-3 rounded-xl bg-white hover:bg-rose-50 text-rose-700 font-bold text-xs border border-rose-200 transition cursor-pointer flex items-center gap-1.5"
                      >
                        <AlertTriangle size={15} />
                        <span>{isReportingThis ? "Cancel Issue" : "Report Discrepancy / Issue"}</span>
                      </button>
                    </div>

                    {/* Issue Drawer */}
                    {isReportingThis && (
                      <div className="p-4 bg-white rounded-xl border border-rose-200 shadow-xs space-y-3 animate-fade-in text-xs">
                        <h5 className="font-bold text-rose-900 flex items-center gap-1.5">
                          <AlertCircle size={15} className="text-rose-600" /> Dispute Reason & Inspection Notes
                        </h5>

                        <div className="flex flex-wrap gap-2">
                          {["Quality Mismatch", "Moisture / Grade Failure", "Quantity Discrepancy", "Damaged Bags"].map((cat) => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setIssueCategory(cat)}
                              className={`px-3 py-1 rounded-lg border text-[11px] font-bold transition cursor-pointer ${
                                issueCategory === cat
                                  ? "bg-rose-50 border-rose-500 text-rose-700"
                                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                              }`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>

                        <textarea
                          placeholder="Describe the discrepancy in detail (e.g. Moisture level exceeded 14%, 2 bags torn during transit)..."
                          className="w-full p-3 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-rose-500"
                          rows={3}
                          value={issueText}
                          onChange={(e) => setIssueText(e.target.value)}
                        />

                        <div className="flex justify-end">
                          <button
                            disabled={actionLoading || !issueText.trim()}
                            onClick={() => reportIssue(d._id)}
                            className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                          >
                            <Send size={13} />
                            <span>Submit Formal Dispute</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
