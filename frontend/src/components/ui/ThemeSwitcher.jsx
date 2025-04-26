// eslint-disable-next-line no-unused-vars
import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useTheme } from './ThemeContext';
import { useTranslation } from 'react-i18next';

const ThemeSwitcher = () => {
  // eslint-disable-next-line no-unused-vars
  const { theme, toggleTheme } = useTheme();
  const i18n = useTranslation();
  return (
    <div >
      <Button
        variant="outline"
        size="icon"
        className={`border-none rounded-sm dark:hover:bg-stone-700 hover:bg-[#ffffff50] backdrop-blur-md ${i18n.language === 'ar' ? "right-10" : "right-4"}`}
        onClick={toggleTheme}
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    </div>
  );
};

export default ThemeSwitcher;