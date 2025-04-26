import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { ChevronLeft } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter
} from '@/components/ui/card';

function DirectoryDetails() {
  const { t, i18n } = useTranslation();
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  // Extract the 'department' query parameter from the URL
  const queryParams = new URLSearchParams(location.search);
  const departmentIdParam = queryParams.get('department');
  const departmentId = departmentIdParam ? Number(departmentIdParam) : null;

  // Function to fetch documents based on departmentId
  const fetchDocuments = async () => {
    try {
      // **IMPORTANT:** Replace the endpoint below with your actual API endpoint for fetching documents by departmentId
      // Example endpoint: `${apiUrl}/api/v1/departments/${departmentId}/documents`
      const response = await axios.get(`${apiUrl}/api/v1/depstodocs/${departmentId}/documents`, { withCredentials: true });
     
      console.log('Documents Response:', response.data); // Debugging log

      // Adjust based on actual response structure
      const fetchedDocuments = response.data.data.documents;
      if (!fetchedDocuments) {
        throw new Error(t('Documents data is missing.'));
      }

      setDocuments(fetchedDocuments);
    } catch (err) {
      console.error('Error fetching documents:', err);
      // Determine error message based on response
      if (err.response) {
        // Server responded with a status other than 2xx
        if (err.response.status === 401) {
          setError(t('You are not authorized to view this information.'));
        } else if (err.response.status === 403) {
          setError(t('Access to this department is forbidden.'));
        } else if (err.response.status === 404) {
          setError(t('Department not found.'));
        } else {
          setError(err.response.data.message || t('Failed to load department documents.'));
        }
      } else if (err.request) {
        // Request was made but no response received
        setError(t('Network error. Please check your connection and try again.'));
      } else {
        // Something else caused the error
        setError(err.message || t('Failed to load department documents.'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (departmentId) {
      fetchDocuments();
    } else {
      setError(t('No department specified.'));
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departmentId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-16 h-16 border-4border-dashed rounded-full animate-spin"></div>
        <span className="ml-4 text-xl text-shadow">{t('Loading...')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center mt-10">
        <p>{error}</p>
        <div className="mt-4">
          <Button
            onClick={() => navigate(-1)}
            className="px-4 py-2 transition-colors"
          >
            <ChevronLeft className="inline-block mr-2" />
            {t('Go Back')}
          </Button>
          {error === t('Network error. Please check your connection and try again.') && (
            <Button
              onClick={() => {
                setIsLoading(true);
                setError(null);
                fetchDocuments();
              }}
              className="ml-2 px-4 py-2 transition-colors"
            >
              {t('Retry')}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-background text-foreground min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-shadow">
          {t('Department Documents')}
        </h1>
        <Button
          onClick={() => navigate(-1)}
          className="flex items-center px-4 py-2transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          {t('Back')}
        </Button>
      </div>
      {documents.length === 0 ? (
        <p className="text-center text-shadow">{t('No documents found for this department.')}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((document) => (
        <Card key={document.id} className="bg-black bg-opacity-20">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">{document.type}</CardTitle>
        </CardHeader>
        <CardContent>
        <p className="text-sm">
            <strong>{t('title')}:</strong> {document.title}
          </p>
          <p className="text-sm">
            <strong>{t('Client')}:</strong> {document.client}
          </p>
          <p className="text-sm">
            <strong>{t('Contract Value')}:</strong> {document.currency} {document.contract_value}
          </p>
          <p className="text-sm">
            <strong>{t('Status')}:</strong> {document.status}
          </p>
          <p className="text-sm">
            <strong>{t('Expiry Date')}:</strong> {new Date(document.expiry_date).toLocaleDateString()}
          </p>
          {/* Add more fields as necessary */}
        </CardContent>
        {document.attachment && (
          <CardFooter>
            <a
              href={document.attachment}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {t('Download Attachment')}
            </a>
          </CardFooter>
        )}
      </Card>
      
          ))}
        </div>
      )}
    </div>
  );
}

export default DirectoryDetails;
