'use client';

import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect, useMemo } from "react";
import { Pagination } from '../../components/ui/pagination';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import DepartmentSkeleton from '@/components/ui/skeleton-departments';

const ITEMS_PER_PAGE = 5;

export default function ViewVendors() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterNationality, setFilterNationality] = useState("all");
  const [vendors, setVendors] = useState([]);
  const [nationalities, setNationalities] = useState(["all"]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/vendors`, { withCredentials: true });

        if (response.data && response.data.data && Array.isArray(response.data.data.vendors)) {
          const fetchedVendors = response.data.data.vendors;
          setVendors(fetchedVendors);

          // Extract unique nationalities for the filter
          const uniqueNationalities = Array.from(new Set(fetchedVendors.map(v => v.nationality || "Unknown")));
          setNationalities(["all", ...uniqueNationalities]);
        } else {
          console.error(t("InvalidResponseFormat"), response.data);
          setVendors([]);
        }
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

  const handleNationalityChange = (value) => {
    setFilterNationality(value);
    setCurrentPage(1);
  };

  const filteredVendors = useMemo(() => {
    return vendors.filter(vendor =>
      (vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (vendor.email && vendor.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
       (vendor.nationality && vendor.nationality.toLowerCase().includes(searchTerm.toLowerCase()))) &&
      (filterNationality === "all" || (vendor.nationality || "Unknown") === filterNationality)
    );
  }, [vendors, searchTerm, filterNationality]);

  const totalPages = Math.ceil(filteredVendors.length / ITEMS_PER_PAGE);

  const paginatedVendors = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredVendors.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredVendors, currentPage]);

  return (
    <div className="min-h-{80vh} bg-background p-4 sm:p-6">
      <div className="mx-auto max-w-5xl">
        {/* Search and Filter Section */}
        <div className="bg-background mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t("SearchForVendors") || "Search for vendors..."}
                value={searchTerm}
                onChange={handleChange}
                className="pl-10 w-full"
              />
            </div>
            <Select onValueChange={handleNationalityChange} defaultValue={filterNationality} className="w-full sm:w-[180px]" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder={t("SelectNationality") || "Select nationality"} />
              </SelectTrigger>
              <SelectContent>
                {nationalities.map((nat) => (
                  <SelectItem key={nat} value={nat}>
                    {nat === "all" ? t("AllNationalities") || "All Nationalities" : nat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Vendors List Section */}
        <div>
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
            <h2 className="text-3xl font-bold sm:mb-0">{t("vendors") || "Vendors"}</h2>
            <p className="text-sm text-muted-foreground">
              {t("TotalVendors") || "Total Vendors"}: {filteredVendors.length} | {t("Page") || "Page"}: {currentPage} / {totalPages}
            </p>
          </div>

          {/* Vendor List */}
          <div className="space-y-4" dir='ltr'>
            {isLoading ? (
              <DepartmentSkeleton />
            ) : paginatedVendors.length > 0 ? (
              paginatedVendors.map((vendor) => {
                const initials = vendor.name
                  ? vendor.name.split(' ').map(name => name.charAt(0)).join('').slice(0, 2).toUpperCase()
                  : "N/A";
                return (
                  <div
                    key={vendor.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border-none bg-card p-4 shadow-lg duration-300 hover:shadow-2xl hover:scale-105"
                  >
                    <div className="flex items-center gap-4 mb-4 sm:mb-0">
                      <Avatar>
                        <AvatarImage src={vendor.avatar} alt={vendor.name} />
                        <AvatarFallback>
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{vendor.name}</h3>
                        <p className="sm:text-left text-muted-foreground">{vendor.nationality || t("UnknownNationality")}</p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                      <div className="text-sm mr-10 mb-4 sm:mb-0">
                        <p className="text-center">
                          {vendor.address && vendor.address.length > 36
                            ? `${vendor.address.slice(0, 36)}...`
                            : vendor.address || t("NoAddressAvailable")}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        className="bg-[#11171D] text-white hover:bg-[#d4ab71] w-full sm:w-auto"
                        onClick={() => navigate(`/vendor/${vendor.id}`)}
                      >
                        {t("ViewProfile") || "View Profile"}
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <p>{t("NoVendorsFound") || "No Vendors Found"}</p>
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
