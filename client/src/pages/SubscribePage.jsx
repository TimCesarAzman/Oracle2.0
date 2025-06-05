import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

async function handleSubscribe(plan, email, setError) {
  if (!email) {
    setError("Please log in or register before subscribing.");
    return;
  }
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/create-checkout-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan, email }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      setError(data.error || "Could not start payment.");
    }
  } catch (err) {
    setError("Network error. Try again.");
  }
}

export default function SubscriptionPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("seeker");

  // Get user email from local/session storage
  let user = {};
  try {
    user =
      JSON.parse(localStorage.getItem("user")) ||
      JSON.parse(sessionStorage.getItem("user")) ||
      {};
  } catch {}
  const userEmail = user.email;

  const plans = [
    {
      name: t("planStarter"),
      time: t("planStarterTime"),
      desc1: t("planStarterDesc1"),
      desc2: t("planStarterDesc2"),
      price: "$19",
      id: "starter",
      featured: false,
    },
    {
      name: t("planSeeker"),
      time: t("planSeekerTime"),
      desc1: t("planSeekerDesc1"),
      desc2: t("planSeekerDesc2"),
      price: "$29",
      id: "seeker",
      featured: false,
    },
    {
      name: t("plan12hour"),
      time: t("plan12hourTime"),
      desc1: t("plan12hourDesc1"),
      desc2: t("plan12hourDesc2"),
      price: "$39",
      id: "pathfinder",
      featured: false,
    },
    {
      name: t("planUnlimited"),
      time: t("planUnlimitedTime"),
      desc1: t("planUnlimitedDesc1"),
      desc2: "",
      price: "$49",
      id: "unlimited",
      featured: true,
    },
  ];

  useEffect(() => {
    if (!selectedPlan) setSelectedPlan("unlimited");
  }, [selectedPlan]);

  // Prompt for login/register
  const LoginPrompt = () => (
    <div className="w-full border-2 border-[#ffe88a] text-[#ffe88a] font-bold rounded-xl px-6 py-4 mb-3 shadow-none bg-transparent text-center flex flex-col items-center">
      <span>{t("subscribeMustLogin") || "Please register or log in to subscribe."}</span>
      <button
        className="mt-4 px-6 py-2 rounded-full border-2 border-[#ffe88a] text-[#ffe88a] font-bold bg-transparent hover:bg-[#ffe88a] hover:text-[#321354] transition"
        onClick={e => {
          e.stopPropagation();
          navigate("/login");
        }}
      >
        {t("goToRegister") || "Go to Register/Login"}
      </button>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, filter: "blur(6px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 1.04, filter: "blur(8px)" }}
      transition={{ duration: 0.7, ease: "easeInOut" }}
    >
      <div className="relative min-h-screen font-serif text-white overflow-x-hidden bg-transparent z-10">
        <main className="relative flex flex-col items-center pt-28 pb-16 px-2 z-10">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-center" style={{ color: "#fff6e7" }}>
            {t("choosePlan")}
          </h1>
          <p className="text-lg md:text-xl mb-12 text-center" style={{ color: "#aaa3c8" }}>
            {t("choosePlanSub")}
          </p>

          {/* DESKTOP: plans row */}
<div
  className="hidden md:flex flex-row items-stretch justify-center w-full"
  style={{ width: "96vw", maxWidth: 1500 }}
>
  {plans.map((plan, idx) => {
    const selected = selectedPlan === plan.id;
    const widthStyle = selected ? "basis-[60%]" : "basis-[13%]";
    return (
      <motion.div
        key={plan.id}
        layout
        transition={{ type: "spring", stiffness: 400, damping: 35 }}
        className={`mx-3 mb-0 flex flex-col items-center rounded-2xl border-2 bg-[#1d1330]/80 cursor-pointer transition-all duration-300
          ${plan.featured ? "border-[#ffe88a] shadow-2xl" : "border-[#a594c7]"}
          ${widthStyle} ${selected ? "z-10 scale-105 border-4" : "opacity-80"}
        `}
        style={{
          minWidth: selected ? 360 : 120,
          borderColor: selected ? "#ffe88a" : "#a594c7",
        }}
        onClick={() => setSelectedPlan(plan.id)}
      >
        <div className="text-xl font-bold mb-2 mt-6 tracking-widest uppercase text-center" style={{ color: plan.featured ? "#ffe88a" : "#fff6e7" }}>
          {plan.name}
        </div>
        <AnimatePresence mode="wait">
          {selected && (
            <motion.div
              key={plan.id + "-details"}
              initial={{ opacity: 0, maxHeight: 0 }}
              animate={{ opacity: 1, maxHeight: 600 }}
              exit={{ opacity: 0, maxHeight: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="w-full flex flex-col items-center overflow-hidden transition-all"
            >
              <div className="text-2xl font-bold mb-2 text-center" style={{ color: "#fff6e7" }}>
                {plan.time}
              </div>
              <div className="text-lg mb-2 font-semibold text-center" style={{ color: "#ffe88a" }}>
                {plan.desc1}
              </div>
              <div className="text-base mb-6 text-[#b4aed3] text-center">{plan.desc2}</div>
              <div className="text-3xl font-extrabold mb-1 text-center" style={{ color: "#fff6e7" }}>
                {plan.price}
                <span className="text-lg font-semibold text-[#aaa3c8]">/month</span>
              </div>
              <div className="w-full flex flex-col items-center mt-4">
                {!userEmail ? (
                  <LoginPrompt />
                ) : (
                  <button
                    type="button"
                    className="w-full mt-2 bg-[#ffe88a] text-[#1d1330] font-bold text-lg py-3 rounded-lg shadow hover:bg-[#fff6e7] transition"
                    onClick={e => {
                      e.stopPropagation();
                      handleSubscribe(plan.id, userEmail, setError);
                    }}
                  >
                    {t("subscribeNow") || "Subscribe Now"}
                  </button>
                )}
                {error && <div className="text-red-400 font-semibold text-center mt-2">{error}</div>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {!selected && userEmail && (
          <button
            onClick={e => {
              e.stopPropagation();
              setSelectedPlan(plan.id);
            }}
            className="mb-6 mt-2 bg-[#ffe88a] text-[#1d1330] font-bold text-md py-2 px-4 rounded shadow hover:bg-[#fff6e7] transition"
          >
            {t("choosePlanBtn") || "Choose"}
          </button>
        )}
      </motion.div>
    );
  })}
</div>


          {/* MOBILE: Accordion */}
          <div className="flex flex-col md:hidden w-full max-w-lg mx-auto">
            {plans.map(plan => {
              const selected = selectedPlan === plan.id;
              return (
                <div key={plan.id} className="w-full mb-3">
                  {/* Always show title */}
                  <div
                    className={`w-full flex items-center justify-between rounded-xl px-5 py-4 cursor-pointer transition-all duration-300 ${selected ? "bg-[#382260]" : "bg-[#1d1330]/70"} border-2 border-[#a594c7]`}
                    onClick={() => setSelectedPlan(plan.id === selectedPlan ? null : plan.id)}
                  >
                    <div className="font-bold text-lg uppercase tracking-wide" style={{ color: plan.featured ? "#ffe88a" : "#fff6e7" }}>
                      {plan.name}
                    </div>
                    <span className={`text-2xl transition-transform ${selected ? "rotate-90" : "rotate-0"}`}>›</span>
                  </div>
                  <AnimatePresence mode="wait">
                    {selected && (
                      <motion.div
                        key="details"
                        initial={{ opacity: 0, y: 10, position: "absolute", width: "100%" }}
                        animate={{ opacity: 1, y: 0, position: "relative", width: "100%" }}
                        exit={{ opacity: 0, y: 10, position: "absolute", width: "100%" }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden px-5 py-4 bg-[#291646]/90 border-b border-[#a594c7] rounded-b-xl"
                        style={{ minHeight: 180 }}
                      >
                        <div className="text-base font-semibold mb-1" style={{ color: "#ffe88a" }}>{plan.time}</div>
                        <div className="text-base mb-1" style={{ color: "#ffe88a" }}>{plan.desc1}</div>
                        <div className="text-xs text-[#b4aed3] mb-2">{plan.desc2}</div>
                        <div className="text-2xl font-extrabold mb-3" style={{ color: "#fff6e7" }}>
                          {plan.price} <span className="text-base text-[#aaa3c8]">/month</span>
                        </div>
                        {!userEmail ? (
                          <LoginPrompt />
                        ) : (
                          <button
                            type="button"
                            className="w-full mt-2 bg-[#ffe88a] text-[#1d1330] font-bold text-lg py-3 rounded-lg shadow hover:bg-[#fff6e7] transition"
                            onClick={e => {
                              e.stopPropagation();
                              handleSubscribe(plan.id, userEmail, setError);
                            }}
                          >
                            {t("subscribeNow") || "Subscribe Now"}
                          </button>
                        )}
                        {error && <div className="text-red-400 font-semibold text-center mt-2">{error}</div>}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Stripe branding */}
        </main>
      </div>
    </motion.div>
  );
}
