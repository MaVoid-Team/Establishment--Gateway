import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { gsap } from 'gsap';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileText } from 'lucide-react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { UploadVendorDocumentDialog } from './UploadVendorDocumentDialog';

export default function VendorContact() {
  const containerRef = useRef(null);
  const [vendor, setVendor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { id } = useParams();
  const apiUrl = import.meta.env.VITE_API_URL;
  const { t } = useTranslation();

  const fetchVendorData = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/v1/vendors/${id}`, { 
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      setVendor(response.data.data.vendor);
    } catch (error) {
      console.error(t("failedToFetchVendorData"), error);
      toast({
        title: t("error"),
        description: t("failedToFetchVendorData"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDocument = async (documentUrl, documentType) => {
    try {
      // First try to open the URL directly if it's a full URL
      if (documentUrl.startsWith('http')) {
        window.open(documentUrl, '_blank');
        return;
      }

      // If it's not a direct URL, make an API request to get the document
      const response = await axios.patch(
        `${apiUrl}/api/v1/companies/1`,
        {
          documentType: documentType,
          attachment: documentUrl
        },
        {
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Accept': 'application/pdf'
          },
        }
      );

      // Extract the document path from the response
      const documentPath = response.data.data.company.attachment;
      
      // Construct the full document URL
      const fullDocumentUrl = `${apiUrl}${documentPath}`;
      
      // Open the document URL in a new tab
      window.open(fullDocumentUrl, '_blank');

    } catch (error) {
      console.error(t("failedToViewDocument"), error);
      toast({
        title: t("error"),
        description: t("failedToViewDocument"),
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchVendorData();
  }, [id, apiUrl, t]);

  useEffect(() => {
    if (!isLoading) {
      gsap.from('.animate-card', {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.3,
        ease: 'power3.out',
      });
    }
  }, [isLoading]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">{t("loading")}</div>;
  }

  if (!vendor) {
    return <div className="flex justify-center items-center h-screen">{t("noVendorDataFound")}</div>;
  }

  const {
    name,
    email,
    phone_number,
    nationality,
    address,
    telephone_number,
    national_id_or_passport_number,
    attachment,
    vendorSignature,
  } = vendor;

  const initials = name ? name.split(' ').map((n) => n.charAt(0)).join('').toUpperCase() : 'N/A';

  return (
    <div ref={containerRef} className="max-w-7xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8">{t("vendorContact")}</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="animate-card shadow-lg border-none dark:shadow-black">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="w-16 h-16">
                <AvatarImage src="/placeholder.svg" alt={t("profilePhoto")} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </div>

            <div className="space-y-4">
              {name && (
                <div>
                  <label className="text-lg font-bold">{t("displayName")}</label>
                  <div className="border-b-2"></div>
                  <div className="mt-2">{name}</div>
                </div>
              )}

              {email && (
                <div>
                  <label className="text-lg font-bold">{t("workEmail")}</label>
                  <div className="border-b-2"></div>
                  <div className="mt-2">{email}</div>
                </div>
              )}

              {phone_number && (
                <div>
                  <label className="text-lg font-bold">{t("phoneNumber")}</label>
                  <div className="border-b-2"></div>
                  <div className="mt-2">{phone_number}</div>
                </div>
              )}

              {nationality && (
                <div>
                  <label className="text-lg font-bold">{t("nationality")}</label>
                  <div className="border-b-2"></div>
                  <div className="mt-2">{nationality}</div>
                </div>
              )}

              {address && (
                <div>
                  <label className="text-lg font-bold">{t("address")}</label>
                  <div className="border-b-2"></div>
                  <div className="mt-2">{address}</div>
                </div>
              )}

              {telephone_number && (
                <div>
                  <label className="text-lg font-bold">{t("telephoneNumber")}</label>
                  <div className="border-b-2"></div>
                  <div className="mt-2">{telephone_number}</div>
                </div>
              )}

              {national_id_or_passport_number && (
                <div>
                  <label className="text-lg font-bold">{t("nationalIdOrPassportNumber")}</label>
                  <div className="border-b-2"></div>
                  <div className="mt-2">{national_id_or_passport_number}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-lg border-none">
            <CardHeader>
              <CardTitle>{t("vendorDocuments")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {attachment && Object.entries(attachment).map(([key, value]) => {
                if (value) {
                  return (
                    <div key={key} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-8 h-8 p-1.5 bg-gray-900 text-white rounded-lg" />
                        <span>{t(key)}</span>
                      </div>
                      <Button 
                        variant="ghost"
                        onClick={() => handleViewDocument(value.url, key)}
                      >
                        {t("view")}
                      </Button>
                    </div>
                  );
                }
                return null;
              })}
              {(!attachment || Object.values(attachment).every(v => v === null)) && (
                <div>{t("noDocumentsAvailable")}</div>
              )}
              <UploadVendorDocumentDialog 
                vendorId={id} 
                onUploadSuccess={fetchVendorData} 
              />
            </CardContent>
          </Card>

          <Card className="shadow-lg border-none">
            <CardHeader>
              <CardTitle>{t("vendorSignature")}</CardTitle>
            </CardHeader>
            <CardContent>
              {vendorSignature ? (
                <div className="space-y-2">
                  <div>
                    <span className="font-semibold">{t("signatureData")}:</span> {vendorSignature.signature_data}
                  </div>
                  {vendorSignature.signature_url && (
                    <div>
                      <span className="font-semibold">{t("signatureUrl")}:</span>
                      <Button
                        variant="ghost"
                        className="ml-2"
                        onClick={() => handleViewDocument(vendorSignature.signature_url, 'signature')}
                      >
                        {t("view")}
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div>{t("noVendorSignatureAvailable")}</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

