"use client"

import { useEffect, useState, useCallback } from "react"
import { useTranslation } from "react-i18next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Home, CreditCard } from "lucide-react"
import axios from "axios"
import { toast } from "@/hooks/use-toast"
import { UploadPersonalDocumentDialog } from "./upload-personal-document-dialog"

export function PersonalDocumentsCard() {
  const [documents, setDocuments] = useState(null)
  const [signature, setSignature] = useState(null)

  const { t } = useTranslation()
  const apiUrl = import.meta.env.VITE_API_URL

  const fetchDocuments = useCallback(async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/v1/employees/myData`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      const employeeData = response.data?.data?.employee
      if (!employeeData) {

        throw new Error("Invalid response format")
      }
      setDocuments(employeeData.attachment || null) // Ensure null if no attachment
      setSignature(employeeData.signature || null) // Ensure null if no signature
    } catch (error) {
      console.error(t("failedToFetchDocuments"), error)
      toast({
        title: t("error"),
        description: error.response?.data?.message || t("failedToFetchDocuments"),
        variant: "destructive",
      })
      setDocuments(null)
      setSignature(null)
    }
  }, [t, apiUrl])

  async function handleDeleteDocument(documentType) {
    try {
      const endpoint = `${apiUrl}/api/v1/employees/myData`
      let payload
      if (documentType === "signature") {
        payload = { signature: null }
        setSignature(null) // Immediately update local state
      } else {
        payload = {
          attachment: {
            ...documents,
            [documentType]: null,
          },
        }
        setDocuments((prev) => ({
          ...prev,
          [documentType]: null,
        }))
      }

      await axios.patch(endpoint, payload, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },

      })

      toast({
        title: t("success"),                 
        description: t("documentDeletedSuccessfully"), 
        variant: "success",
      })

      await fetchDocuments() // Refresh data from server
    } catch (error) {
      console.error(t("failedToDeleteDocument"), error)
      toast({
        title: t("error"),
        description: error.response?.data?.message || t("failedToDeleteDocument"),
        variant: "destructive",
      })
     
      
    }
  }
  const handleViewDocument = (documentUrl, documentType) => {
    try {
      if (documentType === "signature" && documentUrl.startsWith("data:image")) {
        const newWindow = window.open()
        newWindow.document.write(`<img src="${documentUrl}" alt="Signature" />`)
      } else {
        window.open(`${apiUrl}${documentUrl}`, "_blank")
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

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  return (
    <Card className="shadow-lg border-none">
      <CardHeader>
        <CardTitle>{t("identificationDocuments")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {documents?.nationalId && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="w-8 h-8 p-1.5 bg-slate-300 text-black rounded-lg" />
              <span>{t("idCard")}</span>
            </div>
            <div className="space-x-2">
              <Button variant="ghost" onClick={() => handleViewDocument(documents.nationalId.url, "nationalId")}>
                {t("view")}
              </Button>
              <Button variant="destructive" onClick={() => handleDeleteDocument("nationalId")}>
                {t("delete")}
              </Button>
            </div>
          </div>
        )}

        {documents?.passport && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 p-1.5 bg-slate-300 text-black rounded-lg" />
              <span>{t("passport")}</span>
            </div>
            <div className="space-x-2">
              <Button variant="ghost" onClick={() => handleViewDocument(documents.passport.url, "passport")}>
                {t("view")}
              </Button>
              <Button variant="destructive" onClick={() => handleDeleteDocument("passport")}>
                {t("delete")}
              </Button>
            </div>
          </div>
        )}

        {documents?.residencyPermit && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Home className="w-8 h-8 p-1.5 bg-slate-300 text-black rounded-lg" />
              <span>{t("residencyPermit")}</span>
            </div>
            <div className="space-x-2">
              <Button
                variant="ghost"
                onClick={() => handleViewDocument(documents.residencyPermit.url, "residencyPermit")}
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
              <FileText className="w-8 h-8 p-1.5 bg-slate-300 text-black rounded-lg" />
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

        <UploadPersonalDocumentDialog onUploadSuccess={fetchDocuments} currentSignature={signature} />
      </CardContent>
    </Card>
  )
}

