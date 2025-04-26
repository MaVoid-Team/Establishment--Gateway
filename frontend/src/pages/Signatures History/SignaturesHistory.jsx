import { useState, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CalendarIcon, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Pagination } from "@/components/ui/Pagination.jsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SignaturesHistory() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [search, setSearch] = useState("");
  const [orderFilter, setOrderFilter] = useState("");
  const [orderIdFilter, setOrderIdFilter] = useState("");
  const [fromFilter, setFromFilter] = useState("");
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState({
    from: undefined,
    to: undefined,
  });

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [signedFilter, setSignedFilter] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5;
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    async function fetchData() {
      try {
        const [documentsResponse, salesContractsResponse] = await Promise.all([
          axios.get(`${apiUrl}/api/v1/documents/`, { withCredentials: true }),
          axios.get(`${apiUrl}/api/v1/sales-contracts`, { withCredentials: true }),
        ]);

        const documentsData = documentsResponse.data.data.documents;
        const salesContractsData = salesContractsResponse.data.data.salesContracts;

        const normalizedDocuments = documentsData.map(normalizeDocument);
        const normalizedSalesContracts = salesContractsData.map(normalizeSalesContract);

        const combinedData = [...normalizedDocuments, ...normalizedSalesContracts];
        setDocuments(combinedData);
        setTotalPages(Math.ceil(combinedData.length / itemsPerPage));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    }

    fetchData();
  }, [apiUrl]);

  const normalizeDocument = (doc) => ({
    ...doc,
    type: doc.type || t("Unknown"),
    signed: doc.signatures.length > 0,
    signedBy: doc.signatures.map((s) => s.signature_data || "-").join(", "),
    signedRole: doc.signatures.map((s) => s.signer_type || "-").join(", "),
  });

  const normalizeSalesContract = (contract) => ({
    ...contract,
    type: t("Sales Contract"),
    signed: contract.signatures.length > 0,
    signedBy: contract.signatures.map((s) => s.signature_data || "-").join(", "),
    signedRole: contract.signatures.map((s) => s.signer_type || "-").join(", "),
  });

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch = (
        doc.id.toString().toLowerCase().includes(search.toLowerCase()) ||
        doc.client.toLowerCase().includes(search.toLowerCase()) ||
        (doc.companyDetails?.name || "").toLowerCase().includes(search.toLowerCase()) ||
        doc.type.toLowerCase().includes(search.toLowerCase())
      );

      const matchesOrder = !orderFilter || (doc.client || "").toLowerCase().includes(orderFilter.toLowerCase());
      const matchesOrderId = !orderIdFilter || doc.id.toString().toLowerCase().includes(orderIdFilter.toLowerCase());
      const matchesFrom = !fromFilter || (doc.companyDetails?.name || "").toLowerCase().includes(fromFilter.toLowerCase());

      const signatureDate = new Date(doc.updated_at);
      const matchesDate = (
        (!dateRange.from || signatureDate >= dateRange.from) &&
        (!dateRange.to || signatureDate <= dateRange.to)
      );

      const matchesSignedFilter = signedFilter === null || (signedFilter === "signed" ? doc.signed : !doc.signed);

      return matchesSearch && matchesOrder && matchesOrderId && matchesFrom && matchesDate && matchesSignedFilter;
    });
  }, [documents, search, orderFilter, orderIdFilter, fromFilter, dateRange, signedFilter]);

  const paginatedDocuments = useMemo(() => {
    return filteredDocuments.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredDocuments, currentPage]);

  useEffect(() => {
    setTotalPages(Math.ceil(filteredDocuments.length / itemsPerPage));
    setCurrentPage(1);
  }, [filteredDocuments]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 min-h-screen flex items-center justify-center">
        <p>{t("loading")}...</p>
      </div>
    );
  }

  return (
    <div className={`container mx-auto px-4 py-6 min-h-screen ${isRTL ? "text-right" : "text-left"}`}>
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-6">
        {t("Signatures Management")}
      </h1>
      <Card className="mb-6 w-full">
        <CardHeader>
          <CardTitle>{t("filters")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
            <div className="relative flex-1 mb-4 sm:mb-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                className="pl-10"
                placeholder={t("search")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Popover
             dir={`${i18n.language === "ar" ? "ltr" : ""}`}>
              <PopoverTrigger asChild className="">
                <Button variant="outline" className="w-full sm:w-auto">
                  <CalendarIcon className="mx-2 h-4 w-4" />
                  {dateRange.from && dateRange.to
                    ? `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`
                    : t("filterDate")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            <Select value={signedFilter} onValueChange={setSignedFilter}
             dir={`${i18n.language === "ar" ? "rtl" : ""}`}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder={t("filterBySigned")} />
              </SelectTrigger>
              <SelectContent
>
                <SelectItem value={null}>{t("all")}</SelectItem>
                <SelectItem value="signed">{t("signed")}</SelectItem>
                <SelectItem value="not signed">{t("notSigned")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              className="w-full"
              placeholder={t("filterByDocumentName")}
              value={orderFilter}
              onChange={(e) => setOrderFilter(e.target.value)}
            />
            <Input
              className="w-full"
              placeholder={t("filterByDocumentId")}
              value={orderIdFilter}
              onChange={(e) => setOrderIdFilter(e.target.value)}
            />
            <Input
              className="w-full"
              placeholder={t("filterByFrom")}
              value={fromFilter}
              onChange={(e) => setFromFilter(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
      <div className="rounded-sm overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow>
              <TableHead className={i18n.language === "ar" ? "text-right" : "text-left"}>
                {t("Document ID")}
              </TableHead>
              <TableHead className={i18n.language === "ar" ? "text-right" : "text-left"}>{t("Document Name")}</TableHead>
              <TableHead className={i18n.language === "ar" ? "text-right" : "text-left"}>{t("Type")}</TableHead>
              <TableHead className={i18n.language === "ar" ? "text-right" : "text-left"}>{t("Party One")}</TableHead>
              <TableHead className={i18n.language === "ar" ? "text-right" : "text-left"}>{t("Signed By")}</TableHead>
              <TableHead className={i18n.language === "ar" ? "text-right" : "text-left"}>{t("Signed")}</TableHead>
              <TableHead className={i18n.language === "ar" ? "text-right" : "text-left"}>{t("Role")}</TableHead>
              <TableHead className={i18n.language === "ar" ? "text-right" : "text-left"}>{t("Actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedDocuments.length > 0 ? (
              paginatedDocuments.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>{doc.id}</TableCell>
                  <TableCell>{doc.client}</TableCell>
                  <TableCell>{doc.type}</TableCell>
                  <TableCell>{doc.companyDetails?.name || "-"}</TableCell>
                  <TableCell>{doc.vendorDetails?.name || "-"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={doc.signed ? "success" : "destructive"}
                    >
                      {doc.signed ? t("Signed") : t("Not Signed")}
                    </Badge>
                  </TableCell>
                  {/* <TableCell>{doc.signedBy ? <img src={doc.signedBy} className="h-20 w-32"/>:"no signature"}</TableCell> */}
                  <TableCell>{doc.signedRole}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(doc.signed ? `/view-signature/${doc.id}` : `/signature-prepare-1/${doc.id}`)}
                    >
                      {doc.signed ? t("View Signature") : t("Sign")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="9" className="text-center">
                  {t("noDataFound")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
