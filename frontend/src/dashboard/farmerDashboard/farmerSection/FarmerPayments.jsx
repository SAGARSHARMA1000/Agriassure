import React, { useEffect, useState, useMemo } from "react";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle2,
  Landmark,
  AlertCircle,
  TrendingUp,
  ChevronRight,
  ShieldCheck,
  Download,
  Building2,
  Smartphone,
  CreditCard,
  X,
  Loader2,
  Info,
  Sparkles,
  RefreshCw,
  FileText,
  User,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../../services/api";
import { useOutletContext, useNavigate } from "react-router-dom";

/* ---------------- STAT CARD COMPONENT ---------------- */
const StatCard = ({
  label,
  value,
  subtext,
  icon: Icon,
  colorClass,
  bgClass,
  borderClass,
}) => (
  <div
    className={`bg-white p-5 sm:p-6 rounded-3xl shadow-xs border ${borderClass} relative overflow-hidden flex flex-col justify-between`}
  >
    <div className="flex justify-between items-start mb-3">
      <div>
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
          {label}
        </p>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
          ₹{Number(value || 0).toLocaleString("en-IN")}
        </h3>
      </div>
      <div
        className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${bgClass} ${colorClass}`}
      >
        <Icon size={22} />
      </div>
    </div>
    {subtext && (
      <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 pt-2 border-t border-slate-100">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
        <span>{subtext}</span>
      </div>
    )}
  </div>
);

/* ---------------- RAZORPAYX PAYOUT MODAL ---------------- */
const RazorpayxPayoutModal = ({
  isOpen,
  onClose,
  availableBalance,
  farmerId,
  farmerName,
  onPayoutSuccess,
}) => {
  const [payoutMode, setPayoutMode] = useState("IMPS"); // IMPS, UPI, NEFT
  const [amount, setAmount] = useState(
    availableBalance > 0 ? String(availableBalance) : "25000"
  );
  const [accountHolder, setAccountHolder] = useState(
    farmerName || "Sagar Sharma (Demo Farmer)"
  );
  const [accountNumber, setAccountNumber] = useState("918237489281");
  const [confirmAccount, setConfirmAccount] = useState("918237489281");
  const [ifsc, setIfsc] = useState("SBIN0001824");
  const [upiId, setUpiId] = useState("farmer@okhdfcbank");
  const [bankName, setBankName] = useState(
    "State Bank of India (Sehore Mandi Branch)"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (farmerName && !accountHolder) {
      setAccountHolder(farmerName);
    }
  }, [farmerName]);

  // Autofill mock test bank data
  const handleAutofillMock = () => {
    if (payoutMode === "UPI") {
      setUpiId("farmer@okhdfcbank");
    } else {
      setAccountHolder(farmerName || "Sagar Sharma (Demo Farmer)");
      setAccountNumber("918237489281");
      setConfirmAccount("918237489281");
      setIfsc("SBIN0001824");
      setBankName("State Bank of India (Sehore Mandi Branch)");
    }
    if (availableBalance > 0) {
      setAmount(String(availableBalance));
    } else {
      setAmount("25000");
    }
    setError("");
  };

  // Auto-detect bank from IFSC prefix
  const handleIfscChange = (val) => {
    const upper = val.toUpperCase().trim();
    setIfsc(upper);
    if (upper.startsWith("SBIN"))
      setBankName("State Bank of India (Mandi Branch)");
    else if (upper.startsWith("HDFC")) setBankName("HDFC Bank Ltd");
    else if (upper.startsWith("ICIC")) setBankName("ICICI Bank Ltd");
    else if (upper.startsWith("PUNB")) setBankName("Punjab National Bank");
    else if (upper.startsWith("BARB")) setBankName("Bank of Baroda");
    else if (upper.startsWith("UTIB")) setBankName("Axis Bank Ltd");
    else if (upper.length >= 4) setBankName("Commercial Bank");
  };

  const handleQuickAmount = (percentage) => {
    const calc = Math.floor((availableBalance * percentage) / 100);
    setAmount(calc > 0 ? String(calc) : "0");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setError("Please enter a valid payout amount.");
      return;
    }

    if (numAmount > availableBalance && availableBalance > 0) {
      setError(
        `Amount cannot exceed your available balance of ₹${availableBalance.toLocaleString()}`
      );
      return;
    }

    if (payoutMode === "UPI") {
      if (!upiId || !upiId.includes("@")) {
        setError("Please enter a valid UPI VPA ID (e.g. farmer@upi)");
        return;
      }
    } else {
      if (!accountHolder.trim()) {
        setError("Account holder name is required.");
        return;
      }
      if (!accountNumber || accountNumber.length < 8) {
        setError("Please enter a valid bank account number.");
        return;
      }
      if (accountNumber !== confirmAccount) {
        setError("Account numbers do not match.");
        return;
      }
      if (!ifsc || ifsc.length < 8) {
        setError("Please enter a valid 11-character IFSC code.");
        return;
      }
    }

    setLoading(true);

    try {
      const res = await api.requestFarmerPayout({
        farmerId,
        amount: numAmount,
        mode: payoutMode,
        accountNumber,
        ifsc,
        accountHolderName: accountHolder,
        upiId,
        bankName,
      });

      onPayoutSuccess(res.data.payout || res.data);
      onClose();
    } catch (err) {
      console.error("Payout error:", err);
      setError(
        err.response?.data?.message || "Payout processing failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden text-slate-800 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* RazorpayX Header */}
        <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-400 flex items-center justify-center">
              <Landmark size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg">
                  Instant Farmer Payout
                </h3>
                <span className="text-[10px] font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  RazorpayX
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Direct Settlement into your verified Bank or UPI
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Balance Status Banner */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200/80 flex items-center justify-between text-xs shrink-0">
          <span className="text-slate-500 font-medium">
            Available Wallet Balance:
          </span>
          <span className="font-extrabold text-slate-900 text-sm">
            ₹{Number(availableBalance || 0).toLocaleString("en-IN")}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Quick Mock Fill Test Helper */}
          <div className="p-2.5 rounded-2xl bg-indigo-50/80 border border-indigo-200/90 text-indigo-900 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-indigo-600 shrink-0" />
              <span className="font-semibold text-[11px]">Testing Mode Active (Pre-filled test bank details)</span>
            </div>
            <button
              type="button"
              onClick={handleAutofillMock}
              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] shadow-2xs transition cursor-pointer"
            >
              Reset Test Info
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Mode Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Payout Transfer Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "IMPS", label: "IMPS (Instant)", desc: "24x7 Direct Bank" },
                { id: "UPI", label: "UPI (VPA)", desc: "GPay/PhonePe" },
                { id: "NEFT", label: "NEFT / RTGS", desc: "Standard Clearing" },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPayoutMode(m.id)}
                  className={`p-2.5 rounded-2xl border text-left transition cursor-pointer ${
                    payoutMode === m.id
                      ? "bg-emerald-50/80 border-emerald-500 text-emerald-900 shadow-xs"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <p className="font-bold text-xs">{m.label}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{m.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Amount Field */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Withdrawal Amount (₹) *
              </label>
              <div className="flex items-center gap-1.5">
                {[25, 50, 100].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handleQuickAmount(pct)}
                    className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                  >
                    {pct === 100 ? "MAX (100%)" : `${pct}%`}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                ₹
              </span>
              <input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Dynamic Form according to payout mode */}
          {payoutMode === "UPI" ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                UPI ID (VPA) *
              </label>
              <div className="relative">
                <Smartphone
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="e.g. mobileNumber@upi or farmer@okhdfcbank"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Supports Google Pay, PhonePe, Paytm, BHIM UPI.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Beneficiary Account Holder Name *
                </label>
                <input
                  type="text"
                  placeholder="Full name as in Bank Passbook"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Bank Account Number *
                  </label>
                  <input
                    type="password"
                    placeholder="Account Number"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Confirm Account Number *
                  </label>
                  <input
                    type="text"
                    placeholder="Re-enter Account Number"
                    value={confirmAccount}
                    onChange={(e) => setConfirmAccount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    IFSC Code *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SBIN0001234"
                    maxLength={11}
                    value={ifsc}
                    onChange={(e) => handleIfscChange(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 uppercase focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Bank Branch
                  </label>
                  <div className="px-3 py-2 bg-slate-100/80 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 truncate">
                    {bankName}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Fee and Settlement Breakdown */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs space-y-1.5 text-slate-600">
            <div className="flex justify-between">
              <span>Transfer Mode:</span>
              <span className="font-bold text-slate-800">
                RazorpayX Instant {payoutMode}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Transfer Processing Fee:</span>
              <span className="font-bold text-emerald-600">₹0.00 (Free Benefit)</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-slate-900">
              <span>Net Settled into Bank:</span>
              <span className="text-emerald-700">
                ₹{amount ? Number(amount).toLocaleString("en-IN") : "0"}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Processing RazorpayX Payout...</span>
              </>
            ) : (
              <>
                <Landmark size={16} />
                <span>
                  Withdraw ₹{amount ? Number(amount).toLocaleString("en-IN") : "0"}{" "}
                  Now
                </span>
              </>
            )}
          </button>

          <p className="text-[10px] text-center text-slate-400">
            🔒 Secured by RazorpayX RBI-compliant direct banking payouts protocol.
          </p>
        </form>
      </div>
    </div>
  );
};

/* ---------------- MAIN COMPONENT ---------------- */
export default function FarmerPayments() {
  const { user } = useOutletContext();
  const navigate = useNavigate();

  const farmerId = user?.id || user?._id || "f1";
  const farmerName = user?.name || user?.fullName || "Demo Farmer";

  const [walletStats, setWalletStats] = useState({
    availableBalance: 0,
    lockedInEscrow: 0,
    totalEarnings: 0,
    totalWithdrawn: 0,
  });

  const [escrows, setEscrows] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPayoutOpen, setIsPayoutOpen] = useState(false);
  const [successToast, setSuccessToast] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.getFarmerEscrowDashboard(farmerId);

      if (res.data?.wallet) {
        setWalletStats(res.data.wallet);
      }
      if (Array.isArray(res.data?.escrows)) {
        setEscrows(res.data.escrows);
      }
      if (Array.isArray(res.data?.transactions)) {
        setTransactions(res.data.transactions);
      }
    } catch (err) {
      console.error("❌ Failed to load farmer escrow dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [farmerId]);

  const handlePayoutSuccess = (payoutData) => {
    setSuccessToast({
      title: "Payout Dispatched Successfully! 🎉",
      message: `₹${Number(payoutData.amount || 0).toLocaleString()} credited via RazorpayX (${payoutData.mode || "IMPS"}).`,
      utr: payoutData.utr || `RZPX${Date.now().toString().slice(-8)}`,
      beneficiary: payoutData.beneficiary,
    });

    fetchDashboard();

    setTimeout(() => {
      setSuccessToast(null);
    }, 7000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="p-4 rounded-2xl bg-emerald-900 text-white shadow-xl border border-emerald-700 flex items-start justify-between gap-3"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-400/30">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-emerald-300">
                  {successToast.title}
                </h4>
                <p className="text-xs text-slate-200 mt-0.5">
                  {successToast.message}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-300 font-mono mt-1.5 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800/60">
                  <span>UTR: <b>{successToast.utr}</b></span>
                  <span>•</span>
                  <span>Destination: {successToast.beneficiary}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSuccessToast(null)}
              className="text-slate-400 hover:text-white transition p-1"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Wallet className="text-emerald-600" size={24} /> Farm Escrow Wallet & Payouts
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            100% Guaranteed buyer payment protection & Instant RazorpayX Bank Settlements.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchDashboard}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
            title="Refresh Wallet"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>

          <button
            onClick={() => setIsPayoutOpen(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-xs flex items-center gap-2 transition cursor-pointer"
          >
            <Landmark size={16} /> Withdraw to Bank / UPI
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        <StatCard
          label="Available for Withdrawal"
          value={walletStats.availableBalance}
          subtext="Ready for instant 24x7 payout"
          icon={CheckCircle2}
          colorClass="text-emerald-600"
          bgClass="bg-emerald-50"
          borderClass="border-emerald-200/90"
        />

        <StatCard
          label="Locked in Buyer Escrow"
          value={walletStats.lockedInEscrow}
          subtext="Protected funds releasing on delivery"
          icon={Clock}
          colorClass="text-amber-600"
          bgClass="bg-amber-50"
          borderClass="border-amber-200/90"
        />

        <StatCard
          label="Total Lifetime Earnings"
          value={walletStats.totalEarnings}
          subtext={`₹${Number(walletStats.totalWithdrawn || 0).toLocaleString()} transferred to bank`}
          icon={TrendingUp}
          colorClass="text-indigo-600"
          bgClass="bg-indigo-50"
          borderClass="border-indigo-200/90"
        />
      </div>

      {/* Security Nodal Escrow Guarantee Ribbon */}
      <div className="bg-linear-to-r from-emerald-50 via-teal-50 to-emerald-50 p-4 sm:p-5 rounded-2xl border border-emerald-200 text-xs text-emerald-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-emerald-950">
              RBI-Regulated Razorpay Nodal Escrow Protection
            </h4>
            <p className="text-emerald-800 text-xs mt-0.5">
              Buyers pre-fund 100% of the harvest price before crop transport begins. Funds are locked securely and credited to your wallet immediately upon confirmed delivery.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsPayoutOpen(true)}
          className="px-3.5 py-2 rounded-xl bg-white text-emerald-800 hover:bg-emerald-100 font-bold border border-emerald-300 shrink-0 text-xs transition cursor-pointer shadow-2xs"
        >
          Request Payout
        </button>
      </div>

      {/* Main Grid: Escrow Contracts on Left, Transaction Ledger on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Escrow Protected Orders */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-600" /> Live Escrow Contracts
            </h3>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
              {escrows.length} Total Contracts
            </span>
          </div>

          {escrows.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-500 text-xs space-y-2">
              <ShieldCheck size={36} className="mx-auto text-slate-300" />
              <p className="font-bold text-slate-700 text-sm">No Escrow Contracts Yet</p>
              <p className="text-slate-400 max-w-sm mx-auto">
                When buyers make offers on your crop harvest and fund the escrow agreement, your protected funds will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {escrows.map((e) => {
                const contract = e.contractId || {};
                const isLocked = e.status === "locked" || e.status === "Locked";
                const isReleased = e.status === "released" || e.status === "Released";

                return (
                  <div
                    key={e._id}
                    className="bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 p-4 sm:p-5 transition shadow-2xs space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm sm:text-base font-bold text-slate-900">
                            {e.crop || contract.commodity || "Crop Harvest"}
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isLocked
                                ? "bg-amber-100 text-amber-800 border border-amber-200"
                                : isReleased
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {isLocked
                              ? "Locked in Escrow"
                              : isReleased
                              ? "Settled & Released"
                              : e.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                          <User size={13} className="text-emerald-600" />
                          Buyer: <b>{e.buyerName || contract.buyerName || "Verified Buyer"}</b>
                        </p>
                      </div>

                      <div className="text-left sm:text-right">
                        <div className="text-lg font-black text-slate-900">
                          ₹{Number(e.amount || 0).toLocaleString("en-IN")}
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Qty: {e.quantity || contract.quantity || "Agreed Qty"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100 text-slate-600">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">
                          Release Trigger
                        </span>
                        <span className="font-semibold text-slate-800">
                          {e.releaseCondition || "Buyer Delivery Confirmation"}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">
                          Payment Reference
                        </span>
                        <span className="font-mono font-medium text-slate-700 truncate block">
                          {e.paymentId || "Escrow Pre-Funded"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 Col: Live Transaction History */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText size={18} className="text-emerald-600" /> Transaction Ledger
            </h3>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
            {transactions.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                <Clock size={28} className="mx-auto text-slate-300 mb-2" />
                No transactions recorded yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto pr-1">
                {transactions.map((txn, idx) => {
                  const isCredit = txn.type === "credit";
                  const dateStr = txn.createdAt
                    ? new Date(txn.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "Recent";

                  return (
                    <div key={txn._id || idx} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                              isCredit
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                : "bg-indigo-50 text-indigo-600 border border-indigo-100"
                            }`}
                          >
                            {isCredit ? (
                              <ArrowDownLeft size={15} />
                            ) : (
                              <ArrowUpRight size={15} />
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800 truncate max-w-[140px] sm:max-w-[180px]">
                              {txn.description || (isCredit ? "Escrow Settlement" : "RazorpayX Payout")}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {dateStr}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p
                            className={`text-xs font-extrabold ${
                              isCredit ? "text-emerald-600" : "text-slate-900"
                            }`}
                          >
                            {isCredit ? "+" : "-"} ₹{Number(txn.amount || 0).toLocaleString("en-IN")}
                          </p>
                          <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded-md">
                            {txn.status || "Success"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RazorpayX Payout Modal */}
      <RazorpayxPayoutModal
        isOpen={isPayoutOpen}
        onClose={() => setIsPayoutOpen(false)}
        availableBalance={walletStats.availableBalance}
        farmerId={farmerId}
        farmerName={farmerName}
        onPayoutSuccess={handlePayoutSuccess}
      />
    </div>
  );
}