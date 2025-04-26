/* eslint-disable no-unused-vars */
/* SignaturePreparePhase1.jsx */

import { useRef, useState, useEffect } from "react";
import SignaturePad from "react-signature-canvas";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useToast } from "@/hooks/use-toast"; // Assuming you have a toast hook
import { useTranslation } from "react-i18next";

export default function SignaturePreparePhase1() {
  const navigate = useNavigate();
  const { id } = useParams(); // Fetch document ID from the URL
  const signaturePadRef = useRef(null);
  const [hasSignature, setHasSignature] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [document, setDocument] = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL;
  const { toast } = useToast();
  const { t, i18n } = useTranslation();

  const [employeeData, setEmployeeData] = useState({
    id: "",
    // Add other necessary fields if required
  });
  useEffect(() => {
    const fetchPdf = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/v1/documents/${id}`, {
          withCredentials: true, // Send cookies with the request
        });
        const fetchedDocument = response.data.data.document;
        console.log(response)
        setDocument(fetchedDocument);
        setPdfUrl(`${apiUrl}${fetchedDocument.attachment.url}`);
      } catch (error) {
        console.error("Failed to fetch PDF:", error);
        toast({
          className: "text-white",
          title: "Error",
          description: "Failed to fetch PDF document.",
          variant: "destructive",
        });
      }
    };

    const fetchEmployeeData = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/v1/employees/myData`, {
          withCredentials: true,
        });
        if (response.data?.status === "success") {
          const employee = response.data.data.employee;
          setEmployeeData({
            id: employee.id,
            // Populate other fields if necessary
          });
        }
      } catch (error) {
        console.error("Error fetching employee data:", error);
        toast({
          className: "text-white",
          title: "Error",
          description: "Failed to fetch employee data.",
          variant: "destructive",
        });
      }
    };

    fetchPdf();
    fetchEmployeeData();
  }, [id, apiUrl, toast]);

  const handleClearSignature = () => {
    signaturePadRef.current?.clear();
    setHasSignature(false);
  };

  const handleSaveSignature = async () => {
    if (signaturePadRef.current?.isEmpty()) {
      toast({
        className: "text-white",
        title: "Error",
        description: "Please provide a signature before saving.",
        variant: "destructive",
      });
      return;
    }

    const signatureUrl = signaturePadRef.current?.toDataURL();

    try {
      // Ensure employeeData is available
      if (!employeeData.id) {
        throw new Error("Employee data is missing.");
      }

      // Prepare the payload
      const payload = {
        signer_type: "employee",
        signer_id: employeeData.id,
        object_type: "document", // Changed from 'order' to 'document'
        object_id: id, // Document ID
        signature_data: signatureUrl,
      };

      const response = await axios.post(`${apiUrl}/api/v1/signatures`, payload, {
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
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">

      <main className="flex-grow container mx-auto py-10 px-4">
        <div className="grid lg:grid-cols-2 gap-10">
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-6">{t("pdfPreview")}</h2>
              <div className="h-[calc(100vh-380px)] min-h-[450px] bg-muted/10 rounded-lg overflow-hidden">
                {pdfUrl ? (
                  <iframe
                    src={pdfUrl}
                    className="w-full h-full"
                    title="PDF Preview"
                  />
                ) : (
                  <p className="text-muted-foreground">
                    {t("loadingPdf")}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold">{t("signature").toUpperCase()}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {t("Sign in the Space Below")}
              </p>
            </div>

            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-[#3C3C3C] w-full aspect-[3/2]">
                  <SignaturePad
                    ref={signaturePadRef}
                    canvasProps={{
                      className: "w-full h-full",
                    }}
                    onBegin={() => setHasSignature(true)}
                  />
                </div>
                <div className="p-4 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={handleClearSignature}
                    disabled={!hasSignature}
                  >
                    {t("delete")}
                  </Button>
                  <Button
                    onClick={handleSaveSignature}
                    disabled={!hasSignature}
                    className="bg-[#C2B59B]"
                  >
                    {t("save")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="border-t">
        <div className="container mx-auto py-6 px-4">
          <Button
            size="lg"
            onClick={() => navigate(`/signature-prepare-2/${id}`)}
            className="w-full sm:w-auto bg-[#C2B59B] hover:bg-[#B3A68C]"
          >
            {t("continue")}
          </Button>
        </div>
      </footer>
    </div>
  );
}
