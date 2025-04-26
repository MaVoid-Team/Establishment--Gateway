import { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import EmployeeProfile from './EmployeeProfile';

export default function EmployeeProfilePage() {
  const { t } = useTranslation();
  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Access the API base URL from environment variables
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${apiUrl}/api/v1/employees/myData`, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.data.status === 'success') {
          setEmployeeData(response.data.data.employee);
        } else {
          throw new Error(t('fetchEmployeeError'));
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || t('unexpectedError'));
        console.error(t('fetchEmployeeErrorLog'), err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeData();
  }, [apiUrl, t]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl">{t('loadingEmployeeData')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500 text-xl">{t('errorMessage', { error })}</p>
      </div>
    );
  }

  return <EmployeeProfile employee={employeeData} />;
}