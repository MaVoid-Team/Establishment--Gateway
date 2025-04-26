import { useState, useEffect } from "react";
import axios from "axios";

export const useRevenueData = () => {
  const [vendorRevenues, setVendorRevenues] = useState([]);
  const [companyRevenues, setCompanyRevenues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [vendorResponse, companyResponse] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/v1/vendorRevenue/vendorRevenues/`, { withCredentials: true }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/v1/companyRevenue/companyRevenues/`, { withCredentials: true }),
        ]);

        setVendorRevenues(vendorResponse.data);
        setCompanyRevenues(companyResponse.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { vendorRevenues, companyRevenues, isLoading, error };
};
