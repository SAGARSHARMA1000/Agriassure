import React, { useEffect, useState, useRef } from "react";
import { User, LogOut, Menu, X, ChevronDown, Compass } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import LogoutModal from "./modals/LogoutModal";

const Navigation = ({
  mobileMenuOpen,
  setMobileMenuOpen,
  user,
  onLogout,
  onOpenRegister,
  onOpenLogin,
  onDemoLogin,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [openDemo, setOpenDemo] = useState(false);
  const closeTimerRef = useRef(null);
  const [showLogout, setShowLogout] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/"); // smooth navigation
  };

  /* Scroll effect */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Auto close demo dropdown after 5 seconds */
  useEffect(() => {
    if (openDemo) {
      closeTimerRef.current = setTimeout(() => {
        setOpenDemo(false);
      }, 5000);
    }

    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, [openDemo]);

  // Navigation items config
  const navItems = [
    { label: "Home", path: "/" },
    { label: "Marketplace", path: "/market" },
    { label: "Mandi Rates", path: "/rates" },
    { label: "Contact us", path: "/contact" },
  ];

  // Helper to check active path
  const isActiveRoute = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <nav
        className={`
          fixed w-full z-50 transition-all duration-300
          ${
            scrolled
              ? "bg-white/95 backdrop-blur-md shadow-md py-2 md:py-2.5 border-b border-gray-100"
              : "bg-transparent py-2.5 md:py-3.5"
          }
        `}
      >
        <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-20 flex justify-between items-center relative">
          {/* LOGO */}
          <div
            className="flex items-center cursor-pointer z-50 transition-transform duration-200 hover:scale-105 select-none"
            onClick={() => {
              navigate("/");
              if (mobileMenuOpen) setMobileMenuOpen(false);
            }}
          >
            <img
              src={scrolled || mobileMenuOpen ? "/agriDark.png" : "/agriLight.png"}
              alt="AgriAssure"
              className="h-8 sm:h-12 md:h-16 lg:h-18 w-auto object-contain transition-all duration-300"
            />
          </div>

          {/* DESKTOP MENU WITH ACTIVE INDICATOR ANIMATION */}
          <div
            className={`hidden md:flex items-center gap-6 lg:gap-8 font-medium text-sm lg:text-base ${
              scrolled ? "text-gray-600" : "text-white"
            }`}
          >
            {navItems.map((item) => {
              const active = isActiveRoute(item.path);

              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`relative py-1.5 px-1 font-semibold transition-colors duration-200 outline-none select-none cursor-pointer ${
                    active
                      ? scrolled
                        ? "text-emerald-600 font-bold"
                        : "text-emerald-400 font-bold drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]"
                      : scrolled
                      ? "text-slate-600 hover:text-emerald-600"
                      : "text-slate-200 hover:text-white"
                  }`}
                >
                  <span className="relative z-10">{item.label}</span>

                  {/* ANIMATED ACTIVE GLOW UNDERLINE */}
                  {active && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className={`absolute -bottom-1 left-0 right-0 h-0.75 rounded-full ${
                        scrolled
                          ? "bg-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                          : "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]"
                      }`}
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* DESKTOP ACTIONS */}
          <div className="hidden md:flex items-center gap-3 lg:gap-4 relative">
            {user ? (
              <>
                <span className="px-3 lg:px-4 py-1.5 rounded-full bg-emerald-100/90 text-emerald-800 flex items-center gap-2 text-xs lg:text-sm font-semibold border border-emerald-200">
                  <User size={16} className="text-emerald-600" /> {user.name} ({user.role})
                </span>

                <button
                  onClick={() => navigate(`/dashboard/${user.role}`)}
                  className="px-4 lg:px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-bold text-sm shadow-md transition transform hover:scale-105"
                >
                  Dashboard
                </button>

                <button
                  onClick={onLogout}
                  className="text-gray-400 hover:text-red-500 p-1.5 transition"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <>
                {/* LOGIN DROPDOWN */}
                <div className="relative">
                  <button
                    onClick={() => {
                      clearTimeout(closeTimerRef.current);
                      setOpenDemo((prev) => !prev);
                    }}
                    className={`flex items-center gap-1 px-4 lg:px-5 py-2 rounded-full font-semibold transition text-sm ${
                      scrolled
                        ? "text-gray-600 hover:bg-gray-100"
                        : "text-white hover:bg-white/10"
                    }`}
                  >
                    Login
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-300 ${
                        openDemo ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <div
                    className={`absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border overflow-hidden z-50 transform transition-all duration-300 origin-top ${
                      openDemo
                        ? "opacity-100 scale-y-100"
                        : "opacity-0 scale-y-95 pointer-events-none"
                    }`}
                  >
                    <button
                      onClick={() => {
                        onOpenLogin();
                        setOpenDemo(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 font-medium transition"
                    >
                      Login
                    </button>

                    <div className="border-t my-1" />

                    {["farmer", "buyer", "admin"].map((role) => (
                      <button
                        key={role}
                        onClick={() => {
                          onDemoLogin(role);
                          setOpenDemo(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 transition capitalize"
                      >
                        Demo {role}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={onOpenRegister}
                  className="px-4 lg:px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-bold text-sm shadow-md transition transform hover:scale-105"
                >
                  Get Started
                </button>
              </>
            )}
          </div>

          {/* MOBILE TOGGLE */}
          <button
            className="md:hidden z-50 p-1 rounded-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X size={26} className="text-gray-900" />
            ) : (
              <Menu size={26} className={scrolled ? "text-black" : "text-white"} />
            )}
          </button>
        </div>

        <LogoutModal
          isOpen={showLogout}
          onClose={() => setShowLogout(false)}
          onConfirm={handleLogout}
        />
      </nav>

      {/* MOBILE MENU OVERLAY */}
      <div
        className={`fixed inset-0 bg-white z-40 transform transition-transform duration-300 md:hidden ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="pt-20 px-6 pb-10 flex flex-col h-full overflow-y-auto">
          {/* NAVIGATION LINKS WITH ACTIVE STATE */}
          <div className="space-y-3 text-lg font-semibold text-gray-800">
            {navItems.map((item) => {
              const active = isActiveRoute(item.path);

              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left py-3 px-4 rounded-xl transition flex items-center justify-between ${
                    active
                      ? "bg-emerald-50 text-emerald-700 font-bold border-l-4 border-emerald-500 shadow-xs"
                      : "text-gray-700 hover:bg-gray-50 border-b border-gray-100"
                  }`}
                >
                  <span>{item.label}</span>
                  {active && <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
                </button>
              );
            })}
          </div>

          {/* AUTH SECTION */}
          <div className="mt-8 pt-6 border-t border-gray-200 space-y-4">
            {!user ? (
              <>
                {/* LOGIN */}
                <button
                  onClick={() => {
                    onOpenLogin();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-3 rounded-xl border border-gray-300 font-semibold text-gray-800"
                >
                  Login
                </button>

                {/* DEMO SECTION */}
                <div className="space-y-3">
                  <p className="text-sm text-gray-500 font-medium">
                    Try Demo Account
                  </p>

                  <button
                    onClick={() => {
                      onDemoLogin("farmer");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2 rounded-lg bg-emerald-50 text-emerald-700 font-medium"
                  >
                    Demo Farmer
                  </button>

                  <button
                    onClick={() => {
                      onDemoLogin("buyer");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2 rounded-lg bg-blue-50 text-blue-700 font-medium"
                  >
                    Demo Buyer
                  </button>

                  <button
                    onClick={() => {
                      onDemoLogin("admin");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2 rounded-lg bg-purple-50 text-purple-700 font-medium"
                  >
                    Demo Admin
                  </button>
                </div>

                {/* REGISTER */}
                <button
                  onClick={() => {
                    onOpenRegister();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold shadow-md"
                >
                  Get Started
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    navigate(`/dashboard/${user.role}`);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold shadow-md"
                >
                  Go to Dashboard
                </button>

                <button
                  onClick={() => {
                    setShowLogout(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-3 rounded-xl border border-red-200 text-red-500 font-semibold"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navigation;