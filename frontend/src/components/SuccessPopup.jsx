import React, { useEffect } from "react";
import { CheckCircle } from "lucide-react";

const SuccessPopup = ({ message, onClose }) => {

  useEffect(() => {
    const timer = setTimeout(() => onClose(), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center 
      bg-black/30 backdrop-blur-sm z-200">

      <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center
        animate-[fadeIn_0.4s_ease]">

        <CheckCircle className="text-green-600" size={70} />
        
        <h2 className="mt-4 text-xl font-bold text-gray-800">
          {message || "Success!"}
        </h2>

        <div className="mt-2 text-gray-600 text-sm">
          Redirecting...
        </div>
      </div>
    </div>
  );
};

export default SuccessPopup;
