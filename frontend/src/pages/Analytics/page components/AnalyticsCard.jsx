import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from 'react-i18next';

const formatValue = (value, isMonetary, showDecimals, t, i18n) => {
  if (typeof value !== 'number') {
    return value || '0';
  }

  let formattedValue;
  let suffix = '';
  if (Math.abs(value) >= 1000000000) {
    formattedValue = (value / 1000000000).toFixed(1);
    suffix = t('billion');
  } else if (Math.abs(value) >= 1000000) {
    formattedValue = (value / 1000000).toFixed(1);
    suffix = t('million');
  } else if (Math.abs(value) >= 1000) {
    formattedValue = (value / 1000).toFixed(1);
    suffix = t('thousand');
  } else {
    formattedValue = showDecimals
      ? value.toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : value.toLocaleString(i18n.language);
  }

  if (isMonetary) {
    if (i18n.language === 'ar') {
      return `${formattedValue} ${suffix} ${t('Acurrency')} `;
    } else {
      return ` ${formattedValue}${suffix} ${t('Acurrency')}`;
    }
  } else {
    return `${formattedValue}${suffix}`;
  }
};

export function AnalyticsCard({ title, value, icon: Icon, isMonetary = true, showDecimals = true, color }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 border-none transition-colors">
      <CardHeader className={`flex flex-row items-center justify-between space-y-0 pb-2`}>
        <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-200" >
          {t(title)}
        </CardTitle>
        <Icon className={`h-5 w-5 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold text-gray-900 dark:text-gray-100 ${isRTL ? 'text-right' : 'text-left'}`}>
          {formatValue(value, isMonetary, showDecimals, t, i18n)}
        </div>
      </CardContent>
    </Card>
  );
}