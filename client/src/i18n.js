import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import translationEN from "./locale/en.json";
import translationSL from "./locale/sl.json";

i18n
  .use(LanguageDetector) // Detects user language
  .use(initReactI18next) // Passes i18n instance to react-i18next
  .init({
    resources: {
      en: { translation: translationEN },
      sl: { translation: translationSL },
    },
    fallbackLng: "en", // Fallback language if detection fails
    detection: {
      // Options for language detection
      order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'], // Cache user language on localStorage
    },
    interpolation: {
      escapeValue: false, // React already protects from XSS
    },
  });

export default i18n;
