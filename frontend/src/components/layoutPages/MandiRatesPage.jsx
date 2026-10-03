import React, { useEffect,useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Filter, 
  Search, 
  MapPin, 
  Sprout,
  IndianRupee,
  Calendar
} from 'lucide-react';

// ✅ MOCK DATA (As specified)
const MANDI_RATES = [
  {
    id: "mr1",
    crop: "Wheat",
    state: "Madhya Pradesh",
    district: "Sehore",
    minPrice: 2200,
    maxPrice: 2450,
    modalPrice: 2350,
    unit: "Quintal",
    date: "2026-01-22",
    trend: "up"
  },
  {
    id: "mr2",
    crop: "Wheat",
    state: "Uttar Pradesh",
    district: "Kanpur",
    minPrice: 2150,
    maxPrice: 2380,
    modalPrice: 2280,
    unit: "Quintal",
    date: "2026-01-22",
    trend: "down"
  },
  {
    id: "mr3",
    crop: "Soybean",
    state: "Madhya Pradesh",
    district: "Indore",
    minPrice: 4300,
    maxPrice: 4600,
    modalPrice: 4450,
    unit: "Quintal",
    date: "2026-01-22",
    trend: "stable"
  },
  {
    id: "mr4",
    crop: "Mustard",
    state: "Rajasthan",
    district: "Kota",
    minPrice: 5100,
    maxPrice: 5400,
    modalPrice: 5250,
    unit: "Quintal",
    date: "2026-01-22",
    trend: "up"
  },
  {
    id: "mr5",
    crop: "Onion",
    state: "Maharashtra",
    district: "Nashik",
    minPrice: 1200,
    maxPrice: 1800,
    modalPrice: 1500,
    unit: "Quintal",
    date: "2026-01-22",
    trend: "down"
  }
];

