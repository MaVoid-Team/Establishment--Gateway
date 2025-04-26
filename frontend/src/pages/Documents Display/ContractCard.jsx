// ContractCard.jsx

"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, Eye, Pencil, AlertCircle, CheckCircle, XCircle, Building, FileText } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useNavigate } from "react-router-dom"

const statusIcons = {
  "expiringsoon": <AlertCircle className="h-5 w-5" />,
  "active": <CheckCircle className="h-5 w-5" />,
  "expired": <XCircle className="h-5 w-5" />,
}

const statusColors = {
  "expiringsoon": "bg-yellow-100 text-yellow-800",
  "active": "bg-green-100 text-green-800",
  "expired": "bg-red-100 text-red-800",
}
const apiURL = import.meta.env.VITE_API_URL;

export default function ContractCard({
  id,
  title,
  status,
  startDate,
  endDate,
  UnitDeliveryDate,
  details,
  attachment,
  client,
  type,
  companyDetails,
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(t('locale'), {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Card className="w-full max-w-md transition-all duration-300 ease-in-out hover:shadow-lg dark:hover:shadow-primary/25">
      <CardHeader className="relative">
        <div className="absolute top-4 right-4 z-10">
          <Badge
            variant="secondary"
            className={`${statusColors[status.toLowerCase().replace(" ", "")]} flex items-center gap-1 px-2 py-1`}
          >
            {statusIcons[status.toLowerCase().replace(" ", "")]}
            <span className="text-xs font-semibold">
              {t(`MainStatus.${status.toLowerCase().replace(" ", "")}`)}
            </span>
          </Badge>
        </div>
        <div className="relative w-full h-[280px] bg-muted rounded-t-sm overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Skeleton className="w-full h-full" />
            </div>
          )}
          {attachment?.url? (
            <iframe
              src={`${apiUrl}${attachment.url}`}
              className="w-full h-full"
              title={t("contractPDF")}
              onLoad={() => setIsLoading(false)}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <FileText className="h-16 w-16 text-muted-foreground/50" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div>
          <h3 className="text-xl font-bold mb-2 line-clamp-2">{title}</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <InfoItem
            icon={<Building className="h-4 w-4" />}
            label={t("client")}
            value={client}
          />
          <InfoItem
            icon={<FileText className="h-4 w-4" />}
            label={t("type")}
            value={type}
          />
          <InfoItem
            icon={<Calendar className="h-4 w-4" />}
            label={t("startDate")}
            value={startDate ? formatDate(startDate) : t("na")}
          />
          <InfoItem
            icon={<Calendar className="h-4 w-4" />}
            label={t("endDate")}
            value={endDate ? formatDate(endDate) : t("na")}
          />
        </div>

      </CardContent>

      <CardFooter className="flex justify-between gap-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate(`/government-summary/${id}`)}
              >
                <Eye className="h-4 w-4 mr-2" /> {t("view")}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("viewContractDetails")}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button className="w-full">
                <Pencil className="h-4 w-4 mr-2" /> {t("edit")}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("editContractDetails")}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardFooter>
    </Card>
  )
}

function InfoItem({ icon, label, value, highlight }) {
  return (
    <div className="flex items-start space-x-2">
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <div className="flex-1">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className={`capitalize text-sm ${highlight ? "font-semibold" : ""}`}>{value}</p>
      </div>
    </div>
  )
}
