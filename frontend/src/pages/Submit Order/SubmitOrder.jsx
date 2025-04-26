import { useState, useEffect, useRef } from "react";
import SignaturePad from "react-signature-canvas";
import axios from "axios";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { User, FileText, Building2, Upload, X, Download, Printer } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const apiUrl = import.meta.env.VITE_API_URL;

const MAX_FILE_SIZE = 32 * 1024 * 1024; // 5MB
const MAX_TOTAL_SIZE = 32 * 1024 * 1024; // 20MB

const checkFileSize = (file) => {
  return file.size <= MAX_FILE_SIZE;
};

const MergedOrderForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [companyMode, setCompanyMode] = useState("select");
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [employeeData, setEmployeeData] = useState({
    name: "",
    email: "",
    id: "",
    role: "",
    departmentId: null,
  });
  const [existingSignature, setExistingSignature] = useState(null);
  const [existingSignatureType, setExistingSignatureType] = useState(null);
  const [hasSignature, setHasSignature] = useState(false);
  const [showSignatureError, setShowSignatureError] = useState(false);
  const [priceLimit, setPriceLimit] = useState(500);
  const [managers, setManagers] = useState([]);
  const [showManagers, setShowManagers] = useState(false);
  const [signatureType, setSignatureType] = useState("draw");
  const [signatureFile, setSignatureFile] = useState(null);

  const [orderData, setOrderData] = useState({
    title: "",
    price: "",
    description: "",
    notes: "",
    payment_method: "",
    delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    estimated_time: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    delivery_status: "in_progress",
    URL: "",
  });

  const [newCompanyData, setNewCompanyData] = useState({
    name: "",
    phone_number: "",
    email: "",
    cr: "",
    vat: "",
  });

  const [files, setFiles] = useState([]);
  const [priority, setPriority] = useState("3-Normal");

  const [hasWarned, setHasWarned] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  const signaturePadRef = useRef(null);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/v1/employees/myData`, {
          withCredentials: true,
        });

        if (response.data?.status === "success") {
          const employee = response.data.data.employee;
          const cleanedRole = employee.employeeRole.name
            .replace(/`/g, "")
            .trim();

          setEmployeeData({
            name: employee.name,
            email: employee.email,
            id: employee.id,
            role: cleanedRole,
            departmentId: employee.department_id,
          });

          // Set price limit based on role and permissions
          if (cleanedRole.toLowerCase() === "admin") {
            setPriceLimit(99999999);
          } else if (cleanedRole.toLowerCase().includes('manager') || cleanedRole.toLowerCase().includes('ceo')) {
            setPriceLimit(10000);
          } else {
            setPriceLimit(500);
          }
          // Check for existing signature
          if (employee.signatures && employee.signatures.length > 0) {
            const latestSignature = employee.signatures[employee.signatures.length - 1];
            setExistingSignature(latestSignature.signature_data);
            setExistingSignatureType('base64');
            setHasSignature(true);
          } else if (employee.attachment?.signature?.url) {
            setExistingSignature(`${apiUrl}${employee.attachment.signature.url}`);
            setExistingSignatureType('image');
            setHasSignature(true);
          }
        }
      } catch (error) {
        console.error("Error fetching employee data:", error);
        toast({
          className: "text-white",
          title: "Error",
          description: "Failed to fetch employee data",
          variant: "destructive",
        });
      }
    };

    const fetchCompanies = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/v1/companies`, {
          withCredentials: true,
        });

        if (response.data?.status === "success") {
          setCompanies(response.data.data.companies);
        }
      } catch (error) {
        console.error("Error fetching companies:", error);
        setError("Failed to fetch companies");
        toast({
          className: "text-white",
          title: "Error",
          description: "Failed to fetch companies",
          variant: "destructive",
        });
      }
    };

    fetchEmployeeData();
    fetchCompanies();
  }, [toast]);

  const fetchManagers = async (departmentId) => {
    try {
      const response = await axios.get(`${apiUrl}/api/v1/departments/${departmentId}/employees`, {
        withCredentials: true,
      });

      if (response.data?.status === "success") {
        const managers = response.data.data.employees.filter(
          employee => employee.role_name && employee.role_name.toLowerCase().includes("manager")
        );
        setManagers(managers);
      }
    } catch (error) {
      console.error("Error fetching managers:", error);
      toast({
        className: "text-white",
        title: "Error",
        description: "Failed to fetch managers",
        variant: "destructive",
      });
    }
  };

  const createCompany = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${apiUrl}/api/v1/companies`,
        newCompanyData,
        { withCredentials: true }
      );

      return response.data.data.company.id;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to create company";
      setError(errorMessage);
      toast({
        className: "text-white",
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const prepareFormData = (files, orderData, companyId, priority) => {
    const formData = new FormData();
    try {
      // Append files
      for (const file of files) {
        formData.append("attachment", file);
      }

      // Append order data
      formData.append("company_id", companyId);
      formData.append("priority", priority);
      formData.append("employee_id", employeeData.id);

      Object.entries(orderData).forEach(([key, value]) => {
        formData.append(key, value);
      });

      return formData;
    } catch (error) {
      console.error("Error preparing FormData:", error);
      throw error;
    }
  };

  const createOrder = async (companyId, priority, files) => {
    try {
      setLoading(true);
      setError(null);

      // First, create the order without files
      const orderDataWithoutFiles = {
        company_id: companyId,
        priority: priority,
        employee_id: employeeData.id,
        ...orderData
      };

      const orderResponse = await axios.post(`${apiUrl}/api/v1/orders`, orderDataWithoutFiles, {
        withCredentials: true,
      });

      const orderId = orderResponse.data.data.order.id;

      // Then, upload files in chunks
      for (const file of files) {
        const formData = new FormData();
        formData.append("attachment", file);
        formData.append("order_id", orderId);

        await axios.post(`${apiUrl}/api/v1/orders/${orderId}/attachments`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        });
      }

      toast({
        title: "Success",
        description: "Order created successfully",
        variant: "default",
      });

      return orderResponse.data.data.order;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to create order";
      setError(errorMessage);
      toast({
        className: "text-white",
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter(checkFileSize);
      const totalSize = [...files, ...newFiles].reduce((acc, file) => acc + file.size, 0);
    
      if (totalSize > MAX_TOTAL_SIZE) {
        toast({
          className: "text-white",
          title: "Error",
          description: `Total file size exceeds ${MAX_TOTAL_SIZE / (1024 * 1024)}MB limit`,
          variant: "destructive",
        });
        return;
      }

      setFiles((prevFiles) => [...prevFiles, ...newFiles]);

      if (newFiles.length < e.target.files.length) {
        toast({
          className: "text-white",
          title: "Warning",
          description: `Some files were skipped because they exceed the ${MAX_FILE_SIZE / (1024 * 1024)}MB file size limit`,
          variant: "warning",
        });
      }
    }
  };

  const removeFile = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handlePriceChange = async (e) => {
    const newPrice = parseFloat(e.target.value);

    if (newPrice > priceLimit) {
      setShowWarning(true);
      if (!hasWarned) {
        setHasWarned(true);
        if (employeeData.departmentId) {
          await fetchManagers(employeeData.departmentId);
          setShowManagers(true);
        }
      }
    } else {
      setShowWarning(false);
      setShowManagers(false);
    }

    setOrderData({ ...orderData, price: newPrice });
  };

  const handleDownloadOrPrint = () => {
    const orderDetails = `
Order Details:
--------------
Title: ${orderData.title}
Price: ${orderData.price}
Description: ${orderData.description}
Notes: ${orderData.notes}
Payment Method: ${orderData.payment_method}
Delivery Date: ${orderData.delivery_date}
Estimated Time: ${orderData.estimated_time}
Delivery Status: ${orderData.delivery_status}
Priority: ${priority}

Employee Information:
---------------------
Name: ${employeeData.name}
Email: ${employeeData.email}
ID: ${employeeData.id}

Company Information:
--------------------
${companyMode === "select"
        ? `Company ID: ${selectedCompanyId}`
        : `Company Name: ${newCompanyData.name}
Email: ${newCompanyData.email}
Phone: ${newCompanyData.phone_number}
CR: ${newCompanyData.cr}
VAT: ${newCompanyData.vat}`
      }

Attached Files:
---------------
${files.map((file) => file.name).join("\n")}
    `;

    const blob = new Blob([orderDetails], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "order_details.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClearSignature = () => {
    signaturePadRef.current?.clear();
    setHasSignature(false);
    setShowSignatureError(false);
    setExistingSignature(null);
    setExistingSignatureType(null);
  };

  const handleSignatureUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setSignatureFile(file);
      setHasSignature(true);
      setShowSignatureError(false);

      // Upload signature immediately when file is selected
      const formData = new FormData();
      formData.append('attachment', file);
      formData.append('documentType', 'signature');

      try {
        await axios.patch(
          `${apiUrl}/api/v1/employees/${employeeData.id}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            withCredentials: true,
          }
        );

        const response = await axios.get(`${apiUrl}/api/v1/employees/myData`, {
          withCredentials: true,
        });
        
        if (response.data?.status === "success" && response.data.data.employee.attachment?.signature?.url) {
          setExistingSignature(`${apiUrl}${response.data.data.employee.attachment.signature.url}`);
          setExistingSignatureType('image');
        }

        toast({
          title: "Success",
          description: "Signature uploaded successfully",
          variant: "default",
        });
      } catch (error) {
        console.error("Error uploading signature:", error);
        toast({
          className: "text-white",
          title: "Error",
          description: "Failed to upload signature",
          variant: "destructive",
        });
      }
    }
  };

  const handleSaveSignature = async (orderId) => {
    if (signatureType === "draw" && signaturePadRef.current?.isEmpty() && !existingSignature) {
      setShowSignatureError(true);
      throw new Error("Signature is required.");
    }

    try {
      let signatureData;
    
      if (existingSignature && existingSignatureType === 'base64') {
        signatureData = existingSignature;
      } else if (existingSignature && existingSignatureType === 'image') {
        signatureData = existingSignature;
      } else if (signatureType === "draw") {
        signatureData = signaturePadRef.current?.toDataURL();
      } else if (signatureType === "upload" && signatureFile) {
        signatureData = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(signatureFile);
        });
      } else {
        throw new Error("Invalid signature type or missing signature.");
      }

      const signaturePayload = {
        signer_type: "employee",
        signer_id: employeeData.id,
        object_type: "order",
        object_id: orderId,
        signature_data: signatureData
      };

      const response = await axios.post(`${apiUrl}/api/v1/signatures`, signaturePayload, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });

      console.log("Signature submitted successfully:", response.data);
      toast({
        className: "text-white",
        title: "Success",
        description: "Signature submitted successfully!",
        variant: "default",
      });
    } catch (error) {
      console.error("Failed to submit signature:", error);
      if (error.response && error.response.data) {
        console.error("Server responded with:", error.response.data);
        toast({
          className: "text-white",
          title: "Error",
          description: `Failed to submit signature: ${error.response.data.message}`,
          variant: "destructive",
        });
      } else {
        toast({
          className: "text-white",
          title: "Error",
          description: "Failed to submit signature. Please try again.",
          variant: "destructive",
        });
      }
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (signatureType === "draw" && signaturePadRef.current?.isEmpty() && !existingSignature) {
        setShowSignatureError(true);
        throw new Error("Signature is required.");
      }

      let companyId;

      if (companyMode === "create") {
        companyId = await createCompany();
      } else {
        companyId = selectedCompanyId;
      }

      const createdOrder = await createOrder(companyId, priority, files);

      // Create and submit the signature
      await handleSaveSignature(createdOrder.id);

      // Reset form and state
      setOrderData({
        title: "",
        price: "",
        description: "",
        notes: "",
        payment_method: "",
        delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        estimated_time: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        delivery_status: "in_progress",
        URL: "",
      });

      if (companyMode === "create") {
        setNewCompanyData({
          name: "",
          phone_number: "",
          email: "",
          cr: "",
          vat: "",
        });
      }

      setFiles([]);
      setPriority("3-Normal");
      handleClearSignature();
      setSignatureType("draw");
      setSignatureFile(null);

      toast({
        title: "Success",
        description: "Order created and signature submitted successfully",
        variant: "default",
      });

      navigate("/order-history");
    } catch (error) {
      if (error.message === "Signature is required.") {
        toast({
          className: "text-white",
          title: "Error",
          description: "Please provide a signature before submitting.",
          variant: "destructive",
        });
      } else {
        setError(error.message);
        toast({
          className: "text-white",
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-grow container mx-auto py-10 px-4">
        <div className="grid lg:grid-cols-2 gap-10">
          {/* Sidebar */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold">Order Details</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Fill in the details of your order below
              </p>
            </div>
          </div>

          {/* Order Form */}
          <div className="flex items-start justify-center lg:justify-start py-8 px-4 lg:pr-14">
            <Card
              className="w-full max-w-4xl mx-auto border-none dark:shadow-black shadow-2xl rounded-lg"
              dir={i18n.language === "ar" ? "rtl" : "ltr"}
            >
              <CardHeader>
                <CardTitle>{t("orderForm")}</CardTitle>
                <CardDescription>{t("fillDetailsSubmitOrder")}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Employee Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold" id="employee-info">
                      {t("employeeSection")}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="employeeName">{t("employeeName")}</Label>
                        <Input
                          className="capitalize"
                          id="employeeName"
                          value={employeeData?.name || ""}
                          disabled
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="employeeEmail">{t("employeeEmail")}</Label>
                        <Input
                          id="employeeEmail"
                          value={employeeData?.email || ""}
                          disabled
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="employeeId">{t("employeeID")}</Label>
                        <Input
                          id="employeeId"
                          value={employeeData?.id || ""}
                          disabled
                        />
                      </div>
                    </div>
                  </div>

                  {/* Priority Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">{t("priority")}</h3>
                    <RadioGroup value={priority} onValueChange={setPriority}>
                      <div
                        className="flex flex-col space-y-2"
                        dir={i18n.language === "ar" ? "rtl" : "ltr"}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="1-Critical"
                            id="priority-critical"
                          />
                          <Label htmlFor="priority-critical">
                            {" "}
                            1- {t("critical")}
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="2-High" id="priority-high" />
                          <Label htmlFor="priority-high">2- {t("high")}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="3-Normal"
                            id="priority-normal"
                          />
                          <Label htmlFor="priority-normal">
                            3- {t("medium")}
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="4-Low" id="priority-low" />
                          <Label htmlFor="priority-low">4- {t("low")}</Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Order Details Section */}
                  <div className="space-y-4" id="order-details">
                    <h3 className="text-lg font-semibold">{t("orderDetails")}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">{t("title")}</Label>
                        <Input
                          id="title"
                          value={orderData.title}
                          onChange={(e) =>
                            setOrderData({ ...orderData, title: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="price">{t("price")}</Label>
                        <Input
                          id="price"
                          type="number"
                          value={orderData.price}
                          onChange={handlePriceChange}
                          required
                          className={cn(
                            orderData.price > priceLimit && "border-red-500 focus:border-red-500"
                          )}
                        />
                        {orderData.price > priceLimit && (
                          <p className="text-red-500 text-sm">
                            {t("priceExceedsLimit", { limit: priceLimit })}
                          </p>
                        )}
                      </div>
                    </div>
                    {showManagers && (
                      <Card className="mt-4">
                        <CardHeader>
                          <CardTitle>{t("managersToApprove")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul>
                            {managers.map((manager) => (
                              <li key={manager.id}>
                                {manager.name} - {manager.role_name}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="description">{t("description")}</Label>
                      <Textarea
                        id="description"
                        value={orderData.description}
                        onChange={(e) =>
                          setOrderData({
                            ...orderData,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">{t("notes")}</Label>
                      <Textarea
                        id="notes"
                        value={orderData.notes}
                        onChange={(e) =>
                          setOrderData({ ...orderData, notes: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="URL">{t("orderUrl")}</Label>
                      <Textarea
                        id="URL"
                        value={orderData.URL}
                        onChange={(e) =>
                          setOrderData({ ...orderData, URL: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="payment_method">{t("paymentMethod")}</Label>
                      <Select
                        onValueChange={(value) =>
                          setOrderData({ ...orderData, payment_method: value })
                        }
                        required
                      >
                        <SelectTrigger
                          dir={i18n.language === "ar" ? "rtl" : "ltr"}
                        >
                          <SelectValue placeholder={t("selectPaymentMethod")} />
                        </SelectTrigger>
                        <SelectContent
                          dir={i18n.language === "ar" ? "rtl" : "ltr"}
                        >
                          <SelectItem value="cash">{t("cash")}</SelectItem>
                          <SelectItem value="credit_card">
                            {t("creditCard")}
                          </SelectItem>
                          <SelectItem value="bank">{t("bank")}</SelectItem>
                          <SelectItem value="check">{t("check")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Company Information */}
                  <div className="space-y-4" id="company-details">
                    <h3 className="text-lg font-semibold">
                      {t("companyInformation")}
                    </h3>

                    <div className="space-y-4">
                      <Label>{t("chooseAnOption")}</Label>
                      <RadioGroup
                        dir={i18n.language === "ar" ? "rtl" : "ltr"}
                        defaultValue="select"
                        onValueChange={setCompanyMode}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="select"
                            id="select"
                          />
                          <Label htmlFor="select">
                            {t("selectExistingCompany")}
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="create" id="create" />
                          <Label htmlFor="create">{t("createNewCompany")}</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {companyMode === "select" ? (
                      <div className="space-y-2">
                        <Label htmlFor="companySelect">
                          {t("selectCompany")}
                        </Label>
                        <Select
                          onValueChange={setSelectedCompanyId}
                          required
                          dir={i18n.language === "ar" ? "rtl" : "ltr"}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t("companyName")} />
                          </SelectTrigger>
                          <SelectContent>
                            {companies.map((company) => (
                              <SelectItem
                                key={company.id}
                                value={company.id.toString()}
                              >
                                {company.name} - {company.email}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="companyName">{t("companyName")}</Label>
                          <Input
                            id="companyName"
                            value={newCompanyData.name}
                            onChange={(e) =>
                              setNewCompanyData({
                                ...newCompanyData,
                                name: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="companyEmail">
                            {t("companyEmail")}
                          </Label>
                          <Input
                            id="companyEmail"
                            type="email"
                            value={newCompanyData.email}
                            onChange={(e) =>
                              setNewCompanyData({
                                ...newCompanyData,
                                email: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="companyPhone">{t("phoneNumber")}</Label>
                          <Input
                            id="companyPhone"
                            type="tel"
                            value={newCompanyData.phone_number}
                            onChange={(e) =>
                              setNewCompanyData({
                                ...newCompanyData,
                                phone_number: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2" dir="ltr">
                          <Label htmlFor="companyCR">CR</Label>
                          <Input
                            id="companyCR"
                            type="number"
                            value={newCompanyData.cr}
                            onChange={(e) =>
                              setNewCompanyData({
                                ...newCompanyData,
                                cr: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="companyVAT">VAT</Label>
                          <Input
                            id="companyVAT"
                            type="number"
                            value={newCompanyData.vat}
                            onChange={(e) =>
                              setNewCompanyData({
                                ...newCompanyData,
                                vat: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* File Upload Section */}
                  <div className="space-y-2">
                    <Label htmlFor="fileUpload">{t("uploadFiles")}</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="fileUpload"
                        type="file"
                        onChange={handleFileChange}
                        className="hidden"
                        multiple
                      />
                      <Label
                        htmlFor="fileUpload"
                        className="cursor-pointer flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md"
                      >
                        <Upload className="w-5 h-5" />
                        <span>{t("chooseFiles")}</span>
                      </Label>
                    </div>
                    {files.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {files.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-secondary p-2 rounded-md"
                          >
                            <span className="text-sm truncate">{file.name}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Signature Pad Section */}
                  <div className="space-y-4" id="signature-pad">
                    <h3 className="text-lg font-semibold">Signature <span className="text-red-500">*</span></h3>                    <Tabs defaultValue="draw" value={signatureType} onValueChange={setSignatureType}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="draw">Draw Signature</TabsTrigger>
                        <TabsTrigger value="upload">Upload Signature</TabsTrigger>
                      </TabsList>
                      <TabsContent value="draw">
                        <Card className="overflow-hidden">
                          <CardContent className="p-0">
                            {existingSignature && existingSignatureType === 'base64' ? (
                              <div className="bg-[#3C3C3C3C] w-full aspect-[3/2] flex items-center justify-center">
                                <img src={existingSignature || "/placeholder.svg"} alt="Existing Signature" className="max-w-full max-h-full" />
                              </div>
                            ) : (
                              <div className="bg-[#3C3C3C] w-full aspect-[3/2]">
                                <SignaturePad
                                  ref={signaturePadRef}
                                  canvasProps={{
                                    className: "w-full h-full",
                                  }}
                                  onBegin={() => setHasSignature(true)}
                                />
                              </div>
                            )}
                            <div className="p-4 flex justify-end gap-2">
                              <Button
                                variant="outline"
                                onClick={handleClearSignature}
                                disabled={!hasSignature && !existingSignature}
                              >
                                {existingSignature ? "Draw New Signature" : "Clear"}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                      <TabsContent value="upload">
                        <Card>
                          <CardContent className="space-y-4 pt-4">
                            {existingSignature && existingSignatureType === 'image' ? (
                              <div className="relative w-full aspect-[3/2] bg-[#3C3C3C] flex items-center justify-center">
                                <img 
                                  src={existingSignature || "/placeholder.svg"} 
                                  alt="Uploaded Signature" 
                                  className="max-w-full max-h-full object-contain"
                                />
                                <Button
                                  variant="outline"
                                  className="absolute top-2 right-2"
                                  onClick={() => {
                                    setExistingSignature(null);
                                    setExistingSignatureType(null);
                                    setHasSignature(false);
                                  }}
                                >
                                  Remove
                                </Button>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center gap-4">
                                <Input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleSignatureUpload}
                                  className="hidden"
                                  id="signature-upload"
                                />
                                <Label
                                  htmlFor="signature-upload"
                                  className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md"
                                >
                                  <Upload className="w-5 h-5" />
                                  <span>Upload Signature Image</span>
                                </Label>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>
                    {showSignatureError && (
                      <p className="text-red-500 text-sm mt-2">
                        Please provide a signature before submitting.
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
                        {t("processing")}
                      </div>
                    ) : (
                      t("SubmitOrder")
                    )}
                  </Button>

                  {/* Download/Print Button */}
                  <Button
                    type="button"
                    className="w-full mt-4"
                    onClick={handleDownloadOrPrint}
                    disabled={loading}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {t("Print Order")}
                  </Button>
                </form>
                {error && (
                  <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MergedOrderForm;

