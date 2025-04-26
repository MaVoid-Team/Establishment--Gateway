import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export function useAnalyticsData() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/analytics`, { withCredentials: true });
        const analyticsArray = response.data.data.analytics;
        const lifetimeTotals = response.data.data.lifetime_totals;
  
        if (analyticsArray && analyticsArray.length > 0) {
          // Merge analytics data with lifetime totals
          const enhancedData = analyticsArray.map(item => ({
            ...item,
            total_orders: lifetimeTotals.total_orders,
            total_tickets: lifetimeTotals.total_tickets
          }));
          setAnalyticsData(enhancedData);
        } else {
          setError('No data available');
        }
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        setError('Failed to fetch analytics data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalyticsData();
  }, []);

  const processData = useCallback((data, selectedMonth) => {
    if (!data) return null;
  
    if (selectedMonth === 'all') {
      return data.reduce((totals, item) => ({
        repeated_vendors_count: (totals.repeated_vendors_count || 0) + (item.repeated_vendors_count || 0),
        total_sales_contracts_revenue: (totals.total_sales_contracts_revenue || 0) + parseFloat(item.total_sales_contracts_revenue || 0),
        total_sales_contracts_amount_to_be_paid: (totals.total_sales_contracts_amount_to_be_paid || 0) + parseFloat(item.total_sales_contracts_amount_to_be_paid || 0),
        total_sales_contracts_value: (totals.total_sales_contracts_value || 0) + parseFloat(item.total_sales_contracts_value || 0),
        total_spent_on_orders: (totals.total_spent_on_orders || 0) + parseFloat(item.total_spent_on_orders || 0),
        total_contract_value_of_all_contracts_except_sales: 
          (totals.total_contract_value_of_all_contracts_except_sales || 0) + 
          parseFloat(item.total_contract_value_of_all_contracts_except_sales || 0),
        total_orders: item.total_orders,
        total_tickets: item.total_tickets
      }), {});
    } else {
      const selectedData = data.find(item => item.report_date.startsWith(selectedMonth));
      return selectedData ? {
        ...selectedData,
        total_contract_value_of_all_contracts_except_sales: 
          Number(selectedData.total_contract_value_of_all_contracts_except_sales) || 0,
      } : null;
    }
  }, []);

  return { analyticsData, isLoading, error, processData };
}

