"use client"

import { useState, useEffect, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload } from "lucide-react"
import { useTranslation } from "react-i18next"
import axios from "axios"
import { toast } from "@/hooks/use-toast"

export function UploadDocumentDialog({ employeeId, onUploadSuccess }) {
  const [isUploading, setIsUploading] = useState(false)
  const [documentType, setDocumentType] = useState("")
  const [file, setFile] = useState(null)
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [existingSignature, setExistingSignature] = useState(null)
  const apiUrl = import.meta.env.VITE_API_URL
  const fileInputRef = useRef(null) 
  
  useEffect(() => {
    fetchEmployeeData()
    if (!open) {
      setFile(null)
      setDocumentType("")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }, [open])

  const fetchEmployeeData = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/v1/employees/${employeeId}`, {
        withCredentials: true,
      })
      const employee = response.data.data.employee

      if (employee.signature) {
        setExistingSignature(employee.signature)
      }
    } catch (error) {
      console.error("Failed to fetch employee data:", error)
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!documentType || !file) {
      toast({
        title: t("error"),
        description: t("pleaseSelectFileAndDocumentType"),
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      let response

      if (documentType === "signature") {
        const reader = new FileReader()
        reader.onloadend = async () => {
          const base64String = reader.result
          response = await axios.patch(
            `${apiUrl}/api/v1/employees/${employeeId}`,
            { signature: base64String },
            {
              withCredentials: true,
              headers: {
                "Content-Type": "application/json",
              },
            },
          )

          handleUploadSuccess(response)
        }
        reader.readAsDataURL(file)
      } else {
        const formData = new FormData()
        formData.append("documentType", documentType)
        formData.append("attachment", file)

        response = await axios.patch(`${apiUrl}/api/v1/employees/${employeeId}/documents`, formData, {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })

        handleUploadSuccess(response)
      }
    } catch (error) {
      handleUploadError(error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleUploadSuccess = (response) => {
    if (response.status >= 200 && response.status < 300) {
      setOpen(false)
      onUploadSuccess?.()
      toast({
        title: t("uploadSuccess"),
        description: t("fileUploadedSuccessfully"),
        variant: "success",
      })
      setFile(null)
      setDocumentType("")
    } else {
      throw new Error("Upload failed")
    }
  }

  const handleUploadError = (error) => {
    console.error("Upload failed:", error)
    let errorMessage = t("errorUploadingFile")
    if (error.response) {
      if (error.response.status === 403) {
        errorMessage = t("uploadForbidden")
      } else {
        errorMessage = error.response.data?.message || t("errorUploadingFile")
      }
    }
    toast({
      title: t("uploadFailed"),
      description: errorMessage,
      variant: "destructive",
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full mt-4" variant="outline">
          <Upload className="w-4 h-4 mr-2" />
          {t("uploadNewFile")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("uploadFile")}</DialogTitle>
          <DialogDescription>{t("selectDocumentTypeAndChooseFile")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("documentType")}</label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger>
                <SelectValue placeholder={t("selectDocumentType")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nationalId">{t("nationalId")}</SelectItem>
                <SelectItem value="passport">{t("passport")}</SelectItem>
                <SelectItem value="residencyPermit">{t("residencyPermit")}</SelectItem>
                <SelectItem value="signature">{t("signature")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
          <label className="text-sm font-medium">{t("file")}</label>
          <Input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0])}
            accept={documentType === "signature" ? "image/*" : ".pdf,.jpg,.jpeg,.png,image/*"}
            ref={fileInputRef}
            />
          </div>
          <Button type="submit" disabled={isUploading || !file || !documentType}>
            {isUploading ? t("uploading") : t("upload")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

