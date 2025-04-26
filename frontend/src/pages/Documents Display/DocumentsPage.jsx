import { useTranslation } from 'react-i18next';
import { useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import { Calendar, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import ContractCard from "./ContractCard";  
import DashboardWidget from "./DashboardWidget";
import axios from "axios";

const statusIcons = {
  "Expiring Soon": <AlertCircle className="h-5 w-5 text-yellow-500" />,
  Active: <CheckCircle className="h-5 w-5 text-green-500" />,
  Expired: <XCircle className="h-5 w-5 text-red-500" />,
};

const DateRangePicker = ({ dateRange, setDateRange }) => {
  const { t } = useTranslation();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-left font-normal md:w-[300px]"
        >
          <Calendar className="mr-2 h-4 w-4" />
          {dateRange.from ? (
            dateRange.to ? (
              <>
                {format(dateRange.from, "LLL dd, y")} -{" "}
                {format(dateRange.to, "LLL dd, y")}
              </>
            ) : (
              format(dateRange.from, "LLL dd, y")
            )
          ) : (
            <span>{t('pickDateRange')}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <CalendarComponent
          initialFocus
          mode="range"
          defaultMonth={dateRange.from}
          selected={dateRange}
          onSelect={setDateRange}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
};

const apiUrl = import.meta.env.VITE_API_URL;

export default function DocumentsPage() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const folderType = queryParams.get('type'); // Extract the folder type from query parameters

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState({
    from: undefined,
    to: undefined,
  });

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/v1/documents/`, {
          withCredentials: true, // Ensures cookies are sent with the request
        });
        const allDocuments = response.data.data.documents;

        // Filter documents based on the folder type
        const filteredDocuments = allDocuments.filter(
          (doc) => doc.type.toLowerCase() === folderType?.toLowerCase()
        );

        setDocuments(filteredDocuments);
      } catch (error) {
        console.error("Error fetching documents:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [folderType]);

  // Apply additional filters
  const filteredDocuments = documents.filter((document) => {
    const matchesSearch = document.client
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || document.status.toLowerCase() === statusFilter;
    const matchesDateRange =
      (!dateRange.from || new Date(document.created_at) >= dateRange.from) &&
      (!dateRange.to || new Date(document.expiry_date) <= dateRange.to);

    return matchesSearch && matchesStatus && matchesDateRange;
  });

  if (loading) {
    return <div className="container mx-auto p-4">{t('loading')}</div>;
  }

  const counts = {
    "Expiring Soon": documents.filter(
      (doc) => doc.status.toLowerCase() === "expiring soon"
    ).length,
    Active: documents.filter(
      (doc) => doc.status.toLowerCase() === "active"
    ).length,
    Expired: documents.filter(
      (doc) => doc.status.toLowerCase() === "expired"
    ).length,
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-8 mt-4 capitalize">
        {t('Documents For')} {folderType}
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <DashboardWidget
          title="contractsExpiringSoon"
          count={counts["Expiring Soon"]}
          icon={statusIcons["Expiring Soon"]}
        />
        <DashboardWidget
          title="currentlyActiveContracts"
          count={counts.Active}
          icon={statusIcons.Active}
        />
        <DashboardWidget
          title="expiredContracts"
          count={counts.Expired}
          icon={statusIcons.Expired}
        />
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0 mb-8">
        <Input
          type="text"
          placeholder={t('searchDocuments')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
        <Select
          dir={i18n.language === "ar" ? "rtl" : "ltr"}
          value={statusFilter}
          onValueChange={setStatusFilter}
          className="w-full sm:w-auto"
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder={t('filterByStatus')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allStatuses')}</SelectItem>
            <SelectItem value="active">{t('active')}</SelectItem>
            <SelectItem value="expiring soon">{t('expiringSoon')}</SelectItem>
            <SelectItem value="expired">{t('expired')}</SelectItem>
          </SelectContent>
        </Select>
        <DateRangePicker dateRange={dateRange} setDateRange={setDateRange} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-6">
        {filteredDocuments.map((document) => (
          <ContractCard
            key={document.id}
            id={document.id}
            title={document.title}
            status={document.status}
            startDate={document.created_at}
            endDate={document.expiry_date}
            details={`Contract Value: ${document.contract_value} ${document.currency}`}
            attachment={document.vendorDetails || document.companyDetails}
            client={document.client}
            contractValue={document.contract_value}
            changeOrder={document.change_order}
            modifiedContractValue={document.modified_contract_value}
            currency={document.currency}
            type={document.type}
            companyDetails={document.companyDetails}
          />
        ))}
      </div>
    </div>
  );
}

