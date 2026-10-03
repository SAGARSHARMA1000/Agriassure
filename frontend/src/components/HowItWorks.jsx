
import React, { useEffect, useRef } from 'react';
import { User, Search, TrendingUp, FileSignature, Lock, CheckCircle } from "lucide-react";

// Custom CSS for animations and mobile-specific timeline positioning
const CustomStyles = () => (
  <style>{`
    html {
      scroll-behavior: smooth;
    }
    
    /* Base Timeline Line (Desktop/Laptop: Centered) */
    .line-bg {
      position: absolute;
      left: 50%;
      top: 0;
      bottom: 0;
      width: 4px;
      background-color: #e5e7eb;
      transform: translateX(-50%);
      border-radius: 4px;
      z-index: 0;
    }
    
    .line-progress {
      position: absolute;
      left: 50%;
      top: 0;
      width: 4px;
      background: linear-gradient(to bottom, #22c55e, #15803d);
      transform: translateX(-50%);
      border-radius: 4px;
      z-index: 1;
      height: 0%;
      transition: height 0.1s ease-out; /* Smoother transition */
    }

    /* Step Card Animation */
    .step-card {
      opacity: 0;
      transform: scale(0.9) translateY(30px);
      transition: all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .step-card.is-visible {
      opacity: 1;
      transform: scale(1) translateY(0);
    }

    /* Marker Animation */
    .step-marker {
      transition: all 0.4s ease;
      transform: scale(0.8) translateX(-50%); /* Center horizontally by default */
      z-index: 10;
      background-color: #f3f4f6;
      border-color: #ffffff;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .step-marker.is-active {
      transform: scale(1.2) translateX(-50%);
      background-color: #22c55e;
      border-color: #22c55e;
      box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.3);
    }
    .step-marker.is-active span {
      color: white;
    }
    .step-marker span {
        color: #374151;
        transition: color 0.3s;
    }
    
    /* MOBILE & TABLET OVERRIDES (< 768px) */
    @media (max-width: 768px) {
      .line-bg, .line-progress {
        left: 24px; /* Move line to the left */
        transform: translateX(0);
      }
      
      .step-marker {
        left: 24px !important; /* Force marker to left */
        transform: scale(0.8) translateX(-50%);
      }
      
      .step-marker.is-active {
        transform: scale(1.1) translateX(-50%);
      }
    }
  `}</style>
);

// --- Sub-Component: Step Item ---
const TimelineStep = ({ step, title, description, details, icon, image, index, isLast }) => {
  // Determine alignment based on index (even/odd) - Only applies to Desktop
  const isEven = index % 2 === 0;
  
  return (
    <div className={`timeline-step relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center ${!isLast ? 'mb-20 md:mb-32' : ''}`} data-step={step}>
      
      {/* 1. Text Content Block */}
      {/* Mobile: Padded left to clear the line. Desktop: Alternates left/right. */}
      <div 
        className={`step-card order-2 pl-12 md:pl-0 ${isEven ? 'md:order-1 md:text-right md:pr-16' : 'md:order-2 md:pl-16'}`}
      >
        <div className="bg-white/80 backdrop-blur-sm p-5 md:p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 flex items-center gap-3 md:justify-end">
                {/* Mobile Icon (Visible only on small screens next to title) */}
                <span className="md:hidden text-green-600">{React.cloneElement(icon, { size: 24 })}</span>
                <span className={!isEven ? 'md:order-2' : ''}>{step}. {title}</span>
            </h3>
            <p className="text-gray-600 text-base md:text-lg mb-4 leading-relaxed">{description}</p>
            
            {/* Extra Details List */}
            <ul className={`text-sm text-gray-500 space-y-2 ${isEven ? 'md:flex md:flex-col md:items-end' : ''}`}>
                {details.map((detail, i) => (
                    <li key={i} className="flex items-start gap-2">
                        {/* Dot for bullet point */}
                        <span className={`mt-1.5 w-1.5 h-1.5 shrink-0 rounded-full bg-emerald-700 ${isEven ? 'md:order-2 md:ml-2 md:mr-0' : ''}`}></span>
                        <span>{detail}</span>
                    </li>
                ))}
            </ul>
        </div>
      </div>

      {/* 2. Marker (The Circle) */}
      <div 
        className="step-marker absolute left-0 md:left-1/2 w-10 h-10 rounded-full border-4 flex items-center justify-center bg-white"
        // Inline style isn't needed for left position as CSS handles the media query for left: 24px vs left: 50%
      >
         <div className="absolute inset-0 flex items-center justify-center">
             <span className="text-sm font-bold">{step}</span>
         </div>
      </div>

      {/* 3. Image Block */}
      {/* Mobile: Padded left to clear line. Desktop: Alternates. */}
      <div 
        className={`step-card order-3 pl-12 md:pl-0 ${isEven ? 'md:order-2 md:pl-16' : 'md:order-1 md:text-right md:pr-16'}`}
      >
         <div className={`relative group overflow-hidden rounded-2xl shadow-xl border-4 border-white ${!isEven ? 'md:ml-auto' : ''}`}>
            {/* Image */}
            <div className="aspect-video w-full overflow-hidden bg-gray-100">
                <img 
                    src={image} 
                    alt={title} 
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
            </div>
            
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-60"></div>

            {/* Desktop Icon Badge (Hidden on mobile to save space/clutter) */}
            <div className="hidden md:block absolute bottom-4 right-4 bg-white/90 backdrop-blur text-green-600 p-3 rounded-xl shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                {React.cloneElement(icon, { size: 24 })}
            </div>
         </div>
      </div>

    </div>
  );
};

