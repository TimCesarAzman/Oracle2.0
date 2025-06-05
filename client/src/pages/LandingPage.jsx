import { useTranslation } from "react-i18next";
import fortuneTeller from "/src/assets/fortune-teller.png";
import logo from "/src/assets/mystic-oracle-logo.png";
import fortuneTellerTransparent from "/src/assets/fortune-teller-transparent.png";
import { motion } from "framer-motion";
import { useEffect } from "react";

export default function LandingPage() {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, filter: "blur(6px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 1.04, filter: "blur(8px)" }}
      transition={{ duration: 0.7, ease: "easeInOut" }}
      className="..."
    >
      <div className="relative min-h-screen font-serif text-white overflow-x-hidden bg-transparent z-10">
        {/* SECTION 1: Hero */}
        <section className="relative flex flex-col md:flex-row items-center justify-center min-h-screen max-w-6xl mx-auto px-6 z-10 pt-16 md:pt-0">

          {/* Left: Text */}
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
            <h1 className="text-[2.8rem] md:text-[4.3rem] font-extrabold tracking-tight mb-4 leading-tight" style={{ color: "#F7D370" }}>
              {t("mainTitle")}
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-md" style={{ color: "#fff6e7" }}>
              {t("mainSubtitle")}
            </p>
            <a
              href="/subscribe"
              className="bg-[#F7D370] text-[#321354] font-bold px-8 py-4 rounded-full shadow-lg text-lg hover:bg-[#FBE7A2] transition mb-4"
            >
              {t("getYourFortune")}
            </a>
          </div>

          {/* Right: Fortune Teller Image */}
          <div className="flex-1 flex items-center justify-center mt-10 md:mt-0">
            <div className="bg-[#180825] rounded-3xl border border-[#F7D370] shadow-xl p-2">
              <img
                src={fortuneTeller}
                alt="Mystic Oracle Fortune Teller"
                className="w-80 h-auto rounded-2xl object-cover"
              />
            </div>
          </div>
        </section>

        {/* SECTION 2: Chat Scene (scroll down to see) */}
        <section
          id="chat"
          className="relative flex flex-col md:flex-row items-start min-h-screen py-16 md:py-28 w-full px-0 z-10"
        >
          {/* Avatar on left (desktop only, 1/3 of screen) */}
          <div className="hidden md:flex flex-col items-center mt-8 basis-1/3 flex-shrink-0">
            <div className="relative flex flex-col items-center">
              <img
                src={fortuneTellerTransparent}
                alt="Mystic Oracle Fortune Teller"
                className="object-contain"
              />
            </div>
          </div>
          {/* Chat Bubbles (2/3 on desktop, 100% on mobile) */}
          <div className="flex flex-col space-y-4 w-full md:basis-2/3 md:pr-12 mt-10 md:mt-0">
            {/* User bubble 1 */}
            <div className="self-end w-full flex md:block">
              <div className="bg-[#7f60a0] text-white rounded-2xl px-5 py-3 md:px-6 md:py-4 text-base md:text-lg max-w-[90%] md:max-w-[80%] shadow-md relative ml-auto"
                style={{ fontFamily: "inherit" }}>
                <span>{t("chatQuestion1")}</span>
                {/* Arrow on desktop only */}
                <span className="hidden md:inline absolute -right-3 top-6 w-0 h-0 border-t-8 border-t-transparent border-l-8 border-l-[#7f60a0] border-b-8 border-b-transparent"></span>
              </div>
            </div>
            {/* Oracle bubble 1 */}
            <div className="self-start w-full flex md:block">
              <div className="bg-[#442360] text-[#F7D370] rounded-2xl px-5 py-3 md:px-6 md:py-4 text-base md:text-lg max-w-[90%] md:max-w-[90%] shadow-lg relative mr-auto"
                style={{ fontFamily: "inherit" }}>
                <span>{t("chatAnswer1")}</span>
                {/* Arrow on desktop only */}
                <span className="hidden md:inline absolute -left-3 top-6 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-[#442360] border-b-8 border-b-transparent"></span>
              </div>
            </div>
            {/* User bubble 2 */}
            <div className="self-end w-full flex md:block">
              <div className="bg-[#7f60a0] text-white rounded-2xl px-5 py-3 md:px-6 md:py-4 text-base md:text-lg max-w-[90%] md:max-w-[80%] shadow-md relative ml-auto"
                style={{ fontFamily: "inherit" }}>
                <span>{t("chatQuestion2")}</span>
                <span className="hidden md:inline absolute -right-3 top-6 w-0 h-0 border-t-8 border-t-transparent border-l-8 border-l-[#7f60a0] border-b-8 border-b-transparent"></span>
              </div>
            </div>
            {/* Oracle bubble 2 */}
            <div className="self-start w-full flex md:block">
              <div className="bg-[#442360] text-[#F7D370] rounded-2xl px-5 py-3 md:px-6 md:py-4 text-base md:text-lg max-w-[90%] md:max-w-[90%] shadow-lg relative mr-auto"
                style={{ fontFamily: "inherit" }}>
                <span>{t("chatAnswer2")}</span>
                <span className="hidden md:inline absolute -left-3 top-6 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-[#442360] border-b-8 border-b-transparent"></span>
              </div>
            </div>
            {/* User bubble 3 */}
            <div className="self-end w-full flex md:block">
              <div className="bg-[#7f60a0] text-white rounded-2xl px-5 py-3 md:px-6 md:py-4 text-base md:text-lg max-w-[90%] md:max-w-[80%] shadow-md relative ml-auto"
                style={{ fontFamily: "inherit" }}>
                <span>{t("chatQuestion3")}</span>
                <span className="hidden md:inline absolute -right-3 top-6 w-0 h-0 border-t-8 border-t-transparent border-l-8 border-l-[#7f60a0] border-b-8 border-b-transparent"></span>
              </div>
            </div>
            {/* Oracle bubble 3 */}
            <div className="self-start w-full flex md:block">
              <div className="bg-[#442360] text-[#F7D370] rounded-2xl px-5 py-3 md:px-6 md:py-4 text-base md:text-lg max-w-[90%] md:max-w-[90%] shadow-lg relative mr-auto"
                style={{ fontFamily: "inherit" }}>
                <span>{t("chatAnswer3")}</span>
                <span className="hidden md:inline absolute -left-3 top-6 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-[#442360] border-b-8 border-b-transparent"></span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </motion.div>
  );
}
