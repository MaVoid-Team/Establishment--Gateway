import { format, parseISO } from "date-fns";
import { enUS, arSA } from 'date-fns/locale';

export const TIME_RANGES = {
  "3M": 3,
  "6M": 6,
  "1Y": 12,
  ALL: Infinity,
};

export const LINES_CONFIG = [
  {
    dataKey: "total_sales_contracts_revenue",
    stroke: "#488f31",
    name: "totalSalesContractsValue",
  },
  {
    dataKey: "total_sales_contracts_amount_to_be_paid",
    stroke: "#58508d",
    name: "paymentsDue",
  },
  {
    dataKey: "total_sales_contracts_value",
    stroke: "#bc5090",
    name: "paymentsReceived",
  },
  {
    dataKey: "total_contract_value_of_all_contracts_except_sales",
    stroke: "#ffa600",
    name: "TotalContractValueOfAllContractsExceptSales",
  },
];

export const formatCurrency = (value, language) => {
  return new Intl.NumberFormat(language, {
    style: "currency",
    currency: "SAR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatDate = (dateString, language) => {
  return format(parseISO(`${dateString}-01`), "MMMM yyyy", { locale: language === 'ar' ? arSA : enUS });
};
