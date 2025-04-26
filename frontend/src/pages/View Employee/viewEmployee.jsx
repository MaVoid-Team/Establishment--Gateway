'use client'

import { Search } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState, useEffect, useMemo } from "react"
import { Pagination } from '../../components/ui/pagination'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useTranslation } from 'react-i18next'
import DepartmentSkeleton from '@/components/ui/skeleton-departments'

const ITEMS_PER_PAGE = 5;

export default function ViewEmployee() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState(["all"]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [employeesResponse, departmentsResponse] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/v1/employees`, { withCredentials: true }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/v1/departments`, { withCredentials: true })
        ]);

        const departmentsMap = departmentsResponse.data.data.departments.reduce((acc, dept) => {
          acc[dept.id] = dept.name;
          return acc;
        }, {});

        setEmployees(
          employeesResponse.data.data.employees.map((employee) => ({
            ...employee,
            departmentName: departmentsMap[employee.department_id] || t("UnknownDepartment"),
            roleName: employee.employeeRole?.name || t("UnknownRole")
          }))
        );

        setDepartments(["all", ...departmentsResponse.data.data.departments.map((dept) => dept.name)]);
      } catch (err) {
        console.error(t("FailedToFetchData"), err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [t]);

  const handleChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleDepartmentChange = (value) => {
    setFilterDepartment(value);
    setCurrentPage(1);
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter(employee =>
      (employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.roleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.departmentName.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterDepartment === "all" || employee.departmentName === filterDepartment)
    );
  }, [employees, searchTerm, filterDepartment]);

  const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);

  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredEmployees.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredEmployees, currentPage]);

  return (
    <div className="min-h-{80vh} bg-background p-10 sm:p-6">
      <div className="mx-auto max-w-5xl">
        {/* Search and Filter Section */}
        <div className="bg-background  mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t("SearchForEmployees")}
                value={searchTerm}
                onChange={handleChange}
                className="pl-10 w-full"
              />
            </div>
            <Select onValueChange={handleDepartmentChange} defaultValue={filterDepartment} className="w-full sm:w-[180px]" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder={t("SelectDepartment")} />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept === "all" ? t("AllDepartments") : dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Employees List Section */}
        <div>
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
            <h2 className="text-3xl font-bold sm:mb-0">{t("people")}</h2>
            <p className="text-sm text-muted-foreground">
              {t("TotalEmployees")}: {filteredEmployees.length} | {t("Page")}: {currentPage} / {totalPages}
            </p>
          </div>

          {/* Employee List */}
          <div className="space-y-4" dir='ltr'>
            {isLoading ? (
              <DepartmentSkeleton />
            ) : paginatedEmployees.length > 0 ? (
              paginatedEmployees.map((employee) => (
                <div
                  key={employee.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border-none bg-card p-4 shadow-lg duration-300 hover:shadow-2xl hover:scale-105"
                >
                  <div className="flex items-center gap-4 mb-4 sm:mb-0">
                    <Avatar>
                      <AvatarImage src={employee.avatar} alt={employee.name} />
                      <AvatarFallback>
                        {employee.name.split(' ').map(name => name.charAt(0)).join('').slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{employee.name}</h3>
                      <p className={`sm:text-left text-muted-foreground`}>{employee.roleName}</p>
                    </div>
                  </div>
                  <div className={`flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto`}>
                    <div className={`text-sm mr-10 mb-4 sm:mb-0`}>
                      <p className='text-center'>
                        {employee.departmentName.length > 36
                          ? `${employee.departmentName.slice(0, 36)}...`
                          : employee.departmentName}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="bg-[#11171D] text-white hover:bg-[#d4ab71] w-full sm:w-auto"
                      onClick={() => navigate(`/employee-contact/${employee.id}`)}
                    >
                      {t("ViewProfile")}
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p>{t("NoEmployeesFound")}</p>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </div>
    </div>
  );
}

