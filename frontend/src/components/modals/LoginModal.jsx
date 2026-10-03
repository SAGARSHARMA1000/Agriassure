import React, { useState, useEffect } from "react";
import { X, Phone, Lock, AlertCircle, Loader2 } from "lucide-react";
import api from "../../services/api"; // ✅ REAL API

const LoginModal = ({ isOpen, onClose, onLogin }) => {
  const [role, setRole] = useState("farmer");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setRole("farmer");
      setPhone("");
      setPassword("");
      setError("");
      setIsLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // 🔥 REAL BACKEND CALL
      const resp = await api.login({
        phone,
        password
      });

      const { user, token } = resp.data || {};
     // console.log("✅ Login success user from backend:", user);

      if (!user || user.role !== role) {
        setError("Role mismatch. Please select correct role.");
        setIsLoading(false);
        return;
      }

      // ✅ Save auth (optional but recommended)
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // 🔁 Send user to App.js
      onLogin(user);
      onClose();

    } catch (err) {
      console.error("Login failed:", err);

      if (err.response?.status === 401) {
        setError("Invalid credentials. Please try again.");
      } else if (err.response?.status === 404) {
        setError("User not found. Please register first.");
      } else {
        setError("Server error. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-cover bg-center backdrop-blur-sm p-4"
  //   style={{
  //   backgroundImage:
  //     "url('https://res.cloudinary.com/dtbuqsryl/image/upload/v1771403701/Gemini_Generated_Image_ltuieeltuieeltui_bnu3ct.png')",
  // }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
        
        <div className="bg-green-700 p-6 flex justify-between items-center">
          <h3 className="text-white font-bold text-xl">Login to Agriassure</h3>
          <button onClick={onClose} className="text-green-100 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="p-8">

          {/* ROLE TABS */}
          <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
            {["farmer", "buyer", "admin"].map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`flex-1 py-2 text-sm font-bold rounded-md capitalize transition-all ${
                  role === r
                    ? "bg-white text-green-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin} className="space-y-4">

            {/* PHONE */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  required
                  type="tel"
                  className="w-full border border-gray-300 rounded-lg p-2.5 pl-10 focus:ring-2 focus:ring-green-500 outline-none"
                  placeholder="Enter registered mobile"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  required
                  type="password"
                  className="w-full border border-gray-300 rounded-lg p-2.5 pl-10 focus:ring-2 focus:ring-green-500 outline-none"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition flex justify-center items-center gap-2 disabled:opacity-70"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                "Secure Login"
              )}
            </button>
          </form>

          {/* GOOGLE LOGIN (NO CHANGE – FUTURE READY) */}
          <div className="mt-4 text-center text-sm text-gray-500">
            Login via Google (Coming Soon)
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginModal;
