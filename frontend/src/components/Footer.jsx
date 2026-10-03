import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Leaf,
  Twitter,
  Linkedin,
  Instagram,
  Mail
} from "lucide-react";

const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentYear = new Date().getFullYear();


const Footer = () => {
  return (
    <>
      

      {/* ================= MAIN FOOTER ================= */}
      <motion.footer
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
        className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800"
      >
        <div className="w-full px-6 sm:px-8 lg:px-16 xl:px-20 flex flex-col md:flex-row justify-between items-center gap-8">

          {/* Brand */}
          <div className="flex items-center gap-2 text-white font-extrabold text-xl md:text-2xl">
            <Link to="/" onClick={scrollToTop} className="inline-block transition-transform hover:scale-105">
              <img
                src="/agriLight.png"
                alt="Agriassure Logo"
                className="h-14 md:h-16 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Links */}
          <div className="flex gap-6 text-base">
            <a href="#" className="hover:text-white transition">Privacy</a>
            <a href="#" className="hover:text-white transition">Terms</a>
            <a href="#" className="hover:text-white transition">Support</a>
          </div>

          {/* Social Icons */}
          <div className="flex gap-4">
            <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-emerald-600 transition">
              <Twitter size={18} />
            </a>
            <a href="https://linkedin.com/in/sagar-sharma-751943336" className="p-2 bg-gray-800 rounded-full hover:bg-emerald-600 transition">
              <Linkedin size={18} />
            </a>
            <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-emerald-600 transition">
              <Instagram size={18} />
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 text-center text-sm text-gray-500">
          © {currentYear} AgriAssure Technologies Pvt. Ltd. All rights reserved.
        </div>
      </motion.footer>
    </>
  );
};

export default Footer;
