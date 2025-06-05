import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FaGoogle, FaFacebookF, FaApple } from "react-icons/fa";
import logo from "/src/assets/mystic-oracle-logo-notxt.png";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function LoginPage() {
  const location = useLocation();
  const { t } = useTranslation();
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMsg, setForgotMsg] = useState("");

  // Handle token in URL for Google login
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("token", token);
      window.location.href = "/user";
    }
  }, [location]);

  async function handleEmailAuth(e) {
    e.preventDefault();
    setError(""); setSuccess("");
    if (isRegister) {
      // Registration
      const res = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pw, name }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(t("registerSuccess") || "Registration successful! Please log in.");
        setIsRegister(false);
        setEmail(""); setPw(""); setName("");
      } else {
        setError(data.error || t("registerFail"));
      }
    } else {
      // Login
      const res = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pw }),
      });
      const data = await res.json();
      if (data.token) {
        if (rememberMe) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
        } else {
          sessionStorage.setItem("token", data.token);
          sessionStorage.setItem("user", JSON.stringify(data.user));
        }
        setSuccess(t("loginSuccess") || "Logged in!");
        setTimeout(() => window.location.href = "/user", 1000);
      } else {
        setError(data.error || t("loginFail"));
      }
    }
  }

  // Forgot password flow (request reset email)
  async function handleForgot(e) {
    e.preventDefault();
    setForgotMsg("");
    const res = await fetch(`${API_URL}/api/request-reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: forgotEmail }),
    });
    setForgotMsg(t("checkInbox") || "If the email exists, you'll get instructions shortly.");
    setForgotEmail("");
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, filter: "blur(6px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 1.04, filter: "blur(8px)" }}
      transition={{ duration: 0.7, ease: "easeInOut" }}
    >
      <div className="flex flex-col justify-center items-center min-h-screen font-serif relative z-10">
        {/* Top logo */}
        <div className="flex flex-col items-center mb-12 mt-10">
          <img src={logo} alt="Mystic Oracle Logo" className="h-20 w-auto mb-4 drop-shadow" />
          <div className="text-[2.2rem] font-extrabold tracking-widest mb-1" style={{ color: "#dbb24a", letterSpacing: "0.06em" }}>
            MYSTIC ORACLE
          </div>
        </div>

        {/* Title and subtitle */}
        <div className="text-center mb-10">
          <h1 className="text-[2.5rem] md:text-5xl font-serif font-bold mb-2" style={{ color: "#f7e7b6" }}>
            {t("loginTitle")}
          </h1>
          <div className="text-xl text-[#dbb24a] tracking-wide" style={{ color: "#e9d49b" }}>
            {t("loginSubtitle")}
          </div>
        </div>

        {/* Login buttons */}
        <div className="flex flex-col gap-5 w-full max-w-md">
          {/* Google */}
          <button
            className="flex items-center justify-center gap-4 w-full py-4 rounded-xl text-lg font-semibold shadow-sm transition
            bg-[#f7f7f7] text-[#212121] hover:bg-[#eee] border border-[#ece3c1]"
            onClick={() => window.location.href = "http://localhost:4000/api/auth/google"}
          >
            <FaGoogle className="text-2xl" />
            {t("loginGoogle")}
          </button>
          {/* Facebook */}
          <button className="flex items-center justify-center gap-4 w-full py-4 rounded-xl text-lg font-semibold shadow-sm transition
            bg-[#3b5998] text-white hover:bg-[#34508c]">
            <FaFacebookF className="text-2xl" />
            {t("loginFacebook")}
          </button>
          {/* Email */}
          {!showEmailForm ? (
            <button
              className="flex items-center justify-center gap-4 w-full py-4 rounded-xl text-lg font-semibold shadow-sm transition
              bg-[#311a42]/80 text-[#e9d49b] hover:bg-[#442360]"
              onClick={() => setShowEmailForm(true)}
            >
              {t("loginEmail")}
            </button>
          ) : (
            <form
              onSubmit={handleEmailAuth}
              className="flex flex-col gap-3 bg-[#22132c]/80 rounded-xl p-6 mt-2"
            >
              {isRegister && (
                <input
                  className="px-4 py-3 rounded bg-white/20 border border-[#dbb24a] text-[#321354] font-semibold"
                  type="text"
                  placeholder={t("loginName") || "Name"}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              )}
              <input
                className="px-4 py-3 rounded bg-white/20 border border-[#dbb24a] text-[#321354] font-semibold"
                type="email"
                placeholder={t("loginEmail") || "Email"}
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <input
                className="px-4 py-3 rounded bg-white/20 border border-[#dbb24a] text-[#321354] font-semibold"
                type="password"
                placeholder={t("loginPassword") || "Password"}
                value={pw}
                onChange={e => setPw(e.target.value)}
                required
              />
              {error && <div className="text-red-400 text-sm">{error}</div>}
              {success && <div className="text-green-400 text-sm">{success}</div>}
              <button type="submit" className="bg-[#dbb24a] text-[#321354] font-bold rounded-xl py-3 px-8 shadow hover:bg-[#ffe88a] transition">
                {isRegister ? t("register") : t("loginBtn") || "Log In"}
              </button>
              <label className="flex items-center text-[#dbb24a] text-sm mt-1">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="mr-2"
                />
                {t("rememberMe")}
              </label>
              {/* Forgot password */}
              {forgotMode && (
                <form onSubmit={handleForgot} className="flex flex-col gap-3 bg-[#22132c]/80 rounded-xl p-6 mt-2">
                  <input
                    className="px-4 py-3 rounded bg-white/20 border border-[#dbb24a] text-[#321354] font-semibold"
                    type="email"
                    placeholder={t("loginEmail") || "Email"}
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    required
                  />
                  <button type="submit" className="bg-[#dbb24a] text-[#321354] font-bold rounded-xl py-3 px-8 shadow hover:bg-[#ffe88a] transition">
                    {t("resetPassword") || "Reset Password"}
                  </button>
                  {forgotMsg && <div>{forgotMsg}</div>}
                  <button type="button" className="text-gray-400 text-xs mt-1" onClick={() => setForgotMode(false)}>
                    {t("loginBack") || "Back"}
                  </button>
                </form>
              )}
              <button
                type="button"
                className="text-[#dbb24a] text-sm underline hover:text-[#ffe88a] transition"
                onClick={() => setIsRegister(r => !r)}
              >
                {isRegister ? t("loginToLogin") || "Already have an account? Log In" : t("loginToRegister") || "No account? Register"}
              </button>
              <button
                type="button"
                className="text-[#dbb24a] text-xs mt-2 underline hover:text-[#ffe88a] transition"
                onClick={() => setForgotMode(true)}
              >
                {t("forgotPassword")}
              </button>
              <button
                type="button"
                className="text-gray-400 text-xs mt-1"
                onClick={() => setShowEmailForm(false)}
              >
                {t("loginBack") || "Back"}
              </button>
            </form>
          )}
        </div>

        {/* Terms of Service */}
        <div className="mt-12 text-center text-lg" style={{ color: "#e9d49b" }}>
          {t("loginTos1")}{" "}
          <a href="/terms" className="underline hover:text-[#dbb24a] transition">
            {t("loginTos2")}
          </a>
        </div>
      </div>
    </motion.div>
  );
}
