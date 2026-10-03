import React, { useState, useEffect } from "react";
import { X, Sprout, Briefcase, ShieldCheck } from "lucide-react";
import api from "../../services/api"; // ✅ REAL API
import SuccessPopup from "../SuccessPopup"; // ✅ REAL API

const RegistrationModal = ({ isOpen, onClose, onRegisteredDemo }) => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    phone: "",
    password: "",
    cropSpecialty: "",
    businessName: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // ⭐ Reset modal every time it opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setRole(null);
      setFormData({
        name: "",
        location: "",
        phone: "",
        password: "",
        cropSpecialty: "",
        businessName: ""
      });
      setShowSuccess(false);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = { ...formData, role };
    //console.log("🚀 Frontend payload:", payload);


    try {
      const resp = await api.register(payload);

      const backendUser = resp?.data?.user || {};

      // ⭐ Force correct role + full user object
      const finalUser = {
        id: backendUser.id || Date.now().toString(),
        name: backendUser.name || formData.name,
        role: role, // VERY IMPORTANT
        location: backendUser.location || formData.location,
        phone: formData.phone,
        businessName: formData.businessName,
        cropSpecialty: formData.cropSpecialty
      };

      setShowSuccess(true);

      setTimeout(() => {
        onRegisteredDemo(finalUser);
        onClose();
      }, );

    } catch (err) {
      console.warn("Registration failed. Using fallback:", err);

      const fallbackUser = {
        id: Date.now().toString(),
        ...formData,
        role
      };

      setShowSuccess(true);

      setTimeout(() => {
        onRegisteredDemo(fallbackUser);
        onClose();
      }, 1200);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center 
     backdrop-blur-sm
       p-4">

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

        {/* HEADER */}
        <div className="bg-green-700 p-4 flex justify-between items-center">
          <h3 className="text-white font-bold text-lg">
            {step === 1
              ? "Choose Account Type"
              : `Register as ${role?.charAt(0).toUpperCase() + role?.slice(1)}`}
          </h3>

          <button onClick={onClose} className="text-green-100 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-8">
          {step === 1 ? (
            // STEP 1 — Select role
            <div className="grid gap-4">

              <button
                onClick={() => handleRoleSelect("farmer")}
                className="flex items-center p-4 border-2 border-green-100 rounded-xl
                hover:border-green-500 hover:bg-green-50 transition group"
              >
                <div className="bg-green-100 p-3 rounded-full mr-4 group-hover:bg-green-200">
                  <Sprout className="text-green-700" />
                </div>
                <div>
                  <span className="block font-bold text-gray-800">I am a Farmer</span>
                  <span className="text-xs text-gray-500">Sell produce, manage listings</span>
                </div>
              </button>

              <button
                onClick={() => handleRoleSelect("buyer")}
                className="flex items-center p-4 border-2 border-blue-100 rounded-xl
                hover:border-blue-500 hover:bg-blue-50 transition group"
              >
                <div className="bg-blue-100 p-3 rounded-full mr-4 group-hover:bg-blue-200">
                  <Briefcase className="text-blue-700" />
                </div>
                <div>
                  <span className="block font-bold text-gray-800">I am a Buyer/Trader</span>
                  <span className="text-xs text-gray-500">Buy crops, send proposals</span>
                </div>
              </button>

              <button
                onClick={() => handleRoleSelect("admin")}
                className="flex items-center p-4 border-2 border-gray-100 rounded-xl
                hover:border-gray-500 hover:bg-gray-50 transition group"
              >
                <div className="bg-gray-100 p-3 rounded-full mr-4 group-hover:bg-gray-200">
                  <ShieldCheck className="text-gray-700" />
                </div>
                <div>
                  <span className="block font-bold text-gray-800">Admin</span>
                  <span className="text-xs text-gray-500">Manage platform</span>
                </div>
              </button>

            </div>
          ) : (
            // STEP 2 — Form
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  required
                  type="text"
                  className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-green-500"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              {/* Business Name for Buyer */}
              {role === "buyer" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Name
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-green-500"
                    value={formData.businessName}
                    onChange={(e) =>
                      setFormData({ ...formData, businessName: e.target.value })
                    }
                  />
                </div>
              )}

              {/* Phone + Location */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    required
                    type="tel"
                    className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-green-500"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-green-500"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  required
                  type="password"
                  minLength={6}
                  className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-green-500"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>

              {/* Crops for Farmer */}
              {role === "farmer" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Primary Crops
                  </label>
                  <input
                    type="text"
                    className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-green-500"
                    placeholder="e.g. Wheat, Rice"
                    value={formData.cropSpecialty}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cropSpecialty: e.target.value
                      })
                    }
                  />
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 py-2.5 border rounded-lg font-medium hover:bg-gray-50"
                >
                  Back
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 py-2.5 bg-green-600 text-white rounded-lg 
                  font-bold hover:bg-green-700"
                >
                  {loading ? "Registering..." : "Complete Registration"}
                </button>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}
            </form>
          )}
        </div>
      </div>

      {/* SUCCESS POPUP */}
      {showSuccess && (
        <SuccessPopup message="Registration Successful!" onClose={() => {}} />
      )}

    </div>
  );
};

export default RegistrationModal;
          