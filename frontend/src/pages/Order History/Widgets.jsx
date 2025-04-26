import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Widgets = ({ statusCounts }) => {
  const { t } = useTranslation();

  return (
    <div className=" grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-6">
      <Card className=" transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl hover:scale-105 border-none rounded-sm shadow-black/30 hover:shadow-black/30 backdrop-blur-lg">
        <CardHeader className="bg-yellow-500 text-white rounded-t-sm">
          <CardTitle>{t('pendingApproval')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl text-black dark:text-white font-bold mt-2">{statusCounts["pending"] || 0}</p>
        </CardContent>
      </Card>
      <Card className=" transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl hover:scale-105 border-none  shadow-black/30 hover:shadow-black/30 rounded-sm backdrop-blur-lg">
        <CardHeader className="bg-green-500 text-white rounded-t-sm ">
          <CardTitle>{t('approved')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl text-black dark:text-white font-bold mt-2">{statusCounts["approved"] || 0}</p>
        </CardContent>
      </Card>
      <Card className="transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl hover:scale-105 border-none  shadow-black/30 hover:shadow-black/30 rounded-sm backdrop-blur-lg">
        <CardHeader className="bg-red-500 text-white rounded-t-sm">
          <CardTitle>{t('rejected')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl text-black dark:text-white font-bold mt-2">{statusCounts["rejected"] || 0}</p>
        </CardContent>
      </Card>
      <Card className="  transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl hover:scale-105 border-none rounded-sm shadow-black/30 hover:shadow-black/30 backdrop-blur-lg">
        <CardHeader className="bg-blue-500 text-white rounded-t-sm">
          <CardTitle>{t('workInProgress')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl text-black dark:text-white font-bold mt-2">{statusCounts["work_in_progress"]}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Widgets;
