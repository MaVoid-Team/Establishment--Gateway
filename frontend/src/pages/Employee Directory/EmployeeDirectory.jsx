import { useState, useEffect } from 'react';
import { Search, Building2, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter
} from '@/components/ui/card';

function EmployeeDirectory() {
  const { t } = useTranslation();
  const [departments, setDepartments] = useState([]);
  const [employeesByDepartment, setEmployeesByDepartment] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/v1/departments/`, { withCredentials: true });
        if (response.data.status === 'success' && Array.isArray(response.data.data.departments)) {
          setDepartments(response.data.data.departments);
        } else {
          throw new Error('Unexpected response structure');
        }
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching departments:', err);
        setError(t('Failed to load departments.'));
        setIsLoading(false);
      }
    };

    fetchDepartments();
  }, [apiUrl, t]);

  const filteredDepartments = departments.filter((department) =>
    department.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleCard = async (deptId) => {
    setEmployeesByDepartment((prev) => ({
      ...prev,
      [deptId]: {
        ...prev[deptId],
        isExpanded: !prev[deptId]?.isExpanded,
      },
    }));

    if (!employeesByDepartment[deptId]?.employees && !employeesByDepartment[deptId]?.isLoading && !employeesByDepartment[deptId]?.error) {
      setEmployeesByDepartment((prev) => ({
        ...prev,
        [deptId]: {
          ...prev[deptId],
          isLoading: true,
          error: null,
        },
      }));

      try {
        const employeesRes = await axios.get(`${apiUrl}/api/v1/departments/${deptId}/employees`, { withCredentials: true });
        setEmployeesByDepartment((prev) => ({
          ...prev,
          [deptId]: {
            ...prev[deptId],
            employees: employeesRes.data.data.employees,
            isLoading: false,
          },
        }));
      } catch (err) {
        console.error(`Error fetching employees for department ${deptId}:`, err);
        setEmployeesByDepartment((prev) => ({
          ...prev,
          [deptId]: {
            ...prev[deptId],
            isLoading: false,
            error: t('Failed to load employees.'),
          },
        }));
      }
    }
  };

  if (isLoading) return <div>{t('Loading departments...')}</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-6 bg-background text-foreground min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Building2 className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold ml-2">{t('Departments')}</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t('Search departments...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {filteredDepartments.length === 0 ? (
        <p className="text-center">{t('No departments found.')}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDepartments.map((department) => (
            <DepartmentCard
              key={department.id}
              department={department}
              employeesData={employeesByDepartment[department.id]}
              onToggle={() => toggleCard(department.id)}
              onViewDetails={() => navigate(`/directory-details?department=${department.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function DepartmentCard({ department, employeesData, onToggle, onViewDetails }) {
  const { t } = useTranslation();
  const { name } = department;

  const isExpanded = employeesData?.isExpanded;
  const isLoading = employeesData?.isLoading;
  const error = employeesData?.error;
  const employees = employeesData?.employees || [];

  return (
    <Card className="bg-black bg-opacity-20">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-xl font-semibold">{name}</CardTitle>
        <button
          onClick={onToggle}
          className="text-primary hover:text-primary/80 focus:outline-none ml-4"
          aria-label={isExpanded ? t('Collapse employee list') : t('Expand employee list')}
        >
          {isExpanded ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>
      </CardHeader>

      <CardContent>
        {isLoading && <p>{t('Loading employees...')}</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!isLoading && !error && employees.length > 0 ? (
          <ul className="list-disc pl-5">
            {employees.map((employee) => (
              <li key={employee.id} className="mb-2">
                <p className="text-sm font-medium">{employee.name}</p>
                <p className="text-xs text-muted-foreground">{employee.role_name}</p>
              </li>
            ))}
          </ul>
        ) : !isLoading && !error && (
          <p className="text-md text-muted-foreground text-center">{t('Click to see employees.')}</p>
        )}
      </CardContent>

      <CardFooter className="mt-4 text-center">
        <Button
          variant="outline"
          size="sm"
          onClick={onViewDetails}
        >
          {t('View Department Documents')}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default EmployeeDirectory;
