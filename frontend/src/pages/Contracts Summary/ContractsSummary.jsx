// ContractsSummary.js
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { CalendarIcon, Filter, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const getContractStatus = (startDate, endDate) => {
  const now = new Date();
  const end = new Date(endDate);
  const monthsUntilExpiry = (end - now) / (1000 * 60 * 60 * 24 * 30);

  if (now > end) return "expired";
  if (monthsUntilExpiry <= 3) return "expiring-soon";
  return "active";
};

const apiUrl = import.meta.env.VITE_API_URL;

export default function ContractsSummary() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl"; // Improved RTL detection
  const [search, setSearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState([]);
  const [dateRange, setDateRange] = useState({
    from: undefined,
    to: undefined,
  });
  const [statusFilter, setStatusFilter] = useState("all");
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSalesContracts = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${apiUrl}/api/v1/sales-contracts`, {
          withCredentials: true,
        });
        const salesContracts = response.data.data.salesContracts.map((contract) => ({
          id: contract.id,
          name: contract.name,
          details: {
            partyOne: contract.client,
            partyTwo: contract.liwan,
            startDate: contract.issue_date,
            expiryDate: contract.termination_date,
            unitDeliveryDate: contract.unit_delivery_date,
          },
          status: getContractStatus(contract.issue_date, contract.termination_date),
        }));
        setDocuments(salesContracts);
        setFilteredDocuments(salesContracts);
        setLoading(false);
      } catch (error) {
        console.error(t("contractsSummary:fetchSalesContractsError"), error);
        setLoading(false);
      }
    };

    fetchSalesContracts();
  }, [t]);

  const handleFilters = () => {
    let filtered = documents;

    // Apply search filter
    if (search) {
      const lowerSearch = search.toLowerCase();
      filtered = filtered.filter(
        (doc) =>
          doc.id.toString().includes(lowerSearch) ||
          (doc.name && doc.name.toLowerCase().includes(lowerSearch)) ||
          (doc.details.partyOne && doc.details.partyOne.toLowerCase().includes(lowerSearch)) ||
          (doc.details.partyTwo && doc.details.partyTwo.toLowerCase().includes(lowerSearch))
      );
    }

    // Apply company filter
    if (companyFilter.length > 0) {
      filtered = filtered.filter(
        (doc) =>
          companyFilter.includes(doc.details.partyOne) ||
          companyFilter.includes(doc.details.partyTwo)
      );
    }

    // Apply date range filter
    if (dateRange.from || dateRange.to) {
      filtered = filtered.filter((doc) => {
        const expiryDate = new Date(doc.details.expiryDate);
        if (dateRange.from && dateRange.to) {
          return expiryDate >= new Date(dateRange.from) && expiryDate <= new Date(dateRange.to);
        }
        if (dateRange.from) {
          return expiryDate >= new Date(dateRange.from);
        }
        if (dateRange.to) {
          return expiryDate <= new Date(dateRange.to);
        }
        return true;
      });
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((doc) => {
        return doc.status === statusFilter;
      });
    }

    setFilteredDocuments(filtered);
  };

  useEffect(() => {
    handleFilters();
  }, [search, companyFilter, dateRange, statusFilter, documents]);

  const handleViewDetails = (contract) => {
    navigate(`/contracts-summary/${contract.id}`);
  };

  const expiringSoonCount = documents.filter(
    (doc) => doc.status === "expiring-soon"
  ).length;

  const activeContractsCount = documents.filter(
    (doc) => doc.status === "active"
  ).length;

  const expiredContractsCount = documents.filter(
    (doc) => doc.status === "expired"
  ).length;

  const uniqueCompanies = Array.from(
    new Set(documents.flatMap((doc) => [doc.details.partyOne, doc.details.partyTwo]))
  ).filter(Boolean);

  // Helper function to get badge color based on status
  const getBadgeColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-500 text-white";
      case "expired":
        return "bg-red-500 text-white";
      case "expiring-soon":
        return "bg-yellow-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  // Helper function to translate status using 'contractSummaryStatus' namespace
  const translateStatus = (status) => {
    return t(`MainStatus.${status}`);
  };

  return (
    <div
      className={`container mx-auto py-10 min-h-screen px-4 ${
        isRTL ? "text-right" : "text-left"
      } ${isRTL ? "rtl" : ""}`}
    >
      <h1 className="text-4xl font-bold mb-6 text-center">
        {t("Sales Contracts")}
      </h1>

      {/* Dashboard Widgets */}
      <div className="flex justify-center mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-5xl">
          {/* Expiring Soon */}
          <Card className="flex flex-col items-center justify-center border-none shadow-lg dark:shadow-black/30 rounded-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-col items-center space-y-2">
              <AlertCircle className="h-10 w-10 text-yellow-500" />
              <CardTitle className="text-center">
                {t("expiringSoon")}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-2xl font-bold">{expiringSoonCount}</div>
              <p className="text-sm text-muted-foreground">
                {t("contractsExpiringSoon")}
              </p>
            </CardContent>
          </Card>

          {/* Active Contracts */}
          <Card className="flex flex-col items-center justify-center border-none shadow-lg dark:shadow-black/30 rounded-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-col items-center space-y-2">
              <CheckCircle className="h-10 w-10 text-green-500" />
              <CardTitle className="text-center">
                {t("activeContracts")}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-2xl font-bold">{activeContractsCount}</div>
              <p className="text-sm text-muted-foreground">
                {t("currentlyActiveContracts")}
              </p>
            </CardContent>
          </Card>

          {/* Expired Contracts */}
          <Card className="flex flex-col items-center justify-center border-none shadow-lg dark:shadow-black/30 rounded-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-col items-center space-y-2">
              <XCircle className="h-10 w-10 text-red-500" />
              <CardTitle className="text-center">
                {t("expiredContracts")}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-2xl font-bold">{expiredContractsCount}</div>
              <p className="text-sm text-muted-foreground">
                {t("contractsThatHaveExpired")}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 items-center mb-4 gap-4 ">
        <Input 
          placeholder={t("searchContracts")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Company Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full backdrop-blur-md shadow-lg hover:backdrop-blur-xl transition-all duration-300 hover:bg-transparent">
              <Filter className="mr-2 h-4 w-4 " />
              {t("filterCompany")}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent dir={isRTL ? "rtl" : "ltr"}>
            <DropdownMenuCheckboxItem
              checked={companyFilter.length === 0}
              onCheckedChange={() => setCompanyFilter([])}
            >
              {t("clearAll")}
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            {uniqueCompanies.map((company) => (
              <DropdownMenuCheckboxItem
                key={company}
                checked={companyFilter.includes(company)}
                onCheckedChange={(checked) =>
                  setCompanyFilter((prev) =>
                    checked ? [...prev, company] : prev.filter((item) => item !== company)
                  )
                }
              >
                {company}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Date Range Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full backdrop-blur-3xl shadow-lg transition-all duration-300 border-none">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange.from
                ? `${format(dateRange.from, "LLL dd, y")} - ${
                    dateRange.to ? format(dateRange.to, "LLL dd, y") : t("toDate")
                  }`
                : t("filterExpiryDate")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-transparent backdrop-blur-3xl transition-all duration-300 " align="start">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={(range) =>
                setDateRange(range || { from: undefined, to: undefined })
              }
            />
          </PopoverContent>
        </Popover>

        {/* Status Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full backdrop-blur-3xl shadow-lg hover:backdrop-blur-2xl transition-all duration-300 bg-transparent rounded-sm border-none">
              {t("filterStatus")}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent dir={isRTL ? "rtl" : "ltr"}>
            <DropdownMenuCheckboxItem
              checked={statusFilter === "all"}
              onCheckedChange={() => setStatusFilter("all")}
            >
              {t("MainStatus.all")}
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={statusFilter === "active"}
              onCheckedChange={() => setStatusFilter("active")}
            >
              {translateStatus("active")}
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={statusFilter === "expired"}
              onCheckedChange={() => setStatusFilter("expired")}
            >
              {translateStatus("expired")}
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={statusFilter === "expiring-soon"}
              onCheckedChange={() => setStatusFilter("expiring-soon")}
            >
              {translateStatus("expiring-soon")}
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Contracts Table */}
      {loading ? (
        <div className="text-center">{t("loadingContracts")}</div>
      ) : (
        <div className="rounded-sm pt-8 ">
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">
                    {t("contractId")}
                  </TableHead>
                  <TableHead className="text-center">
                    {t("contractName")}
                  </TableHead>
                  <TableHead className="text-center">
                    {t("client")}
                  </TableHead>
                  <TableHead className="text-center">
                    {t("liwan")}
                  </TableHead>
                  <TableHead className="text-center">
                    {t("startDate")}
                  </TableHead>
                  <TableHead className="text-center">
                    {t("expiryDate")}
                  </TableHead>
                  <TableHead className="text-center">
                    {t("unitDeliveryDate")}
                  </TableHead>
                  <TableHead className="text-center">
                    {t("status")}
                  </TableHead>
                  <TableHead className="text-center">
                    {t("actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((doc) => (
                  <TableRow key={doc.id} dir={isRTL ? "rtl" : "ltr"}>
                    <TableCell className="text-center">{doc.id}</TableCell>
                    <TableCell className="text-center">
                      {doc.name || t("notAvailable")}
                    </TableCell>
                    <TableCell className="text-center">
                      {doc.details.partyOne || t("notAvailable")}
                    </TableCell>
                    <TableCell className="text-center">
                      {doc.details.partyTwo || t("notAvailable")}
                    </TableCell>
                    <TableCell className="text-center">
                      {doc.details.startDate
                        ? new Date(doc.details.startDate).toLocaleDateString()
                        : t("notAvailable")}
                    </TableCell>
                    <TableCell className="text-center">
                      {doc.details.expiryDate
                        ? new Date(doc.details.expiryDate).toLocaleDateString()
                        : t("notAvailable")}
                    </TableCell>
                    <TableCell className="text-center">
                      {doc.details.unitDeliveryDate
                        ? new Date(doc.details.unitDeliveryDate).toLocaleDateString()
                        : t("notAvailable")}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={getBadgeColor(doc.status)}>
                        {translateStatus(doc.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button onClick={() => handleViewDetails(doc)}>
                        {t("viewDetails")}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
