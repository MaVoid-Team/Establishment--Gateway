import React from "react";
import { useTranslation } from "react-i18next";
import { formatDate } from "./constants";

export const CustomTooltip = React.memo(({ active, payload, label }) => {
  const { t, i18n } = useTranslation();

  const formatCurrency = (value) => {
    if (typeof value !== 'number') {
      return value || '0';
    }

    let formattedValue;
    if (Math.abs(value) >= 1000000000) {
      formattedValue = `${(value / 1000000000).toFixed(1)} ${t('billion')}`;
    } else if (Math.abs(value) >= 1000000) {
      formattedValue = `${(value / 1000000).toFixed(1)} ${t('million')}`;
    } else if (Math.abs(value) >= 1000) {
      formattedValue = `${(value / 1000).toFixed(1)} ${t('thousand')}`;
    } else {
      formattedValue = value.toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    return ` ${formattedValue} ${i18n.language === 'ar' ? 'ر.س' : 'SAR'}`;
  };

  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-md backdrop-blur-lg shadow-lg">
      <p className="font-bold mb-2 text-gray-900 dark:text-gray-100">
        {formatDate(label, i18n.language)}
      </p>
      <ul>
        {payload.map((entry, index) => (
          <li key={index} className="flex items-center mb-1">
            <span
              className="inline-block w-2 h-2 mr-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            ></span>
            <span className="text-sm text-gray-700 dark:text-gray-300" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
              {t(entry.name)} : {formatCurrency(entry.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
});

