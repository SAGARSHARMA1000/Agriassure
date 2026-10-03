import React, { useEffect, useState, useMemo } from "react";
import api from "../../../services/api";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  Calendar,
  Search,
  Filter,
  ArrowRight,
  AlertTriangle,
  RefreshCw,
  Loader2,
  Boxes,
  ChevronRight,
  Info,
  ExternalLink,
  Phone,
  User,
} from "lucide-react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

/* ---------- STATUS CONFIGURATION ---------- */
const STATUS_CONFIG = {
  PICKUP_SCHEDULED: {
    label: "Pickup Scheduled",
    step: 1,
    badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
    stepColor: "text-amber-600 bg-amber-50 border-amber-300",
    desc: "AgriAssure logistics has scheduled truck pickup from your farm.",
  },
  COLLECTED_FROM_FARMER: {
    label: "Collected from Farm",
    step: 2,
    badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
    stepColor: "text-blue-600 bg-blue-50 border-blue-300",
    desc: "Crop loaded onto transport truck; transit to buyer initiated.",
  },
  IN_TRANSIT: {
    label: "In Transit",
    step: 3,
    badgeClass: "bg-indigo-100 text-indigo-800 border-indigo-200 animate-pulse",
    stepColor: "text-indigo-600 bg-indigo-50 border-indigo-300",
    desc: "Produce is on route to the buyer's destination warehouse.",
  },
  DELIVERED_TO_BUYER: {
    label: "Delivered to Buyer",
    step: 4,
    badgeClass: "bg-purple-100 text-purple-800 border-purple-200",
    stepColor: "text-purple-600 bg-purple-50 border-purple-300",
    desc: "Consignment arrived at buyer facility. Verification in progress.",
  },
  CONFIRMED_BY_BUYER: {
    label: "Buyer Confirmed",
    step: 4,
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
    stepColor: "text-emerald-600 bg-emerald-50 border-emerald-300",
    desc: "Buyer approved crop quality. Payment releasing to your wallet.",
  },
  AUTO_CONFIRMED: {
    label: "Auto Confirmed",
    step: 4,
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
    stepColor: "text-emerald-600 bg-emerald-50 border-emerald-300",
    desc: "Auto-verified upon 24-hour delivery window. Payment released.",
  },
  ESCROW_RELEASED: {
    label: "Payment Released & Completed",
    step: 4,
    badgeClass: "bg-emerald-100 text-emerald-900 border-emerald-300 font-bold",
    stepColor: "text-emerald-600 bg-emerald-50 border-emerald-300",
    desc: "Escrow payment released directly into your Farm Wallet.",
  },
  ISSUE_REPORTED: {
    label: "Issue Under Review",
    step: 4,
    badgeClass: "bg-rose-100 text-rose-800 border-rose-300",
    stepColor: "text-rose-600 bg-rose-50 border-rose-300",
    desc: "A quality or quantity discrepancy is being reviewed by AgriAssure.",
  },
};

const DELIVERY_STEPS = [
  { step: 1, label: "Pickup Scheduled", icon: Clock },
  { step: 2, label: "Collected from Farm", icon: Package },
  { step: 3, label: "In Transit", icon: Truck },
  { step: 4, label: "Delivered & Paid", icon: ShieldCheck },
];

