import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ContractViewer() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [contractData, setContractData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const id = window.location.pathname.split("/").pop();
        const response = await axios.get(`${apiUrl}/api/v1/sales-contracts/${id}`, {
          withCredentials: true,
        });
        if (response.data.status !== "success") throw new Error(t("contractNotFound"));

        setContractData(response.data.data.salesContract);
        setEditedData(response.data.data.salesContract);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl, t]);

  const handleEdit = async () => {
    if (isEditing) {
      try {
        const response = await axios.patch(
          `${apiUrl}/api/v1/sales-contracts/${contractData.id}`,
          editedData,
          { withCredentials: true }
        );
        setContractData(response.data.data.salesContract);
        setIsEditing(false);
        toast({
          title: t("contractUpdated"),
          description: t("contractUpdatedSuccessfully"),
          variant: "success",
        });
      } catch (err) {
        toast({
          title: t("error"),
          description: err.response?.data?.message || err.message,
          variant: "destructive",
        });
      }
    } else {
      setIsEditing(true);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${apiUrl}/api/v1/sales-contracts/${contractData.id}`, {
        withCredentials: true,
      });
      toast({
        title: t("contractDeleted"),
        description: t("contractDeletedSuccessfully"),
        variant: "success",
      });
      navigate("/contracts-summary");
    } catch (err) {
      toast({
        title: t("error"),
        description: err.response?.data?.message || err.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const handleInputChange = (e, field) => {
    setEditedData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  if (loading) return <div>{t("loading")}</div>;
  if (error) return <div>{t("error")}: {error}</div>;
  if (!contractData) return <div>{t("noDataAvailable")}</div>;

  const formatDate = (date) => (date ? new Date(date).toLocaleString() : t("notSpecified"));

  const {
    id,
    title,
    name,
    description,
    type,
    vendor_id,
    company_id,
    issue_date,
    termination_date,
    liwan,
    client,
    unit_delivery_date,
    unit_number,
    unit_total_space,
    unit_price,
    due_payment,
    total_paid,
    delivery_of_contract,
    contract_status,
    payment_schedule,
    created_at,
    updated_at,
    status,
    attachment,
  } = isEditing ? editedData : contractData;

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>{t("pdfPreview")}</CardTitle>
          </CardHeader>
          <CardContent className="h-[800px] overflow-hidden">
            {attachment ? (
              <iframe
                src={`${apiUrl}${attachment.url}`}
                className="w-full h-full"
                title={t("pdfPreviewTitle")}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-destructive">
                {t("pdfNotAvailable")}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle>{t("contractDetails")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="font-extrabold">{t("ID")}:</span> <p className="text-base inline">{id || t("notSpecified")}</p>
              </div>
              <div>
                <span className="font-extrabold">{t("Title")}:</span> <p className="text-base inline">{title || t("notSpecified")}</p>
              </div>
              <div>
                <span className="font-extrabold">{t("Name")}:</span> <p className="text-base inline">{name || t("notSpecified")}</p>
              </div>
              <div>
                <span className="font-extrabold">{t("Description")}:</span> <p className="text-base inline">{description || t("notSpecified")}</p>
              </div>
              <div>
                <span className="font-extrabold">{t("Type")}:</span> <p className="text-base inline">{type || t("notSpecified")}</p>
              </div>
              <div>
                <span className="font-extrabold">{t("Vendor ID")}:</span> <p className="text-base inline">{vendor_id || t("notSpecified")}</p>
              </div>
              <div>
                <span className="font-extrabold">{t("Company ID")}:</span> <p className="text-base inline">{company_id || t("notSpecified")}</p>
              </div>
              <div>
                <span className="font-extrabold">{t("Issue Date")}:</span> <p className="text-base inline">{formatDate(issue_date)}</p>
              </div>
              <div>
                <span className="font-extrabold">{t("Termination Date")}:</span> <p className="text-base inline">{formatDate(termination_date)}</p>
              </div>
              <div>
                <span className="font-extrabold">{t("Liwan")}:</span> <p className="text-base inline">{liwan || t("notSpecified")}</p>
              </div>
              <div>
                <span className="font-extrabold">{t("Client")}:</span> <p className="text-base inline">{client || t("notSpecified")}</p>
              </div>
              <div>
                <span className="font-extrabold">{t("Unit Delivery Date")}:</span> <p className="text-base inline">{formatDate(unit_delivery_date)}</p>
              </div>
              <div>
                <span className="font-extrabold">{t("Unit Number")}:</span> <p className="text-base inline">{unit_number || t("notSpecified")}</p>
              </div>
              <div>
                <span className="font-extrabold">{t("Unit Total Space")}:</span> <p className="text-base inline">{unit_total_space || t("notSpecified")}</p>
              </div>
              <div>
                <span className="font-extrabold">{t("Unit Price")}:</span> <p className="text-base inline">{unit_price || t("notSpecified")}</p>
              </div>
              <div>
                <span className="font-extrabold">{t("Due Payment")}:</span> <p className="text-base inline">{due_payment || t("notSpecified")}</p>
              </div>
              <div>
                <span className="font-extrabold">{t("Total Paid")}:</span> <p className="text-base inline">{total_paid || t("notSpecified")}</p>
              </div>
              <div>
                <span className="font-extrabold">{t("Delivery of Contract")}:</span> <p className="text-base inline">{delivery_of_contract ? t("Yes") : t("No")}</p>
              </div>
              <div>
                <span className="font-extrabold">{t("Contract Status")}:</span> <p className="text-base inline">{contract_status ? t("Active") : t("Inactive")}</p>
              </div>
              <div>
                <span className="font-extrabold">{t("Status")}:</span> <p className="text-base inline">{status || t("notSpecified")}</p>
              </div>
              <div>
                <span className="font-extrabold">{t("Created At")}:</span> <p className="text-base inline">{formatDate(created_at)}</p>
              </div>
              <div>
                <span className="font-extrabold">{t("Updated At")}:</span> <p className="text-base inline">{formatDate(updated_at)}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardHeader>
              <CardTitle>{t("paymentSchedule")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">{t("payment")}</TableHead>
                    <TableHead className="text-center">{t("expectedPaymentDate")}</TableHead>
                    <TableHead className="text-center">{t("amount")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(typeof payment_schedule === 'string' ? JSON.parse(payment_schedule || '[]') : (payment_schedule || [])).map((installment, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-center">
                        {t("installment") + " " + (index + 1)}
                      </TableCell>
                      <TableCell className="text-center">
                        {formatDate(installment.date)}
                      </TableCell>
                      <TableCell className="text-center">
                        {installment.amount || t("notSpecified")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

