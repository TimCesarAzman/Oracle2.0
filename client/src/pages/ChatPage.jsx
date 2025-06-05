import { useTranslation } from "react-i18next";
import fortuneTeller from "/src/assets/fortune-teller-transparent-chat.png";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export default function ChatPage() {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [minutesLeft, setMinutesLeft] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [oracleTyping, setOracleTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Load chat history, minutes left
  useEffect(() => {
    async function loadChat() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_URL}/api/profile`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token") || sessionStorage.getItem("token")}`
          }
        });
        const data = await res.json();
        if (!data || !data.id || !data.plan || data.plan === "None") {
          setError(t("chatSubRequired") || "Subscription required.");
          setMinutesLeft(0);
          setMessages([]);
        } else {
          setMinutesLeft(data.minutesLeftToday ?? 0);
          // Restore chat history
          if (data.questions && Array.isArray(data.questions)) {
            setMessages(
              data.questions.map(q => [
                { from: "user", text: q.q },
                { from: "oracle", text: q.a }
              ]).flat()
            );
          }
        }
      } catch (e) {
        setError(t("chatLoadError") || "Error loading Oracle.");
      }
      setLoading(false);
    }
    loadChat();
    // eslint-disable-next-line
  }, [t]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, oracleTyping]);

  // Send message to backend, receive Oracle's response (with delay)
  async function sendMessage(e) {
    e.preventDefault();
    if (!input.trim() || minutesLeft <= 0 || loading || oracleTyping) return;
    setLoading(true);
    setOracleTyping(true);
    setError("");
    const question = input;
    setInput("");
    // 1. Add user message instantly
    setMessages(msgs => [...msgs, { from: "user", text: question }]);
    // 2. Add "Oracle is thinking..." bubble
    setMessages(msgs => [...msgs, { from: "oracle", text: t("oracleThinking") || "The Oracle is thinking..." }]);

    try {
      const lang = i18n.language || "en";
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token") || sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify({ message: question, lang }),
      });

      const data = await res.json();
      // 3. Replace "Oracle is thinking..." with actual answer (max 300 chars)
      setMessages(msgs => {
        const prev = [...msgs];
        let idx = prev.length - 1;
        // Find last Oracle bubble that's "thinking"
        while (idx >= 0 && (prev[idx].from !== "oracle" || prev[idx].text !== (t("oracleThinking") || "The Oracle is thinking..."))) idx--;
        if (idx >= 0) {
          prev[idx] = {
            from: "oracle",
            text: (data.answer ? data.answer : (data.error || t("oracleError") || "Oracle cannot see your fate.")),
          };
        } else {
          // fallback, add at end
          prev.push({
            from: "oracle",
            text: (data.answer ? data.answer : (data.error || t("oracleError") || "Oracle cannot see your fate.")),
          });
        }
        return prev;
      });
      setMinutesLeft(data.minutesLeft ?? Math.max(0, minutesLeft - 1));
    } catch {
      setMessages(msgs => [
        ...msgs,
        { from: "oracle", text: t("chatNetworkError") || "Network error." }
      ]);
    }
    setLoading(false);
    setOracleTyping(false);
  }

  const canSend = input.trim() && minutesLeft > 0 && !loading && !oracleTyping;

  // "No time left" or not subscribed
  if (error || minutesLeft <= 0) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center font-serif text-lg text-[#ffe88a] pt-36">
        <img src={fortuneTeller} className="w-40 mb-6 drop-shadow-lg" alt="Oracle" />
        <div className="max-w-lg text-center bg-[#241438]/80 border-2 border-[#dbb24a] rounded-2xl p-8 shadow-lg">
          <div className="text-3xl mb-2 font-bold">{t("oracleSleepTitle") || "The Oracle Slumbers..."}</div>
          <div className="text-lg">{error || t("oracleNoTime") || "You have no time left today or no active subscription. Return tomorrow or renew your plan."}</div>
          <a href="/subscribe" className="mt-6 block px-6 py-3 rounded-xl font-bold shadow border-2 border-[#dbb24a] bg-transparent text-[#dbb24a] hover:bg-[#ffe88a]/20 transition">
            {t("renewPlanBtn") || "Renew or Change Plan"}
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
      <div className="flex flex-col min-h-screen w-full font-serif relative bg-transparent z-10">
        <div className="flex flex-col md:flex-row w-full flex-1 max-w-6xl mx-auto pt-36">
          {/* Left: Oracle image (hide on mobile) */}
          <div className="hidden md:flex flex-col items-center justify-center w-1/2 px-8">
            <img
              src={fortuneTeller}
              alt="Oracle"
              className="max-w-lg w-full h-auto select-none pointer-events-none"
              draggable={false}
              style={{ filter: "drop-shadow(0 0 48px #3f2177aa)" }}
            />
          </div>
          {/* Right: Chat area */}
          <div className="flex flex-col flex-1 w-full md:w-1/2 max-w-xl mx-auto rounded-2xl bg-[#f7e7b6]/30 backdrop-blur-md">
            <div className="mb-6 text-center text-2xl md:text-3xl font-bold text-[#dbb24a] drop-shadow pt-5" style={{ textShadow: "0 1px 16px #201346" }}>
              {t("chatTitle")}
            </div>
            <div className="flex-1 flex flex-col gap-4 overflow-y-auto mb-2 px-2" style={{ maxHeight: "60vh" }}>
              <AnimatePresence>
                {messages.map((msg, i) =>
                  msg.from === "user" ? (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 40 }}
                      transition={{ duration: 0.3 }}
                      className="flex justify-end"
                    >
                      <div className="bg-[#3e2b64] text-white rounded-2xl px-6 py-3 max-w-[80%] text-lg shadow-md font-serif break-words whitespace-pre-line">
                        {msg.text}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -40 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -40 }}
                      transition={{ duration: 0.3 }}
                      className="flex justify-start"
                    >
                      <div className={`bg-[#211a2e]/80 text-[#f1ebff] rounded-2xl px-6 py-4 max-w-[95%] text-xl shadow-md font-serif break-words whitespace-pre-line ${msg.text === (t("oracleThinking") || "The Oracle is thinking...") ? "italic animate-pulse" : ""}`}
                        style={{ backdropFilter: "blur(2px)" }}>
                        {msg.text}
                      </div>
                    </motion.div>
                  )
                )}
              </AnimatePresence>
              <div ref={messagesEndRef}></div>
            </div>
            {/* Minutes left */}
            <div className="w-full px-2 mb-2 ">
              <div className="flex justify-center items-center gap-2 text-lg font-serif text-[#b6a0ee]">
                <div className="flex-1 h-px bg-[#b6a0ee] opacity-30" />
                <span>{t("oracleMinutesLeft", { minutes: minutesLeft })}</span>
                <div className="flex-1 h-px bg-[#b6a0ee] opacity-30" />
              </div>
            </div>
            {/* Chat input */}
            <form
              onSubmit={sendMessage}
              className="w-full flex items-center px-2 pb-5"
            >
              <input
                className="flex-1 py-3 px-5 rounded-2xl bg-[#23153c] border border-[#463b5a] text-lg text-white focus:outline-none focus:border-[#dbb24a] transition shadow-md font-serif placeholder-[#a49abe]"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={t("chatInputPlaceholder") || "Type your question..."}
                maxLength={300}
                disabled={minutesLeft <= 0 || loading || oracleTyping}
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={!canSend}
                className={`ml-3 px-6 py-3 rounded-2xl bg-[#dbb24a] text-[#321354] font-bold text-lg shadow transition hover:bg-[#ffe88a] active:scale-95 ${(!canSend) ? "opacity-70 pointer-events-none" : ""}`}
              >
                {oracleTyping ? (t("oracleThinkingShort") || "Thinking...") : (t("send") || "Send")}
              </button>
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
