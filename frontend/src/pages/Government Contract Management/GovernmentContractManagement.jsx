import {UploadDocuments} from "./UploadDocuments";
import { useTranslation } from "react-i18next";
export default function GovernmentManagement() {
  const { t } = useTranslation();
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold pl-4">{t("Upload Contracts")}</h1>
        <div className="flex items-center gap-2">
        </div>
      </div>
      <UploadDocuments/>
    </div>
  )
}
