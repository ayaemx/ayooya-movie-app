import React from "react";
import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const handleLanguageChange = (e) => {
    i18n.changeLanguage(e.target.value);
    // Optional: change direction for RTL languages
    document.body.dir = e.target.value === "ar" ? "rtl" : "ltr";
  };

  return (
    <select value={i18n.language} onChange={handleLanguageChange} className="nav-lang-dropdown">
      <option value="en">English</option>
      <option value="ar">العربية</option>
    </select>
  );
}
