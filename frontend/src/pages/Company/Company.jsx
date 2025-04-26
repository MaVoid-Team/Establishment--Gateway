// Company.jsx
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { gsap } from 'gsap';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { UploadCompanyDocumentDialog } from './UploadCompanyDocumentDialog';

export default function Company() {
  const containerRef = useRef(null);
  const [company, setCompany] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { id } = useParams();
  const { t } = useTranslation();

  const fetchCompanyData = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/companies/${id}`, { withCredentials: true });
      setCompany(response.data.data.company);
    } catch (error) {
      console.error(t("failedToFetchCompanyData"), error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyData();
  }, [id, t]);

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
    return <div>{t("loading")}</div>;
  }

  if (!company) {
    return <div>{t("noCompanyDataFound")}</div>;
  }

  const { name, email, phone_number, cr, vat, location, companySignature, attachment } = company;
  const initials = name ? name.split(' ').map((n) => n.charAt(0)).join('').toUpperCase() : 'N/A';

  return (
    <div ref={containerRef} className="max-w-7xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8">{t("companyDetails")}</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="animate-card shadow-lg border-none dark:shadow-black">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="w-16 h-16">
                <AvatarImage src="/placeholder.svg" alt={t("companyLogo")} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </div>

            <div className="space-y-4">
              {name && (
                <div>
                  <label className="text-lg font-bold">{t("companyName")}</label>
                  <div className="border-b-2"></div>
                  <div className="mt-2">{name}</div>
                </div>
              )}

              {email && (
                <div>
                  <label className="text-lg font-bold">{t("companyEmail")}</label>
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

              {cr && (
                <div>
                  <label className="text-lg font-bold">{t("cr")}</label>
                  <div className="border-b-2"></div>
                  <div className="mt-2">{cr}</div>
                </div>
              )}

              {vat && (
                <div>
                  <label className="text-lg font-bold">{t("vat")}</label>
                  <div className="border-b-2"></div>
                  <div className="mt-2">{vat}</div>
                </div>
              )}

              {location && (
                <div>
                  <label className="text-lg font-bold">{t("location")}</label>
                  <div className="border-b-2"></div>
                  <div className="mt-2">{location}</div>
                </div>
              )}

              {companySignature && (
                <div>
                  <label className="text-lg font-bold">{t("companySignature")}</label>
                  <div className="border-b-2"></div>
                  <div className="mt-2">
                    {companySignature.signature_data || t("noSignatureDataAvailable")}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-lg border-none">
            <CardHeader>
              <CardTitle>{t("documents")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {attachment?.CR ? (
                <div className="flex items-center justify-between">
                  <span>{t("crDocument")}</span>
                  <a href={`${import.meta.env.VITE_API_URL}${attachment.CR.url}`} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                    {t("view")}
                  </a>
                </div>
              ) : (
                <div>{t("noCrDocumentAvailable")}</div>
              )}
              {attachment?.VAT ? (
                <div className="flex items-center justify-between">
                  <span>{t("vatDocument")}</span>
                  <a href={`${import.meta.env.VITE_API_URL}${attachment.VAT.url}`} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                    {t("view")}
                  </a>
                </div>
              ) : (
                <div>{t("noVatDocumentAvailable")}</div>
              )}
              <UploadCompanyDocumentDialog companyId={id} onUploadSuccess={fetchCompanyData} />
            </CardContent>
          </Card>

          <Card className="shadow-lg border-none">
            <CardHeader>
              <CardTitle>{t("companySignature")}</CardTitle>
            </CardHeader>
            <CardContent>
              {companySignature ? (
                <div className="space-y-2">
                  <div>
                    <span className="font-semibold">{t("signatureData")}:</span> {companySignature.signature_data}
                  </div>
                  {companySignature.signature_url && (
                    <div>
                      <span className="font-semibold">{t("signatureUrl")}:</span>
                      <a href={companySignature.signature_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 ml-2">
                        {t("view")}
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div>{t("noCompanySignatureAvailable")}</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}