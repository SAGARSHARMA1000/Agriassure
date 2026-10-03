import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MoreVertical,
  Wheat,
  MapPin,
  Calendar,
  Sparkles,
  Tag,
  PlusCircle,
  TrendingUp,
  ShieldCheck,
  Trash2,
  Edit3,
  SlidersHorizontal,
  Search,
  CheckCircle,
} from "lucide-react";
import { useOutletContext, useNavigate } from "react-router-dom";
import EditListingModal from "./EditListingModal";
import api from "../../../services/api";

const FarmerListings = ({ listings: propListings }) => {
  const navigate = useNavigate();
  const outletContext = useOutletContext() || {};
  const listings = propListings || outletContext.listings || [];
  const fetchListings = outletContext.fetchListings || (() => {});
  const refreshMarketplace = outletContext.refreshMarketplace || (() => {});

  const [openMenu, setOpenMenu] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [deletingId, setDeletingId] = useState(null);
  const [successToast, setSuccessToast] = useState("");

  // Re-fetch listings on mount to guarantee up-to-date listings
  useEffect(() => {
    if (typeof fetchListings === "function") {
      fetchListings();
    }
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;

    setDeletingId(id);
    try {
      await api.deleteListing(id);
      if (typeof fetchListings === "function") await fetchListings();
      if (typeof refreshMarketplace === "function") await refreshMarketplace();
      setSuccessToast("Crop listing deleted successfully");
      setTimeout(() => setSuccessToast(""), 4000);
    } catch (err) {
      console.error("Delete listing error:", err);
      alert("Failed to delete listing. Please try again.");
    } finally {
      setDeletingId(null);
      setOpenMenu(null);
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest(".listing-menu-container")) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Filter listings
  const filteredListings = listings.filter((l) => {
    const matchesSearch =
      l.commodity?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.variety?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.farmAddress?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" ||
      l.cropCategory?.toLowerCase() === categoryFilter.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Toast message */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs"
          >
            <CheckCircle size={16} className="text-emerald-600 shrink-0" />
            {successToast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header controls bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Wheat className="text-emerald-600" size={22} /> My Crop Listings
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage your harvest listings, pricing, and live market offers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate("/dashboard/farmer/add")}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs flex items-center gap-2 transition cursor-pointer"
          >
            <PlusCircle size={15} /> Add New Crop
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      {listings.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-50/70 p-3 rounded-2xl border border-slate-200/80">
          <div className="relative w-full sm:w-72">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search by crop, variety, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-slate-800"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <SlidersHorizontal size={14} className="text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-emerald-500 grow sm:grow-0"
            >
              <option value="all">All Categories</option>
              <option value="Grains">Grains</option>
              <option value="Pulses">Pulses</option>
              <option value="Oilseeds">Oilseeds</option>
              <option value="Vegetables">Vegetables</option>
              <option value="Fruits">Fruits</option>
              <option value="Commercial">Commercial</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      )}

      {/* Empty State */}
      {listings.length === 0 ? (
        <div className="text-center py-16 px-6 bg-slate-50/60 rounded-3xl border border-dashed border-slate-200 max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Wheat size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">
            No Crop Listings Found
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-6">
            Publish your harvest to AgriAssure to connect directly with verified
            institutional buyers, receive competitive offers, and secure legally
            binding escrow contracts.
          </p>
          <button
            onClick={() => navigate("/dashboard/farmer/add")}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md transition transform hover:-translate-y-0.5 cursor-pointer"
          >
            <PlusCircle size={16} /> Add Your First Crop Listing
          </button>
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-xs">
          No crop listings match your search or filter criteria.
        </div>
      ) : (
        /* Listings Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredListings.map((listing, index) => (
            <motion.div
              key={listing._id || listing.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition duration-200 overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Image & Badges Banner */}
                <div className="relative h-44 w-full bg-slate-100 overflow-hidden group">
                  {listing.image ? (
                    <img
                      src={listing.image}
                      alt={listing.commodity}
                      className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.parentElement.classList.add(
                          "flex",
                          "items-center",
                          "justify-center"
                        );
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100">
                      <Wheat size={36} className="mb-1 text-slate-300" />
                      <span className="text-[11px]">Crop Harvest</span>
                    </div>
                  )}

                  {/* Status & Category Badge */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/90 backdrop-blur-xs text-emerald-800 border border-emerald-200 shadow-xs">
                      {listing.cropCategory || "Grains"}
                    </span>
                    {listing.organicCertified && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-700 text-white shadow-xs flex items-center gap-1">
                        <Sparkles size={10} /> Organic
                      </span>
                    )}
                  </div>

                  {/* 3-Dot Options Menu */}
                  <div className="absolute top-3 right-3 listing-menu-container">
                    <button
                      onClick={() =>
                        setOpenMenu(
                          openMenu === (listing._id || listing.id)
                            ? null
                            : listing._id || listing.id
                        )
                      }
                      className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs hover:bg-white text-slate-700 flex items-center justify-center shadow-md transition cursor-pointer"
                      aria-label="Listing options"
                    >
                      <MoreVertical size={16} />
                    </button>

                    {openMenu === (listing._id || listing.id) && (
                      <div className="absolute right-0 mt-1 w-36 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 py-1 overflow-hidden animate-in fade-in duration-150">
                        <button
                          onClick={() => {
                            setOpenMenu(null);
                            setSelectedListing(listing);
                            setIsEditOpen(true);
                          }}
                          className="w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition text-left"
                        >
                          <Edit3 size={14} className="text-emerald-600" /> Edit Listing
                        </button>
                        <button
                          onClick={() => handleDelete(listing._id || listing.id)}
                          disabled={deletingId === (listing._id || listing.id)}
                          className="w-full px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer transition text-left border-t border-slate-100"
                        >
                          <Trash2 size={14} className="text-red-500" />
                          {deletingId === (listing._id || listing.id)
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Price Tag Overlay */}
                  <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-xs text-white px-2.5 py-1 rounded-xl shadow-md">
                    <div className="text-[10px] text-slate-300 leading-none">Price</div>
                    <div className="text-sm font-extrabold text-emerald-400">
                      ₹{listing.price}
                      <span className="text-[10px] font-normal text-slate-300 ml-1">
                        / {listing.unit || "quintal"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-4 space-y-3">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {listing.commodity}
                      </h3>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 shrink-0">
                        {listing.quality || "Grade A"}
                      </span>
                    </div>
                    {listing.variety && (
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        Variety: {listing.variety}
                      </p>
                    )}
                  </div>

                  {/* Crop Specifications */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Available Qty
                      </span>
                      <span className="font-bold text-slate-800">
                        {listing.quantity}{" "}
                        {!String(listing.quantity).includes(listing.unit || "")
                          ? listing.unit || "quintal"
                          : ""}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Negotiation
                      </span>
                      {listing.negotiationAllowed ? (
                        <span className="text-emerald-700 font-bold text-[11px]">
                          ₹{listing.minPrice || listing.price} - ₹
                          {listing.maxPrice || listing.price}
                        </span>
                      ) : (
                        <span className="text-slate-600 font-semibold text-[11px]">
                          Fixed Price
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Address & Harvest Date */}
                  <div className="space-y-1 text-xs text-slate-500">
                    <p className="flex items-center gap-1.5 truncate">
                      <MapPin size={13} className="text-emerald-600 shrink-0" />
                      <span className="truncate">{listing.farmAddress}</span>
                    </p>
                    {listing.harvestDate && (
                      <p className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-slate-400 shrink-0" />
                        <span>Harvest: {listing.harvestDate}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="p-3 pt-0 flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedListing(listing);
                    setIsEditOpen(true);
                  }}
                  className="flex-1 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Edit3 size={13} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(listing._id || listing.id)}
                  disabled={deletingId === (listing._id || listing.id)}
                  className="py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-500 text-xs font-bold transition flex items-center justify-center cursor-pointer"
                  title="Delete Listing"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Edit Listing Modal */}
      <EditListingModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedListing(null);
        }}
        listing={selectedListing}
        fetchListings={fetchListings}
        refreshMarketplace={refreshMarketplace}
      />
    </div>
  );
};

export default FarmerListings;
