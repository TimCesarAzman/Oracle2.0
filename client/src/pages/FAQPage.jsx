import { useTranslation } from "react-i18next";
import { useState } from "react";
import { motion } from "framer-motion";

export default function FAQPage() {
  const { t } = useTranslation();
  const faqs = t("faq", { returnObjects: true }); // array from translations

  const [open, setOpen] = useState(null);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, filter: "blur(6px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 1.04, filter: "blur(8px)" }}
      transition={{ duration: 0.7, ease: "easeInOut" }}
      className="..."
    >
        <div className="flex flex-col items-center min-h-screen pt-32 pb-20 font-serif relative z-10">
          {/* About Oracle */}
          <div className="bg-white/20 backdrop-blur-xl rounded-2xl shadow-xl max-w-2xl w-full px-8 py-10 mb-12 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-[#dbb24a] mb-3 tracking-widest">{t("aboutTitle")}</h1>
            <div className="text-lg text-[#fff6e7]">{t("aboutText")}</div>
          </div>

          {/* FAQ */}
          <div className="bg-white/20 backdrop-blur-xl rounded-2xl shadow-xl max-w-2xl w-full px-8 py-10">
            <h2 className="text-2xl md:text-3xl font-bold text-[#dbb24a] mb-7 tracking-wider">{t("faqTitle")}</h2>
            <div className="flex flex-col gap-4">
              {faqs.map((item, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-white/10 p-4 text-left shadow transition"
                >
                  <button
                    className="w-full flex justify-between items-center text-lg font-bold text-[#fff6e7] focus:outline-none"
                    onClick={() => setOpen(open === i ? null : i)}
                    aria-expanded={open === i}
                  >
                    <span>{item.q}</span>
                    <span className="ml-4 text-[#dbb24a]">{open === i ? "▲" : "▼"}</span>
                  </button>
                  {open === i && (
                    <div className="mt-3 text-[#e9d49b] text-base">{item.a}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
    </motion.div>
  );
}
