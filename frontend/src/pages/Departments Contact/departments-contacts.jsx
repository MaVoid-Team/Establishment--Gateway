'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { gsap } from 'gsap';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileText, Home, CreditCard, Upload } from 'lucide-react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

export default function DepartmentContact() {
  const containerRef = useRef(null);
  const [department, setDepartment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { id } = useParams();
  const apiUrl = import.meta.env.VITE_API_URL;
  const { t } = useTranslation();

  useEffect(() => {
    const fetchDepartment = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/v1/departments/${id}`, { withCredentials: true });
        setDepartment(response.data);
      } catch (error) {
        console.error(t("failedToFetchDepartmentData"), error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDepartment();
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
    return <div>{t("loading")}</div>;
  }

  if (!department) {
    return <div>{t("noDepartmentDataFound")}</div>;
  }

  const { name } = department;

  const initials = name ? name.split(' ').map((n) => n.charAt(0)).join('').toUpperCase() : 'N/A';

  return (
    <div ref={containerRef} className="max-w-7xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8">{t("departmentContact")}</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="animate-card shadow-lg border-none dark:shadow-black">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="w-16 h-16">
                <AvatarImage src="/placeholder.svg" alt={t("departmentIcon")} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </div>

            <div className="space-y-4">
              {name && (
                <div>
                  <label className="text-lg font-bold">{t("departmentName")}</label>
                  <div className="border-b-2"></div>
                  <div className="mt-2">{name}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-16">
          <Card className="shadow-lg border-none">
            <CardHeader>
              <CardTitle>{t("departmentDocuments")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[t("policyDocument"), t("annualReport"), t("budgetReport"), t("strategicPlan")].map((doc) => (
                <div key={doc} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 p-1.5 bg-gray-900 text-white rounded-lg" />
                    <span>{doc}</span>
                  </div>
                  <Button variant="ghost">{t("view")}</Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-lg border-none">
            <CardHeader>
              <CardTitle>{t("identificationDocuments")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-8 h-8 p-1.5 bg-blue-100 rounded-lg" />
                  <span>{t("taxIdentification")}</span>
                </div>
                <Button variant="ghost">{t("edit")}</Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 p-1.5 bg-blue-100 rounded-lg" />
                  <span>{t("registrationCertificate")}</span>
                </div>
                <Button variant="ghost">{t("edit")}</Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Home className="w-8 h-8 p-1.5 bg-blue-100 rounded-lg" />
                  <span>{t("officeLeaseAgreement")}</span>
                </div>
                <Button variant="ghost">{t("edit")}</Button>
              </div>
              <Button className="w-full mt-4" variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                {t("uploadNewDocument")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
