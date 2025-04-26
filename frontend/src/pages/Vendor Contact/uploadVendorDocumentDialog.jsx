import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import { toast } from '@/hooks/use-toast'

export function UploadVendorDocumentDialog({ vendorId, onUploadSuccess }) {
  const [isUploading, setIsUploading] = useState(false)
  const [documentType, setDocumentType] = useState("")
  const [file, setFile] = useState(null)
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file || !documentType) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append('documentType', documentType)
    formData.append('attachment', file)

    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/v1/vendors/${vendorId}`,
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          timeout: 30000,
          maxContentLength: 20 * 1024 * 1024,
        }
      )

      if (response.status >= 200 && response.status < 300) {
        setOpen(false)
        onUploadSuccess()
        toast({
          title: t("uploadSuccess"),
          description: t("fileUploadedSuccessfully"),
          variant: "success",
        })
      } else {
        throw new Error(response.data.message || 'Upload failed')
      }
    } catch (error) {
      console.error('Failed to upload:', error)
      toast({
        title: t("uploadFailed"),
        description: error.response?.data?.message || t("errorUploadingFile"),
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
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
        </DialogHeader>
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("documentType")}</label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger>
                <SelectValue placeholder={t("selectDocumentType")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CR">{t("crCertificate")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("file")}</label>
            <Input 
              type="file" 
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              accept=".pdf,.jpg,.jpeg,.png"
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