export default function TimelineApp({onOpenRegister}) {
  const containerRef = useRef(null);
  const lineRef = useRef(null);
  
  // Data for Agriassure
  const stepsData = [
    {
      step: 1,
      title: "Register",
      description: "Join the Agriassure network securely. Whether you are a farmer looking to sell or a buyer seeking quality produce, it starts here.",
      details: [
        "Secure email & mobile verification",
        "Profile customization for trust",
        "Role selection (Farmer/Buyer)"
      ],
      icon: <User />,
      image:"https://res.cloudinary.com/dtbuqsryl/image/upload/v1771353572/step1_phgexi.png"
      // image: "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=800&q=80"
    },
    {
      step: 2,
      title: "List & Search",
      description: "Discover a marketplace without borders. Farmers showcase their harvest with detailed specs, while buyers filter for exactly what they need.",
      details: [
        "Upload crop photos & quality certificates",
        "Advanced filtering by region & crop type",
        "Real-time market availability"
      ],
      icon: <Search />,
      image:"https://res.cloudinary.com/dtbuqsryl/image/upload/v1771353575/step2_bx8u3j.png"
      //image: "https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=800&q=80"
    },
    {
      step: 3,
      title: "Negotiate",
      description: "Direct communication for fair deals. Our platform facilitates transparent price and quantity negotiations without middlemen.",
      details: [
        "In-app chat system",
        "Price bidding mechanism",
        "Transparent quantity adjustments"
      ],
      icon: <TrendingUp />,
      image:"https://res.cloudinary.com/dtbuqsryl/image/upload/v1771354530/step3_f2d2fz.png"
     // image: "https://images.unsplash.com/photo-1521791136064-7985c2717883?auto=format&fit=crop&w=800&q=80"
    },
    {
      step: 4,
      title: "Smart Contract",
      description: "Seal the deal digitally. We generate a legally binding e-contract that protects both parties, ensuring terms are clear before moving forward.",
      details: [
        "Auto-generated legal templates",
        "Digital signatures (E-Sign)",
        "Immutable agreement records"
      ],
      icon: <FileSignature />,
        image:"https://res.cloudinary.com/dtbuqsryl/image/upload/v1771354510/step4_cglrgb.png"
     // image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=80"
    },
    {
        step: 5,
        title: "Secure Escrow",
        description: "Payment safety is our priority. Buyer funds are locked in a secure escrow account and are not touched until the contract terms are met.",
        details: [
          "Bank-grade security",
          "Funds held in neutral trust",
          "Payment proof generation"
        ],
        icon: <Lock />,
        image:"https://res.cloudinary.com/dtbuqsryl/image/upload/v1771354490/step5_q4vdk4.png"
        //image: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=800&q=80"
    },
    {
        step: 6,
        title: "Delivery & Release",
        description: "The final handshake. Once the produce is delivered and verified, the funds are instantly released to the farmer.",
        details: [
          "Delivery tracking updates",
          "Quality verification checklist",
          "Instant fund transfer"
        ],
        icon: <CheckCircle />,
        image:"https://res.cloudinary.com/dtbuqsryl/image/upload/v1771354450/step6_g2kgb3.png"
       // image: "https://images.unsplash.com/photo-1625246333195-5512a1d3c467?auto=format&fit=crop&w=800&q=80"
    }
  ];

  // --- Effect 1: Scroll Progress Logic ---
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || !lineRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      const startOffset = windowHeight / 2;
      const scrollPosition = -containerRect.top + startOffset;
      const totalHeight = containerRect.height;
      
      let percentage = (scrollPosition / totalHeight) * 100;
      percentage = Math.max(0, Math.min(100, percentage));
      
      lineRef.current.style.height = `${percentage}%`;

      const steps = containerRef.current.querySelectorAll('.timeline-step');
      steps.forEach(step => {
         const marker = step.querySelector('.step-marker');
         const stepTop = step.getBoundingClientRect().top;
         
         if (stepTop < windowHeight / 2) {
             marker.classList.add('is-active');
         } else {
             marker.classList.remove('is-active');
         }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- Effect 2: Intersection Observer for "Grow Up" Animation ---
  useEffect(() => {
    const observerOptions = {
        threshold: 0.1, // Lower threshold for mobile
        rootMargin: "0px 0px -10% 0px" // Adjusted for smaller screens
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            } else {
                entry.target.classList.remove('is-visible');
            }
        });
    }, observerOptions);

    const stepCards = document.querySelectorAll('.step-card');
    stepCards.forEach(card => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-white min-h-screen text-gray-800 font-sans overflow-x-hidden">
      <CustomStyles />
      
      {/* Header Section */}
      <header className="py-16 md:py-24 flex flex-col items-center justify-center bg-linear-to-b from-green-50 to-white text-center px-4">
        <div className="bg-green-100 text-green-800 px-4 py-1 rounded-full text-lg md:text-xl font-semibold mb-6 animate-pulse">
            Secure & Transparent
        </div>
        {/* Adjusted Font Size for 14-inch laptops (md:text-5xl) and large screens (lg:text-6xl) */}
        <h1 className="text-3xl md:text-6xl lg:text-7xl font-bold mb-6 text-gray-900 tracking-tight">
            How <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-600 to-teal-500">Agriassure</span> Works
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 md:mb-12 leading-relaxed px-2">
            From registration to secure payment release, we ensure every step of your agricultural trade is transparent, efficient, and secure.
        </p>
        <button onClick={onOpenRegister} className="bg-emerald-500 text-white px-6 md:px-8 py-3 rounded-full font-semibold shadow-lg hover:bg-green-700 transition-colors transform hover:-translate-y-1">
            Start Trading Today
        </button>
      </header>

      {/* Timeline Section */}
      <section className="pb-20 md:pb-32 px-4 bg-white relative">
        <div className="max-w-7xl mx-auto">
            
            <div ref={containerRef} className="timeline-container relative pb-10 pt-4 md:pt-10">
                {/* Vertical Lines */}
                <div className="line-bg"></div>
                <div ref={lineRef} className="line-progress"></div>

                {/* Steps Loop */}
                {stepsData.map((item, index) => (
                    <TimelineStep 
                        key={item.step}
                        index={index}
                        step={item.step}
                        title={item.title}
                        description={item.description}
                        details={item.details}
                        icon={item.icon}
                        image={item.image}
                        isLast={index === stepsData.length - 1}
                    />
                ))}
            </div>
        </div>
      </section>

   
    </div>
  );
}