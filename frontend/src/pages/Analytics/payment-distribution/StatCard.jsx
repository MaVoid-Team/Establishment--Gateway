import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const StatCard = ({ title, value, change, icon }) => {
  const { t, i18n } = useTranslation();
  
  const formatValue = (val) => {
    if (typeof val !== 'number') return '0 SAR';
    
    const absVal = Math.abs(val);
    let formattedValue;
    let suffix = '';
    
    if (absVal >= 1000000000) {
      formattedValue = (val / 1000000000).toFixed(1);
      suffix = t('billion');
    } else if (absVal >= 1000000) {
      formattedValue = (val / 1000000).toFixed(1);
      suffix = t('million');
    } else if (absVal >= 1000) {
      formattedValue = (val / 1000).toFixed(1);
      suffix = t('thousand');
    } else {
      formattedValue = val.toLocaleString(i18n.language, { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      });
    }

    if (i18n.language === 'ar') {
      return `${formattedValue} ${suffix} ${t('Acurrency')}  `;
    }
    return `${formattedValue}${suffix} ${t('Acurrency')}`;
  };

  return (
    <Card className="hover:shadow-xl transition-shadow"
    dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-gray-800 dark:text-gray-100">
          {formatValue(value)}
        </div>
        <p className={`text-xs ${change >= 0 ? "text-green-600" : "text-red-600"} flex items-center`}>
          {change >= 0 ? (
            <ArrowUpRight className="mr-1 h-4 w-4" />
          ) : (
            <ArrowDownRight className="mr-1 h-4 w-4" />
          )}
          {new Intl.NumberFormat(i18n.language, { 
            style: 'percent', 
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }).format(change / 100)} {t('fromLastPeriod')}
        </p>
      </CardContent>
    </Card>
  );
};

export default StatCard;