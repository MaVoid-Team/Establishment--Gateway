// LanguageSwitcher.jsx

import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { useEffect } from 'react';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  
  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'ar' : 'en');
  };

  useEffect(() => {
    // Update HTML lang attribute
    document.documentElement.lang = i18n.language;

    if (i18n.language === 'ar') {
      document.documentElement.classList.add('arabic-font');
      loadFont('Noto Kufi Arabic', 'font-noto-kufi-arabic');
    } else {
      document.documentElement.classList.remove('arabic-font');
      loadFont('Ubuntu', 'font-ubuntu');
    }
  }, [i18n.language]);

  const loadFont = (fontName, id) => {
    // Define font URLs with desired weights and styles
    let href = '';
    if (fontName === 'Ubuntu') {
      href = "https://fonts.googleapis.com/css2?family=Ubuntu:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap";
    } else if (fontName === 'Noto Kufi Arabic') {
      href = "https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@100..900&display=swap";
    }

    // Check if the font link already exists
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    }
  };

  return (
    <Button
      variant="ghost"
      className={`hover:bg-[#ffffff3b] dark:hover:bg-stone-700 px-4 border rounded-sm ${i18n.language === 'ar' ? "left-16" : "right-16"} z-50 bg-inherit border-none`}
      onClick={toggleLanguage}
    >
      {i18n.language === 'en' ? 'عربي' : 'English'}
    </Button>
  );
};

export default LanguageSwitcher;
