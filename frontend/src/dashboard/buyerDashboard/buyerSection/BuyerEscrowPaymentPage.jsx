import React, { useEffect, useState, useMemo } from "react";
import {
  ShieldCheck,
  Lock,
  CreditCard,
  Smartphone,
  Landmark,
  ChevronRight,
  CheckCircle,
  History,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  AlertCircle,
  Loader2,
  Calendar,
  MapPin,
  Package,
  FileText,
  User,
  ExternalLink,
  ChevronLeft,
  Sparkles
} from "lucide-react";
import api from "../../../services/api";
import { useOutletContext, useParams, useNavigate } from "react-router-dom";
import { openRazorpayCheckout } from "../../../utils/razorpay";


/* ---------------- RESPONSIVE TRANSACTION ROW ---------------- */
const TransactionRow = ({ txn }) => {
  const isCredit = txn.type === "credit";
  const dateStr = txn.createdAt
    ? new Date(txn.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : txn.date || "Recent";

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 py-3.5 border-b border-slate-100 last:border-0 hover:bg-slate-50 px-2.5 rounded-xl transition-colors">
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-xl shrink-0 ${
            isCredit
              ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
              : "bg-slate-100 text-slate-600 border border-slate-200"
          }`}
        >
          {isCredit ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
        </div>

        <div>
          <p className="text-xs sm:text-sm font-semibold text-slate-800 wrap-break-word">
            {txn.description || txn.desc || "Escrow Operation"}
          </p>
          <p className="text-[11px] text-slate-400">
            {dateStr} • {txn._id ? `TXN-...${txn._id.slice(-6).toUpperCase()}` : txn.id}
          </p>
        </div>
      </div>

      <div className="text-left sm:text-right shrink-0">
        <p
          className={`text-sm font-bold ${
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
    </div>
  );
};

/* ---------------- MAIN COMPONENT ---------------- */
export default function BuyerEscrowPaymentPage() {
  const { user } = useOutletContext();
  const { contractId } = useParams();
  const navigate = useNavigate();

  const [contract, setContract] = useState(null);
  const [escrowRecord, setEscrowRecord] = useState(null);
  const [walletStats, setWalletStats] = useState({
    balance: 1000000,
    lockedInEscrow: 0,
    totalPaid: 0,
  });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [showBalance, setShowBalance] = useState(false);

  const platformFee = 499;

  /* ---------------- FETCH CONTRACT & ESCROW DATA ---------------- */
  const loadEscrowDetails = async () => {
    if (!contractId) return;
    try {
      setLoading(true);

      // Fetch contract by ID
      const contractRes = await api.getContractById(contractId);
      const c = contractRes.data?.contract || contractRes.data;
      setContract(c);

      // Fetch buyer's live escrow dashboard
      if (user?.id) {
        const [dashRes, escrowsRes] = await Promise.all([
          api.getBuyerEscrowDashboard(user.id).catch(() => ({ data: null })),
          api.getBuyerEscrows(user.id).catch(() => ({ data: [] })),
        ]);

        if (dashRes?.data?.wallet) {
          setWalletStats(dashRes.data.wallet);
        }

        if (Array.isArray(dashRes?.data?.transactions) && dashRes.data.transactions.length > 0) {
          setTransactions(dashRes.data.transactions);
        }

        const existingEscrow = (escrowsRes?.data || []).find(
          (e) => e.contractId === contractId || e.contractId?._id === contractId
        );
        if (existingEscrow) {
          setEscrowRecord(existingEscrow);
        }
      }
    } catch (err) {
      console.error("❌ Failed to load escrow payment page:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEscrowDetails();
  }, [contractId, user?.id]);

  /* Total Calculations */
  const cropAmount = useMemo(() => {
    if (!contract) return 0;
    return Number(contract.quantity || 0) * Number(contract.offerPrice || 0);
  }, [contract]);

  const totalPayable = useMemo(() => {
    return cropAmount + platformFee;
  }, [cropAmount]);

  const contractLast4 = useMemo(() => {
    return contractId ? contractId.slice(-4).toUpperCase() : "0000";
  }, [contractId]);

  /* ---------------- HANDLE REAL RAZORPAY TEST MODE PAYMENT ---------------- */
  const handlePaymentSuccess = async (response) => {
    if (!contract) return;
    setPaying(true);

    try {
      const depositRes = await api.depositEscrow({
        contractId: contract._id,
        buyerId: user?.id || contract.buyerId,
        buyerName: user?.name || contract.buyerName || "Verified Buyer",
        farmerId: contract.farmerId,
        farmerName: contract.farmerName,
        crop: contract.commodity,
        quantity: `${contract.quantity} ${contract.unit || "Qtl"}`,
        amount: totalPayable,
        pickupAddress: contract.farmAddress || "Farmer Storage",
        deliveryAddress: contract.deliveryAddress || "Buyer Destination Hub",
        releaseCondition: "Delivery Confirmation",
        paymentId: response.razorpay_payment_id,
        orderId: response.razorpay_order_id,
        signature: response.razorpay_signature,
      });

      setPaymentSuccess(true);
      if (depositRes.data?.escrow) {
        setEscrowRecord(depositRes.data.escrow);
      }
      await loadEscrowDetails();
    } catch (depositErr) {
      console.error("Deposit confirmation error:", depositErr);
      await loadEscrowDetails();
    } finally {
      setPaying(false);
    }
  };

  const handleRazorpayPayment = async () => {
    if (!contract || paying) return;
    setPaying(true);

    await openRazorpayCheckout({
      contract,
      user,
      amount: totalPayable,
      onSuccess: handlePaymentSuccess,
      onFailure: (err) => {
        console.warn("Razorpay payment cancelled or failed:", err);
        setPaying(false);
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-emerald-600" size={32} />
          <p className="font-semibold text-sm">Loading Escrow Vault & Agreement Details...</p>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-xs">
          <AlertCircle size={40} className="mx-auto text-amber-500 mb-3" />
          <h2 className="text-xl font-bold text-slate-800">Contract Not Found</h2>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            We could not retrieve the details for this agreement ID.
          </p>
          <button
            onClick={() => navigate("/dashboard/buyer/payments")}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs"
          >
            Back to Payments
          </button>
        </div>
      </div>
    );
  }

  const isAlreadyLocked = !!escrowRecord && escrowRecord.status === "locked";
  const isReleased = !!escrowRecord && escrowRecord.status === "released";

  return (
    <div className="min-h-screen bg-slate-50 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation Back */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/dashboard/buyer/payments")}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition cursor-pointer"
          >
            <ChevronLeft size={18} /> Back to Payments
          </button>

          <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-md border border-slate-200">
            Agreement ID: CTR-...{contractLast4}
          </span>
        </div>

        {/* ================= 📊 TOP WALLET / SECURITY RIBBON ================= */}
        <header className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xs">
            <p className="text-xs text-slate-400 flex items-center gap-1.5 font-medium mb-1">
              <Wallet size={15} className="text-emerald-400" /> Buyer Trade Balance
            </p>
            <h2 className="text-2xl sm:text-3xl font-black">
              {showBalance ? `₹${walletStats.balance.toLocaleString()}` : "₹10,00,000"}
            </h2>
            <p className="text-[11px] text-slate-400 mt-1">Available for direct trading</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-xs text-amber-700 flex items-center gap-1.5 font-semibold mb-1">
              <Lock size={15} className="text-amber-500" /> Total Locked in Escrow
            </p>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              ₹{walletStats.lockedInEscrow.toLocaleString()}
            </h2>
            <p className="text-[11px] text-slate-400 mt-1">Releases upon delivery confirmation</p>
          </div>

          <div className="bg-emerald-50/80 p-5 rounded-2xl border border-emerald-200/80 shadow-xs">
            <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-sm mb-1">
              <ShieldCheck size={18} className="text-emerald-600" /> Razorpay Escrow Vault
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              100% RBI-regulated nodal escrow account. Funds are never released until crop matches quality criteria.
            </p>
          </div>
        </header>

        {/* ================= 🤝 MAIN CONTENT GRID ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT 2 COLUMNS: Contract & Protection Breakdown */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contract Summary Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
                    <Package size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {contract.commodity} Contract
                    </h3>
                    <p className="text-xs text-slate-500">
                      Farmer: <span className="font-semibold text-slate-800">{contract.farmerName}</span>
                    </p>
                  </div>
                </div>

                <div>
                  {isAlreadyLocked ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <Lock size={13} className="text-emerald-600" />
                      Escrow Funded & Locked
                    </span>
                  ) : isReleased ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                      <CheckCircle size={13} className="text-blue-600" />
                      Paid to Farmer
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      <AlertCircle size={13} className="text-amber-600" />
                      Escrow Deposit Due
                    </span>
                  )}
                </div>
              </div>

              {/* Specifications */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-4 text-xs sm:text-sm border-b border-slate-100">
                <div>
                  <span className="text-slate-400 block text-xs mb-0.5">Quantity Agreed</span>
                  <span className="font-bold text-slate-800">{contract.quantity} {contract.unit || "Qtl"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs mb-0.5">Agreed Price</span>
                  <span className="font-bold text-slate-800">₹{contract.offerPrice} / {contract.unit || "Qtl"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs mb-0.5">Pickup Date</span>
                  <span className="font-bold text-slate-800">{contract.pickupDate || "As per Schedule"}</span>
                </div>
              </div>

              {/* Delivery Addresses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-slate-400 font-semibold mb-1 flex items-center gap-1">
                    <MapPin size={13} className="text-emerald-600" /> Farm / Pickup Address
                  </span>
                  <span className="font-medium text-slate-700">{contract.farmAddress || "Regional Mandi Hub"}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-slate-400 block font-semibold mb-1 items-center gap-1">
                    <MapPin size={13} className="text-blue-600" /> Buyer Delivery Destination
                  </span>
                  <span className="font-medium text-slate-700">{contract.deliveryAddress || "Buyer Central Warehouse"}</span>
                </div>
              </div>
            </div>

            {/* Escrow Protection Workflow Steps */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
              <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-600" /> AgriAssure 4-Step Escrow Protection
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="font-bold text-emerald-800 block mb-1">1. Deposit Escrow</span>
                  Buyer deposits funds securely via Razorpay into nodal account.
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-800 block mb-1">2. Crop Dispatch</span>
                  Farmer prepares harvest and schedules delivery pickup.
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-800 block mb-1">3. Quality Check</span>
                  Buyer receives produce and performs quality specification check.
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-800 block mb-1">4. Release Funds</span>
                  Funds released directly to farmer account upon confirmation.
                </div>
              </div>
            </div>

            {/* Recent Transactions List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
              <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <History size={17} className="text-slate-600" /> Escrow Transaction History
              </h4>

              {transactions.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No previous transactions recorded yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {transactions.slice(0, 5).map((txn) => (
                    <TransactionRow key={txn._id || txn.id} txn={txn} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT 1 COLUMN: Payment Action & Breakdown */}
          <div className="lg:col-span-1 space-y-6">
            {/* Payment Summary Box */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sticky top-24">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold mb-4">
                <Sparkles size={13} /> Razorpay Test Mode
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-4">Payment Breakdown</h3>

              <div className="space-y-3 text-xs sm:text-sm text-slate-600 pb-4 border-b border-slate-100">
                <div className="flex justify-between">
                  <span>Crop Harvest Total ({contract.quantity} {contract.unit || "Qtl"})</span>
                  <span className="font-bold text-slate-800">₹{cropAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>AgriAssure Escrow & Quality Fee</span>
                  <span className="font-bold text-slate-800">₹{platformFee}</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Escrow Guarantee Protection</span>
                  <span className="font-bold">Included</span>
                </div>
              </div>

              <div className="pt-4 mb-6 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-900">Total Payable</span>
                <span className="text-2xl font-black text-emerald-700">
                  ₹{totalPayable.toLocaleString()}
                </span>
              </div>

              {/* Payment Action or Confirmation */}
              {isAlreadyLocked || paymentSuccess ? (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                    <div className="flex items-center gap-2 font-bold mb-1">
                      <CheckCircle size={16} className="text-emerald-600" />
                      Escrow Vault Funded Successfully!
                    </div>
                    {escrowRecord?.paymentId && (
                      <p className="font-mono text-[11px] mt-1">
                        Payment ID: <b>{escrowRecord.paymentId}</b>
                      </p>
                    )}
                    <p className="mt-1 text-slate-600">
                      Funds are held securely. You can now monitor harvest transport in the Delivery section.
                    </p>
                  </div>

                  <button
                    onClick={() => navigate("/dashboard/buyer/delivery")}
                    className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <span>Track Delivery Progress</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-xs space-y-1.5">
                    <p className="font-semibold text-slate-800">Supported Test Methods:</p>
                    <div className="flex items-center gap-3 text-slate-500">
                      <span className="flex items-center gap-1"><Smartphone size={13} /> UPI</span>
                      <span className="flex items-center gap-1"><CreditCard size={13} /> Cards</span>
                      <span className="flex items-center gap-1"><Landmark size={13} /> NetBanking</span>
                    </div>
                  </div>

                  <button
                    onClick={handleRazorpayPayment}
                    disabled={paying}
                    className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-emerald-600/25 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                  >
                    {paying ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Processing Payment...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard size={18} />
                        <span>Pay ₹{totalPayable.toLocaleString()} with Razorpay</span>
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-slate-400 text-center">
                    Razorpay Test Mode Active — Safe sandbox checkout simulation.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}