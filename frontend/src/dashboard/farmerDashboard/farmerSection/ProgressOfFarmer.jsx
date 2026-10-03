// Same imports & UI components as Buyer
import React from 'react';
import {
  CheckCircle,
  FileText,
  Handshake,
  Sprout,
  Truck,
  DollarSign,
  AlertCircle,
  Download
} from 'lucide-react';
import { CONTRACT_STATUS_ORDER } from '../../utils/contractStatus';

const PROCESS_STEPS = [
  {
    key: "OFFER_ACCEPTED",
    title: "Offer Accepted",
    description: "You accepted the buyer’s purchase offer.",
    icon: Handshake,
    details: "Prepare for contract execution."
  },
  {
    key: "CONTRACT_SIGNED",
    title: "Contract Signed",
    description: "Contract signed and locked.",
    icon: FileText,
    details: "You are now obligated to supply the crop."
  },
  {
    key: "ADVANCE_PAID",
    title: "Advance Payment Received",
    description: "Advance payment secured in escrow.",
    icon: DollarSign,
    details: "Funds will be released after delivery."
  },
  {
    key: "CULTIVATION",
    title: "Cultivation Phase",
    description: "Cultivate crops as per contract terms.",
    icon: Sprout,
    details: "Maintain quality and update progress."
  },
  {
    key: "DELIVERY",
    title: "Delivery Phase",
    description: "Deliver crops for inspection.",
    icon: Truck,
    details: "Ensure timely delivery."
  },
  {
    key: "SETTLEMENT",
    title: "Final Payment Received",
    description: "Payment settled successfully.",
    icon: CheckCircle,
    details: "Contract completed."
  }
];

/* ---------- SHARED UI COMPONENTS (UNCHANGED) ---------- */

const StepIcon = ({ status, Icon }) => {
  if (status === 'completed') {
    return (
      <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-200 z-10 border-4 border-white">
        <CheckCircle size={20} />
      </div>
    );
  }
  if (status === 'current') {
    return (
      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-200 z-10 border-4 border-white animate-pulse">
        <Icon size={20} />
      </div>
    );
  }
  return (
    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 z-10 border-4 border-white">
      <Icon size={20} />
    </div>
  );
};

const StepContent = ({ step, isLast }) => {
  const isCompleted = step.status === 'completed';
  const isCurrent = step.status === 'current';

  return (
    <div className={`flex-1 ml-4 ${isLast ? '' : 'pb-10'}`}>
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h4 className={`text-lg font-bold ${isCompleted ? 'text-gray-800' : isCurrent ? 'text-blue-700' : 'text-gray-500'}`}>
              {step.title}
            </h4>
          </div>
          <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase ${
            isCompleted ? 'bg-emerald-100 text-emerald-700'
              : isCurrent ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-500'
          }`}>
            {step.status}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-3">{step.description}</p>

        <div className={`p-3 rounded-lg text-sm border ${
          isCurrent ? 'bg-blue-50 border-blue-100 text-blue-800'
            : 'bg-gray-50 border-gray-100 text-gray-600'
        }`}>
          <div className="flex items-start gap-2">
            <AlertCircle size={16} />
            <span>{step.details}</span>
          </div>
        </div>

        {step.action && (
          <div className="mt-4 pt-3 border-t flex gap-2">
            <button className="flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">
              <FileText size={14} /> {step.action}
            </button>
            <button className="flex items-center gap-2 text-xs font-semibold text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
              <Download size={14} /> Receipt
            </button>
          </div>
        )}
      </div>
    </div>
  );
};



export default function ProgressOfFarmer({ contractStatus }) {
  const currentIndex = CONTRACT_STATUS_ORDER.indexOf(contractStatus);

  const processedSteps = PROCESS_STEPS.map((step, index) => ({
    ...step,
    status:
      index < currentIndex ? 'completed'
      : index === currentIndex ? 'current'
      : 'upcoming'
  }));

  return (
    <div className="p-6">
      <div className="relative">
        <div className="absolute left-5 top-4 bottom-4 w-0.5 bg-gray-200" />

        {processedSteps.map((step, index) => (
          <div key={step.key} className="relative flex">
            <StepIcon status={step.status} Icon={step.icon} />
            <StepContent step={step} isLast={index === PROCESS_STEPS.length - 1} />
          </div>
        ))}
      </div>
    </div>
  );
}
