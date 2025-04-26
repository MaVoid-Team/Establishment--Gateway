import { useState, useEffect } from 'react';
import axios from 'axios';

export const usePaymentData = () => {
  const [data, setData] = useState({
    companies: [],
    vendors: [],
    documents: [],
    salesContracts: [],
    tickets: [],
    legalServices: []
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companiesResponse, vendorsResponse, documentsResponse, salesContractsResponse, ticketsResponse, legalServicesResponse] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/v1/companies`, { withCredentials: true }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/v1/vendors`, { withCredentials: true }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/v1/documents`, { withCredentials: true }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/v1/sales-contracts`, { withCredentials: true }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/v1/tickets/category/1`, { withCredentials: true }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/v1/tickets/category/2`, { withCredentials: true })
        ]);

        const fetchedTickets = ticketsResponse.data?.tickets || [];
        const fetchedLegalServices = legalServicesResponse.data?.tickets || [];

        setData({
          companies: Array.isArray(companiesResponse.data) ? companiesResponse.data : [],
          vendors: Array.isArray(vendorsResponse.data) ? vendorsResponse.data : [],
          documents: Array.isArray(documentsResponse.data?.data?.documents) ? documentsResponse.data.data.documents : [],
          salesContracts: Array.isArray(salesContractsResponse.data?.data?.salesContracts) ? salesContractsResponse.data.data.salesContracts : [],
          tickets: fetchedTickets,
          legalServices: fetchedLegalServices
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message || 'An error occurred while fetching data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, error, isLoading };
};