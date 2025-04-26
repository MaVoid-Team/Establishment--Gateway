// eslint-disable-next-line no-unused-vars
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useTheme } from './ThemeContext';
import { useTranslation } from 'react-i18next';

// eslint-disable-next-line react/prop-types
const BackButton = ({ className = '' }) => {
  const navigate = useNavigate();
  // eslint-disable-next-line no-unused-vars
  const { theme } = useTheme();
  const i18n = useTranslation();
  return (
    <Button
      variant="outline"
      size="icon"
      className={`top-4 z-50 border-none bg-inherit ${className}`}
      onClick={() => navigate(-1)}
      aria-label="Go back"
    >
      <ArrowLeft className="h-[1.2rem] w-[1.2rem]" />
    </Button>
  );
};

export default BackButton;

