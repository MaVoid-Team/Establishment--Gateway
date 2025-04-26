'use client'

import { useState, useRef } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
} from "@/components/ui/table";
import { Upload, X } from 'lucide-react';
import { useTranslation } from "react-i18next";

export function UploadSalesContract() {
  const { t, i18n } = useTranslation();
  const [selectedContract, setSelectedContract] = useState(null);
  const [editedContract, setEditedContract] = useState({});
  const [paymentSchedule, setPaymentSchedule] = useState([]);
  const fileInputRef = useRef(null);
  const [apiResponse, setApiResponse] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL;

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const preview = {
        title: file.name.replace(".pdf", ""),
        pdfUrl: URL.createObjectURL(file),
      };
      setSelectedContract(preview);
      setEditedContract(preview);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedContract((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRemovePDF = () => {
    setSelectedContract(null);
    setEditedContract({});
  };

  const addPaymentRow = () => {
    setPaymentSchedule((prev) => [...prev, { date: "", amount: "" }]);
  };

  const removePaymentRow = (index) => {
    setPaymentSchedule((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePaymentChange = (index, field, value) => {
    setPaymentSchedule((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();

      formData.append("name", editedContract.name || "");
      formData.append("description", editedContract.description || "");
      formData.append("type", editedContract.type || "");
      // formData.append("company_id", 2);
      formData.append("issue_date", editedContract.issueDate || "");
      formData.append("termination_date", editedContract.terminationDate || "");
      formData.append("liwan", editedContract.liwan || "");
      formData.append("client", editedContract.client || "");
      formData.append("unit_delivery_date", editedContract.unitDeliveryDate || "");
      formData.append("unit_number", editedContract.unitNumber || "");
      formData.append("unit_total_space", parseFloat(editedContract.unitTotalSpace) || 0);
      formData.append("unit_price", parseFloat(editedContract.unitPrice) || 0);
      formData.append("due_payment", parseFloat(editedContract.duePayment) || 0);
      formData.append("total_paid", parseFloat(editedContract.totalPaid) || 0);
      formData.append("payment_schedule", JSON.stringify(paymentSchedule));

      if (fileInputRef.current?.files[0]) {
        formData.append("attachment", fileInputRef.current.files[0]);
      }

      const response = await axios.post(`${apiUrl}/api/v1/sales-contracts`, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Contract created successfully:", response.data);
      setApiResponse(response.data);
      alert(t("contractCreatedSuccessfully"));
    } catch (error) {
      console.error("Failed to create contract:", error);
      alert(`${t("failedToCreateContract")}${error.message}`);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
      <Card className="flex flex-col h-full">
        <CardContent
          className="flex-1 p-4 cursor-pointer"
          onClick={triggerFileInput}
        >
          <div className="h-full bg-muted flex flex-col items-center justify-center relative">
            {selectedContract ? (
              <>
                <iframe
                  src={selectedContract.pdfUrl}
                  className="w-full h-full"
                  title={t("pdfPreviewTitle")}
                />
              </>
            ) : (
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">
                  {t("clickToUploadContract")}
                </p>
              </div>
            )}
          </div>
          <Input
            type="file"
            accept=".pdf"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
        </CardContent>
      </Card>

      <Card className="flex flex-col h-full">
        <CardContent className="flex-1 p-4">
          <ScrollArea className="h-full">
            <div className="space-y-6"
            dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
              <div>
                <Label htmlFor="contract-upload" className="block mb-2">
                  {t("uploadNewContract")}
                </Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="contract-upload"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="w-full"
                    ref={fileInputRef}
                  />
                  <Button
                    size="icon"
                    onClick={triggerFileInput}
                    aria-label={t("uploadNewContract")}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {selectedContract && (
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRemovePDF}
                  >
                    <X className="h-4 w-4 mr-2" />
                    {t("removePDF")}
                  </Button>
                </div>
              )}

              <div className="space-y-4">
                <h2 className="text-xl font-semibold">
                  {selectedContract?.title || t("contractDetails")}
                </h2>
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="title">{t("title")}</Label>
                    <Input
                    id="title"
                    name="title"
                    value={editedContract.title || ""}
                    onChange={handleInputChange}
                    placeholder={t("enterTitle")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">{t("name")}</Label>
                    <Input
                      id="name"
                      name="name"
                      value={editedContract.name || ""}
                      onChange={handleInputChange}
                      placeholder={t("enterName")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">{t("description")}</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={editedContract.description || ""}
                      onChange={handleInputChange}
                      placeholder={t("enterDescription")}
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">{t("type")}</Label>
                    <Input
                      id="type"
                      name="type"
                      value={editedContract.type || ""}
                      onChange={handleInputChange}
                      placeholder={t("enterType")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="issueDate">{t("issueDate")}</Label>
                    <Input
                      id="issueDate"
                      name="issueDate"
                      type="date"
                      value={editedContract.issueDate || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="terminationDate">{t("terminationDate")}</Label>
                    <Input
                      id="terminationDate"
                      name="terminationDate"
                      type="date"
                      value={editedContract.terminationDate || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="liwan">{t("liwan")}</Label>
                    <Input
                      id="liwan"
                      name="liwan"
                      value={editedContract.liwan || ""}
                      onChange={handleInputChange}
                      placeholder={t("enterLiwanBranch")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="client">{t("client")}</Label>
                    <Input
                      id="client"
                      name="client"
                      value={editedContract.client || ""}
                      onChange={handleInputChange}
                      placeholder={t("enterClientName")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="unitDeliveryDate">{t("unitDeliveryDate")}</Label>
                    <Input
                      id="unitDeliveryDate"
                      name="unitDeliveryDate"
                      type="date"
                      value={editedContract.unitDeliveryDate || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="unitNumber">{t("unitNumber")}</Label>
                    <Input
                      id="unitNumber"
                      name="unitNumber"
                      value={editedContract.unitNumber || ""}
                      onChange={handleInputChange}
                      placeholder={t("enterUnitNumber")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="unitTotalSpace">{t("unitTotalSpace")}</Label>
                    <Input
                      id="unitTotalSpace"
                      name="unitTotalSpace"
                      value={editedContract.unitTotalSpace || ""}
                      onChange={handleInputChange}
                      placeholder={t("enterTotalSpace")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="unitPrice">{t("unitPrice")}</Label>
                    <Input
                      id="unitPrice"
                      name="unitPrice"
                      type="number"
                      value={editedContract.unitPrice || ""}
                      onChange={handleInputChange}
                      placeholder={t("enterUnitPrice")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="duePayment">{t("duePayment")}</Label>
                    <Input
                      id="duePayment"
                      name="duePayment"
                      type="number"
                      value={editedContract.duePayment || ""}
                      onChange={handleInputChange}
                      placeholder={t("enterDuePayment")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="totalPaid">{t("totalPaid")}</Label>
                    <Input
                      id="totalPaid"
                      name="totalPaid"
                      type="number"
                      value={editedContract.totalPaid || ""}
                      onChange={handleInputChange}
                      placeholder={t("enterTotalPaidAmount")}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold">{t("paymentSchedule")}</h3>
                  <Table className="border border-gray-300">
                    <TableHeader>
                      <TableRow>
                        <TableCell className="text-center">{t("payment")}</TableCell>
                        <TableCell className="text-center">{t("expectedPaymentDate")}</TableCell>
                        <TableCell className="text-center">{t("amount")}</TableCell>
                        <TableCell className="text-center">{t("actions")}</TableCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paymentSchedule.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell className="text-center">
                            <Input
                              type="date"
                              value={row.date}
                              onChange={(e) =>
                                handlePaymentChange(
                                  index,
                                  "date",
                                  e.target.value
                                )
                              }
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Input
                              type="number"
                              value={row.amount}
                              onChange={(e) =>
                                handlePaymentChange(
                                  index,
                                  "amount",
                                  e.target.value
                                )
                              }
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => removePaymentRow(index)}
                              aria-label={`${t("removePDF")} ${t("installment")} ${index + 1}`}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="flex justify-end mt-2">
                    <Button onClick={addPaymentRow}>{t("addRow")}</Button>
                  </div>
                  <div className="flex justify-end mt-5">
                    <Button onClick={handleSubmit}>{t("submitContract")}</Button>
                  </div>
                </div>
              </div>
            </div>
            {apiResponse && (
              <div className="mt-6 p-4 bg-green-100 rounded-md">
                <h3 className="text-lg font-semibold">{t("apiResponse")}</h3>
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(apiResponse, null, 2)}
                </pre>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

