
import React, { useEffect, useState } from "react";
import {
  ShieldCheck,
  Clock,
  ChevronLeft,
  Download,
  Printer,
  CheckCircle,
  Loader2,
  AlertTriangle,
  Upload
} from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";
import api from "../../../services/api";

/* ---------------- SAFE EMPTY TEMPLATE ---------------- */

const EMPTY_CONTRACT = {
  id: "",
  createdDate: "",
  buyer: { name: "", address: "" },
  farmer: { name: "", address: "" },
  cropDetails: {
    name: "",
    quantity: "",
    unit: "",
    pricePerQuintal: ""
  },
  delivery: { deadline: "", location: "" },
  payment: { mode: "Escrow Account", advance: 30 },
  buyerSignature: null,
  farmerSignature: null
};

/* ---------------- STATUS BANNER ---------------- */

const StatusBanner = ({ status }) => {
  const map = {
    sent_to_farmer: {
      text: "Action Required: Please review and sign the contract.",
      color: "bg-blue-50 border-blue-200 text-blue-800",
      icon: Clock
    },
    active: {
      text: "Contract Active: Legally binding.",
      color: "bg-emerald-50 border-emerald-200 text-emerald-800",
      icon: ShieldCheck
    },
    rejected: {
      text: "Contract Rejected.",
      color: "bg-red-50 border-red-200 text-red-800",
      icon: AlertTriangle
    }
  };

  const cfg = map[status];
  if (!cfg) return null;
  const Icon = cfg.icon;

  return (
    <div className={`flex items-center gap-3 p-4 rounded-lg border ${cfg.color} mb-6`}>
      <Icon size={22} />
      <span className="font-semibold">{cfg.text}</span>
    </div>
  );
};

/* ---------------- MAIN COMPONENT ---------------- */

