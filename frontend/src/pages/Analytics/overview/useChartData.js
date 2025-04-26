import { useMemo } from "react";
import { format, parseISO, addMonths, subMonths, isAfter } from "date-fns";
import { TIME_RANGES } from "./constants";

export const useChartData = (data, timeRange) => {
  return useMemo(() => {
    if (!data) return [];

    const parsedData = data.map((item) => ({
      ...item,
      report_date: format(parseISO(item.report_date), "yyyy-MM"),
    }));

    const sortedData = parsedData.sort(
      (a, b) =>
        new Date(`${a.report_date}-01`).getTime() -
        new Date(`${b.report_date}-01`).getTime()
    );

    const latestDateStr = sortedData.length
      ? sortedData[sortedData.length - 1].report_date
      : format(new Date(), "yyyy-MM");
    const latestDate = parseISO(`${latestDateStr}-01`);

    let startDate;
    if (TIME_RANGES[timeRange] === Infinity) {
      startDate = sortedData.length
        ? parseISO(`${sortedData[0].report_date}-01`)
        : new Date();
    } else {
      startDate = subMonths(latestDate, TIME_RANGES[timeRange] - 1);
    }

    const generateMonthList = (start, end) => {
      const months = [];
      let current = start;
      while (!isAfter(current, end)) {
        months.push(format(current, "yyyy-MM"));
        current = addMonths(current, 1);
      }
      return months;
    };

    const monthList = generateMonthList(startDate, latestDate);

    return monthList.map((month) => {
      const dataForMonth = sortedData.find((item) => item.report_date === month);
      if (dataForMonth) {
        return {
          report_date: month,
          total_sales_contracts_revenue:
            Number(dataForMonth.total_sales_contracts_revenue) || 0,
          total_sales_contracts_amount_to_be_paid:
            Number(dataForMonth.total_sales_contracts_amount_to_be_paid) || 0,
          total_sales_contracts_value:
            Number(dataForMonth.total_sales_contracts_value) || 0,
          total_spent_on_orders:
            Number(dataForMonth.total_spent_on_orders) || 0,
          total_contract_value_of_all_contracts_except_sales:  Number(dataForMonth.total_contract_value_of_all_contracts_except_sales) || 0,
        };
      } else {
        return {
          report_date: month,
          total_sales_contracts_revenue: 0,
          total_sales_contracts_amount_to_be_paid: 0,
          total_sales_contracts_value: 0,
          total_spent_on_orders: 0,
          total_contract_value_of_all_contracts_except_sales: 0,
        };
      }
    });
  }, [data, timeRange]);
};

