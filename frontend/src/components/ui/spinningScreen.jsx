import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function SpinningScreen() {
    const {t} = useTranslation();
  return (
    <div className="flex items-center justify-center h-[80vh] bg-inherit">
     
      <div className="flex flex-col items-center space-y-4 p-8 bg-white bg-opacity-80 dark:bg-[#222222] dark:bg-opacity-80 rounded-2xl shadow-2xl">
        <Loader2 className="h-12 w-12 text-yellow-600 animate-spin" />
        <h1 className="text-2xl font-bold text-yellow-700 dark:text-yellow-500">
          {t("loading")}
        </h1>
        <p className="text-sm text-gray-700 dark:text-gray-100">
          {t("PleaseWait")}
        </p>
      </div>
    </div>
  );
}
