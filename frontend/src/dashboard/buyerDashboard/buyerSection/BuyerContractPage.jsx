import React, { useEffect, useState } from "react";
import {
  FileText,
  CheckCircle,
  Edit3,
  Printer,
  Download,
  ShieldCheck,
  AlertTriangle,
  Send,
  Save,
  Loader2,
  Clock,
  ChevronLeft,
} from "lucide-react";
import {
  useLocation,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router-dom";
import api from "../../../services/api";
/* ---------------- SAFE EMPTY TEMPLATE ---------------- */

const EMPTY_CONTRACT = {
  id: "",
  createdDate: "",
  buyer: { name: "", address: "", repName: "" },
  farmer: { name: "", regId: "", address: "" },
  cropDetails: {
    name: "",
    variety: "",
    grade: "Standard",
    quantity: "",
    unit: "",
    pricePerQuintal: "",
    packaging: "",
  },
  delivery: { deadline: "", location: "" },
  payment: {
    mode: "Escrow Account",
    advance: 30,
    balanceTerms: "Within 48 hours of Quality Check",
  },
  clauses: {},
  buyerSignature: null,
  farmerSignature: null,
};

/* ---------------- STATUS BANNER ---------------- */

const StatusBanner = ({ status }) => {
  const configs = {
    draft: {
      color: "bg-gray-50 border-gray-200 text-gray-800",
      icon: Clock,
      text: "Draft Mode: Edit contract details before sending to farmer.",
    },
    sent_to_farmer: {
      color: "bg-blue-50 border-blue-200 text-blue-800",
      icon: Send,
      text: "Contract Sent: Waiting for farmer approval.",
    },
    NEGOTIATION: {
      color: "bg-orange-50 border-orange-200 text-orange-800",
      icon: Edit3,
      text: "Negotiation: Farmer requested changes.",
    },
    active: {
      color: "bg-emerald-50 border-emerald-200 text-emerald-800",
      icon: ShieldCheck,
      text: "Contract Active: Legally binding.",
    },
  };

  const config = configs[status] || configs.draft;
  const Icon = config.icon;

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-lg border ${config.color} mb-6 shadow-sm`}
    >
      <Icon size={24} />
      <span className="font-semibold">{config.text}</span>
    </div>
  );
};

/* ---------------- MAIN COMPONENT ---------------- */

export default function BuyerContracts() {
  const { proposalId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;
  const [isSending, setIsSending] = useState(false);

  // ✅ proposal is OPTIONAL (template must render without it)
  const proposal = state?.proposal;
  // ✅ outlet context (for future use / consistency)
  const outletContext = useOutletContext() || {};
  const { proposals, user } = useOutletContext();

  console.log("🆔 proposalId from URL:", proposalId);
  console.log("📦 BuyerContracts proposal:", proposal);

  /* ---------------- CONTRACT DATA (SAFE TEMPLATE) ---------------- */

  const [contractData, setContractData] = useState(EMPTY_CONTRACT);
  const [status, setStatus] = useState("draft");
  const [isEditing, setIsEditing] = useState(true);
  const [contractId, setContractId] = useState(null);
  const [isEditingLocation, setIsEditingLocation] = useState(false);

  /* ---------------- FETCH CONTRACT ---------------- */
  const mapContractFromApi = (c, prev) => {
    if (!c) return prev;
    const buyerSigImg = c.signatures?.buyerSignatureUrl
      ? c.signatures.buyerSignatureUrl.replace(/\\/g, "/")
      : null;
    const buyerSigName = c.signatures?.buyerName || c.buyerName || "";
    const farmerSigImg = c.signatures?.farmerSignatureUrl
      ? c.signatures.farmerSignatureUrl.replace(/\\/g, "/")
      : null;
    const farmerSigName = c.signatures?.farmerName || c.farmerName || "";

    return {
      ...prev,
      id: c._id || prev.id,
      createdDate: c.createdAt?.split("T")[0] || prev.createdDate,

      buyer: {
        ...prev.buyer,
        name: c.buyerName || prev.buyer?.name,
        address: c.deliveryAddress || prev.buyer?.address,
      },

      farmer: {
        ...prev.farmer,
        name: c.farmerName || prev.farmer?.name,
        address: c.farmAddress || prev.farmer?.address,
      },

      cropDetails: {
        ...prev.cropDetails,
        name: c.commodity || prev.cropDetails?.name,
        quantity: c.quantity || prev.cropDetails?.quantity,
        pricePerQuintal: c.offerPrice || prev.cropDetails?.pricePerQuintal,
        unit: c.unit || prev.cropDetails?.unit,
      },

      delivery: {
        ...prev.delivery,
        deadline: c.pickupDate || prev.delivery?.deadline,
        location: c.deliveryAddress || prev.delivery?.location,
      },

      buyerSignature: {
        name: buyerSigName,
        image: buyerSigImg,
      },

      farmerSignature: {
        name: farmerSigName,
        image: farmerSigImg,
      },
    };
  };

  useEffect(() => {
    if (!proposalId) {
      console.warn("⚠️ proposalId missing, skipping fetch");
      return;
    }

    const fetchContract = async () => {
      try {
        const res = await api.getContractByProposal(proposalId);
        const c = res.data;
        setContractId(c._id);
        setContractData((prev) => mapContractFromApi(c, prev));
        setStatus(c.status || "draft");

        const buyerSigImg = c.signatures?.buyerSignatureUrl
          ? c.signatures.buyerSignatureUrl.replace(/\\/g, "/")
          : null;
        const buyerSigName = c.signatures?.buyerName || c.buyerName || user?.name || "";

        if (buyerSigImg || buyerSigName) {
          setBuyerSignature({
            name: buyerSigName,
            image: null,
            imagePreview: buyerSigImg,
          });
        }
      } catch (err) {
        console.error(
          "❌ Contract fetch failed:",
          err.response?.data || err.message,
        );
      }
    };

    fetchContract();
  }, [proposalId, user]);
  // console.log("🖥️ RENDERING contractData:", contractData);

  /* ---------------- BUYER SIGNATURE ---------------- */
  const [buyerSignature, setBuyerSignature] = useState({
    name: "",
    image: null,
    imagePreview: null,
  });

  const handleSignatureUpload = (e) => {
    const file = e.target.files[0];
    //if (file) {
    setBuyerSignature((prev) => ({
      ...prev,
      // image: e.target.files[0],
      image: file,
      imagePreview: URL.createObjectURL(file),
    }));
    // }
  };

  const handleSignatureName = (e) => {
    setBuyerSignature((prev) => ({
      ...prev,
      name: e.target.value,
    }));
  };

  /* ---------------- ACTION HANDLERS ---------------- */

  const handleBack = () => {
    navigate("/dashboard/buyer/contracts", { replace: true });
  };

  const handleSaveDraft = () => {
    alert("Draft saved (UI simulation).");
  };

  const handleSendToFarmer = async () => {
    if (!contractId) {
      alert("Contract not loaded yet.");
      return;
    }
    const confirmSend = window.confirm(
      "Please review the contract carefully.\nOnce sent, you cannot edit it.\n\nDo you want to continue?",
    );

    if (!confirmSend) return;
    if (!buyerSignature.name || (!buyerSignature.image && !buyerSignature.imagePreview)) {
      alert("Please upload your signature and type your name.");
      return;
    }

    try {
      setIsSending(true); // 🔥 start animation
      const formData = new FormData();
      formData.append("name", buyerSignature.name);
      if (buyerSignature.image) {
        formData.append("signature", buyerSignature.image);
      }

      const res = await api.buyerSignContract(contractId, formData);
      const updated = res.data.contract;

      setContractData((prev) => mapContractFromApi(updated, prev));
      setStatus(updated.status || "sent_to_farmer");
      setIsEditing(false);
    } catch (err) {
      console.error(
        "❌ Failed to send contract:",
        err.response?.data || err.message,
      );
      alert("Failed to send contract to farmer");
    } finally {
      setIsSending(false);
    }
  };

  /* ---------------- RENDER ---------------- */

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 font-sans">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between">
        <button
          onClick={handleBack}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft size={20} />
          <span className="font-medium">Back to Dashboard</span>
        </button>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 bg-white rounded border">
            <Printer size={23} /> Print
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-white rounded border">
            <Download size={23} /> Download PDF
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <StatusBanner status={status} />

        {/* --- THE LEGAL CONTRACT DOCUMENT --- */}
        <div className="bg-white shadow-xl rounded-none border border-gray-300 min-h-[800px] relative">
          {/* Document Header */}
          <div className="p-8 md:p-12 border-b border-gray-200 text-center bg-gray-50">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <ShieldCheck size={32} className="text-gray-500" />
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 uppercase tracking-wider mb-2">
              Contract Farming Agreement
            </h1>
            <p className="text-gray-500 text-sm">
              Agreement ID:{" "}
              <span className="font-mono text-black">{contractData.id}</span> |
              Date: {contractData.createdDate}
            </p>
          </div>

          {/* Document Body */}
          <div className="p-8 md:p-12 space-y-8 text-gray-700 leading-relaxed">
            {/* Section 1: Parties */}
            <section>
              <h3 className="font-bold text-gray-900 uppercase border-b border-gray-300 pb-2 mb-4 text-sm">
                1. Parties Involved
              </h3>
              <p className="mb-4">
                This agreement is made and entered into by and between:
              </p>
              <div className="grid md:grid-cols-2 gap-8 bg-gray-50 p-4 rounded border border-gray-100">
                <div>
                  <p className="text-xs uppercase text-gray-500 font-bold mb-1">
                    Buyer (First Party)
                  </p>
                  <p className="font-bold text-lg">
                    {contractData.buyer?.name || "-"}
                  </p>
                  <p className="text-sm">{contractData.buyer?.address}</p>
                  {/* <p className="text-sm">Rep: {contractData.buyer.repName}</p>  */}
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500 font-bold mb-1">
                    Farmer (Second Party)
                  </p>
                  <p className="font-bold text-lg">
                    {contractData.farmer?.name || "-"}
                  </p>
                  <p className="text-sm">{contractData.farmer?.address}</p>
                  {/* <p className="text-sm">ID: {contractData.farmer.regId}</p> */}
                </div>
              </div>
            </section>

            {/* Section 2: Crop & Price Specifications */}
            <section>
              <h3 className="font-bold text-gray-900 uppercase border-b border-gray-300 pb-2 mb-4 text-sm">
                2. Crop Specifications & Pricing
              </h3>
              <p className="mb-4 text-sm italic text-gray-500">
                The Second Party agrees to sell and the First Party agrees to
                purchase the produce as per the following specifications:
              </p>

              <div className="border border-gray-300 rounded overflow-hidden">
                <table className="w-full text-left text-sm">
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="bg-gray-50 p-3 font-semibold w-1/3">
                        Crop Variety
                      </td>
                      <td className="p-3">{contractData.cropDetails?.name}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="bg-gray-50 p-3 font-semibold">
                        Quality Grade
                      </td>
                      {/* <td className="p-3">{contractData.cropDetails.grade}</td> */}
                      <td className="p-3">Standard</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="bg-gray-50 p-3 font-semibold">
                        Quantity Agreed
                      </td>
                      <td className="p-3">
                        {/* <EditableField 
                          section="cropDetails" field="quantity" 
                          value={contractData.cropDetails.quantity} 
                          type="number" suffix="Quintals" label="Quantity"
                        /> */}{" "}
                        {contractData.cropDetails?.quantity}{" "}
                        {contractData.cropDetails?.unit}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="bg-gray-50 p-3 font-semibold">
                        Base Price
                      </td>
                      <td className="p-3">
                        {/* <EditableField 
                          section="cropDetails" field="pricePerQuintal" 
                          value={contractData.cropDetails.pricePerQuintal} 
                          type="number" suffix="INR / Quintal" label="Price"
                        /> */}{" "}
                        ₹{contractData.cropDetails?.pricePerQuintal} per{" "}
                        {contractData.cropDetails?.unit}
                      </td>
                    </tr>
                    <tr className="bg-emerald-50">
                      <td className="p-3 font-bold text-emerald-800">
                        Total Contract Value
                      </td>
                      <td className="p-3 font-bold text-emerald-800 text-lg">
                        ₹
                        {(
                          contractData.cropDetails?.quantity *
                          contractData.cropDetails?.pricePerQuintal
                        ).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 3: Delivery & Payment */}
            <section>
              <h3 className="font-bold text-gray-900 uppercase border-b border-gray-300 pb-2 mb-4 text-sm">
                3. Delivery & Payment Terms
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-sm mb-2">
                    3.1 Delivery Schedule
                  </h4>
                  <ul className="list-disc list-inside text-sm space-y-2">
                    <li>
                      <span className="text-gray-500">Deadline:</span>{" "}
                      {contractData.delivery?.deadline}
                    </li>
                    {/* <li>
                       <span className="text-gray-500">Location:</span> {contractData.delivery.location}
                     </li> */}
                    <li>
                      <span className="text-gray-500 pt-1">Location:</span>

                      {/* Yellow Highlight Box */}
                      <div className="bg-yellow-50 border border-yellow-200 rounded px-3 py-2 flex items-center gap-4">
                        {isEditingLocation ? (
                          <>
                            <input
                              type="text"
                              value={contractData.delivery.location}
                              onChange={(e) =>
                                setContractData((prev) => ({
                                  ...prev,
                                  delivery: {
                                    ...prev.delivery,
                                    location: e.target.value,
                                  },
                                }))
                              }
                              className="border border-gray-300 rounded px-2 py-1 text-sm min-w-[220px]"
                            />
                            <button
                              onClick={() => setIsEditingLocation(false)}
                              className="text-xs text-green-700 font-semibold hover:underline"
                            >
                              Save
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="font-semibold text-gray-900">
                              {contractData.delivery?.location}
                            </span>
                            <button
                              onClick={() => setIsEditingLocation(true)}
                              className="text-xs text-blue-700 font-semibold hover:underline ml-6"
                            >
                              Edit
                            </button>
                          </>
                        )}
                      </div>
                    </li>

                    <li>
                      <span className="text-gray-500">Packaging:</span>{" "}
                      {contractData.cropDetails?.packaging}
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-sm mb-2">
                    3.2 Payment Schedule
                  </h4>
                  <ul className="list-disc list-inside text-sm space-y-2">
                    <li>
                      <span className="text-gray-500">Mode:</span>{" "}
                      {contractData.payment?.mode}
                    </li>
                    <li>
                      <span className="text-gray-500">Advance:</span>{" "}
                      {contractData.payment?.advance}% upon signing
                    </li>
                    <li>
                      <span className="text-gray-500">Balance:</span>Within 24
                      hours of delivery
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 4: Legal Clauses */}
            <section>
              <h3 className="font-bold text-gray-900 uppercase border-b border-gray-300 pb-2 mb-4 text-sm">
                4. Terms & Conditions
              </h3>
              <div className="text-xs text-gray-600 space-y-3 bg-gray-50 p-4 border border-gray-200 rounded">
                <p>
                  <strong>4.1 Rejection Criteria:</strong>Rejection allowed if
                  moisture: 14%
                </p>
                <p>
                  <strong>4.2 Penalties:</strong>1% of total value per day delay
                </p>
                <p>
                  <strong>4.3 Force Majeure:</strong>Applicable for natural
                  calamities (cyclone,flood)
                </p>
                <p>
                  <strong>4.4 Dispute Resolution:</strong> All disputes subject
                  to arbitration under the APMC Act jurisdiction.
                </p>
              </div>
            </section>
          </div>
          {/* End Document Body */}
          <div />

          {/* ---------------- SIGNATURE SECTION ---------------- */}

          <section className="pt-8 mt-8 border-t-2 border-dashed border-gray-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              {/* Buyer Signature Column */}
              <div className="text-center p-4 rounded-xl bg-gray-50/70 border border-gray-200/80 flex flex-col justify-between min-h-[170px]">
                <div className="flex flex-col items-center justify-center grow py-2">
                  {contractData?.buyerSignature?.image || (status !== "draft" && buyerSignature.imagePreview) ? (
                    <div className="space-y-1">
                      <img
                        src={contractData?.buyerSignature?.image || buyerSignature.imagePreview}
                        alt="Buyer Signature"
                        className="h-16 max-w-[200px] object-contain mx-auto border-b border-gray-300 pb-1"
                      />
                      <p className="text-xs font-bold text-gray-900 mt-1">
                        Signed by: {contractData?.buyerSignature?.name || buyerSignature.name || contractData.buyer?.name}
                      </p>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full mt-0.5">
                        <CheckCircle size={11} /> Digitally Signed
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2 w-full max-w-xs mx-auto">
                      {buyerSignature.imagePreview ? (
                        <div className="space-y-1">
                          <img
                            src={buyerSignature.imagePreview}
                            alt="Signature Preview"
                            className="h-12 max-w-[180px] object-contain mx-auto border p-1 rounded bg-white shadow-xs"
                          />
                          <label className="text-[11px] text-emerald-700 font-semibold hover:underline cursor-pointer block">
                            Change Signature File
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleSignatureUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      ) : (
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleSignatureUpload}
                          className="text-xs text-gray-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                        />
                      )}

                      <input
                        type="text"
                        placeholder="Type your full name"
                        value={buyerSignature.name}
                        onChange={handleSignatureName}
                        className="text-xs border-b border-gray-400 text-center focus:outline-none focus:border-emerald-600 px-2 py-1 font-semibold w-full bg-transparent"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Farmer Signature Column */}
              <div className="text-center p-4 rounded-xl bg-gray-50/70 border border-gray-200/80 flex flex-col justify-between min-h-[170px]">
                <div className="flex flex-col items-center justify-center grow py-2">
                  {contractData?.farmerSignature?.image ? (
                    <div className="space-y-1">
                      <img
                        src={contractData.farmerSignature.image}
                        alt="Farmer Signature"
                        className="h-16 max-w-[200px] object-contain mx-auto border-b border-gray-300 pb-1"
                      />
                      <p className="text-xs font-bold text-gray-900 mt-1">
                        Signed by: {contractData.farmerSignature.name || contractData.farmer?.name}
                      </p>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full mt-0.5">
                        <CheckCircle size={11} /> Farmer Verified Signature
                      </span>
                    </div>
                  ) : (
                    <div className="text-gray-500 text-xs italic bg-white border border-dashed border-gray-300 px-4 py-3 rounded-xl flex items-center gap-1.5 shadow-2xs">
                      <Clock size={14} className="text-gray-400" />
                      {status === "sent_to_farmer"
                        ? "Waiting for farmer signature..."
                        : "Pending farmer review..."}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* ---------------- STICKY ACTION BAR ---------------- */}

          {status === "draft" && (
            <div className="sticky bottom-4 mx-auto max-w-4xl mt-6 bg-white p-4 rounded-xl shadow-2xl border border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                <p className="font-bold text-gray-800">Draft Contract</p>
                <p>Edit and send to farmer for approval.</p>
              </div>

              <div className="flex gap-3 w-full md:w-auto">
                <button
                  onClick={handleSaveDraft}
                  className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Save size={23} /> Save Draft
                </button>

                <button
                  onClick={handleSendToFarmer}
                  disabled={isSending}
                  className={`px-8 py-3 rounded-lg font-bold shadow-lg flex items-center gap-2 transition-all
    ${
      isSending
        ? "bg-green-400 cursor-not-allowed"
        : "bg-green-600 hover:bg-green-700 text-white"
    }
  `}
                >
                  {isSending ? (
                    <>
                      <Loader2 className="animate-spin" size={22} />
                      Sending to Farmer...
                    </>
                  ) : (
                    <>
                      <Send size={23} />
                      Send to Farmer
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
          {/* WAITING FOR FARMER */}
          {status === "sent_to_farmer" && (
            <div className="sticky bottom-4 mx-auto max-w-4xl mt-6 bg-green-50 p-4 rounded-lg shadow-lg border border-green-200 flex items-center justify-between">
              <div className="text-sm text-green-800">
                <p className="font-bold">Waiting for Farmer Response</p>
                <p>
                  The contract has been sent and is awaiting farmer’s signature.
                </p>
              </div>

              <button
                disabled
                className="px-6 py-3 rounded-lg bg-green-200 text-green-700 font-bold cursor-not-allowed"
              >
                Awaiting Approval
              </button>
            </div>
          )}

          {/* ACTIVE (SIGNED BY BOTH) */}
          {status === "active" && (
            <div className="sticky bottom-4 mx-auto max-w-4xl mt-6 bg-emerald-50 p-4 rounded-lg shadow-lg border border-emerald-200 flex items-center justify-between">
              <div className="text-sm text-emerald-800">
                <p className="font-bold">Contract Active</p>
                <p>This contract is legally binding and locked.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
