import React from "react";
import { useTranslation } from "react-i18next";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { VendorRevenueTable } from "./VendorRevenueTable";
import { CompanyRevenueTable } from "./CompanyRevenueTable";
import { useRevenueData } from "./useRevenueData";
import SpinningScreen from "@/components/ui/spinningScreen";

const RecentTransactions = () => {
  const { t, i18n } = useTranslation();
  const { vendorRevenues, companyRevenues, isLoading, error } = useRevenueData();
  const locale = i18n.language;
  const rtlLocales = ['ar', 'he', 'fa', 'ur'];
  const isRTL = rtlLocales.includes(locale.split('-')[0]);
  const currency = 'SAR'; // Set to 'SAR' as per requirement

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <SpinningScreen/>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-red-500">{t('recentTransactions.error')}</p>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t('recentTransactions.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="vendors" dir={isRTL ? 'rtl' : 'ltr'}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="vendors">{t('recentTransactions.tabs.clients')}</TabsTrigger>
            <TabsTrigger value="companies">{t('recentTransactions.tabs.companies')}</TabsTrigger>
          </TabsList>
          <TabsContent value="vendors">
            <VendorRevenueTable data={vendorRevenues} isRTL={isRTL} currency={currency} />
          </TabsContent>
          <TabsContent value="companies">
            <CompanyRevenueTable data={companyRevenues} isRTL={isRTL} currency={currency} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;