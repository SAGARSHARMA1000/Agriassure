import React, { useState } from "react";
import {
  ShieldCheck,
  Lock,
  Smartphone,
  CreditCard,
  Landmark,
  X,
  CheckCircle2,
  Loader2,
  Sparkles,
  ChevronRight,
  QrCode,
  IndianRupee,
  Building2
} from "lucide-react";

export default function RazorpayTestModal({
  isOpen,
  onClose,
  amount,
  contractId,
  commodity,
  farmerName,
  buyerName,
  onSuccess,
}) {
  const [selectedMethod, setSelectedMethod] = useState("upi");
  const [processing, setProcessing] = useState(false);
  const [upiId, setUpiId] = useState("buyer@okhdfcbank");
  const [cardDetails, setCardDetails] = useState({
    number: "4111 1111 1111 1111",
    expiry: "12/28",
    cvv: "789",
    name: buyerName || "Verified Buyer",
  });
  const [selectedBank, setSelectedBank] = useState("HDFC");

  if (!isOpen) return null;

  const handleSimulatePayment = () => {
    setProcessing(true);

    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    const fakePaymentId = `pay_test_${Date.now()}_${randomSuffix}`;
    const fakeOrderId = `order_test_${Date.now()}_${randomSuffix}`;

    setTimeout(() => {
      setProcessing(false);
      onSuccess({
        razorpay_payment_id: fakePaymentId,
        razorpay_order_id: fakeOrderId,
        razorpay_signature: `sig_test_${randomSuffix}`,
      });
      onClose();
    }, 1200);
  };

  const contractLast4 = contractId ? String(contractId).slice(-4).toUpperCase() : "0000";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4 animate-fade-in font-sans">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden text-slate-800 relative">
        {/* Razorpay Brand Header */}
        <div className="bg-linear-to-r from-blue-700 via-indigo-700 to-blue-800 text-white p-5 relative">
          <button
            onClick={onClose}
            disabled={processing}
            className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black text-[10px] tracking-wider uppercase">
              TEST MODE
            </span>
            <span className="text-xs text-blue-200 flex items-center gap-1 font-medium">
              <Lock size={12} /> Razorpay Escrow Gateway
            </span>
          </div>

          <h3 className="text-xl font-extrabold text-white">
            AgriAssure Escrow Vault
          </h3>
          <p className="text-xs text-blue-200 mt-0.5 truncate">
            {commodity || "Crop"} Contract (CTR-...{contractLast4}) • {farmerName}
          </p>

          <div className="mt-3 pt-3 border-t border-white/15 flex items-baseline justify-between">
            <span className="text-xs text-blue-200">Amount to Deposit:</span>
            <span className="text-2xl font-black text-white">
              ₹{Number(amount || 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* Method Tabs */}
          <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setSelectedMethod("upi")}
              className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                selectedMethod === "upi"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Smartphone size={14} /> UPI / QR
            </button>
            <button
              onClick={() => setSelectedMethod("card")}
              className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                selectedMethod === "card"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <CreditCard size={14} /> Card (Test)
            </button>
            <button
              onClick={() => setSelectedMethod("netbanking")}
              className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                selectedMethod === "netbanking"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Building2 size={14} /> NetBank
            </button>
          </div>

          {/* TAB 1: UPI / QR */}
          {selectedMethod === "upi" && (
            <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">Simulate UPI Payment</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold">
                  Instant Test
                </span>
              </div>

              <div>
                <label className="text-[11px] text-slate-500 font-semibold block mb-1">
                  Virtual Payment Address (VPA)
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-mono text-xs focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex gap-2">
                {["GPay", "PhonePe", "Paytm", "BHIM"].map((app) => (
                  <span
                    key={app}
                    className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-semibold text-slate-600"
                  >
                    {app}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: TEST CARD */}
          {selectedMethod === "card" && (
            <div className="space-y-2.5 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">Test Card Prefilled</span>
                <span className="text-[10px] text-blue-700 bg-blue-100 px-2 py-0.5 rounded font-bold">
                  Standard Test Visa
                </span>
              </div>

              <div>
                <label className="text-[11px] text-slate-500 font-semibold block mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  value={cardDetails.number}
                  onChange={(e) =>
                    setCardDetails({ ...cardDetails, number: e.target.value })
                  }
                  className="w-full p-2 rounded-lg border border-slate-300 bg-white font-mono text-xs focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-500 font-semibold block mb-1">
                    Expiry (MM/YY)
                  </label>
                  <input
                    type="text"
                    value={cardDetails.expiry}
                    onChange={(e) =>
                      setCardDetails({ ...cardDetails, expiry: e.target.value })
                    }
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white font-mono text-xs focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 font-semibold block mb-1">
                    CVV
                  </label>
                  <input
                    type="password"
                    value={cardDetails.cvv}
                    onChange={(e) =>
                      setCardDetails({ ...cardDetails, cvv: e.target.value })
                    }
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white font-mono text-xs focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: NETBANKING */}
          {selectedMethod === "netbanking" && (
            <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-700 block">Select Test Bank:</span>
              <div className="grid grid-cols-2 gap-2">
                {["HDFC", "SBI", "ICICI", "Axis"].map((bank) => (
                  <button
                    key={bank}
                    onClick={() => setSelectedBank(bank)}
                    className={`p-2 rounded-lg border text-left font-semibold transition cursor-pointer ${
                      selectedBank === bank
                        ? "bg-blue-50 border-blue-500 text-blue-700"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {bank} Bank
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Security Notice */}
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800">
            <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
            <span>Simulated Escrow Vault — Funds locked safely until harvest delivery.</span>
          </div>

          {/* Pay Button */}
          <button
            onClick={handleSimulatePayment}
            disabled={processing}
            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm shadow-md hover:shadow-emerald-600/25 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-60"
          >
            {processing ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Authorizing Test Payment...</span>
              </>
            ) : (
              <>
                <Lock size={16} />
                <span>Pay ₹{Number(amount || 0).toLocaleString()} (Test Mode)</span>
              </>
            )}
          </button>

          <p className="text-[10px] text-slate-400 text-center">
            Razorpay Test Environment • No real charge will occur
          </p>
        </div>
      </div>
    </div>
  );
}
