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

export const VendorRevenueTable = ({ data, isRTL, currency = 'SAR' }) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const rtlLocales = ['ar', 'he', 'fa', 'ur'];
  const isRTLLocale = rtlLocales.includes(locale.split('-')[0]);

  if (data.length === 0) {
    return (
      <p className={`text-gray-500 mt-4 ${isRTL ? 'rtl' : ''}`}>
        {t('recentTransactions.noClientData')}
      </p>
    );
  }

  return (
    <div className={`overflow-x-auto mt-4 ${isRTL ? 'rtl' : ''}`}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className={`font-bold text-primary ${isRTLLocale ? 'text-right' : 'text-left'}`}>
              {t('recentTransactions.table.clientName')}
            </TableHead>
            <TableHead className={`font-bold text-primary ${isRTLLocale ? 'text-right' : 'text-left'}`}>
              {t('recentTransactions.table.contractsValue')}
            </TableHead>
            <TableHead className={`font-bold text-primary ${isRTLLocale ? 'text-right' : 'text-left'}`}>
              {t('recentTransactions.table.lastUpdated')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((vendor) => {
            // Ensure revenue value is a number
            const revenueGenerated = typeof vendor.total_revenue_generated === 'number'
              ? vendor.total_revenue_generated
              : parseFloat(vendor.total_revenue_generated) || 0;

            return (
              <TableRow key={vendor.vendor_id}>
                <TableCell className={isRTLLocale ? 'text-right' : 'text-left'}>
                  {vendor.vendor.name}
                </TableCell>
                <TableCell className={`font-medium ${isRTLLocale ? 'text-right' : 'text-left'}`}>
                  {formatCurrencyWithSuffix(revenueGenerated, locale, currency)}
                </TableCell>
                <TableCell className={isRTLLocale ? 'text-right' : 'text-left'}>
                  {formatDate(vendor.updated_at, locale)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
