import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import logo from "/src/assets/mystic-oracle-logo.png";
import { motion, AnimatePresence } from "framer-motion";
import { HiMenu } from "react-icons/hi";
import { FaGlobe } from "react-icons/fa";

const languages = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "sl", label: "Slovenščina", flag: "🇸🇮" },
];

// Detect login status
  function getUserLoggedIn() {
    try {
      const user = JSON.parse(localStorage.getItem("user")) || JSON.parse(sessionStorage.getItem("user"));
      return !!user?.email;
    } catch {
      return false;
    }
  }

export default function Header() {
  const { i18n } = useTranslation();
  const [langOpen, setLangOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(getUserLoggedIn());

  useEffect(() => {
    const listener = () => setIsLoggedIn(getUserLoggedIn());
    window.addEventListener("storage", listener);
    return () => window.removeEventListener("storage", listener);
  }, []);

  // Pages to show
  const pages = [
    { name: "Home", href: "/" },
    { name: "Plans", href: "/subscribe" },
    ...(isLoggedIn ? [{ name: "Chat", href: "/chat" }] : []),
    { name: "FAQ", href: "/faq" },
    ...(isLoggedIn ? [{ name: "Profile", href: "/user" }] : []),
  ];

  // Refs for dropdown close
  const langRef = useRef();
  const navRef = useRef();

  useEffect(() => {
    const close = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
      if (navRef.current && !navRef.current.contains(e.target)) setNavOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-transparent transition-all">
      <div className="flex items-center justify-between px-2 sm:px-4 md:px-8 py-2 md:py-4 max-w-[1400px] mx-auto mb-2 md:mb-0">
        {/* Logo */}
        <a href="/" className="flex items-center z-20">
          <img
            src={logo}
            alt="Mystic Oracle Logo"
            className="h-14 w-auto md:h-20 min-w-[56px] md:min-w-[90px] drop-shadow-lg transition hover:scale-105"
            style={{ maxHeight: "60px" }}
          />
        </a>

        {/* Desktop Nav + Language */}
        <div className="hidden md:flex items-center gap-4">
          {pages.map((page) => (
            <a
              key={page.href}
              href={page.href}
              className="text-[#ffe88a] font-bold px-4 py-2 rounded-xl hover:bg-[#ffe88a]/10 transition"
            >
              {page.name}
            </a>
          ))}
          {/* Language Dropdown */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setLangOpen((v) => !v)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-bold transition bg-[#ffe88a] text-[#321354] border-[#ffe88a] shadow-md"
            >
              <FaGlobe className="text-lg" />
              <span>{languages.find(l => l.code === i18n.language)?.label || "Language"}</span>
              <svg className={`w-4 h-4 ml-1 transition-transform ${langOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>
            <AnimatePresence>
              {langOpen && (
                <motion.div
                  key="langDropdown"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.22, type: "tween" }}
                  className="absolute right-0 mt-2 w-48 bg-white shadow-xl rounded-xl border-2 border-[#ffe88a] z-50"
                >
                  {languages.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => { i18n.changeLanguage(lang.code); setLangOpen(false); }}
                      className={`flex items-center w-full px-4 py-2 text-left gap-2 font-semibold rounded-xl
                        ${i18n.language === lang.code
                          ? "bg-[#ffe88a] text-[#321354]"
                          : "hover:bg-[#f6ecd3] text-[#321354]"
                        }`}
                    >
                      <span className="text-xl">{lang.flag}</span>
                      <span>{lang.label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {/* Login/Register Button (only if not logged in) */}
          {!isLoggedIn && (
            <a
              href="/login"
              className="ml-2 px-6 py-2 text-base rounded-full font-bold transition border-2 border-[#ffe88a] bg-transparent text-[#ffe88a] hover:bg-[#ffe88a]/20 shadow"
            >
              Login / Register
            </a>
          )}
        </div>

        {/* Mobile: Burger + Globe */}
        <div className="md:hidden flex items-center gap-3">
          {/* Language Dropdown */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setLangOpen((v) => !v)}
              className="flex items-center justify-center p-2 bg-[#ffe88a] rounded-full shadow"
            >
              <FaGlobe className="text-[#321354] text-xl" />
            </button>
            <AnimatePresence>
              {langOpen && (
                <motion.div
                  key="mobileLangDropdown"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.18 }}
                  className="absolute right-0 mt-2 w-40 bg-white shadow-xl rounded-xl border-2 border-[#ffe88a] z-50"
                >
                  {languages.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => { i18n.changeLanguage(lang.code); setLangOpen(false); }}
                      className={`flex items-center w-full px-4 py-2 text-left gap-2 font-semibold rounded-xl
                        ${i18n.language === lang.code
                          ? "bg-[#ffe88a] text-[#321354]"
                          : "hover:bg-[#f6ecd3] text-[#321354]"
                        }`}
                    >
                      <span className="text-xl">{lang.flag}</span>
                      <span>{lang.label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {/* Burger Nav */}
          <div className="relative" ref={navRef}>
            <button
              onClick={() => setNavOpen((v) => !v)}
              className="flex items-center justify-center p-2 bg-[#ffe88a] rounded-full shadow"
            >
              <HiMenu className="text-[#321354] text-2xl" />
            </button>
            <AnimatePresence>
              {navOpen && (
                <motion.div
                  key="mobileNavDropdown"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.18 }}
                  className="absolute right-0 mt-2 w-48 bg-white shadow-xl rounded-xl border-2 border-[#ffe88a] z-50 flex flex-col"
                >
                  {pages.map(page => (
                    <a
                      key={page.href}
                      href={page.href}
                      className="px-4 py-3 font-semibold text-[#321354] hover:bg-[#f6ecd3] rounded-xl transition"
                      onClick={() => setNavOpen(false)}
                    >
                      {page.name}
                    </a>
                  ))}
                  {!isLoggedIn && (
                    <a
                      href="/login"
                      className="mt-1 px-4 py-3 font-bold text-[#321354] border-t border-[#ffe88a] hover:bg-[#ffe88a]/20 rounded-xl transition"
                    >
                      Login / Register
                    </a>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
