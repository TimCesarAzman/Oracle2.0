import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import logo from "../assets/mystic-oracle-logo.png";

// Simulated API (localStorage); replace with real API for production!
const loadContent = (lang) => {
  const raw = localStorage.getItem(`oracle-content-${lang}`);
  return raw
    ? JSON.parse(raw)
    : {
        homeTitle: lang === "sl" ? "ORAKELJ VAS ČAKA" : "THE ORACLE AWAITS",
        homeSubtitle: lang === "sl"
          ? "Odkrij skrivnosti svoje prihodnosti – prejmi takojšnje odgovore in vpoglede od pravega oraklja."
          : "Unlock the mysteries of your future – receive instant answers and insights from a real fortune teller.",
        faq: []
      };
};
const saveContent = (lang, data) =>
  localStorage.setItem(`oracle-content-${lang}`, JSON.stringify(data));

export default function AdminDashboard() {
  const { t, i18n } = useTranslation();
  const [showEditor, setShowEditor] = useState(false);

  // Content Editor states
  const [lang, setLang] = useState(i18n.language);
  const [content, setContent] = useState(() => loadContent(lang));

  // When language changes, load content for that lang
  function handleLangChange(l) {
    setLang(l);
    setContent(loadContent(l));
  }

  // Live update fields
  function handleChange(e) {
    setContent((c) => ({ ...c, [e.target.name]: e.target.value }));
  }

  // Edit FAQ entry
  function editFaq(idx, field, value) {
    setContent((c) => ({
      ...c,
      faq: c.faq.map((f, i) =>
        i === idx ? { ...f, [field]: value } : f
      )
    }));
  }

  // Add FAQ
  function addFaq() {
    setContent((c) => ({
      ...c,
      faq: [...c.faq, { q: "", a: "" }]
    }));
  }

  // Remove FAQ
  function removeFaq(idx) {
    setContent((c) => ({
      ...c,
      faq: c.faq.filter((_, i) => i !== idx)
    }));
  }

  // Save to "backend"
  function handleSave() {
    saveContent(lang, content);
    alert(t("saveChanges") + "!");
  }

  return (
    <div className="flex flex-col items-center min-h-screen pt-36 pb-12 font-serif relative z-10">
      {/* Logo and Page Title */}
      <img src={logo} alt={t("siteTitle")} className="h-16 mb-6 drop-shadow" />
      <div className="text-[2rem] md:text-3xl font-bold text-[#dbb24a] mb-1 tracking-widest">{t("adminWelcome")}</div>
      <div className="mb-8 text-[#e9d49b] text-center text-lg md:text-xl max-w-2xl">{t("adminSubtitle")}</div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-5xl">
        {/* Site Traffic */}
        <div className="bg-white/20 backdrop-blur-xl rounded-2xl shadow-xl p-7 flex flex-col">
          <div className="text-lg font-bold text-[#dbb24a] mb-3">{t("stats")}</div>
          <div className="flex flex-col gap-1">
            <div className="flex justify-between">
              <span className="text-[#fff6e7]">{t("adminActiveUsers")}</span>
              <span className="text-[#dbb24a] font-bold">210</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#fff6e7]">{t("adminNewSubscribers")}</span>
              <span className="text-[#dbb24a] font-bold">25</span>
            </div>
          </div>
        </div>
        {/* Users */}
        <div className="bg-white/20 backdrop-blur-xl rounded-2xl shadow-xl p-7 flex flex-col">
          <div className="text-lg font-bold text-[#dbb24a] mb-3">{t("users")}</div>
          <ul className="text-[#fff6e7] space-y-2">
            <li><span className="font-semibold">sarah@example.com</span> — Seeker</li>
            <li><span className="font-semibold">john@example.com</span> — Unlimited</li>
          </ul>
        </div>
        {/* Chats */}
        <div className="bg-white/20 backdrop-blur-xl rounded-2xl shadow-xl p-7 flex flex-col">
          <div className="text-lg font-bold text-[#dbb24a] mb-3">{t("chats")}</div>
          <ul className="text-[#fff6e7] space-y-2">
            <li><span className="font-semibold">Ella</span>: "When will I find love?"</li>
            <li><span className="font-semibold">Jason</span>: "Will I get the job?"</li>
          </ul>
        </div>
        {/* Content Editor */}
        <div className="bg-white/20 backdrop-blur-xl rounded-2xl shadow-xl p-7 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="text-lg font-bold text-[#dbb24a]">{t("contentEditor")}</div>
            <button
              onClick={() => setShowEditor((s) => !s)}
              className="text-[#dbb24a] text-xl px-3 py-1 bg-white/20 rounded hover:bg-white/30"
            >
              {showEditor ? "−" : "+"}
            </button>
          </div>
          {showEditor && (
            <div className="transition-all">
              {/* Language Switcher */}
              <div className="flex gap-4 mb-5">
                <button
                  className={`px-4 py-2 rounded-full border-2 font-bold transition ${
                    lang === "en"
                      ? "bg-[#dbb24a] text-[#321354] border-[#dbb24a] shadow-md"
                      : "bg-transparent text-[#dbb24a] border-[#dbb24a] hover:bg-[#dbb24a]/20"
                  }`}
                  onClick={() => handleLangChange("en")}
                >🇬🇧 English</button>
                <button
                  className={`px-4 py-2 rounded-full border-2 font-bold transition ${
                    lang === "sl"
                      ? "bg-[#dbb24a] text-[#321354] border-[#dbb24a] shadow-md"
                      : "bg-transparent text-[#dbb24a] border-[#dbb24a] hover:bg-[#dbb24a]/20"
                  }`}
                  onClick={() => handleLangChange("sl")}
                >🇸🇮 Slovenščina</button>
              </div>
              {/* Homepage Hero Text */}
              <div className="mb-5">
                <label className="font-bold text-[#dbb24a]">{t("homeTitle")}</label>
                <input
                  type="text"
                  name="homeTitle"
                  value={content.homeTitle}
                  onChange={handleChange}
                  className="w-full mb-2 px-4 py-2 rounded bg-white/30 border border-[#dbb24a] text-[#321354] font-bold"
                />
                <label className="font-bold text-[#dbb24a]">{t("homeSubtitle")}</label>
                <textarea
                  name="homeSubtitle"
                  value={content.homeSubtitle}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded bg-white/30 border border-[#dbb24a] text-[#321354]"
                  rows={3}
                />
              </div>
              {/* FAQ Editor */}
              <div>
                <div className="font-bold text-[#dbb24a] text-lg mb-2">{t("faqEditor")}</div>
                {content.faq.map((f, i) => (
                  <div key={i} className="flex flex-col gap-1 mb-4 bg-white/10 rounded-xl p-3 relative">
                    <input
                      type="text"
                      placeholder="Question"
                      value={f.q}
                      onChange={(e) => editFaq(i, "q", e.target.value)}
                      className="px-3 py-2 rounded bg-white/30 border border-[#dbb24a] text-[#321354] font-semibold mb-1"
                    />
                    <textarea
                      placeholder="Answer"
                      value={f.a}
                      onChange={(e) => editFaq(i, "a", e.target.value)}
                      className="px-3 py-2 rounded bg-white/30 border border-[#dbb24a] text-[#321354]"
                      rows={2}
                    />
                    <button
                      onClick={() => removeFaq(i)}
                      className="absolute top-2 right-2 text-[#dbb24a] hover:text-red-400 font-bold"
                      title="Remove"
                    >✖</button>
                  </div>
                ))}
                <button
                  onClick={addFaq}
                  className="mt-2 px-5 py-2 bg-[#dbb24a] text-[#321354] rounded-xl font-bold shadow hover:bg-[#ffe88a] transition"
                >{t("addFaq")}</button>
              </div>
              {/* Save */}
              <button
                onClick={handleSave}
                className="mt-5 px-8 py-3 bg-[#dbb24a] text-[#321354] font-bold rounded-2xl shadow hover:bg-[#ffe88a] transition"
              >{t("saveChanges")}</button>
            </div>
          )}
        </div>
      </div>
      {/* Log Out */}
      <button className="mt-10 px-10 py-3 bg-[#dbb24a] text-[#321354] font-bold rounded-2xl shadow hover:bg-[#ffe88a] transition">
        {t("logout")}
      </button>
    </div>
  );
}
