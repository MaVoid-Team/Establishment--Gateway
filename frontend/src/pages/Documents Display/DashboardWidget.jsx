import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const DashboardWidget = ({ title, count, icon }) => {
  const { t } = useTranslation();

  return (
    <Card className="transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl hover:scale-105 border-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{t(title)}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{count}</div>
      </CardContent>
    </Card>
  )
}

export default DashboardWidget

