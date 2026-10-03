import React, { useState } from "react";
import api from "../../../services/api";
import { useOutletContext, useNavigate } from "react-router-dom";
import { Upload, Wheat, CheckCircle2, AlertCircle } from "lucide-react";

const AddListingForm = ({ user, onListingCreated }) => {
  const navigate = useNavigate();
  const outletContext = useOutletContext() || {};

  // Get active user from props or outlet context fallback
  const currentUser = user || outletContext.user || { id: "f1", name: "Demo Farmer" };
  const fetchListings = outletContext.fetchListings || (() => {});
  const refreshMarketplace = outletContext.refreshMarketplace || (() => {});

  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [formData, setFormData] = useState({
    commodity: "",
    cropCategory: "Grains",
    quantity: "",
    price: "",
    unit: "quintal",
    quality: "Grade A",
    farmAddress: "",
    harvestDate: "",
    organicCertified: false,
    description: "",
    negotiationAllowed: false,
    minPrice: "",
    maxPrice: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // 🌾 STRICT CROP IMAGE REQUIREMENT
    if (!imageFile) {
      setError("Crop image is strictly required. Please select a photo of your crop.");
      return;
    }

    if (!formData.commodity || !formData.quantity || !formData.price || !formData.farmAddress) {
      setError("Please fill in all required fields (Commodity, Quantity, Price, Farm Location).");
      return;
    }

    // Negotiation validation
    if (formData.negotiationAllowed) {
      if (!formData.minPrice || !formData.maxPrice) {
        setError("Please specify min and max price for negotiation.");
        return;
      }
      if (Number(formData.minPrice) > Number(formData.maxPrice)) {
        setError("Min price cannot be greater than max price.");
        return;
      }
    }

    setLoading(true);

    try {
      const farmerId = currentUser?.id || currentUser?._id || "f1";
      const farmerName = currentUser?.name || currentUser?.fullName || "Demo Farmer";

      const payload = {
        commodity: formData.commodity,
        cropCategory: formData.cropCategory,
        quantity: formData.quantity,
        unit: formData.unit,
        price: Number(formData.price),
        quality: formData.quality,
        farmAddress: formData.farmAddress.trim(),
        harvestDate: formData.harvestDate,
        organicCertified: formData.organicCertified,
        description: formData.description,
        negotiationAllowed: formData.negotiationAllowed,
        farmerId,
        farmerName,

        ...(formData.negotiationAllowed && {
          minPrice: Number(formData.minPrice),
          maxPrice: Number(formData.maxPrice),
        }),
      };

      const formDataToSend = new FormData();
      for (let key in payload) {
        formDataToSend.append(key, payload[key]);
      }

      // Append required image file
      formDataToSend.append("image", imageFile);

     // console.log("📤 [AddListingForm] Submitting crop listing payload:", payload);

      const response = await api.createListing(formDataToSend);
      // console.log("✅ [AddListingForm] Listing created:", response.data);

      if (onListingCreated) {
        onListingCreated(response.data);
      }

      if (typeof fetchListings === "function") fetchListings();
      if (typeof refreshMarketplace === "function") refreshMarketplace();

      navigate("/dashboard/farmer/listings", {
        state: { refresh: true },
      });
    } catch (err) {
      console.error("❌ Listing creation failed:", err);
      const serverMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to publish listing. Please try again.";
      setError(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex justify-center px-4 sm:px-6 lg:px-8 min-h-screen py-10 bg-slate-50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-3xl
        bg-white border border-slate-200
        p-6 sm:p-10 rounded-3xl shadow-xl
        space-y-6 text-slate-800"
      >
        <div className="border-b border-slate-100 pb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Wheat size={14} /> Farmer Crop Portal
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Publish Crop Listing
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            List your harvest on AgriAssure to connect directly with verified commodity buyers.
          </p>
        </div>

        {/* 📸 REQUIRED CROP IMAGE UPLOAD */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Crop Photo <span className="text-red-500 font-bold">* Required</span>
          </label>
          
          <div className="relative border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-2xl p-6 text-center bg-emerald-50/40 transition cursor-pointer">
            <input
              required
              type="file"
              accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setImageFile(file);
                  setImagePreview(URL.createObjectURL(file));
                  setError("");
                }
              }}
            />

            {imagePreview ? (
              <div className="space-y-3">
                <img
                  src={imagePreview}
                  alt="Crop Preview"
                  className="w-full max-h-56 object-cover rounded-xl shadow-md mx-auto border border-emerald-200"
                />
                <p className="text-xs text-emerald-700 font-semibold flex items-center justify-center gap-1">
                  <CheckCircle2 size={14} /> Photo selected ({imageFile?.name}). Click to change.
                </p>
              </div>
            ) : (
              <div className="space-y-2 py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <Upload size={24} />
                </div>
                <p className="text-sm font-bold text-slate-800">
                  Upload a clear photo of your crop <span className="text-red-500">*</span>
                </p>
                <p className="text-xs text-slate-500">
                  Supports JPG, PNG, WEBP (Max 10MB)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Commodity & Crop Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Commodity Name <span className="text-red-500">*</span>
            </label>
            <input
              required
              placeholder="e.g. Sharbati Wheat, Soybean, Mustard"
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 text-sm font-medium"
              value={formData.commodity}
              onChange={(e) => setFormData({ ...formData, commodity: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Crop Category
            </label>
            <select
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 text-sm font-medium"
              value={formData.cropCategory}
              onChange={(e) => setFormData({ ...formData, cropCategory: e.target.value })}
            >
              <option value="Grains">Grains (अनाज)</option>
              <option value="Pulses">Pulses (दालें)</option>
              <option value="Oilseeds">Oilseeds (तिलहन)</option>
              <option value="Vegetables">Vegetables (सब्जियां)</option>
              <option value="Fruits">Fruits (फल)</option>
              <option value="Commercial">Commercial Crops</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Quantity, Unit & Price */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Quantity Available <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="number"
              placeholder="e.g. 500"
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 text-sm font-medium"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Unit
            </label>
            <select
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 text-sm font-medium"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            >
              <option value="quintal">Quintal (कुंतल)</option>
              <option value="kg">Kg (किलो)</option>
              <option value="tons">Tons (टन)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Price (₹ per unit) <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="number"
              placeholder="e.g. 2450"
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 text-sm font-bold"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
          </div>
        </div>

        {/* Quality Grade & Harvest Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Quality Grade
            </label>
            <select
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 text-sm font-medium"
              value={formData.quality}
              onChange={(e) => setFormData({ ...formData, quality: e.target.value })}
            >
              <option value="Grade A">Grade A (Premium)</option>
              <option value="Grade B">Grade B (Standard)</option>
              <option value="Organic">Organic Certified</option>
              <option value="Export Grade">Export Grade</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Harvest / Ready Date
            </label>
            <input
              type="date"
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 text-sm font-medium"
              value={formData.harvestDate}
              onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
            />
          </div>
        </div>

        {/* Farm Pickup Location */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Farm / Storage Address <span className="text-red-500">*</span>
          </label>
          <input
            required
            placeholder="e.g. Village Sehore, District Sehore, Madhya Pradesh"
            className="w-full p-3 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 text-sm font-medium"
            value={formData.farmAddress}
            onChange={(e) => setFormData({ ...formData, farmAddress: e.target.value })}
          />
        </div>

        {/* Checkboxes: Organic & Negotiation */}
        <div className="flex flex-wrap items-center gap-6 pt-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.organicCertified}
              onChange={(e) => setFormData({ ...formData, organicCertified: e.target.checked })}
              className="w-4 h-4 accent-emerald-600 rounded"
            />
            Organic Certified Crop
          </label>

          <label className="flex items-center gap-2 text-sm font-semibold text-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.negotiationAllowed}
              onChange={(e) => setFormData({ ...formData, negotiationAllowed: e.target.checked })}
              className="w-4 h-4 accent-emerald-600 rounded"
            />
            Allow Price Negotiation
          </label>
        </div>

        {/* Price Range Inputs if Negotiation Allowed */}
        {formData.negotiationAllowed && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 mb-1">
                Minimum Counter Offer (₹)
              </label>
              <input
                type="number"
                placeholder="Min Price"
                className="w-full p-3 rounded-xl bg-white border border-emerald-300 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 text-sm font-semibold"
                value={formData.minPrice}
                onChange={(e) => setFormData({ ...formData, minPrice: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 mb-1">
                Maximum Counter Offer (₹)
              </label>
              <input
                type="number"
                placeholder="Max Price"
                className="w-full p-3 rounded-xl bg-white border border-emerald-300 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 text-sm font-semibold"
                value={formData.maxPrice}
                onChange={(e) => setFormData({ ...formData, maxPrice: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* Crop Description */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Crop Description / Quality Notes
          </label>
          <textarea
            rows="3"
            placeholder="Add details about moisture content, packaging, or crop quality..."
            className="w-full p-3 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 text-sm resize-none"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-semibold flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-2">
          <button
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? "Publishing Listing..." : "Publish Crop Listing"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddListingForm;