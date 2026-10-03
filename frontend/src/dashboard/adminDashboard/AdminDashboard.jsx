import React, { useEffect, useMemo, useState } from "react";
import {
  Truck,
  MapPin,
  Package,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  ShieldCheck,
  User,
  Box,
  X,
  ArrowRight,
  RefreshCw,
  Loader2,
  AlertCircle,
  Building2,
  Phone,
  Boxes,
  ExternalLink,
  ChevronRight,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";

/* ================= STATUS FLOW CONFIG ================= */
const STATUS_FLOW = [
  {
    id: "PICKUP_SCHEDULED",
    label: "Pickup Scheduled",
    color: "bg-amber-50 text-amber-800 border-amber-200",
    stepColor: "bg-amber-500",
    icon: Clock,
    desc: "Produce harvest packaged at farm; truck pickup scheduled.",
  },
  {
    id: "COLLECTED_FROM_FARMER",
    label: "Collected from Farm",
    color: "bg-blue-50 text-blue-800 border-blue-200",
    stepColor: "bg-blue-500",
    icon: Box,
    desc: "AgriAssure logistics has collected crop consignment from farm.",
  },
  {
    id: "IN_TRANSIT",
    label: "In Transit",
    color: "bg-indigo-50 text-indigo-800 border-indigo-200",
    stepColor: "bg-indigo-500",
    icon: Truck,
    desc: "Consignment is moving on the highway to buyer facility.",
  },
  {
    id: "DELIVERED_TO_BUYER",
    label: "Delivered to Buyer",
    color: "bg-purple-50 text-purple-800 border-purple-200",
    stepColor: "bg-purple-500",
    icon: MapPin,
    desc: "Consignment arrived at buyer facility; awaiting confirmation.",
  },
  {
    id: "ESCROW_RELEASED",
    label: "Settled & Completed",
    color: "bg-emerald-50 text-emerald-800 border-emerald-200",
    stepColor: "bg-emerald-500",
    icon: ShieldCheck,
    desc: "Buyer verified harvest quality. Escrow funds released to farmer.",
  },
];

/* ================= STAT CARD ================= */
const StatCard = ({ title, value, sub, icon: Icon, gradientClass, textClass, borderClass }) => (
  <div className={`bg-white/90 backdrop-blur-md p-5 rounded-3xl border ${borderClass || "border-slate-200/80"} shadow-xs flex items-center justify-between hover:shadow-md transition-all duration-200 group relative overflow-hidden`}>
    <div>
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{title}</p>
      <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">{value}</h3>
      <p className="text-[11px] font-medium text-slate-500 mt-0.5">{sub}</p>
    </div>
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${gradientClass} ${textClass} shadow-md group-hover:scale-105 transition-transform`}>
      <Icon size={22} />
    </div>
  </div>
);

/* ================= COMPACT STATUS STEPPER ================= */
const StatusStepper = ({ currentStatus }) => {
  const currentIndex = STATUS_FLOW.findIndex((s) => s.id === currentStatus);
  const safeIndex = currentIndex >= 0 ? currentIndex : 0;

  return (
    <div className="space-y-1.5 min-w-[200px]">
      <div className="flex items-center justify-between text-[11px] font-bold">
        <span className="text-slate-700">
          {STATUS_FLOW[safeIndex]?.label || currentStatus}
        </span>
        <span className="text-slate-400 font-mono text-[10px]">
          Step {safeIndex + 1}/{STATUS_FLOW.length}
        </span>
      </div>

      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex shadow-inner">
        {STATUS_FLOW.map((s, idx) => (
          <div
            key={s.id}
            className={`h-full flex-1 border-r border-white last:border-0 transition-all duration-300 ${
              idx <= safeIndex
                ? "bg-linear-to-r from-emerald-500 to-teal-500"
                : "bg-slate-200"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

/* ================= MAIN DASHBOARD ================= */
export default function AdminDashboard() {
  const [deliveries, setDeliveries] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  /* ================= FETCH DELIVERIES ================= */
  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const res = await api.getAllDeliveries();
      const raw = res.data?.deliveries || res.data || [];

      const mapped = raw.map((d) => {
        const farmerName =
          d.farmerId && typeof d.farmerId === "object"
            ? d.farmerId.name
            : d.farmerName || "Verified Producer";

        const buyerName =
          d.buyerId && typeof d.buyerId === "object"
            ? d.buyerId.name
            : d.buyerName || "Institutional Buyer";

        const pickup =
          typeof d.pickupAddress === "string"
            ? d.pickupAddress
            : d.pickupAddress?.farmAddress || "Regional Farm, MP";

        const destination =
          typeof d.deliveryAddress === "string"
            ? d.deliveryAddress
            : d.deliveryAddress?.deliveryAddress || "Buyer Hub";

        return {
          _id: d._id,
          id: d.deliveryId || `DLV-...${d._id?.slice(-6).toUpperCase()}`,
          crop: d.crop || "Crop Consignment",
          qty: d.quantity || "Agreed Volume",
          status: d.deliveryStatus || "PICKUP_SCHEDULED",
          farmerName,
          buyerName,
          escrowAmount: d.escrowAmount || d.totalValue || 0,
          pickupAddress: pickup,
          deliveryAddress: destination,
          lastUpdate: d.updatedAt
            ? new Date(d.updatedAt).toLocaleString("en-IN", {
                dateStyle: "short",
                timeStyle: "short",
              })
            : "Recent",
        };
      });

      setDeliveries(mapped);
    } catch (err) {
      console.error("❌ Failed to fetch admin deliveries:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  /* ================= STATS ================= */
  const stats = useMemo(() => {
    return {
      total: deliveries.length,
      active: deliveries.filter((d) => d.status !== "ESCROW_RELEASED").length,
      pickup: deliveries.filter((d) => d.status === "PICKUP_SCHEDULED").length,
      transit: deliveries.filter((d) => d.status === "IN_TRANSIT" || d.status === "COLLECTED_FROM_FARMER").length,
      completed: deliveries.filter((d) => d.status === "ESCROW_RELEASED" || d.status === "DELIVERED_TO_BUYER").length,
    };
  }, [deliveries]);

  /* ================= STATUS TRANSITION ================= */
  const getNextStatus = (status) => {
    const idx = STATUS_FLOW.findIndex((s) => s.id === status);
    return idx >= 0 && idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;
  };

  const advanceStatus = async () => {
    if (!selectedDelivery) return;

    try {
      setActionLoading(true);
      const s = selectedDelivery.status;

      if (s === "PICKUP_SCHEDULED") {
        await api.collectFromFarmer(selectedDelivery._id);
        setToastMsg(`Shipment ${selectedDelivery.id} marked as Collected from Farmer.`);
      } else if (s === "COLLECTED_FROM_FARMER") {
        await api.markInTransit(selectedDelivery._id);
        setToastMsg(`Shipment ${selectedDelivery.id} is now In Transit.`);
      } else if (s === "IN_TRANSIT") {
        await api.markDeliveredToBuyer(selectedDelivery._id);
        setToastMsg(`Shipment ${selectedDelivery.id} marked as Delivered to Buyer.`);
      }

      await fetchDeliveries();
      setSelectedDelivery(null);
      setTimeout(() => setToastMsg(""), 4000);
    } catch (err) {
      console.error("❌ Advance status failed:", err);
      alert("Failed to update status. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  /* ================= FILTERING ================= */
  const visible = useMemo(() => {
    return deliveries.filter((d) => {
      const matchFilter = filter === "ALL" || d.status === filter;
      const q = search.toLowerCase();
      const matchSearch =
        d.id.toLowerCase().includes(q) ||
        d.crop.toLowerCase().includes(q) ||
        d.farmerName.toLowerCase().includes(q) ||
        d.buyerName.toLowerCase().includes(q) ||
        d.pickupAddress.toLowerCase().includes(q) ||
        d.deliveryAddress.toLowerCase().includes(q);

      return matchFilter && matchSearch;
    });
  }, [deliveries, filter, search]);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-gray-800 to-slate-900 pt-24 pb-16 px-4 sm:px-6 lg:px-8 font-sans relative">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Toast Alert */}
        <AnimatePresence>
          {toastMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-2xl bg-linear-to-r from-emerald-900 to-slate-900 text-white shadow-xl flex items-center justify-between gap-3 text-xs font-semibold border border-emerald-500/30"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-400" />
                <span>{toastMsg}</span>
              </div>
              <button onClick={() => setToastMsg("")} className="text-slate-400 hover:text-white transition">
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ================= 🚚 HERO HEADER BANNER (LINEAR GRADIENT) ================= */}
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl border border-indigo-900/50">
          {/* Subtle Ambient Glow Effect */}
          <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-10 -top-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                <Truck size={14} className="text-indigo-400" /> Platform Logistics Tower
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
                Delivery & Escrow Operations
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-medium leading-relaxed">
                Live oversight of all contract harvests, farm collections, highway transport, and escrow handoffs across the platform.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={fetchDeliveries}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white transition cursor-pointer shadow-sm flex items-center gap-2 text-xs font-bold backdrop-blur-md"
                title="Refresh Shipments"
              >
                <RefreshCw size={15} className={loading ? "animate-spin text-emerald-400" : "text-emerald-400"} />
                <span>Refresh Data</span>
              </button>
            </div>
          </div>
        </div>

        {/* ================= 📊 METRICS WITH GRADIENTS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Consignments"
            value={stats.total}
            sub="Active platform contracts"
            icon={Boxes}
            gradientClass="bg-gradient-to-br from-slate-700 to-slate-900 text-white"
            textClass="text-white"
            borderClass="border-slate-200/80"
          />
          <StatCard
            title="Pickup Pending"
            value={stats.pickup}
            sub="Awaiting farm collection"
            icon={Clock}
            gradientClass="bg-gradient-to-br from-amber-400 to-amber-600 text-white"
            textClass="text-white"
            borderClass="border-amber-200/80"
          />
          <StatCard
            title="In Highway Transit"
            value={stats.transit}
            sub="Moving to buyer hubs"
            icon={Truck}
            gradientClass="bg-gradient-to-br from-indigo-500 to-indigo-700 text-white"
            textClass="text-white"
            borderClass="border-indigo-200/80"
          />
          <StatCard
            title="Delivered / Completed"
            value={stats.completed}
            sub="Escrow released"
            icon={CheckCircle2}
            gradientClass="bg-gradient-to-br from-emerald-500 to-teal-700 text-white"
            textClass="text-white"
            borderClass="border-emerald-200/80"
          />
        </div>

        {/* ================= 🔍 SEARCH & FILTER BAR ================= */}
        <div className="bg-white/90 backdrop-blur-md p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search shipment, crop, farmer, buyer..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 transition"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            <Filter size={14} className="text-slate-400 shrink-0 ml-1 mr-1" />
            <button
              onClick={() => setFilter("ALL")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                filter === "ALL"
                  ? "bg-linear-to-r from-slate-900 to-indigo-950 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All ({deliveries.length})
            </button>
            {STATUS_FLOW.map((s) => (
              <button
                key={s.id}
                onClick={() => setFilter(s.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  filter === s.id
                    ? "bg-linear-to-r from-slate-900 to-indigo-950 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* ================= 📋 SHIPMENTS DATA TABLE ================= */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-16 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-indigo-600" size={32} />
              <p className="text-xs font-semibold">Loading platform logistics data...</p>
            </div>
          ) : visible.length === 0 ? (
            <div className="p-16 text-center text-slate-400 text-xs space-y-2">
              <Truck size={36} className="mx-auto text-slate-300 mb-2" />
              <p className="font-bold text-slate-700 text-sm">No shipments match your filter</p>
              <p className="text-slate-400">Try changing your search query or status filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/90 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                  <tr>
                    <th className="py-4 px-4 sm:px-6">Shipment & Crop</th>
                    <th className="py-4 px-4">Origin & Destination</th>
                    <th className="py-4 px-4">Escrow Value</th>
                    <th className="py-4 px-4 min-w-[220px]">Live Progress</th>
                    <th className="py-4 px-4 sm:px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {visible.map((d) => {
                    const next = getNextStatus(d.status);

                    return (
                      <tr key={d._id} className="hover:bg-slate-50/80 transition">
                        {/* Shipment & Crop */}
                        <td className="py-4 px-4 sm:px-6">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px] border border-slate-200">
                              {d.id}
                            </span>
                          </div>
                          <p className="font-bold text-slate-900 text-sm mt-1">
                            {d.crop}
                          </p>
                          <p className="text-slate-500 font-medium text-[11px]">
                            Qty: {d.qty}
                          </p>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                            <span className="flex items-center gap-1">
                              <User size={11} className="text-emerald-600" />
                              <b>Farmer:</b> {d.farmerName}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Building2 size={11} className="text-indigo-600" />
                              <b>Buyer:</b> {d.buyerName}
                            </span>
                          </div>
                        </td>

                        {/* Origin & Destination */}
                        <td className="py-4 px-4 max-w-60">
                          <div className="space-y-1.5">
                            <div className="flex items-start gap-1.5">
                              <MapPin size={12} className="text-emerald-600 shrink-0 mt-0.5" />
                              <div>
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">From (Farm)</span>
                                <span className="font-medium text-slate-800 line-clamp-1">{d.pickupAddress}</span>
                              </div>
                            </div>
                            <div className="flex items-start gap-1.5">
                              <MapPin size={12} className="text-indigo-600 shrink-0 mt-0.5" />
                              <div>
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">To (Buyer Hub)</span>
                                <span className="font-medium text-slate-800 line-clamp-1">{d.deliveryAddress}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Escrow Value */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="font-extrabold text-sm text-slate-900">
                            ₹{Number(d.escrowAmount || 0).toLocaleString("en-IN")}
                          </div>
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-block mt-0.5">
                            Escrow Locked
                          </span>
                        </td>

                        {/* Progress Stepper */}
                        <td className="py-4 px-4">
                          <StatusStepper currentStatus={d.status} />
                        </td>

                        {/* Action */}
                        <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                          {next ? (
                            <button
                              onClick={() => setSelectedDelivery(d)}
                              className="px-4 py-2 bg-linear-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold rounded-xl text-xs shadow-xs transition-all flex items-center gap-1.5 ml-auto cursor-pointer"
                            >
                              <span>Update: {next.label}</span>
                              <ChevronRight size={14} />
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 size={13} /> Completed
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ================= 🚀 STATUS UPDATE MODAL ================= */}
      {selectedDelivery && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden text-slate-800 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                  <Truck size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">Advance Shipment Status</h3>
                  <p className="text-xs text-slate-300 font-mono">
                    Consignment: {selectedDelivery.id}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedDelivery(null)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Crop Produce:</span>
                  <span className="font-bold text-slate-900">{selectedDelivery.crop} ({selectedDelivery.qty})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Current State:</span>
                  <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {STATUS_FLOW.find((s) => s.id === selectedDelivery.status)?.label || selectedDelivery.status}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                  <span className="text-slate-500 font-semibold">Advance Next To:</span>
                  <span className="font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-200">
                    {getNextStatus(selectedDelivery.status)?.label}
                  </span>
                </div>
              </div>

              <p className="text-slate-500 leading-relaxed text-[11px]">
                {getNextStatus(selectedDelivery.status)?.desc}
              </p>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedDelivery(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 font-bold text-slate-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={advanceStatus}
                  className="flex-1 py-2.5 rounded-xl bg-linear-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      <span>Confirm Update</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

