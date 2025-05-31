import { useTranslation } from "react-i18next";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "ko" ? "en" : "ko";
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="px-1 hover:cursor-pointer leading-none transition-colors hover:bg-blue-100"
    >
      {i18n.language === "ko" ? "🇰🇷" : "🇺🇸"}
    </button>
  );
};

export default LanguageSwitcher;
