import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, PieChartIcon, FileText, Calculator } from 'lucide-react';
import { usePaymentData } from './usePaymentData';
import { 
  filterDocuments, 
  aggregateData, 
  prepareChartData, 
  calculateStats, 
  prepareSalesContractsData, 
  filterSalesContracts,
  prepareSalesContractsStatusData,
  prepareTicketStatusData,
  prepareLegalServicesStatusData,
  translateContractType,
  prepareAmountPaidVsDueData
} from './paymentUtils';
import ChartCard from './ChartCard';
import StatCard from './StatCard';
import { useTranslation } from 'react-i18next';
import SpinningScreen from "@/components/ui/spinningScreen";

export function PaymentDistribution({ className }) {
  const { t, i18n } = useTranslation();
  const { data, error, isLoading } = usePaymentData();
  const [selectedMonths, setSelectedMonths] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [firstChartData, setFirstChartData] = useState([]);

  const dateOptions = [
    { label: t('allTimeData'), value: "all" },
    { label: t('last3Months'), value: "3" },
    { label: t('last6Months'), value: "6" },
    { label: t('last12Months'), value: "12" },
  ];

  const filteredDocuments = useMemo(() => filterDocuments(data.documents, selectedMonths), [data.documents, selectedMonths]);
  const aggregatedData = useMemo(() => aggregateData(filteredDocuments, selectedType), [filteredDocuments, selectedType]);

  const [selectedEntityType, setSelectedEntityType] = useState("all");
  const [selectedPaidDueType, setSelectedPaidDueType] = useState("all");
  const filteredEntityDocuments = useMemo(() => 
    filterDocuments(data.documents, selectedMonths), 
    [data.documents, selectedMonths]
  );
  const filteredPaidDueDocuments = useMemo(() => 
    filterDocuments(data.documents, selectedMonths), 
    [data.documents, selectedMonths]
  );
  
  const typeChartData = useMemo(() => {
    if (selectedType === 'all') return firstChartData;
    const aggregated = aggregateData(filteredDocuments, selectedType);
    return prepareChartData(aggregated, 'type');
  }, [filteredDocuments, selectedType, firstChartData]);

  const entityChartData = useMemo(() => 
    prepareChartData(aggregateData(filteredEntityDocuments, selectedEntityType), 'entity'), 
    [filteredEntityDocuments, selectedEntityType]
  );

  
  const typeStats = useMemo(() => calculateStats(typeChartData), [typeChartData]);
  const entityStats = useMemo(() => calculateStats(entityChartData), [entityChartData]);

  const documentTypes = useMemo(() => ["all", ...new Set(data.documents.map(doc => doc.type).filter(type => type))], [data.documents]);

  const amountPaidVsDueData = useMemo(() => 
    prepareAmountPaidVsDueData(filteredPaidDueDocuments, selectedPaidDueType), 
    [filteredPaidDueDocuments, selectedPaidDueType]
  );

  useEffect(() => {
    const allTypesData = aggregateData(filteredDocuments, 'all');
    const typeChartDataAll = prepareChartData(allTypesData, 'type');
    setFirstChartData(typeChartDataAll);
  }, [filteredDocuments]);

  const filteredSalesContracts = useMemo(() => {
    return filterSalesContracts(data.salesContracts, selectedMonths);
  }, [data.salesContracts, selectedMonths]);

  const salesContractsData = useMemo(() => {
    return prepareSalesContractsData(filteredSalesContracts);
  }, [filteredSalesContracts]);

  const salesContractsStats = useMemo(() => calculateStats(salesContractsData), [salesContractsData]);

  const salesContractsStatusData = useMemo(() => {
    return prepareSalesContractsStatusData(filteredSalesContracts);
  }, [filteredSalesContracts]);

  const ticketStatusData = useMemo(() => {
    return prepareTicketStatusData(data.tickets);
  }, [data.tickets]);

  const legalServicesStatusData = useMemo(() => {
    return prepareLegalServicesStatusData(data.legalServices);
  }, [data.legalServices]);

  if (isLoading) {
    return (
      <Card className={`${className} p-4 max-h-[600px] border-none`}>
        <CardContent>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center h-full"
          >
            <SpinningScreen />
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`${className} p-4 max-h-[600px] border-none`}>
        <CardContent>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center h-full"
          >
            <p className="text-destructive">{error}</p>
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  const hasData = typeChartData.length > 0 || entityChartData.length > 0 || salesContractsData.length > 0 || salesContractsStatusData.length > 0 || ticketStatusData.length > 0 || legalServicesStatusData.length > 0;

  return (
    <Card className={`${className} p-6 bg-background border-none`}>
      <CardHeader className="px-0 space-y-1">
        <div className="flex justify-between items-start gap-4 flex-wrap">
          <div>
            <CardTitle className="text-2xl font-bold">{t('paymentDistribution')}</CardTitle>
            <CardDescription className="text-muted-foreground">{t('amountSpentDistributionAnalysis')}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Select value={selectedMonths} onValueChange={setSelectedMonths} dir={i18n.language === "ar" ? "rtl" : "ltr"}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('selectDateRange')} />
              </SelectTrigger>
              <SelectContent>
                {dateOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="px-0">
        <AnimatePresence>
          {!hasData ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex justify-center items-center h-[400px] text-muted-foreground"
            >
              {t('noRevenueData')}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="overview">{t('overview')}</TabsTrigger>
                  <TabsTrigger value="details">{t('detailedView')}</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <StatCard
                      title={t('totalAmountSpent')}
                      value={entityStats.total}
                      change={entityStats.change}
                      icon={<DollarSign className="h-6 w-6 text-green-500" />}
                    />
                    <StatCard
                      title={t('avgAmountSpent')}
                      value={entityStats.avg}
                      change={typeStats.change}
                      icon={<Calculator className="h-6 w-6 text-blue-500" />}
                    />
                    <StatCard
                      title={t('totalSalesContracts')}
                      value={salesContractsStats.total}
                      change={salesContractsStats.change}
                      icon={<FileText className="h-6 w-6 text-purple-500" />}
                    />
                    
                    <StatCard
                      title={t('avgSalesContracts')}
                      value={salesContractsStats.avg}
                      change={salesContractsStats.change}
                      icon={<PieChartIcon className="h-6 w-6 text-orange-500" />}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="details" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <ChartCard
                      title={t('amountSpentByDocumentType')}
                      data={firstChartData.map(item => ({ ...item, name: translateContractType(item.name) }))}
                      stats={calculateStats(firstChartData)}
                      context={t('documentTypeBreakdown')}
                    />
                    <ChartCard
                      title={t('amountSpentByEntity')}
                      data={entityChartData}
                      stats={calculateStats(entityChartData)}
                      showTypeSelect={true}
                      selectedType={selectedEntityType}
                      setSelectedType={setSelectedEntityType}
                      documentTypes={documentTypes}
                      context={t('entitySpendingDistribution')}
                    />
                    <ChartCard
                      title={t('salesContracts')}
                      data={salesContractsData}
                      stats={salesContractsStats}
                      context={t('salesContractsOverview')}
                    />
                    <ChartCard
                      title={t('amountPaidVsDue')}
                      data={amountPaidVsDueData}
                      stats={calculateStats(amountPaidVsDueData)}
                      showTypeSelect={true}
                      selectedType={selectedPaidDueType}
                      setSelectedType={setSelectedPaidDueType}
                      documentTypes={documentTypes}
                      context={t('amountPaidVsDueContext')}
                    />
                    <ChartCard 
                      title={t('salesContractsStatus')}
                      data={salesContractsStatusData}
                      stats={{ total: calculateStats(salesContractsStatusData).total }}
                      showDollarSign={false}
                      context={t('salesContractsStatusOverview')}
                    />
                    <ChartCard
                      title={t('ticketStatusDistribution')}
                      data={ticketStatusData}
                      stats={{ total: calculateStats(ticketStatusData).total }}
                      showDollarSign={false}
                      context={t('ticketStatusDistributionOverview')}
                    />
                    <ChartCard
                      title={t('legalServicesStatus')}
                      data={legalServicesStatusData}
                      stats={{ total: calculateStats(legalServicesStatusData).total }}
                      showDollarSign={false}
                      context={t('legalServicesStatusOverview')}
                    />
                    
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

export default PaymentDistribution;

