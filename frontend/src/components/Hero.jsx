
import React, { useState, useEffect } from 'react';
import { 
  Leaf, 
  ArrowRight, 
  CheckCircle, 
  Shield, 
  TrendingUp, 
  Users, 
  Play, 
  Menu, 
  X,
  Sprout,
  Briefcase
} from 'lucide-react';
import video1 from "../assets/video1.mp4"; // or your path
export default function Hero({onOpenRegister}) {
  const [scrolled, setScrolled] = useState(false);
  const [activeRole, setActiveRole] = useState('farmer'); // 'farmer' or 'buyer'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- Data for Interactive Section ---
  const roleContent = {
    farmer: {
      title: "For Farmers",
      heading: "Secure Your Harvest Before You Sow",
      description: "Stop worrying about fluctuating market prices. Lock in your profits with assured contracts and guaranteed payments.",
      points: [
        "Guaranteed Buy-back Agreements",
        "Zero Market Risk Price Protection",
        "Timely Payments via Escrow",
        "Access to Verified Corporate Buyers"
      ],
      image: "https://res.cloudinary.com/dtbuqsryl/image/upload/v1774884990/farmer_wooowq.png",
      cta: "Join as Farmer"
    },
    buyer: {
      title: "For Buyers",
      heading: "Reliable Supply Chain, Quality Assured",
      description: "Source directly from farmers with full traceability. Manage contracts, quality checks, and logistics in one platform.",
      points: [
        "Direct Farm-to-Factory Sourcing",
        "Traceable Quality Monitoring",
        "Digital Contract Management",
        "Hassle-free Bulk Procurement"
      ],
      image: "https://res.cloudinary.com/dtbuqsryl/image/upload/v1774884989/buyer_dawwxg.png",
      cta: "Join as Buyer"
    }
  };

  return (
    <div className="min-h-screen font-sans text-gray-900 overflow-x-hidden selection:bg-emerald-200">

      {/* --- Hero Section --- */}
      <header className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
           src="https://res.cloudinary.com/dtbuqsryl/image/upload/v1774884987/agri-bg_yrpk8n.avif"
            alt="Agriculture Field" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/40 to-black/70"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white space-y-6 md:space-y-8 pt-16 md:pt-20">
          <div className="animate-fade-in-up">
            <span className="inline-block py-1 px-3 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs md:text-sm font-semibold tracking-wide mb-2 md:mb-3 backdrop-blur-sm">
              🌾 Built for India's Farmers
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight mb-4 md:mb-6">
              Cultivating Trust,<br />
              <span className="bg-emerald-400 bg-clip-text text-transparent">Harvesting Stability.</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto font-light leading-relaxed px-4">
              The bridge between hardworking farmers and reliable buyers. <br className="hidden md:block"/>
              Secure contracts. Payments you can count on.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 animate-fade-in-up delay-200 px-4">
            <button onClick={onOpenRegister} className="w-full sm:w-auto px-6 md:px-8 py-3.5 md:py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-bold text-base md:text-lg shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 group">
              Start Farming Contract
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => setShowVideo(true)} className="w-full sm:w-auto px-6 md:px-8 py-3.5 md:py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-full font-bold text-base md:text-lg transition-all flex items-center justify-center gap-2">
              <Play size={20} className="fill-current" /> Watch Demo
            </button>
          </div>
          
          
          {/* Trust Badges */}
          <div className="pt-8 md:pt-12 flex flex-wrap justify-center gap-4 md:gap-8 opacity-70 animate-fade-in-up delay-500 text-sm md:text-base">
             <div className="flex items-center gap-2"><Shield size={18} className="md:w-[18px] md:h-[18px]"/> Secure Escrow</div>
             <div className="flex items-center gap-2"><CheckCircle size={18} className="md:w-[18px] md:h-[18px]"/> Legal Compliance</div>
             <div className="flex items-center gap-2"><Users size={18} className="md:w-[18px] md:h-[18px]"/> 10k+ Farmers</div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-white/50">
           <ArrowRight className="rotate-90 w-5 h-5 md:w-6 md:h-6" />
        </div>
      </header>

      {/* --- Interactive "Choose Your Role" Section --- */}
      <section id="features" className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">One Platform, Two Perspectives</h2>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-2">AgriAssure adapts to your needs. Select your role to see how we empower you.</p>
          </div>

          {/* Toggle Switch */}
          <div className="flex justify-center mb-8 md:mb-12">
            <div className="bg-white p-1 rounded-full shadow-md border border-gray-200 inline-flex relative scale-90 md:scale-100 transform origin-center">
              <div 
                className={`absolute top-1 bottom-1 w-[140px] rounded-full bg-emerald-600 transition-all duration-300 ease-in-out ${activeRole === 'buyer' ? 'left-[148px]' : 'left-1'}`}
              ></div>
              <button 
                onClick={() => setActiveRole('farmer')}
                className={`relative z-10 w-[140px] py-3 rounded-full text-sm font-bold transition-colors flex items-center justify-center gap-2 ${activeRole === 'farmer' ? 'text-white' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <Sprout size={18} /> I'm a Farmer
              </button>
              <button 
                onClick={() => setActiveRole('buyer')}
                className={`relative z-10 w-[140px] py-3 rounded-full text-sm font-bold transition-colors flex items-center justify-center gap-2 ${activeRole === 'buyer' ? 'text-white' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <Briefcase size={18} /> I'm a Buyer
              </button>
            </div>
          </div>

          {/* Interactive Content Card */}
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl overflow-hidden border border-gray-100 transition-all duration-500 transform">
            <div className="flex flex-col lg:flex-row">
              {/* Text Content */}
              <div className="lg:w-1/2 p-6 sm:p-10 lg:p-12 flex flex-col justify-center animate-fade-in order-2 lg:order-1">
                <span className="text-emerald-600 font-bold tracking-wider uppercase text-xs md:text-sm mb-3 md:mb-4">
                  {roleContent[activeRole].title}
                </span>
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">
                  {roleContent[activeRole].heading}
                </h3>
                <p className="text-base md:text-lg text-gray-600 mb-6 md:mb-8 leading-relaxed">
                  {roleContent[activeRole].description}
                </p>
                
                <ul className="space-y-3 md:space-y-4 mb-8 md:mb-10">
                  {roleContent[activeRole].points.map((point, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="mt-1 p-1 bg-emerald-100 rounded-full text-emerald-600 shrink-0">
                        <CheckCircle size={14} className="md:w-4 md:h-4" />
                      </div>
                      <span className="text-gray-700 font-medium text-sm md:text-base">{point}</span>
                    </li>
                  ))}
                </ul>

                <button className="self-start px-6 md:px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center gap-2 text-sm md:text-base">
                  {roleContent[activeRole].cta} <ArrowRight size={18} />
                </button>
              </div>

              {/* Image Content */}
              <div className="lg:w-1/2 relative min-h-[250px] sm:min-h-[300px] lg:min-h-[400px] order-1 lg:order-2">
                <img 
                  key={activeRole} // Force re-render for animation
                  src={roleContent[activeRole].image} 
                  alt="Role Context" 
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 animate-fade-in"
                />
                <div className="absolute inset-0 bg-linear-to-t lg:bg-linear-to-l from-black/40 to-transparent lg:from-transparent lg:to-black/5"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
       {showVideo && (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
    <div className="relative w-[90%] md:w-[70%] lg:w-[60%]">

      {/* Close Button */}
      <button
        onClick={() => setShowVideo(false)}
        className="absolute -top-10 right-0 text-white text-2xl"
      >
        ✕
      </button>

      <video
        src={video1}
        controls
        autoPlay
        className="w-full rounded-lg shadow-2xl"
      />
    </div>
  </div>
)}
      

    </div>
    
  );
}