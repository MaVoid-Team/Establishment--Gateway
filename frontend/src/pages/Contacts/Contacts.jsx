'use client';

import { useTranslation } from "react-i18next";
import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Users, BarChart3, Briefcase, ChevronRight, ChevronLeft, MessageSquare, Search, Calendar } from 'lucide-react';
import DepartmentSkeleton from '@/components/ui/skeleton-departments';



function Contacts() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const apiUrl = import.meta.env.VITE_API_URL;

  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [errorEmployees, setErrorEmployees] = useState(null);

  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [errorDepartments, setErrorDepartments] = useState(null);

  const [vendors, setVendors] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(true);
  const [errorVendors, setErrorVendors] = useState(null);

  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [errorCompanies, setErrorCompanies] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterOption, setFilterOption] = useState("most-connected");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoadingDepartments(true);
        const response = await axios.get(`${apiUrl}/api/v1/departments/`, { withCredentials: true });
        
        if (response.data.status === 'success' && Array.isArray(response.data.data.departments)) {
          setDepartments(response.data.data.departments);
        } else {
          console.error(t('InvalidResponseFormat'), response.data);
          setDepartments([]);
        }
      } catch (error) {
        console.error(t('ErrorFetchingDepartments'), error.response?.data || error.message);
        setErrorDepartments(t("ErrorFetchingDepartments"));
        setDepartments([]);
      } finally {
        setLoadingDepartments(false);
      }
    };

    fetchDepartments();
  }, [apiUrl, t]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoadingEmployees(true);
        const response = await axios.get(`${apiUrl}/api/v1/employees`, { withCredentials: true });
        if (response.data.status === 'success' && Array.isArray(response.data.data.employees)) {
          setEmployees(response.data.data.employees);
        } else {
          console.error(t('InvalidResponseFormat'), response.data);
          setEmployees([]);
        }
      } catch (err) {
        setErrorEmployees(t("FailedToFetchEmployees"));
        console.error("Error fetching employees:", err.response || err.message || err);
      } finally {
        setLoadingEmployees(false);
      }
    };

    fetchEmployees();
  }, [apiUrl, t]);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setLoadingVendors(true);
        const response = await axios.get(`${apiUrl}/api/v1/vendors`, { withCredentials: true });
        if (response.data.data && Array.isArray(response.data.data.vendors)) {
          setVendors(response.data.data.vendors);
        } else {
          console.error(t('InvalidResponseFormat'), response.data);
          setVendors([]);
        }
      } catch (err) {
        setErrorVendors(t("FailedToFetchVendors"));
        console.error("Error fetching vendors:", err.response || err.message || err);
      } finally {
        setLoadingVendors(false);
      }
    };

    fetchVendors();
  }, [apiUrl, t]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoadingCompanies(true);
        const response = await axios.get(`${apiUrl}/api/v1/companies`, { withCredentials: true });
        if (response.data.data && Array.isArray(response.data.data.companies)) {
          setCompanies(response.data.data.companies);
        } else {
          console.error(t('InvalidResponseFormat'), response.data);
          setCompanies([]);
        }
      } catch (err) {
        setErrorCompanies(t("FailedToFetchCompanies"));
        console.error("Error fetching companies:", err.response || err.message || err);
      } finally {
        setLoadingCompanies(false);
      }
    };

    fetchCompanies();
  }, [apiUrl, t]);

  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleFilterChange = (value) => setFilterOption(value);

  const filteredResults = useMemo(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    
    const filterArray = (array, filterFn) => {
      return Array.isArray(array) ? array.filter(filterFn) : [];
    };

    return {
      employees: filterArray(employees, employee => 
        (employee.name && employee.name.toLowerCase().includes(lowercasedSearchTerm)) ||
        (employee.employeeRole && employee.employeeRole.name.toLowerCase().includes(lowercasedSearchTerm))
      ),
      departments: filterArray(departments, department =>
        department.name && department.name.toLowerCase().includes(lowercasedSearchTerm)
      ),
      companies: filterArray(companies, company =>
        (company.name && company.name.toLowerCase().includes(lowercasedSearchTerm)) ||
        (company.industry && company.industry.toLowerCase().includes(lowercasedSearchTerm))
      ),
      vendors: filterArray(vendors, vendor =>
        (vendor.name && vendor.name.toLowerCase().includes(lowercasedSearchTerm)) ||
        (vendor.nationality && vendor.nationality.toLowerCase().includes(lowercasedSearchTerm))
      )
    };
  }, [employees, departments, companies, vendors, searchTerm]);

  const filteredEmployees = useMemo(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    return Array.isArray(employees)
      ? employees.filter(employee => 
          (employee.name && employee.name.toLowerCase().includes(lowercasedSearchTerm)) ||
          (employee.employeeRole && employee.employeeRole.name.toLowerCase().includes(lowercasedSearchTerm))
        )
      : [];
  }, [employees, searchTerm]);

  const SafeRender = ({ children }) => {
    try {
      return children;
    } catch (error) {
      console.error("Rendering error:", error);
      return <p>Error rendering content</p>;
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-10">
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">{t("Contacts Directory")}</h1>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <Input
            type="text"
            placeholder={t("searchDepartmentsOrEmployees")}
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full sm:w-64"
          />
          <Button size="icon" variant="ghost">
            <Search className="h-6 w-6" />
          </Button>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Card className="p-6 border-none shadow-xl dark:shadow-lg">
            <h2 className="mb-4 font-semibold">{t("topEmployees")}</h2>
            {loadingEmployees ? (
              <DepartmentSkeleton count={3} />
            ) : (
              <div className="grid grid-cols-3 gap-4">
                <SafeRender>
                  {filteredEmployees.slice((currentPage - 1) * 3, currentPage * 3).map((employee) => (
                    <div key={employee.id} className="flex flex-col items-center">
                      <Avatar className="h-16 w-16 mb-2">
                        <AvatarImage src={employee.avatar || "/path/to/default/avatar.png"} alt={employee.name} />
                        <AvatarFallback>{employee.name[0]}</AvatarFallback>
                      </Avatar>
                      <p className="text-sm font-medium text-center">{employee.name}</p>
                      <p className="text-xs text-center text-gray-500">{employee.employeeRole?.name}</p>
                    </div>
                  ))}
                </SafeRender>
              </div>
            )}
            {!loadingEmployees && (
              <>
                <div className="mt-4 flex justify-center gap-2">
                  {Array.from({ length: Math.ceil(filteredEmployees.length / 3) }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
              </>
            )}
          </Card>
          
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Link to="/view-employee">
            <Card className="flex flex-col items-center justify-center p-4 border-none shadow-xl dark:shadow-lg  hover:scale-105 duration-300">
              <Users className="mb-2 h-6 w-6 text-blue-500 dark:text-blue-400" />
              <span className="text-sm">{t("employeeOverview")}</span>
            </Card>
            </Link>
            <Link to="/analytics">
            <Card className="flex flex-col items-center justify-center p-4 border-none shadow-xl dark:shadow-lg  hover:scale-105 duration-300">
              <BarChart3 className="mb-2 h-6 w-6 text-green-500 dark:text-green-400" />
              <span className="text-sm">{t("Analytics")}</span>
            </Card>
            </Link>
          </div>

          <Card className="p-6 border-none shadow-xl dark:shadow-lg hover:scale-105 duration-300">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">{t("top5Departments")}</h2>
              <Select value={filterOption} onValueChange={handleFilterChange}
               dir={`${i18n.language==="ar" ? "rtl" : "ltr"}`}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t("filterBy")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="most-connected">{t("mostConnected")}</SelectItem>
                  <SelectItem value="highest-rating">{t("highestRating")}</SelectItem>
                  <SelectItem value="most-productive">{t("mostProductive")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-4">
              <SafeRender>
                {loadingDepartments ? (
                  <DepartmentSkeleton count={5} />
                ) : errorDepartments ? (
                  <p className="text-red-500">{errorDepartments}</p>
                ) : departments.length > 0 ? (
                  filteredResults.departments.slice(0, 5).map((dept) => (
                    <div key={dept.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={dept.icon} alt={dept.name} />
                          <AvatarFallback>
                            <Building2 className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{dept.name}</p>
                          <p className="text-sm">{t("employeesCount", { count: dept.employees })}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => navigate(`/departments-contact/${dept.id}`)}>
                        {i18n.language === "ar" ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </Button>
                    </div>
                  ))
                ) : (
                  <p>{t("noDepartmentsFound")}</p>
                )}
              </SafeRender>
            </div>
            <div className="mt-4 flex items-center justify-center">
              <Button
                variant="outline"
                className="w-full rounded-lg text-center"
                onClick={() => navigate("/view-departments")}
              >
                {t("viewAllDepartments")}
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* New Section for Employee, Company, and Vendor Lists */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-6">
        {/* Employee List */}
        <Card className="p-6 border-none shadow-xl dark:shadow-lg">
          <h2 className="mb-4 font-semibold text-lg">{t("Employees List")}</h2>
          <div className="space-y-4">
            <SafeRender>
              {loadingEmployees ? (
                <DepartmentSkeleton count={6} />
              ) : (
                filteredResults.employees.slice(0, 6).map((employee) => (
                  <div 
                    key={employee.id} 
                    className="flex items-center justify-between rounded-lg p-2 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 ">
                        <AvatarImage src={employee.avatar} alt={employee.name} />
                        <AvatarFallback>{employee.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{employee.name}</p>
                        <p className="text-sm">{t(employee.employeeRole?.name)}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => navigate(`/employee-contact/${employee.id}`)}>
                      {i18n.language === "ar" ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                  </div>
                ))
              )}
            </SafeRender>
          </div>
          <Button
            variant="outline"
            className="w-full rounded-lg text-center mt-4"
            onClick={() => navigate("/view-employee")}
          >
            {t("viewAllEmployees")}
          </Button>
        </Card>

        {/* Company List */}
        <Card className="p-6 border-none shadow-xl dark:shadow-lg">
          <h2 className="mb-4 font-semibold text-lg">{t("Companies List")}</h2>
          <div className="space-y-4">
            <SafeRender>
              {loadingCompanies ? (
                <DepartmentSkeleton count={6} />
              ) : errorCompanies ? (
                <p className="text-red-500">{errorCompanies}</p>
              ) : (
                filteredResults.companies.slice(0, 6).map((company) => (
                  <div 
                    key={company.id} 
                    className="flex items-center justify-between rounded-lg p-2 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 ">
                        <AvatarImage src={company.logo || "/placeholder.svg"} alt={company.name} />
                        <AvatarFallback>{company.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium ">{company.name}</p>
                        <p className="text-sm ">{t(company.industry)}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => navigate(`/company/${company.id}`)}>
                      {i18n.language === "ar" ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                  </div>
                ))
              )}
            </SafeRender>
          </div>
          <Button
            variant="outline"
            className="w-full rounded-lg text-center mt-4"
            onClick={() => navigate("/view-companies")}
          >
            {t("viewAllCompanies")}
          </Button>
        </Card>

        {/* Vendor List */}
        <Card className="p-6 border-none shadow-xl dark:shadow-lg">
          <h2 className="mb-4 font-semibold text-lg ">{t("Clients List")}</h2>
          <div className="space-y-4">
            <SafeRender>
              {loadingVendors ? (
                <DepartmentSkeleton count={6} />
              ) : errorVendors ? (
                <p className="text-red-500">{errorVendors}</p>
              ) : (
                filteredResults.vendors.slice(0, 6).map((vendor) => (
                  <div 
                    key={vendor.id} 
                    className="flex items-center justify-between rounded-lg p-2 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 ">
                        <AvatarImage src="/placeholder.svg?height=40&width=40" alt={vendor.name} />
                        <AvatarFallback>{vendor.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium ">{vendor.name}</p>
                        <p className="text-sm ">{t(vendor.nationality || "")}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => navigate(`/vendor/${vendor.id}`)}>
                      {i18n.language === "ar" ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                  </div>
                ))
              )}
            </SafeRender>
          </div>
          <Button
            variant="outline"
            className="w-full rounded-lg text-center mt-4"
            onClick={() => navigate("/view-vendor")}
          >
            {t("viewAllVendors")}
          </Button>
        </Card>
      </div>
    </div>
  );
}

export default Contacts;