export default function FarmerContractView() {
  const { contractId } = useParams();
  const navigate = useNavigate();

  const [contractData, setContractData] = useState(EMPTY_CONTRACT);
  const [status, setStatus] = useState("sent_to_farmer");

  /* Farmer signature */
  const [signature, setSignature] = useState(null);
  const [name, setName] = useState("");
  const [isSigning, setIsSigning] = useState(false);
  /* ---------------- FETCH CONTRACT ---------------- */

 
  useEffect(() => {
  if (!contractId) return;

  const fetchContract = async () => {
    try {
      const res = await api.getContractById(contractId);
      console.log("📦 RAW CONTRACT RESPONSE:", res.data);

      const c = res.data.contract;

      setContractData({
        id: c._id,
        createdDate: c.createdAt?.split("T")[0] || "",
        buyer: {
          name: c.buyerName,
          address: c.deliveryAddress,
        },
        farmer: {
          name: c.farmerName,
          address: c.farmAddress,
        },
        cropDetails: {
          name: c.commodity,
          quantity: c.quantity,
          unit: c.unit,
          pricePerQuintal: c.offerPrice,
        },
        delivery: {
          deadline: c.pickupDate,
          location: c.deliveryAddress,
        },
        payment: c.payment,
       // ✅ FIXED SIGNATURE MAPPING
  buyerSignature: {
    name: c.signatures?.buyerName || "",
    image: c.signatures?.buyerSignatureUrl
      ? c.signatures.buyerSignatureUrl.replace(/\\/g, "/")
      : null
  },
  farmerSignature: {
    name: c.signatures?.farmerName || "",
    image: c.signatures?.farmerSignatureUrl
      ? c.signatures.farmerSignatureUrl.replace(/\\/g, "/")
      : null
  }
      });

      setStatus(c.status);
    } catch (err) {
      console.error("❌ Failed to load contract", err);
    }
  };

  fetchContract();
}, [contractId]);


  /* ---------------- ACCEPT ---------------- */

  const handleAccept = async () => {
    if (!signature || !name) {
      alert("Upload signature and enter name");
      return;
    }

    const formData = new FormData();
    formData.append("signature", signature);
    formData.append("name", name);
    setIsSigning(true);
    await api.farmerSignContract(contractId, formData);
    alert("✅ Contract accepted & signed");
    setStatus("active");
  };

  /* ---------------- REJECT ---------------- */
const handleReject = async () => {
  const confirmReject = window.confirm("Reject this contract?");
  if (!confirmReject) return;

  try {
    await api.rejectContract(contractId);
    setStatus("rejected");
  } catch (err) {
    console.error("❌ Failed to reject contract", err);
  }
};



  /* ---------------- RENDER ---------------- */

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-4xl mx-auto mb-6 flex justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-600">
          <ChevronLeft size={18} /> Back
        </button>
        <div className="flex gap-2">
          <button className="bg-white px-3 py-2 border rounded"><Printer /></button>
          <button className="bg-white px-3 py-2 border rounded"><Download /></button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <StatusBanner status={status} />

        {/* CONTRACT BODY – UI SAME */}
        <div className="bg-white p-10 border shadow-xl">
          <h1 className="text-2xl font-bold text-center mb-4">
            Contract Farming Agreement
          </h1>

          <p className="text-center text-sm text-gray-500 mb-6">
            Agreement ID: {contractData.id} | Date: {contractData.createdDate}
          </p>

           {/* Document Body */}
          <div className="p-8 md:p-12 space-y-8 text-gray-700 leading-relaxed">
            
            {/* Section 1: Parties */}
            <section>
              <h3 className="font-bold text-gray-900 uppercase border-b border-gray-300 pb-2 mb-4 text-sm">1. Parties Involved</h3>
              <p className="mb-4">
                This agreement is made and entered into by and between:
              </p>
              <div className="grid md:grid-cols-2 gap-8 bg-gray-50 p-4 rounded border border-gray-100">
                <div>
                  <p className="text-xs uppercase text-gray-500 font-bold mb-1">Buyer (First Party)</p>
                  <p className="font-bold text-lg">{contractData.buyer?.name||"-"}</p>
                   <p className="text-sm">{contractData.buyer?.address}</p>
                  {/* <p className="text-sm">Rep: {contractData.buyer.repName}</p>  */}
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500 font-bold mb-1">Farmer (Second Party)</p>
                  <p className="font-bold text-lg">{contractData.farmer?.name||"-"}</p>
                  <p className="text-sm">{contractData.farmer?.address}</p>
                  {/* <p className="text-sm">ID: {contractData.farmer.regId}</p> */}
                </div>
              </div>
            </section>

            {/* Section 2: Crop & Price Specifications */}
            <section>
              <h3 className="font-bold text-gray-900 uppercase border-b border-gray-300 pb-2 mb-4 text-sm">2. Crop Specifications & Pricing</h3>
              <p className="mb-4 text-sm italic text-gray-500">
                The Second Party agrees to sell and the First Party agrees to purchase the produce as per the following specifications:
              </p>
              
              <div className="border border-gray-300 rounded overflow-hidden">
                <table className="w-full text-left text-sm">
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="bg-gray-50 p-3 font-semibold w-1/3">Crop Variety</td>
                      <td className="p-3">{contractData.cropDetails?.name}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="bg-gray-50 p-3 font-semibold">Quality Grade</td>
                      {/* <td className="p-3">{contractData.cropDetails.grade}</td> */}
                      <td className="p-3">Standard</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="bg-gray-50 p-3 font-semibold">Quantity Agreed</td>
                      <td className="p-3">
                        {/* <EditableField 
                          section="cropDetails" field="quantity" 
                          value={contractData.cropDetails.quantity} 
                          type="number" suffix="Quintals" label="Quantity"
                        /> */} {contractData.cropDetails.quantity} {contractData.cropDetails.unit}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="bg-gray-50 p-3 font-semibold">Base Price</td>
                      <td className="p-3">
                        {/* <EditableField 
                          section="cropDetails" field="pricePerQuintal" 
                          value={contractData.cropDetails.pricePerQuintal} 
                          type="number" suffix="INR / Quintal" label="Price"
                        /> */}  ₹{contractData.cropDetails.pricePerQuintal} per {contractData.cropDetails.unit}
                      </td>
                    </tr>
                    <tr className="bg-emerald-50">
                      <td className="p-3 font-bold text-emerald-800">Total Contract Value</td>
                      <td className="p-3 font-bold text-emerald-800 text-lg">
                        ₹{(contractData.cropDetails.quantity * contractData.cropDetails.pricePerQuintal).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 3: Delivery & Payment */}
            <section>
              <h3 className="font-bold text-gray-900 uppercase border-b border-gray-300 pb-2 mb-4 text-sm">3. Delivery & Payment Terms</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                   <h4 className="font-bold text-sm mb-2">3.1 Delivery Schedule</h4>
                   <ul className="list-disc list-inside text-sm space-y-2">
                     <li>
                       <span className="text-gray-500">Deadline:</span>{' '}
                      {contractData.delivery.deadline} 
                     </li>
                     <li>
                       <span className="text-gray-500">Location:</span> {contractData.delivery.location}
                     </li>
                   
  


                     <li><span className="text-gray-500">Packaging:</span> {contractData.cropDetails.packaging}</li>
                   </ul>
                </div>
                <div>
                   <h4 className="font-bold text-sm mb-2">3.2 Payment Schedule</h4>
                   <ul className="list-disc list-inside text-sm space-y-2">
                     <li><span className="text-gray-500">Mode:</span> {contractData.payment?.mode}</li>
                     <li><span className="text-gray-500">Advance:</span> {contractData.payment?.advance}% upon signing</li>
                     <li><span className="text-gray-500">Balance:</span>Within 24 hours of delivery</li>
                   </ul>
                </div>
              </div>
            </section>

            {/* Section 4: Legal Clauses */}
            <section>
              <h3 className="font-bold text-gray-900 uppercase border-b border-gray-300 pb-2 mb-4 text-sm">4. Terms & Conditions</h3>
              <div className="text-xs text-gray-600 space-y-3 bg-gray-50 p-4 border border-gray-200 rounded">
                <p><strong>4.1 Rejection Criteria:</strong>Rejection allowed if moisture: 14%</p>
                <p><strong>4.2 Penalties:</strong>1% of total value per day delay</p>
                <p><strong>4.3 Force Majeure:</strong>Applicable for natural calamities (cyclone,flood)</p>
                <p><strong>4.4 Dispute Resolution:</strong> All disputes subject to arbitration under the APMC Act jurisdiction.</p>
              </div>
            </section>
               

          </div>
          {/* End Document Body */}
       <div/>

       
          <section className="pt-8 mt-8 border-t-2 border-dashed border-gray-300">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">

          {/* Buyer Signature Card */}
          <div className="text-center p-5 rounded-2xl bg-gray-50/70 border border-gray-200/80 flex flex-col justify-between min-h-[200px]">
            <div className="flex flex-col items-center justify-center grow py-2">
              {contractData?.buyerSignature?.image ? (
                <div className="space-y-1.5">
                  <img
                    src={contractData.buyerSignature.image}
                    alt="Buyer Signature"
                    className="h-16 max-w-[200px] object-contain mx-auto border-b border-gray-300 pb-1"
                  />
                  <p className="text-xs font-bold text-gray-900 mt-1">
                    Signed by: {contractData.buyerSignature.name || contractData.buyer?.name || "Buyer"}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full mt-0.5">
                    <CheckCircle size={11} /> Digitally Signed
                  </span>
                </div>
              ) : (
                <div className="text-gray-500 text-xs italic bg-white border border-dashed border-gray-300 px-4 py-3 rounded-xl flex items-center gap-1.5">
                  <Clock size={14} className="text-gray-400" />
                  Awaiting buyer signature...
                </div>
              )}
            </div>

          </div>

          {/* Farmer Signature Card */}
          <div className="text-center p-5 rounded-2xl bg-gray-50/70 border border-gray-200/80 flex flex-col justify-between min-h-[200px]">
            <div className="flex flex-col items-center justify-center grow py-2">
              {contractData?.farmerSignature?.image && status !== "sent_to_farmer" ? (
                <div className="space-y-1.5">
                  <img
                    src={contractData.farmerSignature.image}
                    alt="Farmer Signature"
                    className="h-16 max-w-[200px] object-contain mx-auto border-b border-gray-300 pb-1"
                  />
                  <p className="text-xs font-bold text-gray-900 mt-1">
                    Signed by: {contractData.farmerSignature.name || contractData.farmer?.name || "Farmer"}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full mt-0.5">
                    <CheckCircle size={11} /> Farmer Verified Signature
                  </span>
                </div>
              ) : status === "sent_to_farmer" ? (
                <div className="space-y-3 w-full max-w-xs mx-auto">
                  {contractData?.farmerSignature?.image ? (
                    <div className="space-y-1.5">
                      <div className="p-2 bg-white rounded-xl border border-gray-200 shadow-2xs">
                        <img
                          src={contractData.farmerSignature.image}
                          alt="Signature Preview"
                          className="h-14 max-w-[180px] object-contain mx-auto"
                        />
                      </div>
                      <label className="text-[11px] text-emerald-700 font-semibold hover:underline cursor-pointer block">
                        Change Signature File
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            setSignature(file);
                            const previewUrl = URL.createObjectURL(file);
                            setContractData((prev) => ({
                              ...prev,
                              farmerSignature: {
                                ...prev.farmerSignature,
                                image: previewUrl,
                                name: name || "",
                              },
                            }));
                          }}
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-emerald-500 bg-white hover:bg-emerald-50/30 rounded-xl p-4 cursor-pointer transition group">
                      <Upload size={22} className="text-gray-400 group-hover:text-emerald-600 mb-1" />
                      <span className="text-xs font-semibold text-gray-700 group-hover:text-emerald-700">
                        Upload Your Signature Image
                      </span>
                      <span className="text-[10px] text-gray-400">PNG, JPG, or JPEG</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          setSignature(file);
                          const previewUrl = URL.createObjectURL(file);
                          setContractData((prev) => ({
                            ...prev,
                            farmerSignature: {
                              ...prev.farmerSignature,
                              image: previewUrl,
                              name: name || "",
                            },
                          }));
                        }}
                      />
                    </label>
                  )}

                  <input
                    type="text"
                    placeholder="Type your full legal name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs font-semibold text-gray-800 bg-white border border-gray-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-xl px-3 py-2 text-center outline-none transition shadow-2xs"
                  />
                </div>
              ) : (
                <div className="text-gray-400 text-xs italic">
                  Contract rejected / inactive
                </div>
              )}
            </div>

            
          </div>

        </div>
      </section>


        </div>

        {/* ACTION BAR */}
        {status === "sent_to_farmer" && (
          <div className="sticky bottom-4 bg-white p-4 mt-6 shadow-lg border rounded flex justify-between">
            <button
              onClick={handleReject}
              className="px-6 py-3 border border-red-300 text-red-600 rounded"
            >
              Reject
            </button>

             <button
  onClick={handleAccept}
  disabled={isSigning}
  className={`px-8 py-3 font-bold rounded flex items-center justify-center gap-2 transition-all
    ${isSigning
      ? "bg-emerald-400 cursor-not-allowed"
      : "bg-emerald-600 hover:bg-emerald-700 text-white"}
  `}
>
  {isSigning ? (
    <>
      <Loader2 className="animate-spin" size={20} />
      Signing...
    </>
  ) : (
    <>
      <CheckCircle className="inline mr-2" />
      Accept & Sign
    </>
  )}
</button>
          </div>
        )}
      </div>
    </div>
  );
}
