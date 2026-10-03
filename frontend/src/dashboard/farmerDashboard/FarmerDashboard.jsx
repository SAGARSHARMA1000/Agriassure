import React, { useEffect, useState, useMemo, useRef } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  ClipboardList,
  FileText,
  Bell,
  FileSignature,
  Wallet,
  Truck,
  PlusCircle,
  ShieldCheck,
  MapPin,
  Wheat,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";
import api from "../../services/api";
import "./FarmerDashboard.css";


const FarmerDashboard = ({
  user,
  proposals = [],
  onUpdateProposalStatus,
  refreshMarketplace,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const farmerId = user?.id || user?._id || "f1";

  const [listings, setListings] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [escrowStats, setEscrowStats] = useState(null);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [selectedCropFilter, setSelectedCropFilter] = useState("all");
  const notificationRef = useRef(null);

  // Fetch farmer listings
  const fetchListings = async () => {
    try {
      const fId = user?.id || user?._id || "f1";
      const fName = user?.name || user?.fullName;
      const resp = await api.getFarmerListings(fId, fName);
      const list =
        resp.data?.data ||
        resp.data?.listings ||
        (Array.isArray(resp.data) ? resp.data : []);
      setListings(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Fetch listings failed", err);
    }
  };

  // Fetch farmer contracts
  const fetchContracts = async () => {
    try {
      const fId = user?.id || user?._id || "f1";
      const res = await api.getFarmerContracts(fId);
      setContracts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch farmer contracts", err);
    }
  };

  // Fetch escrow dashboard summary
  const fetchEscrow = async () => {
    try {
      const fId = user?.id || user?._id || "f1";
      const res = await api.getFarmerEscrowDashboard(fId);
      setEscrowStats(res.data);
    } catch (err) {
      console.error("Failed to fetch escrow summary", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchListings();
      fetchContracts();
      fetchEscrow();
    }
  }, [user]);

  // Listen for navigation state refresh
  useEffect(() => {
    if (location.state?.refresh) {
      fetchListings();
      fetchContracts();
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Close notification popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target)
      ) {
        setNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Safe proposals array
  const allProposals = useMemo(() => {
    return Array.isArray(proposals) ? proposals : [];
  }, [proposals]);

  // Pending proposals (requires farmer action)
  const pendingProposals = useMemo(() => {
    return allProposals.filter((p) => p.status === "pending");
  }, [allProposals]);

  // Crop-wise proposal groupings for alert indicators
  const cropProposalAlerts = useMemo(() => {
    const map = {};
    pendingProposals.forEach((p) => {
      const cropName = p.listing?.commodity || "Crop";
      if (!map[cropName]) {
        map[cropName] = [];
      }
      map[cropName].push(p);
    });
    return map;
  }, [pendingProposals]);

  // Active Contracts count
  const pendingContractsCount = useMemo(() => {
    return contracts.filter((c) => c.status === "sent_to_farmer").length;
  }, [contracts]);

  const activeContractsCount = useMemo(() => {
    return contracts.filter(
      (c) => c.status === "active" || c.status === "sent_to_farmer"
    ).length;
  }, [contracts]);

  // Active Payments count
  const activePaymentsCount = useMemo(() => {
    if (escrowStats?.activeEscrows) return escrowStats.activeEscrows;
    return contracts.filter((c) => c.status === "active").length;
  }, [contracts, escrowStats]);

  // Accept Proposal Handler
  const handleAccept = async (proposalId) => {
    try {
      await onUpdateProposalStatus(proposalId, "accepted");
      await api.acceptProposal(proposalId);
      await fetchContracts();
    } catch (err) {
      console.error("Accept failed", err);
    }
  };

  // Reject Proposal Handler
  const handleReject = async (proposalId) => {
    try {
      await onUpdateProposalStatus(proposalId, "rejected");
    } catch (err) {
      console.error("Reject failed", err);
    }
  };

  // Filtered proposals list for proposal view
  const displayProposals = useMemo(() => {
    if (selectedCropFilter === "all") return allProposals;
    return allProposals.filter(
      (p) =>
        p.listing?.commodity?.toLowerCase() ===
        selectedCropFilter.toLowerCase()
    );
  }, [allProposals, selectedCropFilter]);

  // Safety Guard
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-emerald-700">
        <div className="flex items-center gap-3 text-lg font-semibold">
          <Wheat className="animate-spin text-emerald-600" size={24} />
          Loading Farmer Dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="farmer-dashboard-container pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ================= 🌾 TOP WELCOME BANNER & PROFILE ================= */}
        <div className="rounded-2xl bg-white border border-slate-200/90 p-6 md:p-8 mb-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
                <ShieldCheck size={14} className="text-emerald-600" /> Verified Producer
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Welcome back,{" "}
                <span className="text-emerald-700">{user.name}</span>
              </h1>
              <p className="mt-1 text-slate-500 text-xs sm:text-sm flex items-center gap-1.5">
                <MapPin size={14} className="text-emerald-600 shrink-0" />
                {user.farmAddress || "Central Mandi, MP"} • Producer Portal
              </p>
            </div>

            {/* Quick Actions & Notification Bell */}
            <div className="flex items-center gap-3 farmer-header-actions">
              {/* Notification Bell Dropdown */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setNotificationOpen(!notificationOpen)}
                  className={`p-2.5 rounded-xl border transition relative flex items-center justify-center cursor-pointer ${
                    notificationOpen
                      ? "bg-emerald-50 border-emerald-400 text-emerald-700"
                      : "bg-white border-slate-200 text-slate-700 hover:border-emerald-400 hover:text-emerald-700 shadow-xs"
                  }`}
                  title="Crop Proposal Notifications"
                >
                  <Bell size={20} />
                  {pendingProposals.length > 0 && (
                    <span className="bell-pulse-badge">
                      {pendingProposals.length}
                    </span>
                  )}
                </button>

                {/* 🔔 NOTIFICATION CENTER DROPDOWN */}
                {notificationOpen && (
                  <div className="notification-dropdown">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                      <div className="flex items-center gap-2">
                        <Bell size={16} className="text-emerald-600" />
                        <h4 className="text-sm font-bold text-slate-900">
                          Crop Proposal Alerts
                        </h4>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {pendingProposals.length} New
                      </span>
                    </div>

                    <div className="max-h-72 overflow-y-auto farmer-custom-scroll divide-y divide-slate-100">
                      {pendingProposals.length === 0 ? (
                        <div className="p-6 text-center text-slate-500 text-xs">
                          <CheckCircle2
                            size={26}
                            className="mx-auto mb-2 text-emerald-500 opacity-80"
                          />
                          No pending proposal alerts right now.
                        </div>
                      ) : (
                        pendingProposals.map((p) => {
                          const cropName = p.listing?.commodity || "Crop";
                          return (
                            <div
                              key={p._id}
                              onClick={() => {
                                setNotificationOpen(false);
                                navigate("proposals");
                              }}
                              className="notification-item"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-xs text-slate-900">
                                      {cropName}
                                    </span>
                                    <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-semibold">
                                      New Offer
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-600 mt-0.5">
                                    Buyer:{" "}
                                    <span className="font-medium text-slate-800">
                                      {p.buyerName || "Verified Buyer"}
                                    </span>
                                  </p>
                                  <p className="text-[11px] text-emerald-700 font-bold mt-0.5">
                                    ₹{p.offerPrice} / {p.unit || "Qtl"} • Qty: {p.quantity}
                                  </p>
                                </div>
                                <ChevronRight
                                  size={16}
                                  className="text-slate-400 shrink-0 mt-1"
                                />
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                      <button
                        onClick={() => {
                          setNotificationOpen(false);
                          navigate("proposals");
                        }}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center justify-center gap-1 w-full cursor-pointer"
                      >
                        View All Proposals ({allProposals.length}) <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Add New Listing Button */}
              <NavLink
                to="add"
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-xs flex items-center gap-2 transition"
              >
                <PlusCircle size={16} />
                <span>Add Crop Listing</span>
              </NavLink>
            </div>
          </div>
        </div>

        {/* ================= 📊 ACTIVE METRICS / STAT CARDS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stat-grid-responsive">
          {/* 1. Active Listings */}
          <div
            onClick={() => navigate("listings")}
            className="stat-card-light p-5 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Active Listings
              </span>
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
                <Wheat size={18} />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {listings.length}
              </h3>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                Live in Market
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Manage your published crop harvest
            </p>
          </div>

          {/* 2. Received Proposals */}
          <div
            onClick={() => navigate("proposals")}
            className="stat-card-light p-5 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Crop Proposals
              </span>
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-100 relative">
                <Bell size={18} />
                {pendingProposals.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping"></span>
                )}
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {allProposals.length}
              </h3>
              {pendingProposals.length > 0 ? (
                <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                  {pendingProposals.length} Pending Action
                </span>
              ) : (
                <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                  Up to date
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Buyer price negotiations & bids
            </p>
          </div>

          {/* 3. Active Contracts */}
          <div
            onClick={() => navigate("contracts")}
            className="stat-card-light p-5 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Active Contracts
              </span>
              <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700 border border-teal-100">
                <FileSignature size={18} />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {activeContractsCount}
              </h3>
              {pendingContractsCount > 0 ? (
                <span className="text-[11px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-md">
                  {pendingContractsCount} Sign Required
                </span>
              ) : (
                <span className="text-[11px] font-semibold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-md">
                  Secured
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Legal digital farming agreements
            </p>
          </div>

          {/* 4. Active Payments / Escrow */}
          <div
            onClick={() => navigate("payments")}
            className="stat-card-light p-5 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Active Escrow
              </span>
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
                <Wallet size={18} />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {activePaymentsCount}
              </h3>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                <ShieldCheck size={11} /> 100% Protected
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Guaranteed payment upon delivery
            </p>
          </div>
        </div>

        {/* ================= 🗂️ MAIN WORKSPACE & NAVIGATION ================= */}
        <div className="dashboard-main-panel overflow-hidden flex flex-col lg:flex-row">
          {/* 📱 MOBILE HORIZONTAL NAV BAR (Only visible on tablet/mobile <= 1024px) */}
          <div className="farmer-nav-mobile-bar farmer-custom-scroll">
            <NavLink
              to="listings"
              className={({ isActive }) =>
                `farmer-nav-item ${isActive ? "active" : ""}`
              }
            >
              <ClipboardList size={17} className="nav-icon" /> My Listings
            </NavLink>

            <NavLink
              to="add"
              className={({ isActive }) =>
                `farmer-nav-item ${isActive ? "active" : ""}`
              }
            >
              <PlusCircle size={17} className="nav-icon" /> Add Listing
            </NavLink>

            <NavLink
              to="proposals"
              className={({ isActive }) =>
                `farmer-nav-item ${isActive ? "active" : ""}`
              }
            >
              <Bell size={17} className="nav-icon" /> Proposals
              {pendingProposals.length > 0 && (
                <span className="ml-1 bg-amber-100 text-amber-800 font-bold text-[10px] px-1.5 py-0.2 rounded-full">
                  {pendingProposals.length}
                </span>
              )}
            </NavLink>

            <NavLink
              to="contracts"
              className={({ isActive }) =>
                `farmer-nav-item ${isActive ? "active" : ""}`
              }
            >
              <FileSignature size={17} className="nav-icon" /> Contracts
              {pendingContractsCount > 0 && (
                <span className="ml-1 bg-red-100 text-red-700 font-bold text-[10px] px-1.5 py-0.2 rounded-full">
                  {pendingContractsCount}
                </span>
              )}
            </NavLink>

            <NavLink
              to="payments"
              className={({ isActive }) =>
                `farmer-nav-item ${isActive ? "active" : ""}`
              }
            >
              <Wallet size={17} className="nav-icon" /> Payments
            </NavLink>

            <NavLink
              to="delivery"
              className={({ isActive }) =>
                `farmer-nav-item ${isActive ? "active" : ""}`
              }
            >
              <Truck size={17} className="nav-icon" /> Delivery
            </NavLink>
          </div>

          {/* 🖥️ DESKTOP SIDEBAR (Only visible on laptop/desktop > 1024px) */}
          <div className="w-64 bg-slate-50/70 border-r border-slate-200 p-5 space-y-2 shrink-0 farmer-sidebar-desktop">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-2">
              Farmer Menu
            </div>

            <NavLink
              to="listings"
              className={({ isActive }) =>
                `farmer-nav-item ${isActive ? "active" : ""}`
              }
            >
              <ClipboardList size={18} className="nav-icon" />
              <span>My Listings</span>
              <span className="ml-auto text-xs text-slate-400 font-medium">
                {listings.length}
              </span>
            </NavLink>

            <NavLink
              to="add"
              className={({ isActive }) =>
                `farmer-nav-item ${isActive ? "active" : ""}`
              }
            >
              <PlusCircle size={18} className="nav-icon" />
              <span>Add Listing</span>
            </NavLink>

            <NavLink
              to="proposals"
              className={({ isActive }) =>
                `farmer-nav-item ${isActive ? "active" : ""}`
              }
            >
              <Bell size={18} className="nav-icon" />
              <span>Proposals</span>
              {pendingProposals.length > 0 ? (
                <span className="ml-auto bg-amber-100 text-amber-800 font-bold text-xs px-2 py-0.5 rounded-full">
                  {pendingProposals.length}
                </span>
              ) : (
                <span className="ml-auto text-xs text-slate-400 font-medium">
                  {allProposals.length}
                </span>
              )}
            </NavLink>

            <NavLink
              to="contracts"
              className={({ isActive }) =>
                `farmer-nav-item ${isActive ? "active" : ""}`
              }
            >
              <FileSignature size={18} className="nav-icon" />
              <span>Contracts</span>
              {pendingContractsCount > 0 ? (
                <span className="ml-auto bg-red-100 text-red-700 font-bold text-xs px-2 py-0.5 rounded-full">
                  {pendingContractsCount}
                </span>
              ) : (
                <span className="ml-auto text-xs text-slate-400 font-medium">
                  {contracts.length}
                </span>
              )}
            </NavLink>

            <NavLink
              to="payments"
              className={({ isActive }) =>
                `farmer-nav-item ${isActive ? "active" : ""}`
              }
            >
              <Wallet size={18} className="nav-icon" />
              <span>Payments</span>
            </NavLink>

            <NavLink
              to="delivery"
              className={({ isActive }) =>
                `farmer-nav-item ${isActive ? "active" : ""}`
              }
            >
              <Truck size={18} className="nav-icon" />
              <span>Delivery</span>
            </NavLink>

            {/* Quick Crop Proposal Indicators */}
            {Object.keys(cropProposalAlerts).length > 0 && (
              <div className="pt-4 mt-4 border-t border-slate-200">
                <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <Bell size={12} className="text-amber-600" /> Bids by Crop
                </div>
                <div className="space-y-1.5">
                  {Object.entries(cropProposalAlerts).map(([crop, propList]) => (
                    <div
                      key={crop}
                      onClick={() => {
                        setSelectedCropFilter(crop);
                        navigate("proposals");
                      }}
                      className="px-3 py-2 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 cursor-pointer flex items-center justify-between text-xs transition"
                    >
                      <span className="text-slate-700 truncate font-medium">
                        {crop}
                      </span>
                      <span className="bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded text-[10px]">
                        {propList.length} bid{propList.length > 1 ? "s" : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ================= 📄 MAIN CONTENT WORKSPACE ================= */}
          <div className="flex-1 p-5 sm:p-7 min-w-0 bg-white">
            <Outlet
              context={{
                listings,
                fetchListings,
                user,
                refreshMarketplace,
                proposals: allProposals,
                handleAccept,
                handleReject,
                contracts,
                fetchContracts,
                escrowStats,
              }}
            />
          </div>

        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;
