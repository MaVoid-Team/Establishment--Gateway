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
import { Upload, Edit } from "lucide-react"
import { useTranslation } from "react-i18next"
import axios from "axios"
import { toast } from "@/hooks/use-toast"
import SignaturePad from "react-signature-canvas"

export function UploadPersonalDocumentDialog({ onUploadSuccess, currentSignature }) {
  const [isUploading, setIsUploading] = useState(false)
  const [documentType, setDocumentType] = useState("")
  const [file, setFile] = useState(null)
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [signatureType, setSignatureType] = useState("draw")
  const [isEditingSignature, setIsEditingSignature] = useState(false)
  const [showSignatureError, setShowSignatureError] = useState(false)
  const signaturePadRef = useRef(null)
  const apiUrl = import.meta.env.VITE_API_URL
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!open) {
      resetForm()
    }
  }, [open])

  const resetForm = () => {
    setDocumentType("")
    setFile(null)
    setSignatureType("draw")
    setIsEditingSignature(false)
    setShowSignatureError(false)
    if (signaturePadRef.current) {
      signaturePadRef.current.clear()
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!documentType) return

    setIsUploading(true)
    setShowSignatureError(false)

    try {
      if (documentType === "signature") {
        let signatureData
        if (signatureType === "draw") {
          if (signaturePadRef.current?.isEmpty() && !currentSignature) {
            setShowSignatureError(true)
            throw new Error("Signature is required.")
          }
          signatureData = signaturePadRef.current?.isEmpty() ? null : signaturePadRef.current?.toDataURL()
        } else if (signatureType === "upload" && file) {
          signatureData = await new Promise((resolve) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result)
            reader.readAsDataURL(file)
          })
        } else if (currentSignature && !isEditingSignature) {
          signatureData = currentSignature
        } else {
          throw new Error("Invalid signature type or missing signature.")
        }

        await axios.patch(
          `${apiUrl}/api/v1/employees/myData`,
          { signature: signatureData },
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          },
        )
      } else {
        const formData = new FormData()
        formData.append("attachment", file)
        formData.append("documentType", documentType)

        await axios.patch(`${apiUrl}/api/v1/employees/myData`, formData, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        })
      }

      setOpen(false)
      resetForm()
      onUploadSuccess?.()
      toast({
        title: t("uploadSuccess"),
        description: t("fileUploadedSuccessfully"),
        variant: "success",
      })
    } catch (error) {
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
    } finally {
      setIsUploading(false)
    }
  }

  const renderSignatureContent = () => {
    if (currentSignature && !isEditingSignature) {
      return (
        <div className="space-y-2">
          <img src={currentSignature || "/placeholder.svg"} alt="Current Signature" className="max-w-full h-auto" />
          <Button onClick={() => setIsEditingSignature(true)}>
            <Edit className="w-4 h-4 mr-2" />
            {t("editSignature")}
          </Button>
        </div>
      )
    }

    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">{t("signatureType")}</label>
        <Select value={signatureType} onValueChange={setSignatureType}>
          <SelectTrigger>
            <SelectValue placeholder={t("selectSignatureType")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draw">{t("draw")}</SelectItem>
            <SelectItem value="upload">{t("upload")}</SelectItem>
          </SelectContent>
        </Select>
        {signatureType === "draw" && (
          <div className="border p-2">
            <SignaturePad 
              ref={signaturePadRef} 
              canvasProps={{
                className: "signature-canvas",
                width: 400,
                height: 200,
                style: { width: '100%', height: '100%' }
              }} 
            />
            <Button type="button" onClick={() => signaturePadRef.current?.clear()} className="mt-2">
              {t("clear")}
            </Button>
          </div>
        )}
        {signatureType === "upload" && (
          <Input type="file" onChange={(e) => setFile(e.target.files?.[0])} accept="image/*" />
        )}
        {showSignatureError && <p className="text-red-500">{t("signatureRequired")}</p>}
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" variant="outline">
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
          {documentType === "signature" ? (
            renderSignatureContent()
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("file")}</label>
              <Input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0])}
                accept={documentType === "signature" ? "image/*" : ".pdf,.jpg,.jpeg,.png,image/*"}
                ref={fileInputRef}
              />
            </div>
          )}
          <Button
            type="submit"
            disabled={
              isUploading ||
              (documentType !== "signature" && !file) ||
              (documentType === "signature" &&
                signatureType === "draw" &&
                signaturePadRef.current?.isEmpty() &&
                !currentSignature) ||
              !documentType
            }
          >
            {isUploading ? t("uploading") : t("upload")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

