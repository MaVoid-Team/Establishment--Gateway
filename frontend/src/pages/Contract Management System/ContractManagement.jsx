import { useTranslation } from "react-i18next";
import { UploadSalesContract } from "./UploadSalesContract";

export default function ContractManagement() {
  const { t ,i18n} = useTranslation();

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">{t("Upload Sales Contracts")}</h1>
        <div className="flex items-center gap-2"></div>
      </div>
      <UploadSalesContract />
    </div>
  );
}
