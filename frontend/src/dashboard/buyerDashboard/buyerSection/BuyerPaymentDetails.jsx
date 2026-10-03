import React, { useEffect, useState, useMemo } from "react";
import {
  ShieldCheck,
  FileText,
  CheckCircle,
  Clock,
  MapPin,
  Package,
  AlertCircle,
  CreditCard,
  Lock,
  ChevronRight,
  ExternalLink,
  Loader2,
  Calendar,
  IndianRupee,
  User,
  Sparkles,
  Wallet,
} from "lucide-react";
import api from "../../../services/api";
import { useOutletContext, useNavigate } from "react-router-dom";
import { openRazorpayCheckout } from "../../../utils/razorpay";


export default function BuyerPaymentDetails() {
  const { user } = useOutletContext();
  const navigate = useNavigate();

  const [contracts, setContracts] = useState([]);
  const [escrows, setEscrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingContractId, setPayingContractId] = useState(null);

  /* ---------------- FETCH CONTRACTS + ESCROWS ---------------- */
  const loadData = async () => {
    try {
      if (!user?.id) return;
      const [contractsRes, escrowRes] = await Promise.all([
        api.getBuyerContracts(user.id),
        api.getBuyerEscrows(user.id),
      ]);

      setContracts(contractsRes.data || []);
      setEscrows(escrowRes.data || []);
    } catch (err) {
      console.error("❌ Failed to load buyer payment data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  /* ---------------- HELPERS ---------------- */
  const getEscrowForContract = (contractId) =>
    escrows.find((e) => e.contractId === contractId || e.contractId?._id === contractId) || null;

  const activeContracts = useMemo(
    () => contracts.filter((c) => c.status === "active"),
    [contracts]
  );

  const totalPendingAmount = useMemo(() => {
    return activeContracts
      .filter((c) => !getEscrowForContract(c._id))
      .reduce((sum, c) => sum + (Number(c.quantity) * Number(c.offerPrice) || 0), 0);
  }, [activeContracts, escrows]);

  const totalLockedAmount = useMemo(() => {
    return escrows
      .filter((e) => e.status === "locked")
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [escrows]);

  /* ---------------- REAL RAZORPAY TEST MODE PAYMENT ---------------- */
  const handlePaymentSuccess = async (contract, response) => {
    const payableAmount = Number(contract.quantity) * Number(contract.offerPrice);
    setPayingContractId(contract._id);

    try {
      await api.depositEscrow({
        contractId: contract._id,
        buyerId: user?.id || contract.buyerId,
        buyerName: user?.name || contract.buyerName || "Verified Buyer",
        farmerId: contract.farmerId,
        farmerName: contract.farmerName,
        crop: contract.commodity,
        quantity: `${contract.quantity} ${contract.unit || "Qtl"}`,
        amount: payableAmount,
        pickupAddress: contract.farmAddress || "Farm Mandi",
        deliveryAddress: contract.deliveryAddress || "Buyer Delivery Hub",
        releaseCondition: "Delivery Confirmation",
        paymentId: response.razorpay_payment_id,
        orderId: response.razorpay_order_id,
        signature: response.razorpay_signature,
      });

      alert(`🎉 Payment of ₹${payableAmount.toLocaleString()} successfully deposited into Escrow Vault!`);
      await loadData();
    } catch (err) {
      console.error("Deposit confirmation error:", err);
      await loadData();
    } finally {
      setPayingContractId(null);
    }
  };

  const handleDirectRazorpayPay = async (contract) => {
    if (payingContractId) return;
    setPayingContractId(contract._id);
    const payableAmount = Number(contract.quantity) * Number(contract.offerPrice);

    await openRazorpayCheckout({
      contract,
      user,
      amount: payableAmount,
      onSuccess: (res) => handlePaymentSuccess(contract, res),
      onFailure: (err) => {
        console.warn("Payment cancelled or failed:", err);
        setPayingContractId(null);
      },
    });
  };

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return (
      <div className="p-12 text-center text-slate-600 flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
        <span className="font-semibold text-sm">Loading Escrow Payment Details…</span>
      </div>
    );
  }

  /* ---------------- EMPTY STATE ---------------- */
  if (activeContracts.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-10 bg-white rounded-2xl shadow-xs border border-slate-200 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-4">
          <ShieldCheck size={36} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">No Active Contract Payments</h2>
        <p className="text-slate-500 text-sm max-w-md mx-auto mb-8">
          Payments are created automatically once both you and the farmer sign a digital contract.
        </p>

        <div className="grid md:grid-cols-3 gap-4 text-xs text-slate-600 text-left">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <FileText className="text-emerald-600 mb-2" size={20} />
            <h4 className="font-bold text-slate-800 mb-1">Contract Signed First</h4>
            Payments activate immediately after two-party digital signature.
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <ShieldCheck className="text-teal-600 mb-2" size={20} />
            <h4 className="font-bold text-slate-800 mb-1">Razorpay Escrow Vault</h4>
            Funds are locked safely and released only upon delivery verification.
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <CheckCircle className="text-blue-600 mb-2" size={20} />
            <h4 className="font-bold text-slate-800 mb-1">Guaranteed Safety</h4>
            100% protection against crop default, quality failure, or fraud.
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- UI ---------------- */
  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      {/* Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">Contract Escrow Payments</h2>
          <p className="text-xs text-slate-500">Fund signed farming agreements into Razorpay Nodal Escrow</p>
        </div>
        <button
          onClick={() => navigate("/dashboard/buyer/wallet")}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer self-start sm:self-auto"
        >
          <Wallet size={14} className="text-emerald-400" />
          <span>View Escrow Wallet & History</span>
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Overview Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Pending Deposits
          </span>
          <div className="text-2xl font-black text-slate-900">
            ₹{totalPendingAmount.toLocaleString()}
          </div>
          <span className="text-[11px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded mt-2 inline-block">
            Due on Active Contracts
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Locked in Escrow
          </span>
          <div className="text-2xl font-black text-emerald-700">
            ₹{totalLockedAmount.toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded mt-2 inline-block">
            Protected by Razorpay Vault
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Escrow Gateway
            </span>
            <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck size={18} className="text-emerald-600" /> Razorpay Test Mode
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Instant UPI & Card Testing</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
            <Lock size={20} />
          </div>
        </div>
      </div>

      {/* Contract Payments List */}
      <div className="space-y-5">
        {activeContracts.map((contract) => {
          const escrow = getEscrowForContract(contract._id);
          const payableAmount = Number(contract.quantity) * Number(contract.offerPrice);
          const last4Digits = contract._id ? contract._id.slice(-4).toUpperCase() : "0000";
          const isPaying = payingContractId === contract._id;

          return (
            <div
              key={contract._id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 transition hover:border-slate-300"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
                    <Package size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg text-slate-900">
                        {contract.commodity}
                      </h3>
                      <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md border border-slate-200">
                        CTR-...{last4Digits}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Agreement ID: <span className="font-mono">{contract._id}</span>
                    </p>
                  </div>
                </div>

                <div>
                  {!escrow ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      <AlertCircle size={13} className="text-amber-600 animate-pulse" />
                      Payment Due
                    </span>
                  ) : escrow.status === "locked" ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <Lock size={13} className="text-emerald-600" />
                      Locked in Escrow
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                      <CheckCircle size={13} className="text-blue-600" />
                      Paid & Released
                    </span>
                  )}
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 py-4 text-sm">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                    Farmer (Seller)
                  </p>
                  <p className="font-bold text-slate-800 flex items-center gap-1">
                    <User size={14} className="text-emerald-600" /> {contract.farmerName || "Verified Producer"}
                  </p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {contract.farmAddress || "Regional Mandi"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                    Quantity & Rate
                  </p>
                  <p className="font-bold text-slate-800">
                    {contract.quantity} {contract.unit || "Quintal"}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    ₹{contract.offerPrice} / {contract.unit || "Qtl"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                    {escrow ? "Amount Protected" : "Total Payable Amount"}
                  </p>
                  <p className="font-extrabold text-xl text-emerald-700">
                    ₹{payableAmount.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-slate-400">100% Escrow Protected</p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                    Delivery Location
                  </p>
                  <p className="text-xs font-medium text-slate-700 flex items-start gap-1">
                    <MapPin size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{contract.deliveryAddress || "Buyer Destination Hub"}</span>
                  </p>
                </div>
              </div>

              {/* Escrow Transaction Receipt Metadata */}
              {escrow && (
                <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100 flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-900 mt-2">
                  <div className="flex flex-wrap items-center gap-4">
                    {escrow.paymentId && (
                      <span className="font-mono bg-white px-2 py-0.5 rounded border border-emerald-200">
                        Payment ID: <b>{escrow.paymentId}</b>
                      </span>
                    )}
                    {escrow.depositedAt && (
                      <span className="flex items-center gap-1 text-slate-600">
                        <Clock size={13} className="text-emerald-600" />
                        Deposited: {new Date(escrow.depositedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </span>
                    )}
                    <span className="text-emerald-700 font-semibold">
                      Release Condition: {escrow.releaseCondition || "Buyer Delivery Confirmation"}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck size={12} /> Protected by Razorpay
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck size={15} className="text-emerald-600" />
                  Your payment is safely held in Razorpay Escrow until crop delivery is verified.
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {!escrow ? (
                    <>
                      <button
                        onClick={() => handleDirectRazorpayPay(contract)}
                        disabled={isPaying}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-xs flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                      >
                        {isPaying ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Opening Razorpay...
                          </>
                        ) : (
                          <>
                            <CreditCard size={16} />
                            Pay ₹{payableAmount.toLocaleString()} via Razorpay
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => navigate(`/dashboard/buyer/payments/${contract._id}`)}
                        className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition cursor-pointer"
                      >
                        Escrow Details
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => navigate(`/dashboard/buyer/payments/${contract._id}`)}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <span>View Escrow Vault</span>
                      <ChevronRight size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