const MandiRates = () => {
  // State for Filters
  const [selectedCrop, setSelectedCrop] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Extract Unique Filter Options based on Data
  const uniqueCrops = useMemo(() => [...new Set(MANDI_RATES.map(item => item.crop))], []);
  const uniqueStates = useMemo(() => [...new Set(MANDI_RATES.map(item => item.state))], []);
  //for time
   const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // District depends on Selected State
  const availableDistricts = useMemo(() => {
    if (!selectedState) return [...new Set(MANDI_RATES.map(item => item.district))];
    return [...new Set(MANDI_RATES.filter(item => item.state === selectedState).map(item => item.district))];
  }, [selectedState]);

  // Filter Logic
  const filteredRates = useMemo(() => {
    return MANDI_RATES.filter(item => {
      const matchCrop = selectedCrop ? item.crop === selectedCrop : true;
      const matchState = selectedState ? item.state === selectedState : true;
      const matchDistrict = selectedDistrict ? item.district === selectedDistrict : true;
      const matchSearch = searchQuery 
        ? item.crop.toLowerCase().includes(searchQuery.toLowerCase()) || 
          item.district.toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      return matchCrop && matchState && matchDistrict && matchSearch;
    });
  }, [selectedCrop, selectedState, selectedDistrict, searchQuery]);

  // Handler for State Change (Reset District)
  const handleStateChange = (e) => {
    setSelectedState(e.target.value);
    setSelectedDistrict(''); // Reset district when state changes
  };

  // Helper to render trend icon
  const renderTrend = (trend) => {
    switch(trend) {
      case 'up':
        return <div className="flex items-center text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-full text-xs"><TrendingUp size={14} className="mr-1" /> Up</div>;
      case 'down':
        return <div className="flex items-center text-red-500 font-medium bg-red-50 px-2 py-1 rounded-full text-xs"><TrendingDown size={14} className="mr-1" /> Down</div>;
      default:
        return <div className="flex items-center text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-full text-xs"><Minus size={14} className="mr-1" /> Stable</div>;
    }
  };

  // Helper for formatting currency
  const formatINR = (price) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
  };


    return (
  <div
    className="
      w-full  mx-auto
      pt-28 md:pt-32
      p-4 md:p-6
    bg-linear-to-br from-slate-950 via-emerald-950 to-slate-950
      min-h-screen font-sans
    "
  >
     <div className="max-w-7xl mx-auto">
    {/* Mandi rates content */}

     {/* 1️⃣ HEADER SECTION */}
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-100 flex items-center gap-2">
            <Sprout className="text-emerald-600" /> Live Mandi Rates
          </h1>
          <p className="text-gray-300 mt-1">
            Government mandi prices updated daily across India.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-semibold">
          <span className="animate-pulse w-2 h-2 bg-emerald-500 rounded-full"></span>
          Live Updates: {time.toLocaleString()}
        </div>
      </div>
    </div>

       {/* 2️⃣ FILTERS PANEL */}
    <div
      className="
        bg-white rounded-xl shadow-sm border border-gray-200
        p-4 mb-6
        sticky top-28 md:top-32
        z-30
      "
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Search */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search crop or mandi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg
                       focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                       outline-none transition-all"
          />
        </div>

        {/* Crop Dropdown */}
        <div className="relative">
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg
                       focus:ring-2 focus:ring-emerald-500 outline-none
                       appearance-none bg-white"
          >
            <option value="">All Crops</option>
            {uniqueCrops.map((crop) => (
              <option key={crop} value={crop}>{crop}</option>
            ))}
          </select>
          <Filter
            className="absolute right-3 top-1/2 -translate-y-1/2
                       text-gray-400 pointer-events-none"
            size={16}
          />
        </div>

        {/* State Dropdown */}
        <div className="relative">
          <select
            value={selectedState}
            onChange={handleStateChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg
                       focus:ring-2 focus:ring-emerald-500 outline-none
                       appearance-none bg-white"
          >
            <option value="">All States</option>
            {uniqueStates.map((state) => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
          <MapPin
            className="absolute right-3 top-1/2 -translate-y-1/2
                       text-gray-400 pointer-events-none"
            size={16}
          />
        </div>

        {/* District Dropdown */}
        <div className="relative">
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            disabled={!selectedState && availableDistricts.length === 0}
            className={`
              w-full px-4 py-2 border border-gray-300 rounded-lg
              focus:ring-2 focus:ring-emerald-500 outline-none
              appearance-none bg-white
              ${!selectedState ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""}
            `}
          >
            <option value="">
              {selectedState ? "All Districts" : "Select State First"}
            </option>
            {availableDistricts.map((dist) => (
              <option key={dist} value={dist}>{dist}</option>
            ))}
          </select>
          <MapPin
            className="absolute right-3 top-1/2 -translate-y-1/2
                       text-gray-400 pointer-events-none"
            size={16}
          />
        </div>

      </div>
    </div>

      {/* 3️⃣ RATES DISPLAY */}
    {filteredRates.length === 0 ? (
      <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
        <Sprout size={48} className="mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-600">
          No Mandi Rates Found
        </h3>
        <p className="text-gray-400">
          Try adjusting your filters or search criteria.
        </p>
      </div>
    ) : (
      <>
        {/* DESKTOP TABLE */}
        <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Commodity</th>
                  <th className="px-6 py-4">Market / Mandi</th>
                  <th className="px-6 py-4 text-right">Min Price</th>
                  <th className="px-6 py-4 text-right">Max Price</th>
                  <th className="px-6 py-4 text-right bg-emerald-50 text-emerald-800">
                    Modal Price
                  </th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Trend</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredRates.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">
                        {item.crop}
                      </div>
                      <div className="text-xs text-gray-500">
                        Per {item.unit}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800">
                        {item.district}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.state}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-gray-600">
                      {formatINR(item.minPrice)}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-gray-600">
                      {formatINR(item.maxPrice)}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-700 bg-emerald-50/50">
                      {formatINR(item.modalPrice)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {item.date}
                    </td>
                    <td className="px-6 py-4">
                      {renderTrend(item.trend)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* MOBILE CARDS */}
        <div className="md:hidden space-y-4">
          {filteredRates.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
            >
              <div className="flex justify-between items-start mb-3 border-b pb-3">
                <div>
                  <h3 className="font-bold text-lg">{item.crop}</h3>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <MapPin size={14} className="mr-1" />
                    {item.district}, {item.state}
                  </div>
                </div>
                {renderTrend(item.trend)}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-500">Min Price</div>
                  <div className="font-semibold">
                    {formatINR(item.minPrice)}
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-500">Max Price</div>
                  <div className="font-semibold">
                    {formatINR(item.maxPrice)}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center bg-emerald-50 p-3 rounded-lg border">
                <span className="text-sm font-medium text-emerald-800">
                  Modal Price
                </span>
                <span className="text-xl font-bold text-emerald-700">
                  {formatINR(item.modalPrice)}
                </span>
              </div>

              <div className="mt-3 flex justify-end text-xs text-gray-400">
                <Calendar size={12} className="mr-1" />
                Updated: {item.date}
              </div>
            </div>
          ))}
        </div>
      </>
    )}


  </div>
   

  </div>
);
 
};


export default MandiRates;