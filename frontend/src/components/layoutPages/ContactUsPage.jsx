import React, { useState } from "react";
import { MapPin, PhoneCall, Mail, Leaf, CheckCircle, Send } from "lucide-react";

/* TiltCard Wrapper (kept simple so your design stays same) */
const TiltCard = ({ children, className = "" }) => {
  return (
    <div className={`transform transition duration-300 hover:scale-[1.02] ${className}`}>
      {children}
    </div>
  );
};

export default function ContactUsPage() {
  const [formState, setFormState] = useState("idle");

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setFormState("submitting");

    // Simulate API delay
    setTimeout(() => {
      setFormState("success");
    }, 2000);
  };

  return (
    <section
      id="contact"
      
     className="py-16 sm:py-20 lg:py-24 bg-linear-to-br from-emerald-800 via-grey to-emerald-850 relative overflow-hidden min-h-screen"
    >
      {/* Background Decorations */}
      <div className="absolute top-0 right-0 w-3/4 lg:w-1/2 h-full bg-emerald-50/50 -skew-x-12 transform origin-top-right z-0"></div>
      <div className="absolute bottom-0 left-0 w-24 sm:w-32 h-24 sm:h-32 bg-emerald-100 rounded-full blur-3xl opacity-50 z-0"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Heading */}
        <div className="text-center mb-12 sm:mb-16">
          <span className="text-emerald-600 font-bold tracking-widest uppercase text-xs sm:text-sm mb-3 sm:mb-4 block">
            Get In Touch
          </span>

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-800 leading-tight">
            Let's Grow{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-600 to-teal-500">
              Together
            </span>
          </h2>

          <p className="mt-3 sm:mt-4 text-slate-600 text-sm sm:text-base lg:text-lg max-w-xl sm:max-w-2xl mx-auto">
            Have questions about our platform or want to explore partnership opportunities? We'd love to hear from you.
          </p>
        </div>

        {/* Layout */}
        <div className="flex flex-col lg:flex-row gap-8 sm:gap-10 lg:gap-20 items-stretch">
          {/* LEFT SIDE */}
          <div className="w-full lg:w-5/12">
            <TiltCard className="h-full">
              <div className="bg-slate-900 h-full p-6 sm:p-8 md:p-10 rounded-3xl shadow-2xl relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 w-32 sm:w-40 h-32 sm:h-40 bg-emerald-500 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition duration-500"></div>

                <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 sm:mb-8">
                  Contact Information
                </h3>

                <div className="space-y-6 sm:space-y-8">
                  {/* Address */}
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="bg-emerald-500/20 p-2 sm:p-3 rounded-xl text-emerald-400">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm sm:text-base mb-1">
                        Corporate Office
                      </p>
                      <p className="text-slate-400 text-xs sm:text-sm">
                        Agriassure, Bairagarh, Bhopal, Madhya Pradesh 462030
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="bg-emerald-500/20 p-2 sm:p-3 rounded-xl text-emerald-400">
                      <PhoneCall size={20} />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm sm:text-base mb-1">
                        Phone Number
                      </p>
                      <p className="text-slate-400 text-xs sm:text-sm">
                        +91 1800-AGRI-SURE
                      </p>
                      <p className="text-slate-400 text-xs sm:text-sm">
                        +91 98765 43210 (Support)
                      </p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="bg-emerald-500/20 p-2 sm:p-3 rounded-xl text-emerald-400">
                      <Mail size={20} />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm sm:text-base mb-1">
                        Email Address
                      </p>
                      <p className="text-slate-400 text-xs sm:text-sm">
                        sagar09shrm@gmail.com
                      </p>
                      <p className="text-slate-400 text-xs sm:text-sm">
                        support@agriassure.com
                      </p>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-6 right-6 sm:bottom-8 sm:right-8 opacity-10">
                  <Leaf size={80} className="text-white rotate-45" />
                </div>
              </div>
            </TiltCard>
          </div>

          {/* RIGHT SIDE */}
          <div className="w-full lg:w-7/12">
            <div className="bg-white p-6 sm:p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100">
              {formState === "success" ? (
                <div className="h-full min-h-[300px] sm:min-h-[400px] flex flex-col items-center justify-center text-center">
                  <div className="w-16 sm:w-20 h-16 sm:h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                    <CheckCircle size={32} className="text-emerald-600" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">
                    Message Sent Successfully!
                  </h3>
                  <p className="text-slate-600 text-sm sm:text-base">
                    Thank you for reaching out. Our team will get back within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-5 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <input
                      type="text"
                      required
                      placeholder="Full Name"
                      className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 bg-gray-50"
                    />
                    <input
                      type="email"
                      required
                      placeholder="Email Address"
                      className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 bg-gray-50"
                    />
                  </div>

                  <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 bg-gray-50">
                    <option>Farmer / FPO</option>
                    <option>Buyer / Retailer</option>
                    <option>Partner</option>
                    <option>Other</option>
                  </select>

                  <textarea
                    rows="4"
                    required
                    placeholder="Your Message"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 bg-gray-50"
                  />

                  <button
                    type="submit"
                    className="w-full py-3 sm:py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2"
                  >
                    {formState === "submitting" ? "Sending..." : "Send Message"}
                    <Send size={18} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}