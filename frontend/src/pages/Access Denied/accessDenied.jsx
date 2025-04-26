import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function AccessDenied() {
  const {t} = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-white">
      <div className="text-center">
        <AlertTriangle className="w-16 h-16 text-red-700 mx-auto mb-6 animate-pulse " />
        <h1 className="text-5xl font-extrabold mb-4 text-red-500">{t("Access Denied")}</h1>
        <p className="text-lg mb-6 text-red-400">
           {t("noPermission")}
        </p>
        <Link
          to="/main-page"
          className="px-6 py-3 bg-white text-red-600 font-bold rounded-lg shadow-lg hover:bg-red-100 transition duration-300"
        >
          {t("Return to Home")}
        </Link>
      </div>
    </div>
  );
}
