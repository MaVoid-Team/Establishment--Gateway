'use client'

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

export default function SignatureView() {
  const { id } = useParams();         // Document ID from route params
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();

  const [documentData, setDocumentData] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Adjust this if your environment variables differ
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchDocument = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${apiUrl}/api/v1/documents/${id}`, {
          withCredentials: true,
        });

        const fetchedDoc = response.data.data.document;
        setDocumentData(fetchedDoc);

        // If the document has an attachment (a PDF file), build the URL
        if (fetchedDoc.attachment && fetchedDoc.attachment.url) {
          setPdfUrl(`${apiUrl}${fetchedDoc.attachment.url}`);
        } else {
          setPdfUrl(null);
        }
      } catch (err) {
        console.error("Error fetching document:", err);
        setError("Failed to fetch document data.");
        toast({
          title: "Error",
          description: "Failed to fetch document data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id, apiUrl, toast]);

  /**
   * A helper to find a signature by signer type in the documentData.signatures array.
   * This is used if there isn't already a signature in the vendorDetails or companyDetails.
   */
  const getSignatureFromSignaturesArray = (type) => {
    if (!documentData?.signatures?.length) return null;
    // If you expect only one signature per signer_type, .find() is sufficient.
    return documentData.signatures.find(
      (sig) => sig.signer_type === type && sig.signature_data
    )?.signature_data || null;
  };

  // 1. Employee signature is typically in the signatures array:
  const employeeSignature = getSignatureFromSignaturesArray("employee");

  // 2. Vendor signature might be in vendorDetails.signature 
  //    or (fallback) in the signatures array (signer_type === "vendor"):
  const vendorSignature =
    documentData?.vendorDetails?.signature?.signature_data ||
    getSignatureFromSignaturesArray("vendor");

  // 3. Company signature might be in companyDetails.signature 
  //    or (fallback) in the signatures array (signer_type === "company"):
  const companySignature =
    documentData?.companyDetails?.signature?.signature_data ||
    getSignatureFromSignaturesArray("company");

  /**
   * Helper function to display a signature <img> or fallback text if no signature is present.
   */
  const renderSignatureImage = (signatureData, label) => {
    if (!signatureData) {
      return <p className="text-sm text-muted-foreground">{`${label} ${t('notSigned')}`}</p>;
    }
    return (
      <div>
        <p className="font-semibold mb-2">{label}</p>
        <img
          src={signatureData}
          alt={`${label} Signature`}
          className="border rounded p-2 max-h-40"
        />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 min-h-screen flex items-center justify-center">
        <p>{t("loading")}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6 min-h-screen flex flex-col items-center justify-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => navigate(-1)} variant="outline">
          {t("goBack")}
        </Button>
      </div>
    );
  }

  if (!documentData) {
    return (
      <div className="container mx-auto px-4 py-6 min-h-screen flex items-center justify-center">
        <p>{t("noDataFound")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-grow container mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-6">
          {t("documentSignatures")} (ID: {documentData.id})
        </h1>
        
        {/* PDF Preview Section */}
        <Card className="mb-6">
          <CardContent>
            <h2 className="text-xl font-semibold mb-4">{t("pdfPreview")}</h2>
            <div className="min-h-[400px] bg-muted/10 rounded-lg overflow-hidden">
              {pdfUrl ? (
                <iframe
                  src={pdfUrl}
                  className="w-full h-[600px]"
                  title="PDF Preview"
                />
              ) : (
                <p className="p-4 text-muted-foreground">{t("noPdfFound")}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Signatures Section */}
        <Card>
          <CardContent className="space-y-6">
            <h2 className="text-xl font-semibold">{t("signatures")}</h2>

            {/* Employee Signature */}
            {renderSignatureImage(employeeSignature, t("employeeSignature"))}

            {/* Vendor Signature */}
            {renderSignatureImage(vendorSignature, t("vendorSignature"))}

            {/* Company Signature */}
            {renderSignatureImage(companySignature, t("companySignature"))}
          </CardContent>
        </Card>
      </main>

      <footer className="border-t">
        <div className="container mx-auto py-6 px-4">
          <Button
            variant="outline"
            onClick={() => navigate("/signatures-history")}
          >
            {t("backToHistory")}
          </Button>
        </div>
      </footer>
    </div>
  );
}
