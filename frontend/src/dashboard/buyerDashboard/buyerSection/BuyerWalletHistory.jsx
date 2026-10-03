import React, { useEffect, useState, useMemo } from "react";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Lock,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Search,
  Filter,
  Download,
  Receipt,
  Building2,
  CreditCard,
  Smartphone,
  ExternalLink,
  ChevronRight,
  Package,
  Calendar,
  Sparkles,
  AlertCircle,
  Loader2,
  RefreshCw,
  PlusCircle,
  X,
  Printer
} from "lucide-react";
import api from "../../../services/api";
import { useOutletContext, useNavigate } from "react-router-dom";

export default function BuyerWalletHistory() {
  const { user } = useOutletContext();
  const navigate = useNavigate();

  const [walletStats, setWalletStats] = useState({
    balance: 1000000,
    lockedInEscrow: 0,
    totalPaid: 0,
  });
  const [escrows, setEscrows] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'completed' | 'locked'
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all"); // 'all' | 'debit' | 'credit'

  // Modal states
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState(50000);
  const [isTopUpProcessing, setIsTopUpProcessing] = useState(false);

  /* ---------------- FETCH DATA ---------------- */
  const fetchData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const [dashRes, escrowsRes] = await Promise.all([
        api.getBuyerEscrowDashboard(user.id).catch(() => ({ data: null })),
        api.getBuyerEscrows(user.id).catch(() => ({ data: [] })),
      ]);

      if (dashRes?.data?.wallet) {
        setWalletStats(dashRes.data.wallet);
      }

      const fetchedEscrows = escrowsRes.data || [];
      setEscrows(fetchedEscrows);

      // Extract or build transactions list
      let txns = dashRes?.data?.transactions || [];
      if (txns.length === 0 && fetchedEscrows.length > 0) {
        // Fallback: derive transactions from escrows if ledger was empty
        txns = fetchedEscrows.map((e) => ({
          _id: e._id,
          description: `Escrow Deposit - ${e.crop || "Crop"} Contract (CTR-...${String(e.contractId?._id || e.contractId || "").slice(-4).toUpperCase()})`,
          amount: e.amount,
          type: "debit",
          status: e.status === "released" ? "Success" : "Locked",
          createdAt: e.depositedAt || new Date(),
          escrowId: e,
        }));
      }
      setTransactions(txns);
    } catch (err) {
      console.error("❌ Failed to fetch wallet history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  /* ---------------- COMPUTED METRICS ---------------- */
  const releasedEscrows = useMemo(
    () => escrows.filter((e) => e.status === "released"),
    [escrows]
  );

  const lockedEscrows = useMemo(
    () => escrows.filter((e) => e.status === "locked"),
    [escrows]
  );

  const totalReleasedAmount = useMemo(
    () => releasedEscrows.reduce((sum, e) => sum + (Number(e.amount) || 0), 0),
    [releasedEscrows]
  );

  const totalLockedAmount = useMemo(
    () => lockedEscrows.reduce((sum, e) => sum + (Number(e.amount) || 0), 0),
    [lockedEscrows]
  );

  /* ---------------- FILTERING ---------------- */
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Tab filter
      if (activeTab === "completed" && t.status !== "Success") return false;
      if (activeTab === "locked" && t.status !== "Locked") return false;

      // Type filter
      if (filterType === "debit" && t.type !== "debit") return false;
      if (filterType === "credit" && t.type !== "credit") return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const descMatch = (t.description || "").toLowerCase().includes(query);
        const idMatch = (t._id || "").toLowerCase().includes(query);
        const amountMatch = String(t.amount || "").includes(query);
        return descMatch || idMatch || amountMatch;
      }

      return true;
    });
  }, [transactions, activeTab, filterType, searchQuery]);

  /* ---------------- TOP UP SIMULATION ---------------- */
  const handleSimulateTopUp = () => {
    setIsTopUpProcessing(true);
    setTimeout(() => {
      setWalletStats((prev) => ({
        ...prev,
        balance: prev.balance + Number(topUpAmount),
      }));

      // Add credit transaction
      const newCreditTxn = {
        _id: `TXN-CR-${Date.now().toString().slice(-6)}`,
        description: `Wallet Top-up via Razorpay Test Gateway`,
        amount: Number(topUpAmount),
        type: "credit",
        status: "Success",
        createdAt: new Date(),
      };
      setTransactions((prev) => [newCreditTxn, ...prev]);

      setIsTopUpProcessing(false);
      setShowTopUpModal(false);
    }, 800);
  };

  /* ---------------- EXPORT CSV ---------------- */
  const handleExportStatement = () => {
    if (transactions.length === 0) {
      alert("No transaction records to export.");
      return;
    }

    const headers = ["Transaction ID", "Date", "Description", "Type", "Amount (INR)", "Status"];
    const rows = transactions.map((t) => [
      t._id || t.id,
      new Date(t.createdAt).toLocaleDateString("en-IN"),
      `"${t.description?.replace(/"/g, '""') || "Escrow Operation"}"`,
      t.type?.toUpperCase() || "DEBIT",
      t.amount || 0,
      t.status || "Completed",
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `AgriAssure_Buyer_Statement_${user?.name || "Buyer"}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-96 flex flex-col items-center justify-center gap-3 p-8 text-slate-600">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
        <p className="font-semibold text-sm">Loading Escrow Wallet & Settlement Ledger...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 font-sans animate-fade-in">
      {/* ================= TOP HEADER RIBBON ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-1.5">
            <ShieldCheck size={14} className="text-emerald-600" /> Razorpay Nodal Escrow Account
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Escrow Wallet & Completed Payments
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Real-time audit ledger of all funded escrows, completed crop settlements, and transaction receipts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowTopUpModal(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <PlusCircle size={16} />
            <span>Add Trade Funds</span>
          </button>

          <button
            onClick={handleExportStatement}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm border border-slate-200 flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
          >
            <Download size={15} />
            <span className="hidden sm:inline">Statement</span>
          </button>

          <button
            onClick={fetchData}
            title="Refresh Ledger"
            className="p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 shadow-2xs transition cursor-pointer"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* ================= 📊 WALLET METRIC CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Available Trade Balance */}
        <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xs relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none"></div>
          <p className="text-xs font-medium text-slate-400 flex items-center gap-1.5 mb-1">
            <Wallet size={15} className="text-emerald-400" /> Buyer Trade Balance
          </p>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
            ₹{walletStats.balance.toLocaleString()}
          </h2>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800 pt-2">
            <span>Ready for Contracts</span>
            <span className="text-emerald-400 font-semibold">Active</span>
          </div>
        </div>

        {/* Card 2: Completed / Released Payments */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1">
            <CheckCircle2 size={15} className="text-emerald-600" /> Completed Payments
          </p>
          <h2 className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight mt-1">
            ₹{totalReleasedAmount.toLocaleString()}
          </h2>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
            <span>{releasedEscrows.length} Settled with Farmers</span>
            <span className="font-bold text-emerald-700">Released</span>
          </div>
        </div>

        {/* Card 3: Locked in Escrow */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1">
            <Lock size={15} className="text-amber-500" /> Locked in Escrow
          </p>
          <h2 className="text-2xl sm:text-3xl font-black text-amber-700 tracking-tight mt-1">
            ₹{totalLockedAmount.toLocaleString()}
          </h2>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
            <span>{lockedEscrows.length} Active Orders</span>
            <span className="font-bold text-amber-600">Holding</span>
          </div>
        </div>

        {/* Card 4: Protection Guarantee */}
        <div className="bg-emerald-50/70 p-5 rounded-2xl border border-emerald-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-xs mb-1">
              <ShieldCheck size={16} className="text-emerald-600" /> 100% Escrow Security
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed mt-1">
              Protected by Razorpay Nodal Escrow. Funds are released strictly upon buyer delivery verification.
            </p>
          </div>
          <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mt-2">
            RBI Regulated
          </div>
        </div>
      </div>

      {/* ================= 📑 COMPLETED ESCROWS HIGHLIGHT REEL ================= */}
      {releasedEscrows.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
                <Receipt size={18} />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900">
                  Recently Settled & Released Payments
                </h3>
                <p className="text-xs text-slate-400">
                  Payments completed after delivery and quality verification sign-off
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              {releasedEscrows.length} Completed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {releasedEscrows.map((escrow) => {
              const contractIdStr = escrow.contractId?._id || escrow.contractId || "";
              const last4 = contractIdStr ? String(contractIdStr).slice(-4).toUpperCase() : "0000";

              return (
                <div
                  key={escrow._id}
                  onClick={() => setSelectedReceipt(escrow)}
                  className="p-4 rounded-xl bg-slate-50 hover:bg-emerald-50/40 border border-slate-200/80 hover:border-emerald-200 transition-all cursor-pointer group space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-[10px] font-bold bg-white text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                        CTR-...{last4}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 mt-1 group-hover:text-emerald-700 transition-colors">
                        {escrow.crop || escrow.contractId?.commodity || "Crop Harvest"}
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 shrink-0 flex items-center gap-1">
                      <CheckCircle2 size={11} /> Released
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between pt-1 border-t border-slate-200/60 text-xs">
                    <span className="text-slate-500">Farmer: <b>{escrow.farmerName}</b></span>
                    <span className="font-extrabold text-slate-900 text-sm">
                      ₹{Number(escrow.amount || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>{escrow.releasedAt ? new Date(escrow.releasedAt).toLocaleDateString("en-IN") : "Completed"}</span>
                    <span className="text-emerald-600 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      View Receipt <ChevronRight size={12} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= 🔍 LEDGER FILTER & TABS ================= */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Top Control Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold shrink-0">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3.5 py-2 rounded-lg transition cursor-pointer ${
                activeTab === "all"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Transactions ({transactions.length})
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`px-3.5 py-2 rounded-lg transition cursor-pointer ${
                activeTab === "completed"
                  ? "bg-white text-emerald-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Completed ({releasedEscrows.length})
            </button>
            <button
              onClick={() => setActiveTab("locked")}
              className={`px-3.5 py-2 rounded-lg transition cursor-pointer ${
                activeTab === "locked"
                  ? "bg-white text-amber-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Locked ({lockedEscrows.length})
            </button>
          </div>

          {/* Search & Type Filter */}
          <div className="flex items-center gap-2.5 grow sm:justify-end">
            <div className="relative grow sm:max-w-xs">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by crop, ID, or amount..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-600 bg-slate-50 focus:bg-white transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 text-slate-700 focus:outline-none focus:border-emerald-600 cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="debit">Debits (-)</option>
              <option value="credit">Credits (+)</option>
            </select>
          </div>
        </div>

        {/* ================= 📋 TRANSACTIONS LEDGER LIST ================= */}
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
              <Receipt size={24} />
            </div>
            <h4 className="font-bold text-slate-800 text-sm">No transactions match your criteria</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Transactions will appear here once you deposit escrow payments or top-up your trade wallet.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTransactions.map((txn) => {
              const isCredit = txn.type === "credit";
              const dateStr = txn.createdAt
                ? new Date(txn.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Recent";

              const txnId = txn._id ? `TXN-...${String(txn._id).slice(-6).toUpperCase()}` : txn.id || "TXN-000";

              return (
                <div
                  key={txn._id || txn.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 hover:bg-slate-50/80 transition-colors"
                >
                  {/* Left: Type Icon & Info */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isCredit
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {isCredit ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {txn.description || "Escrow Operation"}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                        <span>{dateStr}</span>
                        <span>•</span>
                        <span className="font-mono text-slate-500">{txnId}</span>
                        {txn.escrowId?.paymentId && (
                          <>
                            <span>•</span>
                            <span className="font-mono text-slate-500">
                              Payment: {txn.escrowId.paymentId}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount & Status Badge */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                    <div className="text-left sm:text-right">
                      <p
                        className={`text-sm sm:text-base font-extrabold ${
                          isCredit ? "text-emerald-600" : "text-slate-900"
                        }`}
                      >
                        {isCredit ? "+" : "-"} ₹{Number(txn.amount || 0).toLocaleString()}
                      </p>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                          txn.status === "Locked"
                            ? "bg-amber-100 text-amber-800"
                            : txn.status === "Success"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {txn.status || "Completed"}
                      </span>
                    </div>

                    {txn.escrowId && (
                      <button
                        onClick={() => setSelectedReceipt(txn.escrowId)}
                        title="View Official Receipt"
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 font-semibold text-xs border border-slate-200 transition cursor-pointer flex items-center gap-1 shrink-0"
                      >
                        <Receipt size={13} />
                        <span className="hidden sm:inline">Receipt</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ================= 🧾 DIGITAL RECEIPT MODAL ================= */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4 animate-fade-in font-sans">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden text-slate-800 relative">
            {/* Header */}
            <div className="bg-slate-900 text-white p-5 relative">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-white font-bold text-[10px] tracking-wider uppercase">
                  VERIFIED AUDIT
                </span>
                <span className="text-xs text-slate-300 flex items-center gap-1 font-medium">
                  <ShieldCheck size={13} className="text-emerald-400" /> AgriAssure Nodal Escrow
                </span>
              </div>

              <h3 className="text-lg font-bold text-white">Digital Escrow Settlement Receipt</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Receipt Ref: REC-{String(selectedReceipt._id || "").slice(-8).toUpperCase()}
              </p>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 text-xs sm:text-sm">
              <div className="flex items-center justify-between p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900">
                <div>
                  <span className="text-xs text-emerald-700 block font-semibold">Total Settled Amount</span>
                  <span className="text-2xl font-black text-emerald-800">
                    ₹{Number(selectedReceipt.amount || 0).toLocaleString()}
                  </span>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  selectedReceipt.status === "released"
                    ? "bg-emerald-200 text-emerald-900"
                    : "bg-amber-200 text-amber-900"
                }`}>
                  {selectedReceipt.status === "released" ? "Paid to Farmer" : "Locked in Escrow"}
                </span>
              </div>

              <div className="space-y-2.5 divide-y divide-slate-100">
                <div className="flex justify-between pt-2">
                  <span className="text-slate-500">Commodity Crop:</span>
                  <span className="font-bold text-slate-800">
                    {selectedReceipt.crop || selectedReceipt.contractId?.commodity || "Crop Harvest"}
                  </span>
                </div>

                <div className="flex justify-between pt-2">
                  <span className="text-slate-500">Contract Ref:</span>
                  <span className="font-mono font-bold text-slate-800">
                    CTR-...{String(selectedReceipt.contractId?._id || selectedReceipt.contractId || "").slice(-4).toUpperCase()}
                  </span>
                </div>

                <div className="flex justify-between pt-2">
                  <span className="text-slate-500">Farmer (Beneficiary):</span>
                  <span className="font-bold text-slate-800">{selectedReceipt.farmerName || "Verified Producer"}</span>
                </div>

                <div className="flex justify-between pt-2">
                  <span className="text-slate-500">Buyer (Depositor):</span>
                  <span className="font-bold text-slate-800">{user?.name || selectedReceipt.buyerName}</span>
                </div>

                {selectedReceipt.paymentId && (
                  <div className="flex justify-between pt-2">
                    <span className="text-slate-500">Razorpay Payment ID:</span>
                    <span className="font-mono text-xs font-semibold text-slate-700">{selectedReceipt.paymentId}</span>
                  </div>
                )}

                <div className="flex justify-between pt-2">
                  <span className="text-slate-500">Release Protocol:</span>
                  <span className="font-medium text-slate-700">
                    {selectedReceipt.releaseCondition || "Buyer Delivery Confirmation"}
                  </span>
                </div>

                {selectedReceipt.depositedAt && (
                  <div className="flex justify-between pt-2">
                    <span className="text-slate-500">Deposit Timestamp:</span>
                    <span className="text-slate-700">{new Date(selectedReceipt.depositedAt).toLocaleString("en-IN")}</span>
                  </div>
                )}
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                <span>Legally binding settlement document generated by AgriAssure Smart Contracts.</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 flex items-center gap-1.5 transition cursor-pointer"
              >
                <Printer size={14} /> Print Receipt
              </button>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= 💳 TOP UP WALLET MODAL ================= */}
      {showTopUpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4 animate-fade-in font-sans">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden text-slate-800 relative">
            <div className="bg-emerald-700 text-white p-5 relative">
              <button
                onClick={() => setShowTopUpModal(false)}
                disabled={isTopUpProcessing}
                className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X size={18} />
              </button>
              <div className="flex items-center gap-1.5 text-xs text-emerald-200 font-semibold mb-1">
                <PlusCircle size={14} /> Trade Account Refill
              </div>
              <h3 className="text-xl font-extrabold text-white">Add Funds to Escrow Wallet</h3>
              <p className="text-xs text-emerald-100 mt-0.5">
                Top up your procurement trading balance for instant contract commitments.
              </p>
            </div>

            <div className="p-5 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select Top-Up Amount (INR)
                </label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[25000, 50000, 100000].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setTopUpAmount(amt)}
                      type="button"
                      className={`py-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                        topUpAmount === amt
                          ? "bg-emerald-50 border-emerald-600 text-emerald-700 shadow-2xs"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      ₹{amt.toLocaleString()}
                    </button>
                  ))}
                </div>

                <input
                  type="number"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(Number(e.target.value))}
                  placeholder="Enter custom amount"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-800 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                <p className="font-semibold text-slate-700">Supported Test Gateways:</p>
                <div className="flex items-center gap-3 text-slate-500">
                  <span className="flex items-center gap-1"><Smartphone size={13} /> UPI</span>
                  <span className="flex items-center gap-1"><CreditCard size={13} /> Corporate Card</span>
                  <span className="flex items-center gap-1"><Building2 size={13} /> NEFT / RTGS</span>
                </div>
              </div>

              <button
                onClick={handleSimulateTopUp}
                disabled={isTopUpProcessing || topUpAmount <= 0}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-emerald-600/25 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                {isTopUpProcessing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Processing Gateway Deposit...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle size={18} />
                    <span>Confirm Deposit of ₹{Number(topUpAmount || 0).toLocaleString()}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
