import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Pagination } from '../../components/ui/pagination';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import DepartmentSkeleton from '../../components/ui/skeleton-departments';

const ITEMS_PER_PAGE = 5;

function ViewDepartments() {
  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const apiUrl = import.meta.env.VITE_API_URL;
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${apiUrl}/api/v1/departments/`, { withCredentials: true });
        if (response.data.status === 'success' && Array.isArray(response.data.data.departments)) {
          setDepartments(response.data.data.departments);
        } else {
          console.error(t('InvalidResponseFormat'), response.data);
          setDepartments([]);
        }
      } catch (error) {
        console.error(t('ErrorFetchingDepartments'), error.response?.data || error.message);
        setDepartments([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDepartments();
  }, [apiUrl, t]);

  const handleChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const filteredDepartments = useMemo(() => {
    return departments.filter(department =>
      department.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [departments, searchTerm]);

  const totalPages = Math.ceil(filteredDepartments.length / ITEMS_PER_PAGE);

  const paginatedDepartments = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredDepartments.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredDepartments, currentPage]);

  return (
    <div className="min-h-[80vh] p-4 sm:p-6">
      <div className="mx-auto max-w-5xl ">
        {/* Search Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t("SearchForDepartments")}
                value={searchTerm}
                onChange={handleChange}
                className="pl-10 w-full"
              />
            </div>
          </div>
        </div>

        {/* Departments List Section */}
        <div>
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6 ">
            <h2 className="text-3xl font-bold sm:mb-0">{t("Departments")}</h2>
            <p className="text-sm text-muted-foreground">
              {t("TotalDepartments")}: {filteredDepartments.length} | {t("Page")}: {currentPage} / {totalPages}
            </p>
          </div>

          {/* Department List */}
          <div className="grid grid-cols-1 gap-4 " dir={i18n.language === "ar" ? "rtl" : "ltr"}>
            {isLoading ? (
              <DepartmentSkeleton />
            ) : paginatedDepartments.length > 0 ? (
              paginatedDepartments.map((department) => (
                <Card key={department.id} className="hover:shadow-xl shadow-lg dark:shadow-black transition-all duration-500 hover:scale-105 border-none ">
                  <CardContent className="flex items-center justify-between p-4 ">
                    <h3 className="font-medium text-lg">{department.name}</h3>
                    <Button variant="outline" onClick={() => navigate(`/departments-contact/${department.id}`)}>
                      {t("ViewDetails")}
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p>{t("NoDepartmentsFound")}</p>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ViewDepartments;
