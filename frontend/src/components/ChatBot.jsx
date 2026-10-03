import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Send,
  RotateCcw,
  Globe,
  UserCheck,
  Sparkles,
  ChevronRight,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { askGeminiAI } from "../services/geminiService";
import "./ChatBot.css";

const ChatBot = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);

  // Onboarding Quiz State: "language" -> "role" -> "completed"
  const [onboardingStep, setOnboardingStep] = useState(() => {
    return localStorage.getItem("agri_ai_onboarded") === "true" ? "completed" : "language";
  });

  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("agri_ai_lang") || "English";
  });

  const [role, setRole] = useState(() => {
    return localStorage.getItem("agri_ai_role") || user?.role || "Explorer";
  });

  // Messages List
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("agri_ai_messages");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback default
      }
    }
    return [];
  });

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem("agri_ai_lang", language);
      localStorage.setItem("agri_ai_role", role);
      localStorage.setItem("agri_ai_onboarded", onboardingStep === "completed");
      localStorage.setItem("agri_ai_messages", JSON.stringify(messages));
    } catch (e) {
      console.error("Storage error:", e);
    }
  }, [language, role, onboardingStep, messages]);

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, loading, isOpen, onboardingStep]);

  // Handle Initial Welcome Message when onboarding completes
  const completeOnboarding = (selectedLanguage, selectedRole) => {
    setLanguage(selectedLanguage);
    setRole(selectedRole);
    setOnboardingStep("completed");

    let welcomeText = "";
    if (selectedLanguage === "Hindi" || selectedLanguage === "हिंदी") {
      welcomeText = `🌾 **नमस्ते! एग्रीएश्योर एआई सहायक में आपका स्वागत है।**\n\nआप **${selectedRole}** के रूप में जुड़े हैं। मैं आपकी अनुबंध खेती (Contract Farming), एस्क्रो सुरक्षा और मंडी भाव में मदद के लिए तैयार हूँ। नीचे दिए गए सुझावों में से चुनें या अपना प्रश्न टाइप करें!`;
    } else if (selectedLanguage === "Hinglish") {
      welcomeText = `🌾 **Namaste! AgriAssure AI Assistant me aapka swagat hai.**\n\nAapne **${selectedRole}** select kiya hai. Main aapki contract farming, Razorpay Escrow, crop listing aur Mandi rates me help kar sakta hu. Sawaal poochein!`;
    } else {
      welcomeText = `🌾 **Welcome to AgriAssure AI Assistant!**\n\nYou are exploring as a **${selectedRole}** in **${selectedLanguage}**. I'm here to assist you with crop marketplace listings, Razorpay Escrow protection, digital contracts, and Mandi rates.`;
    }

    setMessages([
      {
        id: Date.now(),
        sender: "bot",
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  // Reset Onboarding Settings
  const resetSetup = () => {
    setOnboardingStep("language");
    setMessages([]);
    localStorage.removeItem("agri_ai_messages");
  };

  // Send Message Handler
  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const botReplyText = await askGeminiAI(messages, query, language, role);

      const botMsg = {
        id: Date.now() + 1,
        sender: "bot",
        text: botReplyText || "No response received.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("❌ [ChatBot UI] Error in handleSend:", err);
      const errorMsg = {
        id: Date.now() + 1,
        sender: "bot",
        text: "I am having trouble connecting right now. Please try again shortly.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Quick Suggestion Chips based on Language
  const getSuggestions = () => {
    if (language === "Hindi" || language === "हिंदी") {
      return [
        "एस्क्रो भुगतान सुरक्षा कैसे काम करती है?",
        "फसल लिस्टिंग कैसे दर्ज करें?",
        "खरीदार के रूप में प्रस्ताव (Offer) कैसे भेजें?",
        "ताज़ा मंडी भाव कहाँ देखें?",
      ];
    }
    if (language === "Hinglish") {
      return [
        "Escrow payment kaise kaam karta hai?",
        "Crop listing kaise add karein?",
        "Buyer proposal kaise send karein?",
        "Mandi rates kahan check karein?",
      ];
    }
    return [
      "How does Razorpay Escrow payment work?",
      "How to post a crop listing as a farmer?",
      "How to send a purchase proposal as a buyer?",
      "Where to view real-time Mandi Rates?",
    ];
  };

  return (
    <>
      {/* 🟢 LIGHT THEME FLOATING ACTION BUTTON (FAB) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3"
          >
            {/* Pulsing Pill Tooltip */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              onClick={() => setIsOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/95 text-emerald-800 border border-emerald-300 shadow-lg cursor-pointer hover:border-emerald-500 backdrop-blur-md text-xs font-bold"
            >
              <Sparkles size={14} className="text-emerald-600 animate-pulse" />
              <span>Ask AgriAI</span>
            </motion.div>

            {/* Glowing FAB Button with chatBot.png */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(true)}
              className="agri-fab-aura relative w-14 h-14 rounded-full bg-white text-slate-800 shadow-xl flex items-center justify-center border-2 border-emerald-400 p-1.5 cursor-pointer"
            >
              <img
                src="/chatbot.png"
                alt="AgriAI Assistant"
                className="w-full h-full object-contain drop-shadow-sm rounded-full"
              />
              <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full animate-ping"></span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🤖 LIGHT THEME FLOATING CHATBOT WINDOW */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 40 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className={`fixed z-50 chatbot-window-light rounded-3xl overflow-hidden flex flex-col text-slate-800 ${
              minimized
                ? "bottom-6 right-6 w-80 h-16 rounded-2xl"
                : "bottom-6 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[420px] h-[580px] max-h-[85vh]"
            }`}
          >
            {/* 👑 LIGHT HEADER */}
            <div className="bg-linear-to-r from-emerald-600 via-teal-600 to-emerald-700 p-3.5 text-white flex items-center justify-between shrink-0 select-none shadow-md">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-2xl bg-white p-1 border border-white/40 flex items-center justify-center shrink-0 shadow-xs">
                  <img src="/chatbot.png" alt="AgriAI Avatar" className="w-full h-full object-contain" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-emerald-700"></span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                    AgriAssure AI <Sparkles size={13} className="text-emerald-200" />
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-emerald-100">
                    <span className="font-medium text-emerald-200">● Online</span>
                    {onboardingStep === "completed" && (
                      <span>
                        • {language} ({role})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Header Controls */}
              <div className="flex items-center gap-1.5 text-white/80">
                {onboardingStep === "completed" && !minimized && (
                  <button
                    onClick={resetSetup}
                    className="p-1.5 rounded-lg hover:bg-white/20 hover:text-white transition"
                    title="Change Language or Role"
                  >
                    <RotateCcw size={16} />
                  </button>
                )}

                <button
                  onClick={() => setMinimized(!minimized)}
                  className="p-1.5 rounded-lg hover:bg-white/20 hover:text-white transition"
                >
                  {minimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                </button>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/20 hover:text-white transition"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* If Minimized, hide body */}
            {!minimized && (
              <div className="flex flex-col grow overflow-hidden bg-slate-50/70">
                {/* 📋 ONBOARDING STEP 1: LANGUAGE SELECTOR */}
                {onboardingStep === "language" && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-6 flex flex-col justify-center items-center h-full text-center space-y-6"
                  >
                    <div className="w-20 h-20 rounded-full bg-emerald-100 border border-emerald-300 p-2 flex items-center justify-center shadow-md">
                      <img src="/chatbot.png" alt="AgriAI" className="w-full h-full object-contain" />
                    </div>

                    <div>
                      <h4 className="text-xl font-extrabold text-slate-900 mb-1">Select Preferred Language</h4>
                      <p className="text-xs text-slate-500 font-medium">भाषा चुनें / Choose your language</p>
                    </div>

                    <div className="w-full space-y-3">
                      {[
                        { code: "English", label: "🇬🇧 English", desc: "Standard English Assistant" },
                        { code: "Hindi", label: "🇮🇳 हिंदी (Hindi)", desc: "सरल हिंदी भाषा" },
                        { code: "Hinglish", label: "🌾 Hinglish", desc: "Hindi + English mixed" },
                      ].map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setLanguage(lang.code);
                            setOnboardingStep("role");
                          }}
                          className="w-full p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/80 text-left transition flex items-center justify-between group shadow-xs cursor-pointer"
                        >
                          <div>
                            <span className="font-bold text-slate-800 text-sm block group-hover:text-emerald-700">
                              {lang.label}
                            </span>
                            <span className="text-xs text-slate-500">{lang.desc}</span>
                          </div>
                          <ChevronRight size={18} className="text-slate-400 group-hover:text-emerald-600" />
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* 📋 ONBOARDING STEP 2: ROLE SELECTOR */}
                {onboardingStep === "role" && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-6 flex flex-col justify-center items-center h-full text-center space-y-6"
                  >
                    <div className="w-16 h-16 rounded-full bg-teal-100 border border-teal-300 flex items-center justify-center text-teal-700 shadow-md">
                      <UserCheck size={30} />
                    </div>

                    <div>
                      <h4 className="text-xl font-extrabold text-slate-900 mb-1">What is your primary role?</h4>
                      <p className="text-xs text-slate-500 font-medium">आपकी भूमिका क्या है? / Tell us about yourself</p>
                    </div>

                    <div className="w-full space-y-3">
                      {[
                        {
                          id: "Farmer",
                          title: "👨‍🌾 Farmer / किसान",
                          desc: "I grow crops and want fair contracts & guaranteed payment",
                        },
                        {
                          id: "Buyer",
                          title: "💼 Buyer / खरीदार",
                          desc: "I want to buy quality crops & deposit Escrow funds safely",
                        },
                        {
                          id: "Explorer",
                          title: "🔍 Just Exploring / अन्वेषक",
                          desc: "I want to learn about contract farming & AgriAssure",
                        },
                      ].map((r) => (
                        <button
                          key={r.id}
                          onClick={() => completeOnboarding(language, r.id)}
                          className="w-full p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/80 text-left transition flex items-center justify-between group shadow-xs cursor-pointer"
                        >
                          <div>
                            <span className="font-bold text-slate-800 text-sm block group-hover:text-emerald-700">
                              {r.title}
                            </span>
                            <span className="text-xs text-slate-500">{r.desc}</span>
                          </div>
                          <ChevronRight size={18} className="text-slate-400 group-hover:text-emerald-600" />
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setOnboardingStep("language")}
                      className="text-xs text-slate-500 hover:text-emerald-700 font-medium transition underline cursor-pointer"
                    >
                      ← Back to language selection
                    </button>
                  </motion.div>
                )}

                {/* 💬 LIGHT CHAT MESSAGES BODY */}
                {onboardingStep === "completed" && (
                  <div className="flex flex-col grow overflow-hidden">
                    <div className="grow p-4 overflow-y-auto space-y-3.5 chatbot-messages-scroll bg-slate-50/60">
                      {messages.map((msg) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                        >
                          {msg.sender === "bot" && (
                            <div className="w-7 h-7 rounded-full bg-white border border-emerald-200 p-0.5 shrink-0 mr-2 shadow-xs">
                              <img src="/chatbot.png" alt="Bot" className="w-full h-full object-contain" />
                            </div>
                          )}

                          <div
                            className={`max-w-[82%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                              msg.sender === "user"
                                ? "bg-emerald-600 text-white rounded-br-none font-medium"
                                : "bg-white border border-slate-200/90 text-slate-800 rounded-bl-none shadow-xs"
                            }`}
                          >
                            <div className="whitespace-pre-line">{msg.text}</div>
                            <span
                              className={`block text-[10px] mt-1.5 ${
                                msg.sender === "user" ? "text-emerald-100 text-right" : "text-slate-400"
                              }`}
                            >
                              {msg.timestamp}
                            </span>
                          </div>
                        </motion.div>
                      ))}

                      {/* Loading Animated Dots */}
                      {loading && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-white border border-emerald-200 p-0.5 shrink-0 shadow-xs">
                            <img src="/chatbot.png" alt="Bot" className="w-full h-full object-contain" />
                          </div>
                          <div className="bg-white border border-slate-200/90 rounded-2xl p-3 flex items-center gap-1.5 shadow-xs">
                            <span className="typing-dot-light"></span>
                            <span className="typing-dot-light"></span>
                            <span className="typing-dot-light"></span>
                          </div>
                        </motion.div>
                      )}

                      <div ref={messagesEndRef} />
                    </div>

                    {/* 💡 LIGHT QUICK SUGGESTION CHIPS */}
                    <div className="px-3.5 py-2 bg-white border-t border-slate-200/80 flex gap-2 overflow-x-auto custom-scrollbar shrink-0">
                      {getSuggestions().map((chip, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(chip)}
                          className="suggestion-chip-light px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>

                    {/* ⌨️ LIGHT INPUT BAR */}
                    <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0">
                      <input
                        type="text"
                        placeholder={
                          language === "Hindi" || language === "हिंदी"
                            ? "अपना प्रश्न यहाँ टाइप करें..."
                            : "Ask AgriAI anything..."
                        }
                        className="w-full bg-slate-50 border border-slate-300 text-slate-900 py-2.5 px-3.5 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition placeholder-slate-400 font-medium"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      />

                      <button
                        onClick={() => handleSend()}
                        disabled={loading || !input.trim()}
                        className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold transition shadow-md shrink-0 cursor-pointer"
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;
