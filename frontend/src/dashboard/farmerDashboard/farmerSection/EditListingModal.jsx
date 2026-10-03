import React, { useState, useEffect } from "react";
import api from "../../../services/api";
import { X, Edit3, Upload, Wheat, CheckCircle2, AlertCircle } from "lucide-react";

const EditListingModal = ({ isOpen, onClose, listing, fetchListings, refreshMarketplace }) => {
  const [form, setForm] = useState({
    commodity: "",
    cropCategory: "Grains",
    quantity: "",
    unit: "quintal",
    price: "",
    quality: "Grade A",
    farmAddress: "",
    harvestDate: "",
    organicCertified: false,
    description: "",
    negotiationAllowed: false,
    minPrice: "",
    maxPrice: "",
    image: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  /* PREFILL FORM */
  useEffect(() => {
    if (listing) {
      setForm({
        commodity: listing.commodity || "",
        cropCategory: listing.cropCategory || "Grains",
        quantity: listing.quantity ? String(listing.quantity).split(" ")[0] : "",
        unit: listing.unit || (listing.quantity ? String(listing.quantity).split(" ")[1] : "quintal"),
        price: listing.price || "",
        quality: listing.quality || "Grade A",
        farmAddress: listing.farmAddress || listing.location || "",
        harvestDate: listing.harvestDate || "",
        organicCertified: listing.organicCertified || false,
        description: listing.description || "",
        negotiationAllowed: listing.negotiationAllowed || false,
        minPrice: listing.minPrice || "",
        maxPrice: listing.maxPrice || "",
        image: listing.image || "",
      });
      setImagePreview(listing.image || null);
      setImageFile(null);
      setErrors({});
    }
  }, [listing]);

  /* VALIDATION */
  const validate = () => {
    const err = {};

    if (!form.commodity.trim()) err.commodity = "Crop name is required";
    if (!form.quantity) err.quantity = "Quantity is required";
    if (!form.price || Number(form.price) <= 0) err.price = "Valid price required";
    if (!form.farmAddress.trim()) err.farmAddress = "Farm location required";

    if (form.negotiationAllowed) {
      if (!form.minPrice || !form.maxPrice) {
        err.negotiation = "Min and Max prices are required for negotiation";
      } else if (Number(form.minPrice) > Number(form.maxPrice)) {
        err.negotiation = "Min price cannot be greater than max price";
      }
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  /* SUBMIT */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || submitting) return;

    setSubmitting(true);

    try {
      // If new image file selected, use FormData; else use JSON
      if (imageFile) {
        const formData = new FormData();
        formData.append("commodity", form.commodity);
        formData.append("cropCategory", form.cropCategory);
        formData.append("quantity", `${form.quantity} ${form.unit}`);
        formData.append("unit", form.unit);
        formData.append("price", Number(form.price));
        formData.append("quality", form.quality);
        formData.append("farmAddress", form.farmAddress);
        formData.append("harvestDate", form.harvestDate);
        formData.append("organicCertified", form.organicCertified);
        formData.append("description", form.description);
        formData.append("negotiationAllowed", form.negotiationAllowed);

        if (form.negotiationAllowed) {
          formData.append("minPrice", Number(form.minPrice));
          formData.append("maxPrice", Number(form.maxPrice));
        }

        formData.append("image", imageFile);
        await api.updateListing(listing._id || listing.id, formData);
      } else {
        const updatePayload = {
          commodity: form.commodity,
          cropCategory: form.cropCategory,
          quantity: `${form.quantity} ${form.unit}`,
          unit: form.unit,
          price: Number(form.price),
          quality: form.quality,
          farmAddress: form.farmAddress,
          harvestDate: form.harvestDate,
          organicCertified: form.organicCertified,
          description: form.description,
          negotiationAllowed: form.negotiationAllowed,
          ...(form.negotiationAllowed && {
            minPrice: Number(form.minPrice),
            maxPrice: Number(form.maxPrice),
          }),
        };

        await api.updateListing(listing._id || listing.id, updatePayload);
      }

      if (typeof fetchListings === "function") fetchListings();
      if (typeof refreshMarketplace === "function") refreshMarketplace();
      onClose();
    } catch (err) {
      console.error("Update listing error:", err);
      setErrors({ submit: err?.response?.data?.message || "Failed to update listing. Try again." });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !listing) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto custom-scrollbar p-6 sm:p-8 shadow-2xl text-slate-800 animate-fadeIn">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
              <Edit3 size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Edit Crop Listing</h2>
              <p className="text-xs text-slate-500">
                Update information for <span className="font-semibold text-emerald-700">{listing.commodity}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 text-slate-400 hover:text-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          {/* CROP PHOTO UPDATE */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Crop Image
            </label>
            <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Crop"
                  className="w-16 h-16 object-cover rounded-xl border border-slate-200 shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                  <Wheat size={24} />
                </div>
              )}

              <div className="grow">
                <input
                  type="file"
                  accept="image/*"
                  id="edit-listing-image"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setImageFile(file);
                      setImagePreview(URL.createObjectURL(file));
                    }
                  }}
                />
                <label
                  htmlFor="edit-listing-image"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer"
                >
                  <Upload size={14} /> Change Photo
                </label>
                <span className="block text-[11px] text-slate-400 mt-1">Select a new image to replace current photo</span>
              </div>
            </div>
          </div>

          {/* COMMODITY & CATEGORY */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Crop Name *
              </label>
              <input
                type="text"
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 font-medium"
                value={form.commodity}
                onChange={(e) => setForm({ ...form, commodity: e.target.value })}
              />
              {errors.commodity && <p className="text-red-500 text-[11px] mt-1">{errors.commodity}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Category
              </label>
              <select
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 font-medium"
                value={form.cropCategory}
                onChange={(e) => setForm({ ...form, cropCategory: e.target.value })}
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

          {/* QUANTITY, UNIT & PRICE */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 font-medium"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              />
              {errors.quantity && <p className="text-red-500 text-[11px] mt-1">{errors.quantity}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Unit
              </label>
              <select
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 font-medium"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
              >
                <option value="quintal">Quintal</option>
                <option value="kg">Kg</option>
                <option value="tons">Tons</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Price (₹ / unit) *
              </label>
              <input
                type="number"
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 font-bold"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
              {errors.price && <p className="text-red-500 text-[11px] mt-1">{errors.price}</p>}
            </div>
          </div>

          {/* QUALITY & LOCATION */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Quality Grade
              </label>
              <select
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 font-medium"
                value={form.quality}
                onChange={(e) => setForm({ ...form, quality: e.target.value })}
              >
                <option value="Grade A">Grade A (Premium)</option>
                <option value="Grade B">Grade B (Standard)</option>
                <option value="Organic">Organic Certified</option>
                <option value="Export Grade">Export Grade</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Farm Address *
              </label>
              <input
                type="text"
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 font-medium"
                value={form.farmAddress}
                onChange={(e) => setForm({ ...form, farmAddress: e.target.value })}
              />
              {errors.farmAddress && <p className="text-red-500 text-[11px] mt-1">{errors.farmAddress}</p>}
            </div>
          </div>

          {/* NEGOTIATION TOGGLE & RANGE */}
          <div className="pt-2 space-y-3">
            <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={form.negotiationAllowed}
                onChange={(e) => setForm({ ...form, negotiationAllowed: e.target.checked })}
                className="w-4 h-4 accent-emerald-600 rounded"
              />
              Allow Price Negotiation
            </label>

            {form.negotiationAllowed && (
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                <div>
                  <label className="block text-xs font-bold text-emerald-900 mb-1">Min Price (₹)</label>
                  <input
                    type="number"
                    className="w-full p-2 rounded-xl bg-white border border-emerald-300 font-semibold"
                    value={form.minPrice}
                    onChange={(e) => setForm({ ...form, minPrice: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-emerald-900 mb-1">Max Price (₹)</label>
                  <input
                    type="number"
                    className="w-full p-2 rounded-xl bg-white border border-emerald-300 font-semibold"
                    value={form.maxPrice}
                    onChange={(e) => setForm({ ...form, maxPrice: e.target.value })}
                  />
                </div>
                {errors.negotiation && (
                  <p className="col-span-2 text-red-600 text-xs font-medium">{errors.negotiation}</p>
                )}
              </div>
            )}
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Description / Quality Notes
            </label>
            <textarea
              rows="2"
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 resize-none font-medium"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          {/* SUBMIT ERROR */}
          {errors.submit && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0 text-red-600" />
              <span>{errors.submit}</span>
            </div>
          )}

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl font-semibold transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold transition shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
            >
              {submitting ? "Updating..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditListingModal;
