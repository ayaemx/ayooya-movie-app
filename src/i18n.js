import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import en from "./locales/en.json"
import ar from "./locales/ar.json"
import { load, save } from "./lib/storage.js"

const supported = ["en", "ar"]
const saved = load("ayooya:lang", null)
const browser = typeof navigator !== "undefined" ? navigator.language?.slice(0, 2) : "en"
const initial = supported.includes(saved) ? saved : supported.includes(browser) ? browser : "en"

// Keep <html lang dir> in sync so the whole layout mirrors for Arabic.
function applyDirection(lng) {
  document.documentElement.lang = lng
  document.documentElement.dir = lng === "ar" ? "rtl" : "ltr"
}

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, ar: { translation: ar } },
  lng: initial,
  fallbackLng: "en",
  interpolation: { escapeValue: false }, // React already escapes
})

applyDirection(initial)
i18n.on("languageChanged", (lng) => {
  applyDirection(lng)
  save("ayooya:lang", lng)
})

export default i18n
