import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  CheckCircle, 
  Shield, 
  Users, 
  Play, 
  Sprout,
  Briefcase,
  X
} from 'lucide-react';
import video1 from "../assets/video1.mp4";
import './Hero.css';

export default function Hero({ onOpenRegister }) {
  const [activeRole, setActiveRole] = useState('farmer'); // 'farmer' or 'buyer'
  const [showVideo, setShowVideo] = useState(false);

  // Close modal on Escape key press and manage body scroll lock
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showVideo) {
        setShowVideo(false);
      }
    };

    if (showVideo) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showVideo]);

  // Smooth scroll helper for down arrow indicator
  const scrollToFeatures = () => {
    const section = document.getElementById('features');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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
      <header className="hero-wrapper" role="banner">
        {/* Background Image with Overlay */}
        <div className="hero-bg-media">
          <img 
            src="https://res.cloudinary.com/dtbuqsryl/image/upload/v1774884987/agri-bg_yrpk8n.avif"
            alt="Agriculture Field" 
            loading="eager"
          />
        </div>
        <div className="hero-bg-overlay" aria-hidden="true"></div>

        {/* Content */}
        <div className="hero-content">
          <span className="hero-badge-pill">
            <span>🌾</span> Built for India's Farmers & Buyers
          </span>

          <h1 className="hero-headline">
            Cultivating Trust,<br />
            <span className="hero-headline-highlight">Harvesting Stability.</span>
          </h1>

          <p className="hero-description">
            The bridge between hardworking farmers and reliable buyers. Secure contracts, transparent quality, and payments you can count on.
          </p>

          <div className="hero-cta-wrapper">
            <button 
              type="button"
              onClick={onOpenRegister} 
              className="hero-btn-primary group"
              aria-label="Start Farming Contract"
            >
              Start Farming Contract
              <ArrowRight size={19} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <button 
              type="button"
              onClick={() => setShowVideo(true)} 
              className="hero-btn-secondary group"
              aria-label="Watch Platform Demo Video"
            >
              <Play size={18} className="fill-current" />
              <span>Watch Demo</span>
            </button>
          </div>
          
          {/* Trust Badges */}
          <div className="hero-trust-container" aria-label="Key Trust Guarantees">
            <div className="hero-trust-item">
              <Shield size={18} />
              <span>Secure Escrow</span>
            </div>
            <div className="hero-trust-item">
              <CheckCircle size={18} />
              <span>Legal Compliance</span>
            </div>
            <div className="hero-trust-item">
              <Users size={18} />
              <span>10k+ Farmers</span>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <button 
          type="button"
          onClick={scrollToFeatures}
          className="hero-scroll-prompt" 
          aria-label="Scroll down to explore features"
        >
          <ArrowRight className="rotate-90 w-5 h-5 md:w-6 md:h-6" />
        </button>
      </header>

      {/* --- Interactive "Choose Your Role" Section --- */}
      <section id="features" className="role-section-wrapper" aria-label="Role Overview">
        <div className="role-section-inner">
          <div className="role-header-block">
            <h2 className="role-section-title">One Platform, Two Perspectives</h2>
            <p className="role-section-subtitle">
              AgriAssure adapts to your needs. Select your role below to see how our assured contracts empower you.
            </p>
          </div>

          {/* Fluid Responsive Toggle Switch */}
          <div className="role-toggle-bar">
            <div className="role-toggle-track" role="tablist" aria-label="User Role Selector">
              <div 
                className={`role-toggle-glider ${activeRole === 'buyer' ? 'is-buyer' : ''}`}
                aria-hidden="true"
              ></div>
              
              <button 
                type="button"
                role="tab"
                aria-selected={activeRole === 'farmer'}
                onClick={() => setActiveRole('farmer')}
                className={`role-toggle-btn ${activeRole === 'farmer' ? 'active' : 'inactive'}`}
              >
                <Sprout size={18} />
                <span>I'm a Farmer</span>
              </button>

              <button 
                type="button"
                role="tab"
                aria-selected={activeRole === 'buyer'}
                onClick={() => setActiveRole('buyer')}
                className={`role-toggle-btn ${activeRole === 'buyer' ? 'active' : 'inactive'}`}
              >
                <Briefcase size={18} />
                <span>I'm a Buyer</span>
              </button>
            </div>
          </div>

          {/* Interactive Content Card */}
          <div className="role-showcase-card">
            <div className="role-showcase-grid">
              
              {/* Text Content */}
              <div className="role-card-content" key={`text-${activeRole}`}>
                <span className="role-card-badge">
                  {roleContent[activeRole].title}
                </span>

                <h3 className="role-card-heading">
                  {roleContent[activeRole].heading}
                </h3>

                <p className="role-card-desc">
                  {roleContent[activeRole].description}
                </p>
                
                <ul className="role-points-group">
                  {roleContent[activeRole].points.map((point, index) => (
                    <li key={index} className="role-point-row">
                      <div className="role-point-icon">
                        <CheckCircle size={15} />
                      </div>
                      <span className="role-point-text">{point}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  type="button"
                  onClick={onOpenRegister}
                  className="role-card-action-btn group"
                >
                  <span>{roleContent[activeRole].cta}</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Image Content */}
              <div className="role-card-media">
                <img 
                  key={`img-${activeRole}`}
                  src={roleContent[activeRole].image} 
                  alt={roleContent[activeRole].title}
                  className="role-card-img"
                  loading="lazy"
                />
                <div className="role-media-gradient" aria-hidden="true"></div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* --- Video Modal with Responsive Overlay --- */}
      {showVideo && (
        <div 
          className="hero-video-modal-backdrop" 
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowVideo(false);
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Demo Video Player"
        >
          <div className="hero-video-modal-box">
            <button
              type="button"
              onClick={() => setShowVideo(false)}
              className="hero-video-close-btn"
              aria-label="Close Demo Video"
            >
              <X size={20} />
            </button>

            <video
              src={video1}
              controls
              autoPlay
              className="hero-video-tag"
            />
          </div>
        </div>
      )}

    </div>
  );
}