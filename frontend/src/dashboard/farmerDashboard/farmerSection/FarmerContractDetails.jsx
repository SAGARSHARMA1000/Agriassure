
import React, { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import api from "../../../services/api";
import { FileText, Download, ShieldCheck } from "lucide-react";

export default function FarmerContracts() {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const res = await api.getFarmerContracts(user.id);
        setContracts(res.data);
      } catch (err) {
        console.error("❌ Failed to load contracts", err);
      }
    };

    fetchContracts();
  }, [user]);

  if (contracts.length === 0) {
    return (
      <div className="text-center text-gray-500">
        📄 No contracts received yet
      </div>
    );
  }

  const statusBadge = (status) => {
    const map = {
      draft: "bg-gray-100 text-gray-700",
      sent_to_farmer: "bg-blue-100 text-blue-700",
      active: "bg-emerald-100 text-emerald-700",
      completed: "bg-purple-100 text-purple-700"
    };
    return map[status] || "bg-gray-100 text-gray-600";
  };

  const formatStatus = (status) =>
    status.replaceAll("_", " ").toUpperCase();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
        <ShieldCheck className="text-emerald-600" />
        My Contracts
      </h2>

      {contracts.map((c) => (
        <div
          key={c._id}
          className="bg-white border rounded-xl shadow-sm p-6 space-y-4"
        >
          {/* HEADER */}
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {c.commodity} Contract
              </h3>
              <p className="text-sm text-gray-500">
                Buyer: {c.buyerName}
              </p>
            </div>

            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${statusBadge(
                c.status
              )}`}
            >
              {formatStatus(c.status)}
            </span>
          </div>

          {/* DETAILS */}
          <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-700">
            <p>
              <b>Quantity:</b> {c.quantity} {c.unit}
            </p>
            <p>
              <b>Price / Unit:</b> ₹{c.offerPrice}
            </p>
            <p>
              <b>Total Value:</b>{" "}
              ₹{(c.quantity * c.offerPrice).toLocaleString()}
            </p>
          </div>

          {/* ACTIONS */}
          <div className="flex flex-wrap gap-3 pt-2">
            {/* <button
              className="px-4 py-2 rounded-lg border text-sm font-medium hover:bg-gray-50"
              onClick={() =>
                window.open(`/dashboard/buyer/contracts/${c._id}`)
              }
            >
              View Contract
            </button> */}
                 {/* <div className="flex justify-center mt-4"> */}
               <button
                 onClick={() =>
                   navigate(`/dashboard/farmer/contracts/${c._id}`)
                 }
                className="px-4 py-2 rounded-lg border text-sm font-medium hover:bg-gray-50"
               >
                 View Contract
               </button>
             {/* </div> */}
            {c.pdf?.url && (
              <a
                href={c.pdf.url}
                download={`contract-${c._id}.pdf`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-bold flex items-center gap-2 hover:bg-emerald-700"
              >
                <Download size={23} /> Download PDF
              </a>
            )}
            {/* {c.status === "sent_to_farmer" && ( */}
       
           {/* )} */}
          </div>
        </div>
      ))}
    </div>
  );
}
