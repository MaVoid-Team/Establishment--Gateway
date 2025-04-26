import React from "react";
import { useTranslation } from "react-i18next";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrencyWithSuffix, formatDate } from "./formatting";

export const CompanyRevenueTable = ({ data, isRTL, currency = 'SAR' }) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const rtlLocales = ['ar', 'he', 'fa', 'ur'];
  const isRTLLocale = rtlLocales.includes(locale.split('-')[0]);

  if (data.length === 0) {
    return (
      <p className={`text-gray-500 mt-4 ${isRTL ? 'rtl' : ''}`}>
        {t('recentTransactions.noCompanyData')}
      </p>
    );
  }

  return (
    <div className={`overflow-x-auto mt-4 ${isRTL ? 'rtl' : ''}`}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className={`font-bold text-primary ${isRTLLocale ? 'text-right' : 'text-left'}`}>
              {t('recentTransactions.table.companyName')}
            </TableHead>
            <TableHead className={`font-bold text-primary ${isRTLLocale ? 'text-right' : 'text-left'}`}>
              {t('recentTransactions.table.totalRevenueGenerated')}
            </TableHead>
            <TableHead className={`font-bold text-primary ${isRTLLocale ? 'text-right' : 'text-left'}`}>
              {t('recentTransactions.table.totalRevenueToBeGenerated')}
            </TableHead>
            <TableHead className={`font-bold text-primary ${isRTLLocale ? 'text-right' : 'text-left'}`}>
              {t('recentTransactions.table.lastUpdated')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((company) => {
            // Ensure revenue values are numbers
            const revenueGenerated = typeof company.total_revenue_generated === 'number'
              ? company.total_revenue_generated
              : parseFloat(company.total_revenue_generated) || 0;

            const revenueToBeGenerated = typeof company.total_revenue_to_be_generated === 'number'
              ? company.total_revenue_to_be_generated
              : parseFloat(company.total_revenue_to_be_generated) || 0;

            return (
              <TableRow key={company.company_id}>
                <TableCell className={isRTLLocale ? 'text-right' : 'text-left'}>
                  {company.company.name}
                </TableCell>
                <TableCell className={`font-medium ${isRTLLocale ? 'text-right' : 'text-left'}`}>
                  {formatCurrencyWithSuffix(revenueGenerated, locale, currency)}
                </TableCell>
                <TableCell className={`font-medium ${isRTLLocale ? 'text-right' : 'text-left'}`}>
                  {formatCurrencyWithSuffix(revenueToBeGenerated, locale, currency)}
                </TableCell>
                <TableCell className={isRTLLocale ? 'text-right' : 'text-left'}>
                  {formatDate(company.updated_at, locale)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
