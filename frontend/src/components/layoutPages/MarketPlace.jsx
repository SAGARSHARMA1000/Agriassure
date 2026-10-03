import React, { useState, useMemo, useEffect } from "react";
import {
  Filter,
  BarChart3,
  MapPin,
  User,
  Wheat,
  Star,
  Search,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  ShieldCheck,
  Bookmark,
  BookmarkCheck,
  Truck,
  Grid,
  List,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Tag,
  Info,
  Calendar,
  IndianRupee,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import ProposalModal from "../modals/ProposalModal";
import "./MarketPlace.css";

const Marketplace = ({ listings = [], user, onSendProposal }) => {
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCrop, setSelectedCrop] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedQuality, setSelectedQuality] = useState("");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 20000 });
  const [negotiableOnly, setNegotiableOnly] = useState(false);
  const [savedOnly, setSavedOnly] = useState(false);

  // Sorting & View Mode
  const [sortBy, setSortBy] = useState("newest"); // "price-low", "price-high", "quantity-high", "rating-high", "newest"
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"

  // UI Modals & Interaction States
  const [selectedListing, setSelectedListing] = useState(null); // For proposal modal
  const [quickViewItem, setQuickViewItem] = useState(null); // For detail drawer modal
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem("agri_marketplace_favs");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Ratings State (persistent in local storage)
  const [ratings, setRatings] = useState(() => {
    try {
      const saved = localStorage.getItem("agri_marketplace_ratings");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Sync favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("agri_marketplace_favs", JSON.stringify(favorites));
    } catch (e) {
      console.error("Failed to save favorites", e);
    }
  }, [favorites]);

  // Sync ratings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("agri_marketplace_ratings", JSON.stringify(ratings));
    } catch (e) {
      console.error("Failed to save ratings", e);
    }
  }, [ratings]);

  // All listings memoized
  const allListings = useMemo(() => {
    return Array.isArray(listings) ? listings : [];
  }, [listings]);

  // Max price calculation from dataset
  const maxDatasetPrice = useMemo(() => {
    if (allListings.length === 0) return 10000;
    const maxVal = Math.max(...allListings.map((l) => Number(l.price) || 0));
    return maxVal > 0 ? maxVal : 10000;
  }, [allListings]);

  // Unique Crops from DB
  const uniqueCrops = useMemo(() => {
    const crops = allListings
      .filter((l) => l?.commodity)
      .map((l) => l.commodity.trim().split(" ")[0]);
    return [...new Set(crops)];
  }, [allListings]);

  // Unique States / Locations from DB
  const uniqueStates = useMemo(() => {
    const locations = allListings
      .filter((l) => l?.farmAddress || l?.location)
      .map((l) => {
        const addr = l.farmAddress || l.location || "";
        const parts = addr.split(",");
        return parts[parts.length - 1].trim();
      })
      .filter(Boolean);
    return [...new Set(locations)];
  }, [allListings]);

  // Filter & Search Logic
  const filteredListings = useMemo(() => {
    return allListings
      .filter((item) => {
        if (!item) return false;

        // Search term match across multiple fields
        const query = searchTerm.toLowerCase();
        const matchesSearch =
          !searchTerm ||
          item.commodity?.toLowerCase().includes(query) ||
          item.farmAddress?.toLowerCase().includes(query) ||
          item.farmerName?.toLowerCase().includes(query) ||
          item.quality?.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query);

        // Crop Category filter
        const matchesCrop =
          !selectedCrop ||
          item.commodity?.toLowerCase().includes(selectedCrop.toLowerCase());

        // Location / State filter
        const matchesState =
          !selectedState ||
          item.farmAddress?.toLowerCase().includes(selectedState.toLowerCase()) ||
          item.location?.toLowerCase().includes(selectedState.toLowerCase());

        // Quality grade filter
        const matchesQuality =
          !selectedQuality ||
          item.quality?.toLowerCase().includes(selectedQuality.toLowerCase());

        // Price Range filter
        const itemPrice = Number(item.price) || 0;
        const matchesPrice =
          itemPrice >= priceRange.min && itemPrice <= priceRange.max;

        // Negotiable filter
        const matchesNegotiable = !negotiableOnly || item.negotiationAllowed === true;

        // Saved Favorites filter
        const matchesSaved = !savedOnly || favorites.includes(item._id || item.id);

        return (
          matchesSearch &&
          matchesCrop &&
          matchesState &&
          matchesQuality &&
          matchesPrice &&
          matchesNegotiable &&
          matchesSaved
        );
      })
      .sort((a, b) => {
        const priceA = Number(a.price) || 0;
        const priceB = Number(b.price) || 0;
        const qtyA = parseFloat(a.quantity) || 0;
        const qtyB = parseFloat(b.quantity) || 0;
        const ratingA = ratings[a._id || a.id] || 4.5;
        const ratingB = ratings[b._id || b.id] || 4.5;

        if (sortBy === "price-low") return priceA - priceB;
        if (sortBy === "price-high") return priceB - priceA;
        if (sortBy === "quantity-high") return qtyB - qtyA;
        if (sortBy === "rating-high") return ratingB - ratingA;
        // Default newest
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
  }, [
    allListings,
    searchTerm,
    selectedCrop,
    selectedState,
    selectedQuality,
    priceRange,
    negotiableOnly,
    savedOnly,
    sortBy,
    favorites,
    ratings,
  ]);

  // Toggle favorite helper
  const toggleFavorite = (id, e) => {
    if (e) e.stopPropagation();
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Rate handler
  const handleRate = (id, value, e) => {
    if (e) e.stopPropagation();
    setRatings((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Handle Initiate Offer (Only Buyers can make offers)
  const handleInitiateOffer = (listingItem, e) => {
    if (e) e.stopPropagation();
    if (!user) {
      alert("Please log in as a Buyer to make an offer.");
      return;
    }
    if (user.role !== "buyer") {
      alert("Only registered buyers can make an offer on crop listings.");
      return;
    }
    setSelectedListing(listingItem);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCrop("");
    setSelectedState("");
    setSelectedQuality("");
    setPriceRange({ min: 0, max: maxDatasetPrice || 20000 });
    setNegotiableOnly(false);
    setSavedOnly(false);
    setSortBy("newest");
  };

  // Active filter count calculation
  const activeFiltersCount = [
    searchTerm !== "",
    selectedCrop !== "",
    selectedState !== "",
    selectedQuality !== "",
    priceRange.min > 0 || priceRange.max < maxDatasetPrice,
    negotiableOnly,
    savedOnly,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen pt-28 pb-16 bg-linear-to-br from-emerald-950 via-slate-900 to-emerald-950 text-slate-100 marketplace-container">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 🌾 HERO MARKETPLACE BANNER */}
        <div className="relative rounded-3xl overflow-hidden bg-linear-to-r from-emerald-900/80 via-slate-900/90 to-teal-950/80 border border-emerald-500/20 p-6 md:p-8 mb-8 shadow-2xl backdrop-blur-xl">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
                 Direct Farmer Trade Portal
              </div>
              <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight marketplace-header-title">
                Contract Farming <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-teal-300">Marketplace</span>
              </h1>
              <p className="mt-2 text-slate-300 text-sm md:text-base max-w-2xl">
                Browse verified crop listings, negotiate pricing directly with farmers, and secure contracts backed by AgriAssure Escrow protection.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 bg-slate-900/80 p-4 rounded-2xl border border-white/10 shrink-0">
              <div className="text-center px-2">
                <span className="block text-xl md:text-2xl font-black text-emerald-400">
                  {allListings.length}
                </span>
                <span className="text-xs text-slate-400 font-medium">Listings</span>
              </div>
              <div className="text-center border-x border-white/10 px-2 sm:px-4">
                <span className="block text-xl md:text-2xl font-black text-teal-400">
                  {uniqueCrops.length}
                </span>
                <span className="text-xs text-slate-400 font-medium">Crops</span>
              </div>
              <div className="text-center px-2">
                <span className="flex items-center justify-center gap-1 text-xl md:text-2xl font-black text-amber-400">
                  100% <ShieldCheck size={18} className="text-amber-400 inline" />
                </span>
                <span className="text-xs text-slate-400 font-medium">Escrow</span>
              </div>
            </div>
          </div>
        </div>

        {/* 🔍 SEARCH & FILTER BAR */}
        <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-white/10 p-5 mb-8 shadow-xl">
          {/* Main Search Row */}
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between mb-4">
            {/* Search Input Box */}
            <div className="relative w-full md:w-1/2">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search crops, locations, farmers, or specifications..."
                className="w-full pl-10 pr-10 py-3 rounded-xl agri-input-dark text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* View Mode & Mobile Filter Trigger Controls */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="flex md:hidden items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 font-medium text-sm"
              >
                <Filter size={16} />
                Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
              </button>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-2 rounded-xl border border-white/10">
                <ArrowUpDown size={15} className="text-emerald-400" />
                <span className="text-xs text-slate-400 hidden sm:inline font-medium">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-xs sm:text-sm text-slate-200 outline-none cursor-pointer pr-1"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="quantity-high">Quantity: High to Low</option>
                  <option value="rating-high">Highest Rated</option>
                </select>
              </div>

              {/* View Toggles */}
              <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-white/10">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition ${
                    viewMode === "grid"
                      ? "bg-emerald-500 text-white shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                  title="Grid View"
                >
                  <Grid size={16} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition ${
                    viewMode === "list"
                      ? "bg-emerald-500 text-white shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                  title="List View"
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Detailed Filter Panel */}
          <div className="hidden md:grid grid-cols-4 gap-4 pt-4 border-t border-white/10 filter-bar-desktop">
            {/* Category Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Crop Category
              </label>
              <select
                className="w-full agri-input-dark py-2 px-3 rounded-xl text-sm"
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
              >
                <option value="">All Crops ({uniqueCrops.length})</option>
                {uniqueCrops.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* State / Location */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                State / Location
              </label>
              <select
                className="w-full agri-input-dark py-2 px-3 rounded-xl text-sm"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
              >
                <option value="">All Locations</option>
                {uniqueStates.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Quality Grade */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Quality Grade
              </label>
              <select
                className="w-full agri-input-dark py-2 px-3 rounded-xl text-sm"
                value={selectedQuality}
                onChange={(e) => setSelectedQuality(e.target.value)}
              >
                <option value="">All Qualities</option>
                <option value="Grade A">Grade A</option>
                <option value="Premium">Premium</option>
                <option value="Standard">Standard</option>
                <option value="Organic">Organic</option>
              </select>
            </div>

            {/* Price Max Slider */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Max Price: ₹{priceRange.max.toLocaleString()}
                </label>
              </div>
              <input
                type="range"
                min={500}
                max={maxDatasetPrice || 20000}
                step={250}
                value={priceRange.max}
                onChange={(e) =>
                  setPriceRange({ ...priceRange, max: Number(e.target.value) })
                }
                className="agri-range-slider mt-2"
              />
            </div>
          </div>

          {/* Quick Filter Chips Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-4 border-t border-white/10 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-400 font-medium">Quick Filters:</span>
              
              {/* Negotiable Toggle Chip */}
              <button
                onClick={() => setNegotiableOnly(!negotiableOnly)}
                className={`px-3 py-1.5 rounded-full border transition flex items-center gap-1.5 ${
                  negotiableOnly
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                    : "bg-slate-800/60 border-white/10 text-slate-300 hover:border-slate-600"
                }`}
              >
                <Tag size={13} /> Negotiable Only
              </button>

              {/* Saved Only Toggle Chip */}
              <button
                onClick={() => setSavedOnly(!savedOnly)}
                className={`px-3 py-1.5 rounded-full border transition flex items-center gap-1.5 ${
                  savedOnly
                    ? "bg-amber-500/20 border-amber-500 text-amber-300"
                    : "bg-slate-800/60 border-white/10 text-slate-300 hover:border-slate-600"
                }`}
              >
                <BookmarkCheck size={13} /> Saved Favorites ({favorites.length})
              </button>
            </div>

            {/* Active Filter Indicators & Reset Button */}
            {activeFiltersCount > 0 && (
              <button
                onClick={resetFilters}
                className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 text-xs font-semibold transition"
              >
                <RotateCcw size={13} /> Clear All Filters ({activeFiltersCount})
              </button>
            )}
          </div>
        </div>

        {/* 📱 MOBILE FILTER DRAWER */}
        {mobileFilterOpen && (
          <div className="mobile-filter-drawer flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <SlidersHorizontal size={18} className="text-emerald-400" /> Filter Crop Listings
                </h3>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-5 text-sm">
                {/* Mobile Search */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Keyword</label>
                  <input
                    type="text"
                    placeholder="Search by crop, farmer, location..."
                    className="w-full agri-input-dark p-3 rounded-xl text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Mobile Crop Select */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Crop Type</label>
                  <select
                    className="w-full agri-input-dark p-3 rounded-xl text-sm"
                    value={selectedCrop}
                    onChange={(e) => setSelectedCrop(e.target.value)}
                  >
                    <option value="">All Crops</option>
                    {uniqueCrops.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Mobile State Select */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Location / State</label>
                  <select
                    className="w-full agri-input-dark p-3 rounded-xl text-sm"
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                  >
                    <option value="">All Locations</option>
                    {uniqueStates.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Mobile Max Price Slider */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                    Max Price: ₹{priceRange.max.toLocaleString()}
                  </label>
                  <input
                    type="range"
                    min={500}
                    max={maxDatasetPrice || 20000}
                    step={250}
                    value={priceRange.max}
                    onChange={(e) =>
                      setPriceRange({ ...priceRange, max: Number(e.target.value) })
                    }
                    className="agri-range-slider mt-2"
                  />
                </div>

                {/* Mobile Toggles */}
                <div className="space-y-3 pt-2 border-t border-white/10">
                  <label className="flex items-center gap-3 text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={negotiableOnly}
                      onChange={(e) => setNegotiableOnly(e.target.checked)}
                      className="w-4 h-4 accent-emerald-500 rounded"
                    />
                    <span>Negotiable Price Only</span>
                  </label>

                  <label className="flex items-center gap-3 text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={savedOnly}
                      onChange={(e) => setSavedOnly(e.target.checked)}
                      className="w-4 h-4 accent-amber-500 rounded"
                    />
                    <span>Saved Favorites Only</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Mobile Actions Footer */}
            <div className="pt-6 border-t border-white/10 flex gap-3 mt-6">
              <button
                onClick={resetFilters}
                className="w-1/2 py-3 rounded-xl border border-white/10 text-slate-300 font-semibold text-sm"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-1/2 py-3 rounded-xl bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/20"
              >
                Apply ({filteredListings.length})
              </button>
            </div>
          </div>
        )}

        {/* 📊 RESULTS SUMMARY HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-slate-300 font-medium">
            Showing <span className="font-bold text-emerald-400">{filteredListings.length}</span> of{" "}
            <span className="text-slate-400">{allListings.length}</span> crops available
          </div>
        </div>

        {/* 🚫 NO LISTINGS EMPTY STATE */}
        {filteredListings.length === 0 && (
          <div className="text-center py-20 bg-slate-900/60 rounded-3xl border border-white/10 p-8 shadow-xl max-w-xl mx-auto">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <Wheat size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Matching Crops Found</h3>
            <p className="text-slate-400 text-sm mb-6">
              We couldn't find any crop listings that match your active search filters or price constraints.
            </p>
            <button
              onClick={resetFilters}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm transition shadow-lg shadow-emerald-500/25 inline-flex items-center gap-2"
            >
              <RotateCcw size={16} /> Reset All Search Filters
            </button>
          </div>
        )}

        {/* 🛒 CROP LISTINGS GRID / LIST VIEW */}
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 marketplace-grid"
              : "space-y-4"
          }
        >
          {filteredListings.map((item) => {
            const itemId = item._id || item.id;
            const isFav = favorites.includes(itemId);
            const userRating = ratings[itemId] || 4.5;
            const isBuyer = user?.role === "buyer";

            if (viewMode === "list") {
              // 📄 LIST VIEW ITEM ROW
              return (
                <div
                  key={itemId}
                  onClick={() => setQuickViewItem(item)}
                  className="marketplace-glass-panel rounded-2xl p-5 border border-white/10 hover:border-emerald-500/40 transition-all flex flex-col md:flex-row items-center justify-between gap-6 group list-view-row cursor-pointer"
                >
                  {/* Left: Thumbnail & Details */}
                  <div className="flex items-center gap-5 w-full md:w-auto">
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shrink-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.commodity}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center text-emerald-400">
                          <Wheat size={32} />
                        </div>
                      )}
                      <button
                        onClick={(e) => toggleFavorite(itemId, e)}
                        className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-black/50 text-amber-400 backdrop-blur"
                      >
                        {isFav ? <BookmarkCheck size={14} fill="#f59e0b" /> : <Bookmark size={14} />}
                      </button>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition">
                          {item.commodity}
                        </h3>
                        {item.negotiationAllowed && (
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Negotiable
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-300">
                        <span className="flex items-center text-slate-300">
                          <BarChart3 size={13} className="mr-1 text-emerald-400" />
                          {item.quantity}
                        </span>
                        <span className="flex items-center text-slate-300">
                          <MapPin size={13} className="mr-1 text-emerald-400" />
                          {item.farmAddress || item.location || "Central Mandi"}
                        </span>
                        <span className="flex items-center text-slate-300">
                          <User size={13} className="mr-1 text-emerald-400" />
                          {item.farmerName || "Verified Farmer"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 pt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={14}
                            className={`cursor-pointer ${
                              userRating >= star ? "text-amber-400 fill-amber-400" : "text-slate-600"
                            }`}
                            onClick={(e) => handleRate(itemId, star, e)}
                          />
                        ))}
                        <span className="text-xs text-slate-400 ml-1 font-medium">{userRating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Price & CTA */}
                  <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto border-t md:border-t-0 border-white/10 pt-3 md:pt-0">
                    <div className="text-left md:text-right">
                      <span className="text-xs text-slate-400 block font-medium">Market Offer</span>
                      <span className="text-xl font-black text-emerald-400">₹{item.price}</span>
                      <span className="text-xs text-slate-400"> / Quintal</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleInitiateOffer(item, e)}
                        className="px-5 py-2.5 rounded-xl bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm shadow-md shadow-emerald-500/20 cursor-pointer"
                      >
                        Make Offer
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            // 🌾 GRID VIEW CARD ITEM
            return (
              <div
                key={itemId}
                onClick={() => setQuickViewItem(item)}
                className="crop-card group relative rounded-2xl overflow-hidden
                bg-linear-to-b from-slate-900/90 to-slate-950/95
                border border-white/10 hover:border-emerald-500/40 shadow-xl
                flex flex-col h-full cursor-pointer"
              >
                {/* Crop Image Header */}
                <div className="relative h-44 w-full overflow-hidden listing-card-image shrink-0">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.commodity}
                      className="w-full h-full object-cover group-hover:scale-108 transition duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-emerald-950 to-slate-900 flex items-center justify-center text-emerald-400">
                      <Wheat size={48} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

                  {/* Badges Top Bar */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold">
                      <ShieldCheck size={12} className="text-emerald-400" /> Escrow Verified
                    </span>

                    <button
                      onClick={(e) => toggleFavorite(itemId, e)}
                      className={`p-2 rounded-full backdrop-blur transition ${
                        isFav
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                          : "bg-slate-950/60 text-slate-300 hover:text-white border border-white/10"
                      }`}
                      title={isFav ? "Remove Bookmark" : "Save Crop"}
                    >
                      {isFav ? <BookmarkCheck size={15} fill="#f59e0b" /> : <Bookmark size={15} />}
                    </button>
                  </div>

                  {/* Icon Overlay on Image */}
                  <div className="absolute bottom-3 left-4 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-emerald-950/90 text-emerald-400 font-extrabold text-xs border border-emerald-500/30">
                      {item.quality || "Grade A"}
                    </span>
                    {item.negotiationAllowed && (
                      <span className="px-2 py-1 rounded-md bg-teal-950/90 text-teal-300 font-semibold text-[11px] border border-teal-500/30">
                        Negotiable
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="p-5 text-white flex flex-col grow justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold tracking-wide text-white group-hover:text-emerald-400 transition">
                        {item.commodity}
                      </h3>
                    </div>

                    <div className="text-xs text-slate-300 space-y-2 mt-3">
                      <div className="flex items-center text-slate-300">
                        <BarChart3 size={14} className="mr-2 text-emerald-400 shrink-0" />
                        <span className="font-medium text-slate-200">{item.quantity}</span>
                      </div>

                      <div className="flex items-center text-slate-300">
                        <MapPin size={14} className="mr-2 text-emerald-400 shrink-0" />
                        <span className="truncate">{item.farmAddress || item.location || "Farm Address"}</span>
                      </div>

                      <div className="flex items-center text-slate-300">
                        <User size={14} className="mr-2 text-emerald-400 shrink-0" />
                        <span className="truncate">{item.farmerName || "Verified Farmer"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Price & Rating Footer */}
                  <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 uppercase font-semibold block">Listing Price</span>
                      <div className="text-2xl font-black text-emerald-400 flex items-baseline gap-0.5">
                        <span className="text-lg">₹</span>
                        {item.price}
                        <span className="text-xs font-normal text-slate-400 ml-1">/ Qtl</span>
                      </div>
                    </div>

                    {/* Rating Interactive Stars */}
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={14}
                            className={`cursor-pointer transition ${
                              userRating >= star
                                ? "text-amber-400 fill-amber-400"
                                : "text-slate-600 hover:text-slate-400"
                            }`}
                            onClick={(e) => handleRate(itemId, star, e)}
                          />
                        ))}
                      </div>
                      <span className="text-[11px] text-slate-400 mt-1">{userRating.toFixed(1)} / 5.0</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Button Bar */}
                <div className="p-4 bg-slate-950/80 border-t border-white/10 flex items-center">
                  <button
                    onClick={(e) => handleInitiateOffer(item, e)}
                    className="w-full bg-linear-to-r from-emerald-500 to-teal-600
                    hover:from-emerald-400 hover:to-teal-500
                    text-white py-2.5 rounded-xl font-bold text-sm
                    transition-all duration-300 shadow-md hover:shadow-emerald-500/30 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Make Offer</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 🔍 QUICK VIEW CROP SPEC MODAL */}
      {quickViewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden text-slate-100 animate-fadeIn">
            {/* Modal Header */}
            <div className="relative h-48 w-full">
              {quickViewItem.image ? (
                <img
                  src={quickViewItem.image}
                  alt={quickViewItem.commodity}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-linear-to-br from-emerald-950 to-slate-900 flex items-center justify-center text-emerald-400">
                  <Wheat size={48} />
                </div>
              )}
              <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
              
              <button
                onClick={() => setQuickViewItem(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-slate-950/80 text-slate-300 hover:text-white border border-white/10"
              >
                <X size={18} />
              </button>

              <div className="absolute bottom-4 left-6">
                <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30">
                  {quickViewItem.quality || "Grade A Certified"}
                </span>
                <h2 className="text-2xl font-black text-white mt-1">{quickViewItem.commodity}</h2>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3 bg-slate-950/60 p-4 rounded-2xl border border-white/10">
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Price Per Unit</span>
                  <span className="text-xl font-bold text-emerald-400">₹{quickViewItem.price}</span> / Quintal
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Available Supply</span>
                  <span className="text-xl font-bold text-teal-300">{quickViewItem.quantity}</span>
                </div>
              </div>

              <div className="space-y-2 text-slate-300 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/50">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <User size={14} className="text-emerald-400" /> Farmer / Supplier
                  </span>
                  <span className="font-semibold text-white">{quickViewItem.farmerName || "Verified Producer"}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/50">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <MapPin size={14} className="text-emerald-400" /> Pickup Location
                  </span>
                  <span className="font-semibold text-white">{quickViewItem.farmAddress || "Regional Storage"}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/50">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Tag size={14} className="text-emerald-400" /> Terms
                  </span>
                  <span className="font-semibold text-emerald-300">
                    {quickViewItem.negotiationAllowed ? "Open for Counter-Offers" : "Fixed Contract Price"}
                  </span>
                </div>
              </div>

              <div className="bg-emerald-950/40 border border-emerald-500/20 p-3.5 rounded-2xl text-xs text-emerald-300 flex items-start gap-2.5">
                <ShieldCheck size={18} className="shrink-0 text-emerald-400 mt-0.5" />
                <div>
                  <span className="font-bold text-white block mb-0.5">AgriAssure Escrow Protection</span>
                  Your payment is securely held in Razorpay Escrow until crop delivery meets quality specifications.
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => setQuickViewItem(null)}
                  className="w-1/3 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
                >
                  Close
                </button>

                <button
                  onClick={(e) => {
                    handleInitiateOffer(quickViewItem, e);
                    if (user?.role === "buyer") {
                      setQuickViewItem(null);
                    }
                  }}
                  className="w-2/3 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Proceed to Make Offer</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🤝 PROPOSAL MODAL INTEGRATION */}
      <ProposalModal
        isOpen={!!selectedListing}
        onClose={() => setSelectedListing(null)}
        listing={selectedListing}
        user={user}
        onSubmit={async (proposalData) => {
          const finalProposal = {
            ...proposalData,
            listingId: selectedListing._id || selectedListing.id,
            listing: selectedListing,
            buyerId: user?.id || "b1",
            buyerName: user?.name || "Verified Buyer",
            status: "pending",
            createdAt: new Date().toISOString(),
          };

          return await onSendProposal(finalProposal);
        }}
      />
    </div>
  );
};

export default Marketplace;