export default function FarmerDeliveryDashboard() {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const farmerId = user?.id || user?._id || "f1";

  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedTimeline, setExpandedTimeline] = useState({});

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const res = await api.getFarmerDeliveries(farmerId);
      setDeliveries(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("❌ Failed to load farmer deliveries", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (farmerId) fetchDeliveries();
  }, [farmerId]);

  // Metric summaries
  const metrics = useMemo(() => {
    const total = deliveries.length;
    const inTransit = deliveries.filter(
      (d) =>
        d.deliveryStatus === "IN_TRANSIT" ||
        d.deliveryStatus === "PICKUP_SCHEDULED" ||
        d.deliveryStatus === "COLLECTED_FROM_FARMER"
    ).length;
    const completed = deliveries.filter(
      (d) =>
        d.deliveryStatus === "ESCROW_RELEASED" ||
        d.deliveryStatus === "CONFIRMED_BY_BUYER" ||
        d.deliveryStatus === "AUTO_CONFIRMED"
    ).length;
    const totalValue = deliveries.reduce(
      (sum, d) => sum + (Number(d.escrowAmount) || Number(d.totalValue) || 0),
      0
    );

    return { total, inTransit, completed, totalValue };
  }, [deliveries]);

  // Filtered list
  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((d) => {
      const matchSearch =
        d.crop?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.deliveryId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.pickupAddress?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.deliveryAddress?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "in_transit" &&
          (d.deliveryStatus === "IN_TRANSIT" ||
            d.deliveryStatus === "PICKUP_SCHEDULED" ||
            d.deliveryStatus === "COLLECTED_FROM_FARMER")) ||
        (statusFilter === "delivered" &&
          (d.deliveryStatus === "DELIVERED_TO_BUYER" ||
            d.deliveryStatus === "CONFIRMED_BY_BUYER" ||
            d.deliveryStatus === "AUTO_CONFIRMED" ||
            d.deliveryStatus === "ESCROW_RELEASED"));

      return matchSearch && matchStatus;
    });
  }, [deliveries, searchQuery, statusFilter]);

  const toggleTimeline = (id) => {
    setExpandedTimeline((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="space-y-6 font-sans">
      {/* ================= 🚚 HEADER & ACTIONS ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Truck className="text-emerald-600" size={24} /> Crop Logistics & Delivery Tracking
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitor farm pickups, live transport tracking, and automated escrow release triggers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchDeliveries}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
            title="Refresh Deliveries"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>

          <button
            onClick={() => navigate("/dashboard/farmer/payments")}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-xs flex items-center gap-2 transition cursor-pointer"
          >
            <ShieldCheck size={16} /> View Escrow Wallet
          </button>
        </div>
      </div>

      {/* ================= 📊 QUICK METRIC STATS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Consignments
            </p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              {metrics.total}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">End-to-end tracked</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Boxes size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-indigo-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">
              Active In Transit
            </p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              {metrics.inTransit}
            </h3>
            <p className="text-[11px] text-indigo-600 font-medium mt-0.5">On route to buyer</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Truck size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-emerald-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
              Settled & Paid
            </p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              {metrics.completed}
            </h3>
            <p className="text-[11px] text-emerald-700 font-medium mt-0.5">Escrow released</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Protected Volume
            </p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              ₹{metrics.totalValue.toLocaleString("en-IN")}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">100% Escrow Secured</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck size={22} />
          </div>
        </div>
      </div>

      {/* ================= 🔍 SEARCH & FILTERS ================= */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
        <div className="relative w-full sm:w-80">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search by crop, tracking ID, destination..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={14} className="text-slate-400 shrink-0" />
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-0.5 text-xs w-full sm:w-auto">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                statusFilter === "all"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All ({deliveries.length})
            </button>
            <button
              onClick={() => setStatusFilter("in_transit")}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                statusFilter === "in_transit"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              In Transit ({metrics.inTransit})
            </button>
            <button
              onClick={() => setStatusFilter("delivered")}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                statusFilter === "delivered"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Settled ({metrics.completed})
            </button>
          </div>
        </div>
      </div>

      {/* ================= 📦 DELIVERIES LIST ================= */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
          <Loader2 className="animate-spin text-emerald-600" size={32} />
          <span className="font-semibold text-xs sm:text-sm">
            Loading logistics consignments & tracking...
          </span>
        </div>
      ) : filteredDeliveries.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center text-slate-500 max-w-xl mx-auto space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
            <Truck size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">
            No Deliveries Found
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            When buyers accept your crop proposals and deposit escrow funds, AgriAssure automatically schedules farm collection and provides live tracking updates here.
          </p>
          <button
            onClick={() => navigate("/dashboard/farmer/proposals")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs transition cursor-pointer"
          >
            Review Crop Proposals
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredDeliveries.map((delivery, index) => {
            const config =
              STATUS_CONFIG[delivery.deliveryStatus] || STATUS_CONFIG.PICKUP_SCHEDULED;
            const currentStep = config.step;
            const isCompleted =
              delivery.deliveryStatus === "ESCROW_RELEASED" ||
              delivery.deliveryStatus === "CONFIRMED_BY_BUYER" ||
              delivery.deliveryStatus === "AUTO_CONFIRMED";
            const isExpanded = !!expandedTimeline[delivery._id];
            const timelineEvents = Array.isArray(delivery.timeline)
              ? delivery.timeline
              : [];

            return (
              <motion.div
                key={delivery._id || index}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition overflow-hidden"
              >
                {/* Consignment Top Bar */}
                <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
                      <Package size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                          {delivery.crop || "Crop Harvest"}
                        </h3>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${config.badgeClass}`}
                        >
                          {config.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        Tracking ID: <b>{delivery.deliveryId || `DLV-...${delivery._id?.slice(-6).toUpperCase()}`}</b>
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <div className="text-base sm:text-lg font-black text-emerald-700">
                      ₹{Number(delivery.escrowAmount || delivery.totalValue || 0).toLocaleString("en-IN")}
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                      <ShieldCheck size={12} /> Escrow Protected
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 sm:p-6 space-y-6">
                  {/* Step Progress Tracker */}
                  <div className="bg-slate-50/80 p-4 sm:p-5 rounded-2xl border border-slate-200/70">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
                      {DELIVERY_STEPS.map((s, sIdx) => {
                        const StepIcon = s.icon;
                        const isDone = currentStep >= s.step;
                        const isCurrent = currentStep === s.step;

                        return (
                          <div
                            key={s.step}
                            className="flex flex-col items-center text-center relative z-10"
                          >
                            <div
                              className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm mb-2 transition shadow-xs ${
                                isDone
                                  ? "bg-emerald-600 text-white"
                                  : "bg-white border border-slate-200 text-slate-400"
                              } ${isCurrent ? "ring-4 ring-emerald-100" : ""}`}
                            >
                              {isDone ? <CheckCircle2 size={20} /> : <StepIcon size={18} />}
                            </div>
                            <span
                              className={`text-xs font-bold leading-tight ${
                                isDone ? "text-slate-900" : "text-slate-400"
                              }`}
                            >
                              {s.label}
                            </span>
                            <span className="text-[10px] text-slate-400 mt-0.5">
                              Step {s.step} of 4
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Route & Harvest Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
                    {/* Quantity & Value */}
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Consignment Volume
                      </span>
                      <p className="font-extrabold text-sm text-slate-800">
                        {delivery.quantity || "Agreed Harvest Quantity"}
                      </p>
                      <p className="text-slate-500 text-[11px]">
                        Contract ID: CTR-...{delivery.contractId ? String(delivery.contractId).slice(-4).toUpperCase() : "AGRI"}
                      </p>
                    </div>

                    {/* Pickup Address (Farm) */}
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block items-center gap-1">
                        <MapPin size={11} className="text-emerald-600" /> Origin (Farm Mandi)
                      </span>
                      <p className="font-medium text-slate-800 line-clamp-2">
                        {delivery.pickupAddress || "Farmer Farm Location, MP"}
                      </p>
                    </div>

                    {/* Destination Address (Buyer) */}
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block items-center gap-1">
                        <MapPin size={11} className="text-indigo-600" /> Destination Facility
                      </span>
                      <p className="font-medium text-slate-800 line-clamp-2">
                        {delivery.deliveryAddress || "Buyer Commercial Hub"}
                      </p>
                    </div>
                  </div>

                  {/* Status Explanation Callout Banner */}
                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <Info size={16} className="text-emerald-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block text-emerald-900">
                          Logistics Status: {config.label}
                        </span>
                        <p className="text-emerald-800 text-[11px] mt-0.5">
                          {config.desc}
                        </p>
                      </div>
                    </div>

                    {isCompleted ? (
                      <button
                        onClick={() => navigate("/dashboard/farmer/payments")}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 transition flex items-center gap-1 shadow-2xs cursor-pointer"
                      >
                        <span>Withdraw ₹{Number(delivery.escrowAmount || delivery.totalValue || 0).toLocaleString("en-IN")}</span>
                        <ChevronRight size={14} />
                      </button>
                    ) : (
                      <div className="text-[11px] font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-xl border border-emerald-200 shrink-0">
                        🔒 Funds Protected in Escrow
                      </div>
                    )}
                  </div>

                  {/* Collapsible Timeline Events */}
                  {timelineEvents.length > 0 && (
                    <div className="border-t border-slate-100 pt-3">
                      <button
                        onClick={() => toggleTimeline(delivery._id)}
                        className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <span>{isExpanded ? "Hide" : "View"} Detailed Transport Log ({timelineEvents.length} updates)</span>
                        <ChevronRight
                          size={14}
                          className={`transform transition ${isExpanded ? "rotate-90" : ""}`}
                        />
                      </button>

                      {isExpanded && (
                        <div className="mt-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                          {timelineEvents.map((evt, eIdx) => (
                            <div
                              key={eIdx}
                              className="flex items-center justify-between text-xs text-slate-600 pb-1.5 border-b border-slate-200/60 last:border-0 last:pb-0"
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                <span className="font-semibold text-slate-800">
                                  {evt.status}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400">
                                {evt.at
                                  ? new Date(evt.at).toLocaleString("en-IN", {
                                      dateStyle: "short",
                                      timeStyle: "short",
                                    })
                                  : "Recorded"}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}