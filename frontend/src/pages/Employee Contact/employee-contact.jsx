"use client"

import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { gsap } from "gsap"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FileText, Home, CreditCard } from "lucide-react"
import axios from "axios"
import { useParams } from "react-router-dom"
import { toast } from "@/hooks/use-toast"

import { UploadDocumentDialog } from "./upload-document-dialog"

function EmployeeContact() {
  const containerRef = useRef(null)
  const [employee, setEmployee] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const { id } = useParams()
  const { t } = useTranslation()
  const apiUrl = import.meta.env.VITE_API_URL

  const fetchEmployee = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/v1/employees/${id}`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      })
      setEmployee(response.data.data.employee)
    } catch (error) {
      console.error(t("failedToFetchEmployeeData"), error)
      toast({
        title: t("error"),
        description: error.response?.data?.message || t("failedToFetchEmployeeData"),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewDocument = (documentUrl, documentType) => {
    try {
      if (documentType === "signature" && documentUrl.startsWith("data:image")) {
        // For base64 encoded signatures
        const newWindow = window.open()
        newWindow.document.write(`<img src="${documentUrl}" alt="Signature" />`)
      } else {
        // For all other documents, including non-base64 signatures
        const fullDocumentUrl = documentType === "signature" ? documentUrl : `${apiUrl}${documentUrl}`
        window.open(fullDocumentUrl, "_blank")
      }
    } catch (error) {
      console.error("Failed to view document:", error)
      toast({
        title: t("error"),
        description: t("failedToViewDocument"),
        variant: "destructive",
      })
    }
  }

  const handleDeleteDocument = async (documentType) => {
    try {
      if (documentType === "signature") {
        const response = await axios.patch(
          `${apiUrl}/api/v1/employees/${id}`,
          { signature: null },
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          },
        )
        if (response.status === 200) {
          toast({
            title: t("success"),
            description: t("signatureDeletedSuccessfully"),
            variant: "success",
          })
          fetchEmployee() // Refresh employee data
        }
      } else {
        const response = await axios.delete(`${apiUrl}/api/v1/employees/${id}/documents`, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          data: { documentType },
        })

        if (response.status === 200) {
          toast({
            title: t("success"),
            description: t("documentDeletedSuccessfully"),
            variant: "success",
          })
          fetchEmployee() // Refresh employee data
        }
      }
    } catch (error) {
      console.error(t("failedToDeleteDocument"), error)
      toast({
        title: t("error"),
        description: error.response?.data?.message || t("failedToDeleteDocument"),
        variant: "destructive",
      })
    }
  }

  const handleUploadSuccess = () => {
    fetchEmployee()
    toast({
      title: t("success"),
      description: t("documentUploadedSuccessfully"),
      variant: "success",
    })
  }

  useEffect(() => {
    fetchEmployee()
  }, [id]) // Updated dependency array

  useEffect(() => {
    if (!isLoading) {
      gsap.from(".animate-card", {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.3,
        ease: "power3.out",
      })
    }
  }, [isLoading])

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">{t("loading")}</div>
  }

  if (!employee) {
    return <div className="flex justify-center items-center h-screen">{t("noEmployeeDataFound")}</div>
  }

  const {
    name,
    email,
    phone_number,
    nationality,
    department_id,
    role_id,
    extension_number,
    Medical_conditions,
    Accessibility_Needs,
    Home_Address,
    Emergency_Contact,
    Personal_Email,
    attachment,
    signature,
  } = employee

  const initials = name
    ? name
        .split(" ")
        .map((n) => n.charAt(0))
        .join("")
        .toUpperCase()
    : "N/A"

  return (
    <div ref={containerRef} className="max-w-7xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8">{t("employeeContact")}</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-lg border-none">
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

              {department_id && (
                <div>
                  <label className="text-lg font-bold">{t("department")}</label>
                  <div className="border-b-2"></div>
                  <div className="mt-2">{department_id}</div>
                </div>
              )}

              {role_id && (
                <div>
                  <label className="text-lg font-bold">{t("role")}</label>
                  <div className="border-b-2"></div>
                  <div className="mt-2">{role_id}</div>
                </div>
              )}

              {extension_number && (
                <div>
                  <label className="text-lg font-bold">{t("extensionNumber")}</label>
                  <div className="border-b-2"></div>
                  <div className="mt-2">{extension_number}</div>
                </div>
              )}

              {Personal_Email && (
                <div>
                  <label className="text-lg font-bold">{t("personalEmail")}</label>
                  <div className="border-b-2"></div>
                  <div className="mt-2">{Personal_Email}</div>
                </div>
              )}

              {Emergency_Contact && (
                <div>
                  <label className="text-lg font-bold">{t("emergencyContact")}</label>
                  <div className="border-b-2"></div>
                  <div className="mt-2">{Emergency_Contact}</div>
                </div>
              )}

              {Home_Address && (
                <div>
                  <label className="text-lg font-bold">{t("homeAddress")}</label>
                  <div className="border-b-2"></div>
                  <div className="mt-2">{Home_Address}</div>
                </div>
              )}

              {Medical_conditions && (
                <div>
                  <label className="text-lg font-bold">{t("medicalConditions")}</label>
                  <div className="border-b-2"></div>
                  <div className="mt-2">{Medical_conditions}</div>
                </div>
              )}

              {Accessibility_Needs && (
                <div>
                  <label className="text-lg font-bold">{t("accessibilityNeeds")}</label>
                  <div className="border-b-2"></div>
                  <div className="mt-2">{Accessibility_Needs}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-16">
          <Card className="shadow-lg border-none">
            <CardHeader>
              <CardTitle>{t("identificationDocuments")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {attachment && attachment.nationalId && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-8 h-8 p-1.5 bg-slate-700 rounded-lg" />
                    <span>{t("idCard")}</span>
                  </div>
                  <div className="space-x-2">
                    <Button variant="ghost" onClick={() => handleViewDocument(attachment.nationalId.url, "nationalId")}>
                      {t("view")}
                    </Button>
                    <Button variant="destructive" onClick={() => handleDeleteDocument("nationalId")}>
                      {t("delete")}
                    </Button>
                  </div>
                </div>
              )}
              {attachment && attachment.passport && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 p-1.5 bg-slate-700 rounded-lg" />
                    <span>{t("passport")}</span>
                  </div>
                  <div className="space-x-2">
                    <Button variant="ghost" onClick={() => handleViewDocument(attachment.passport.url, "passport")}>
                      {t("view")}
                    </Button>
                    <Button variant="destructive" onClick={() => handleDeleteDocument("passport")}>
                      {t("delete")}
                    </Button>
                  </div>
                </div>
              )}
              {attachment && attachment.residencyPermit && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Home className="w-8 h-8 p-1.5 bg-slate-700 rounded-lg" />
                    <span>{t("residencyPermit")}</span>
                  </div>
                  <div className="space-x-2">
                    <Button
                      variant="ghost"
                      onClick={() => handleViewDocument(attachment.residencyPermit.url, "residencyPermit")}
                    >
                      {t("view")}
                    </Button>
                    <Button variant="destructive" onClick={() => handleDeleteDocument("residencyPermit")}>
                      {t("delete")}
                    </Button>
                  </div>
                </div>
              )}
              {signature && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 p-1.5 bg-slate-700 rounded-lg" />
                    <span>{t("signature")}</span>
                  </div>
                  <div className="space-x-2">
                    <Button variant="ghost" onClick={() => handleViewDocument(signature, "signature")}>
                      {t("view")}
                    </Button>
                    <Button variant="destructive" onClick={() => handleDeleteDocument("signature")}>
                      {t("delete")}
                    </Button>
                  </div>
                </div>
              )}

              <UploadDocumentDialog employeeId={id} onUploadSuccess={handleUploadSuccess} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default EmployeeContact

