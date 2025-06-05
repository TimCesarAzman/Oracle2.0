import { useTranslation } from "react-i18next";
import { FaUserCircle } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const API_URL = import.meta.env.VITE_API_URL;

export default function UserProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [modal, setModal] = useState(""); // "email" | "password" | ""
  const [field, setField] = useState(""); // new email or password
  const [currentPw, setCurrentPw] = useState("");
  const [modalError, setModalError] = useState("");
  const [modalSuccess, setModalSuccess] = useState("");

  // Load user profile from backend
  useEffect(() => {
    async function fetchProfile() {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!token) return setUser(null);
        const res = await fetch(`${API_URL}/api/profile`, {
          headers: { Authorization: "Bearer " + token },
        });
        const data = await res.json();
        if (data.error) {
          setUser(null);
        } else {
          setUser(data);

          // Update storage with fresh info
          localStorage.setItem("user", JSON.stringify(data));
          sessionStorage.setItem("user", JSON.stringify(data));
        }
      } catch {
        setUser(null);
      }
    }
    fetchProfile();
  }, []);

  // Logout button handler
  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    window.location.href = "/";
  }

  // Update Email
  async function handleEmailUpdate(e) {
    e.preventDefault();
    setModalError(""); setModalSuccess("");
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/update-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ newEmail: field, password: currentPw }),
      });
      const data = await res.json();
      if (data.success) {
        setModalSuccess(t("updateEmailSuccess") || "Email updated!");
        setUser(u => ({ ...u, email: field }));
        // update storage
        const updated = { ...user, email: field };
        localStorage.setItem("user", JSON.stringify(updated));
        sessionStorage.setItem("user", JSON.stringify(updated));
        setTimeout(() => setModal(""), 1200);
      } else {
        setModalError(data.error || t("updateEmailError"));
      }
    } catch {
      setModalError(t("updateEmailError") || "Update failed.");
    }
  }

  // Update Password
  async function handlePasswordUpdate(e) {
    e.preventDefault();
    setModalError(""); setModalSuccess("");
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/update-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ newPassword: field, password: currentPw }),
      });
      const data = await res.json();
      if (data.success) {
        setModalSuccess(t("updatePasswordSuccess") || "Password updated!");
        setTimeout(() => setModal(""), 1200);
      } else {
        setModalError(data.error || t("updatePasswordError"));
      }
    } catch {
      setModalError(t("updatePasswordError") || "Update failed.");
    }
  }

  if (user === null) {
    // Not logged in
    return (
      <div className="flex flex-col items-center min-h-screen pt-32 pb-16 font-serif bg-transparent z-10">
        <div className="bg-white/20 backdrop-blur-xl shadow-2xl rounded-2xl max-w-xl w-full px-8 py-10 flex flex-col items-center text-center">
          <FaUserCircle className="text-[6rem] text-[#dbb24a] mb-3" />
          <div className="text-2xl font-bold text-[#dbb24a] mb-4">{t("profileNotLoggedIn") || "You are not logged in."}</div>
          <a
            href="/login"
            className="px-7 py-3 rounded-xl font-bold shadow border-2 border-[#dbb24a] bg-transparent text-[#dbb24a] hover:bg-[#ffe88a]/20 transition"
          >
            {t("loginOrRegister") || "Login or Register"}
          </a>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, filter: "blur(6px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 1.04, filter: "blur(8px)" }}
      transition={{ duration: 0.7, ease: "easeInOut" }}
      className="..."
    >
      <div className="flex flex-col items-center min-h-screen pt-32 pb-16 font-serif bg-transparent z-10">
        {/* Profile card */}
        <div className="bg-white/20 backdrop-blur-xl shadow-2xl rounded-2xl max-w-xl w-full px-8 py-10 flex flex-col items-center">
          {user.avatar ? (
            <img src={user.avatar} alt="User avatar" className="w-28 h-28 rounded-full mb-3 border-4 border-[#dbb24a] object-cover shadow" />
          ) : (
            <FaUserCircle className="text-[6rem] text-[#dbb24a] mb-3" />
          )}
          <div className="text-2xl font-bold text-[#dbb24a] mb-1">{t("profileGreeting", { name: user.name }) || user.name}</div>
          <div className="text-lg text-[#fff6e7] mb-4">{user.email}</div>

          {/* Subscription section */}
          <div className="w-full flex flex-col gap-3 bg-white/10 rounded-xl p-4 mb-5">
            <div className="font-bold text-[#dbb24a]">{t("yourSubscription")}</div>
            <div className="flex justify-between text-[#fff6e7]">
              <span>{t("plan")}</span>
              <span className="font-semibold text-[#dbb24a]">{user.plan}</span>
            </div>
            <div className="flex justify-between text-[#fff6e7]">
              <span>{t("renewal")}</span>
              <span>{user.renewal}</span>
            </div>
            <div className="flex justify-between text-[#fff6e7]">
              <span>{t("usedTime")}</span>
              <span>{user.usedMinutesToday ?? "-"} min</span>
            </div>
            <div className="flex justify-between text-[#fff6e7]">
              <span>{t("remainingTime")}</span>
              <span>{user.minutesLeftToday ?? "-"} min</span>
            </div>
            <button
              className="mt-2 px-5 py-2 bg-[#dbb24a] text-[#321354] rounded-xl font-bold shadow hover:bg-[#ffe88a] transition"
              onClick={() => navigate("/subscribe")}
            >
              {t("changePlan")}
            </button>
            {user.plan && user.plan !== "None" && (
              <a
                href="/chat"
                className="block w-full mt-3 px-5 py-3 bg-[#321354] text-[#ffe88a] text-center font-bold rounded-xl shadow hover:bg-[#463b5a] transition"
              >
                {t("enterChat")}
              </a>
            )}
          </div>
          {/* Update email/password */}
          <div className="flex gap-4 mb-6">
            <button className="px-5 py-2 bg-[#fff6e7] text-[#321354] rounded-xl font-bold shadow hover:bg-[#ffe88a] transition"
              onClick={() => { setModal("email"); setField(""); setModalError(""); setModalSuccess(""); setCurrentPw(""); }}>
              {t("updateEmail")}
            </button>
            <button className="px-5 py-2 bg-[#fff6e7] text-[#321354] rounded-xl font-bold shadow hover:bg-[#ffe88a] transition"
              onClick={() => { setModal("password"); setField(""); setModalError(""); setModalSuccess(""); setCurrentPw(""); }}>
              {t("updatePassword")}
            </button>
          </div>
          {/* Logout */}
          <button className="px-10 py-3 bg-[#dbb24a] text-[#321354] font-bold rounded-xl shadow hover:bg-[#ffe88a] transition"
            onClick={handleLogout}>
            {t("logout")}
          </button>
        </div>
        {/* Past questions */}
        <div className="mt-10 w-full max-w-xl">
          <div className="text-xl font-bold text-[#dbb24a] mb-3">{t("yourQuestions")}</div>
          <div className="bg-white/10 rounded-2xl p-5 shadow-xl space-y-4">
            {user.questions && user.questions.length === 0 ? (
              <div className="text-[#fff6e7] opacity-70">{t("noQuestions")}</div>
            ) : (
              user.questions?.map((q, i) => (
                <div key={i} className="border-b border-[#dbb24a]/30 pb-3 mb-3 last:border-none last:mb-0 last:pb-0">
                  <div className="text-[#fff6e7]"><span className="font-semibold">Q:</span> {q.q}</div>
                  <div className="text-[#dbb24a] mt-1"><span className="font-semibold">A:</span> {q.a}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modal for Email/Password Update */}
        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <form
              className="bg-[#23132a] border-2 border-[#dbb24a] rounded-2xl shadow-2xl p-8 flex flex-col gap-4 min-w-[310px] max-w-sm"
              onSubmit={modal === "email" ? handleEmailUpdate : handlePasswordUpdate}
            >
              <div className="text-xl font-bold text-[#dbb24a] mb-2">
                {modal === "email" ? t("updateEmail") : t("updatePassword")}
              </div>
              {modal === "email" ? (
                <>
                  <input
                    type="email"
                    placeholder={t("newEmail") || "New email"}
                    value={field}
                    onChange={e => setField(e.target.value)}
                    required
                    className="px-4 py-2 rounded border border-[#dbb24a] bg-[#fff6e7] text-[#321354] font-semibold"
                  />
                  <input
                    type="password"
                    placeholder={t("currentPassword") || "Current password"}
                    value={currentPw}
                    onChange={e => setCurrentPw(e.target.value)}
                    required
                    className="px-4 py-2 rounded border border-[#dbb24a] bg-[#fff6e7] text-[#321354] font-semibold"
                  />
                </>
              ) : (
                <>
                  <input
                    type="password"
                    placeholder={t("newPassword") || "New password"}
                    value={field}
                    onChange={e => setField(e.target.value)}
                    required
                    className="px-4 py-2 rounded border border-[#dbb24a] bg-[#fff6e7] text-[#321354] font-semibold"
                  />
                  <input
                    type="password"
                    placeholder={t("currentPassword") || "Current password"}
                    value={currentPw}
                    onChange={e => setCurrentPw(e.target.value)}
                    required
                    className="px-4 py-2 rounded border border-[#dbb24a] bg-[#fff6e7] text-[#321354] font-semibold"
                  />
                </>
              )}
              {modalError && <div className="text-red-400 font-semibold">{modalError}</div>}
              {modalSuccess && <div className="text-green-400 font-semibold">{modalSuccess}</div>}
              <div className="flex gap-2 justify-end mt-2">
                <button type="button" className="text-[#dbb24a] font-bold underline hover:text-[#ffe88a]" onClick={() => setModal("")}>
                  {t("cancel")}
                </button>
                <button type="submit" className="px-5 py-2 bg-[#dbb24a] text-[#321354] rounded-xl font-bold shadow hover:bg-[#ffe88a] transition">
                  {t("save")}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </motion.div>
  );
}
