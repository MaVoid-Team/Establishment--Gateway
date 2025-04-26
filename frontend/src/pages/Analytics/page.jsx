import React, { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from 'react-i18next';

import { Overview } from "./overview/overview";
import { PaymentDistribution } from "./payment-distribution/payment-distribution";
import RecentTransactions from './recent-transactions/recent-transactions';
import { AnalyticsCard } from './page components/AnalyticsCard';
import { useAnalyticsData } from './page components/useAnalyticsData';
import { cardConfig } from './page components/cardConfig';
import SpinningScreen from '@/components/ui/spinningScreen';

export default function AnalyticsPage() {
  const [selectedMonth, setSelectedMonth] = useState('all');
  const { analyticsData, isLoading, error, processData } = useAnalyticsData();
  const { t, i18n } = useTranslation();

  const currentData = useMemo(() => processData(analyticsData, selectedMonth), [analyticsData, selectedMonth, processData]);

  // Render all data cards
  const renderAnalyticsData = useMemo(() => {
    if (!currentData) return null;

    return (
      <div className="space-y-4">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cardConfig.map((config) => {
            const { key, ...cardProps } = config;
            return (
              <div key={key} className="card hover:scale-105 duration-500 transition-all">
                <AnalyticsCard {...cardProps} value={currentData[key]} />
              </div>
            );
          })}
        </div>
      </div>
    );
  }, [currentData]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500 text-lg">{error}
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <SpinningScreen />
      </div>
    );
  }

  const isRTL = i18n.language === 'ar';

  return (
    <div 
      className={`flex-1 space-y-4 p-4 pt-12`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold tracking-tight text-shadow text-gray-800 dark:text-gray-100">
          {t('analytics')}
        </h2>
      </div>

      <Tabs defaultValue="overview" className="space-y-4" 
      dir={isRTL ? 'rtl' : 'ltr'}>
        <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
          <TabsList className={`flex ${isRTL ? 'justify-end flex-row-reverse' : 'justify-start flex-row'} w-full`}>
            <TabsTrigger value="overview">{t('overview')}</TabsTrigger>
            <TabsTrigger value="transactions">{t('transactions')}</TabsTrigger>
            <TabsTrigger value="distribution">{t('distribution')}</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-4 back" 
        dir={isRTL ? 'rtl' : 'ltr'}>
          <div className={`flex justify-between items-center`}
          dir={isRTL ? 'rtl' : 'ltr'}>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 text-shadow">
              {t('financialAnalyticsDashboard')}
            </h2>
            <Select 
              dir={isRTL ? 'rtl' : 'ltr'}
              value={selectedMonth}
              onValueChange={setSelectedMonth}
              className={`${isRTL ? 'rtl' : 'ltr'}`}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t('selectDataRange')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('showAllTimeData')}</SelectItem>
                {analyticsData && analyticsData.map((data) => (
                  <SelectItem key={data.report_date} value={data.report_date}>
                    {new Date(data.report_date).toLocaleString(i18n.language, { month: 'long', year: 'numeric' })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {renderAnalyticsData}

          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
            <Overview data={analyticsData} className="w-full" />
            <PaymentDistribution className="w-full" />
          </div>
        </TabsContent>

        <TabsContent value="transactions">
          <RecentTransactions />
        </TabsContent>

        <TabsContent value="distribution">
          <PaymentDistribution className="w-full aspect-[4/3]" />
        </TabsContent>
      </Tabs>
    </div>
  );
}