import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  ClipboardList,
  FileSignature,
  ShieldCheck,
  Truck,
  BarChart3,
  Briefcase,
  Sparkles,
  Wallet,
} from "lucide-react";
import "./BuyerDashboard.css";

const BuyerDashboard = ({ user, proposals }) => {
  // 🔒 SAFETY GUARD
  if (!user || !user.id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-6">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-300 font-medium text-sm">Loading Buyer Dashboard...</p>
        </div>
      </div>
    );
  }

  const activeProposalsCount = Array.isArray(proposals) ? proposals.length : 0;

  const navLinks = [
    {
      to: "/dashboard/buyer/orders",
      label: "Orders & Proposals",
      icon: <ClipboardList size={20} />,
      badge: activeProposalsCount > 0 ? activeProposalsCount : null,
    },
    {
      to: "/dashboard/buyer/contracts",
      label: "Contracts & Drafting",
      icon: <FileSignature size={20} />,
    },
    {
      to: "/dashboard/buyer/payments",
      label: "Escrow Payments",
      icon: <ShieldCheck size={20} />,
    },
    {
      to: "/dashboard/buyer/wallet",
      label: "Escrow Wallet & History",
      icon: <Wallet size={20} />,
    },
    {
      to: "/dashboard/buyer/delivery",
      label: "Delivery Tracking",
      icon: <Truck size={20} />,
    },
    {
      to: "/dashboard/buyer/analytics",
      label: "Market Analytics",
      icon: <BarChart3 size={20} />,
    },
  ];

  return (
    <div className="buyer-dashboard-container">
      {/* ================= HEADER BANNER ================= */}
      <div className="text-white pt-28 md:pt-32 pb-8">
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-2 backdrop-blur-md">
                <Briefcase size={13} /> Buyer Procurement Portal
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight buyer-header-title">
                Buyer Dashboard
              </h1>
              <p className="text-emerald-100/90 text-xs sm:text-sm md:text-base mt-1">
                Welcome back, <span className="text-white font-bold">{user.name}</span>. Manage crop procurement, contracts, and Razorpay Escrow.
              </p>
            </div>

            {/* Quick Metrics Badges */}
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center shrink-0">
                <span className="block text-lg sm:text-xl font-black text-emerald-300">
                  {activeProposalsCount}
                </span>
                <span className="text-[10px] sm:text-xs text-emerald-100 font-medium">Proposals</span>
              </div>

              <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center shrink-0">
                <span className="flex items-center justify-center gap-1 text-lg sm:text-xl font-black text-amber-300">
                  100% <ShieldCheck size={16} className="text-amber-400" />
                </span>
                <span className="text-[10px] sm:text-xs text-emerald-100 font-medium">Escrow Protected</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MAIN DASHBOARD CARD ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2">
        <div className="buyer-dashboard-card buyer-dashboard-content-wrapper flex">
          {/* 🧭 RESPONSIVE SIDEBAR / TAB NAVIGATION */}
          <aside className="buyer-sidebar">
            <nav className="buyer-nav-list custom-scrollbar">
              {navLinks.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `buyer-nav-item ${isActive ? "buyer-nav-item-active" : ""}`
                  }
                >
                  <span className="shrink-0">{item.icon}</span>
                  <span className="grow">{item.label}</span>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-600 text-white shrink-0">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>
          </aside>

          {/* 📄 OUTLET CONTENT VIEW */}
          <main className="buyer-main-content">
            <Outlet context={{ proposals, user }} />
          </main>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
