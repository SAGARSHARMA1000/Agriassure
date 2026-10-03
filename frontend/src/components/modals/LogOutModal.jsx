import React from "react";

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-[90%] max-w-md p-6 animate-fadeIn">
        
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Confirm Logout
        </h2>

        <p className="text-gray-500 mb-6">
          Are you sure you want to logout from your account?
        </p>

        <div className="flex gap-3">
          {/* Cancel */}
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl border border-gray-300 text-gray-600 font-medium hover:bg-gray-100"
          >
            Cancel
          </button>

          {/* Logout */}
          <button
            onClick={onConfirm}
            className="w-full py-2 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;