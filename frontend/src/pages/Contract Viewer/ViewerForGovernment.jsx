// ContractViewer.jsx

"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  Eye,
  Pencil,
  AlertCircle,
  CheckCircle,
  XCircle,
  Building,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";

// Utility function for date formatting
const formatDate = (dateString, locale) => {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Status badge component with capitalized text
const StatusBadge = ({ status, t }) => {
  const getStatusColor = () => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "expired":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <span
      className={`px-3 py-1 rounded-sm text-sm font-medium ${getStatusColor()}`}
    >
      {t(`MainStatus.${status?.toLowerCase()}`.replace(" ", ""))}
    </span>
  );
};

export default function ContractViewer() {
  const { t, i18n } = useTranslation();
  const [contractData, setContractData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const id = window.location.pathname.split("/").pop();
        const response = await axios.get(`${apiUrl}/api/v1/documents/${id}`, {
          withCredentials: true,
        });
        const data = response.data.data.document;
        setContractData(data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-sm h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-800 p-4 rounded-sm">
          {t("error").toUpperCase()}: {error}
        </div>
      </div>
    );
  }

  if (!contractData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>{t("noDataAvailable").toUpperCase()}</div>
      </div>
    );
  }

  const {
    client,
    contract_value,
    modified_contract_value,
    currency,
    status,
    expiry_date,
    type,
    companyDetails,
    departments,
    logs,
    attachment,
    amount_paid,
    amount_due,
  } = contractData;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-2 gap-6">
        {/* PDF Preview Section */}
        <div className="rounded-sm overflow-hidden shadow-2xl">
          <div className="border-b border-gray-200 p-4">
            <h2 className="text-xl font-semibold">
              {t("pdfPreview").toUpperCase()}
            </h2>
          </div>
          <div className="h-[600px] overflow-hidden">
            {attachment?.url ? (
              <iframe
                src={`${apiUrl}${attachment.url}`}
                className="w-full h-full"
                title={t("contractPDF").toUpperCase()}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-red-500">
                {t("pdfNotAvailable").toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Contract Details Section */}
        <div className="space-y-6 shadow-lg">
          {/* Main Details Card */}
          <div className=" p-6">
            <h2 className="text-xl font-semibold mb-6">
              { contractData.title || t("contractDetails").toUpperCase()}
            </h2>
            <div className="grid gap-6">
              <div className="flex justify-between items-start pb-4 border-b border-gray-100">
                <div>
                  <p className="text-sm text-primary/50">{t("client").toUpperCase()}</p>
                  <p className="text-lg font-medium">
                    {client || t("notSpecified")}
                  </p>
                </div>
                <StatusBadge status={status} t={t} />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-primary/50">{t("contractValue").toUpperCase()}</p>
                  <p className="text-lg font-medium ">
                    {contract_value && currency
                      ? `${contract_value} ${currency}`
                      : t("notSpecified")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-primary/50">{t("amountPaid").toUpperCase()}</p>
                  <p className="text-lg font-medium">
                    {amount_paid && currency
                      ? `${amount_paid} ${currency}`
                      : t("notSpecified")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-primary/50">{t("amountDue").toUpperCase()}</p>
                  <p className="text-lg font-medium">
                    {amount_due && currency
                      ? `${amount_due} ${currency}`
                      : t("notSpecified")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-primary/50">
                    {t("modifiedContractValue").toUpperCase()}
                  </p>
                  <p className="text-lg font-medium ">
                    {modified_contract_value && currency
                      ? `${modified_contract_value} ${currency}`
                      : t("notSpecified")}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-primary/50">{t("expiryDate").toUpperCase()}</p>
                  <p className="text-lg font-medium">
                    {expiry_date
                      ? formatDate(expiry_date, i18n.language)
                      : t("notSpecified")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-primary/50">{t("type").toUpperCase()}</p>
                  <p className="text-lg font-medium">{type || t("notSpecified")}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Company Details Card */}
          {companyDetails && (
            <div className="rounded-sm shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">
                {t("companyDetails").toUpperCase()}
              </h3>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm">{t("name").toUpperCase()}</p>
                    <p className="text-base">
                      {companyDetails.name || t("notSpecified")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm">{t("phone").toUpperCase()}</p>
                    <p className="text-base">
                      {companyDetails.phone_number || t("notSpecified")}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm">{t("email").toUpperCase()}</p>
                  <p className="text-base">
                    {companyDetails.email || t("notSpecified")}
                  </p>
                </div>
                <div>
                  <p className="text-sm">{t("vat").toUpperCase()}</p>
                  <p className="text-base">
                    {companyDetails.vat || t("notSpecified")}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Departments Card */}
          {departments?.length > 0 && (
            <div className="rounded-sm shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">
                {t("departments").toUpperCase()}
              </h3>
              <div className="flex flex-wrap gap-2">
                {departments.map((dept) => (
                  <span
                    key={dept.id}
                    className="px-3 py-1 rounded-sm text-sm font-medium bg-blue-100 text-blue-900 text-primary/50"
                  >
                    {dept.name.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Logs Card */}
          {logs?.length > 0 && (
            <div className="rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">
                {t("logs").toUpperCase()}
              </h3>
              <div className="space-y-4">
                {logs.map((log) => (
                  <div key={log.id} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm">{t("operationType").toUpperCase()}</p>
                        <p className="text-base font-medium">
                          {t(`operation.${log.operation_type.toLowerCase()}`)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm">{t("timestamp").toUpperCase()}</p>
                        <p className="text-base">
                          {formatDate(log.timestamp, i18n.language)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm">{t("submitter").toUpperCase()}</p>
                      <p className="text-base">
                        {log.submitter.name.toUpperCase()}{" "}
                        <span className="text-sm ml-2">({log.submitter.email})</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
