import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

const API_URL = import.meta.env.VITE_API_URL;

export default function ResetPassword() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const token = params.get("token");

  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReset(e) {
    e.preventDefault();
    setMsg("");
    if (newPw.length < 6) {
      setMsg(t("resetFail") || "Password must be at least 6 characters.");
      return;
    }
    if (newPw !== confirmPw) {
      setMsg(t("resetFail") || "Passwords do not match.");
      return;
    }
    setLoading(true);
    const res = await fetch(`${API_URL}/api/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword: newPw }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      setMsg(t("resetSuccess") || "Password reset successful! You can now log in.");
      setTimeout(() => window.location.href = "/login", 2000);
    } else {
      setMsg(data.error || t("resetFail"));
    }
  }

  if (!token) {
    return <div className="text-center text-red-400 mt-10">{t("resetFail") || "Invalid or missing token."}</div>;
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen font-serif">
      <div className="bg-[#22132c]/80 p-8 rounded-xl shadow-lg w-full max-w-md mt-10">
        <h1 className="text-2xl font-bold text-[#dbb24a] mb-4">{t("resetPasswordTitle") || "Reset Your Password"}</h1>
        <form onSubmit={handleReset} className="flex flex-col gap-4">
          <input
            className="px-4 py-3 rounded bg-white/20 border border-[#dbb24a] text-[#321354] font-semibold"
            type="password"
            placeholder={t("loginPassword") || "New Password"}
            value={newPw}
            onChange={e => setNewPw(e.target.value)}
            required
          />
          <input
            className="px-4 py-3 rounded bg-white/20 border border-[#dbb24a] text-[#321354] font-semibold"
            type="password"
            placeholder={t("loginPassword") + " (repeat)" || "Repeat password"}
            value={confirmPw}
            onChange={e => setConfirmPw(e.target.value)}
            required
          />
          <button type="submit" disabled={loading} className="bg-[#dbb24a] text-[#321354] font-bold rounded-xl py-3 px-8 shadow hover:bg-[#ffe88a] transition">
            {loading ? t("resetting") || "Resetting..." : t("resetPassword") || "Reset Password"}
          </button>
          {msg && <div className={`mt-2 text-center ${msg.includes("success") ? "text-green-400" : "text-red-400"}`}>{msg}</div>}
        </form>
      </div>
    </div>
  );
}
