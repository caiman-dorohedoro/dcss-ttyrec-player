import { Globe } from "lucide-react";
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
      className="text-xs text-[#6a7282] leading-4 flex items-center gap-[2px] min-w-[60px] hover:text-gray-700 hover:cursor-pointer"
    >
      <Globe className="w-4 h-4" />
      {i18n.language === "ko" ? "한국어" : "English"}
    </button>
  );
};

export default LanguageSwitcher;
