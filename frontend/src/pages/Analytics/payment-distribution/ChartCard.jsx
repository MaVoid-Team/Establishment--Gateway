import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { COLORS, formatNumber } from './paymentUtils';
import { useTranslation } from 'react-i18next';

const ChartCard = ({
  title,
  data,
  stats,
  showTypeSelect,
  selectedType,
  setSelectedType,
  documentTypes,
  showDollarSign = true,
  context
}) => {
  const { t, i18n } = useTranslation();

  const CustomTooltip = useMemo(() => {
    return ({ active, payload }) => {
      if (active && payload && payload.length) {
        const dataItem = payload[0].payload;
        const color = COLORS[payload[0].index % COLORS.length];
        return (
          <div className=" p-4 border-none rounded-lg shadow-lg bg-slate-800" style={{ borderColor: color }} dir={i18n.language === "ar" ? "rtl" : "ltr"}>
            <p className="font-semibold text-left" style={{ color }}>{t(dataItem.name)}</p>
            <p className="text-muted-foreground" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
              {t('value')} : {formatNumber(dataItem.value)} {showDollarSign ? t('SAR') : ''}
            </p>
          </div>
        );
      }
      return null;
    };
  }, [t, i18n.language, showDollarSign]);

  const isSpecificTypeSelected = showTypeSelect && selectedType !== "all";
  const noDataMessage = useMemo(() => {
    return isSpecificTypeSelected
      ? `${t('noDataForContractType')}${selectedType}".`
      : t('noDataAvailable');
  }, [isSpecificTypeSelected, selectedType, t]);

  const sortedData = useMemo(() => {
    return [...data]
      .filter(item => item.value > 0) // Filter out zero values
      .sort((a, b) => b.value - a.value);
  }, [data]);

  const maxIndividualSlices = 6;
  const topData = sortedData.slice(0, maxIndividualSlices);
  const remainingData = sortedData.slice(maxIndividualSlices);
  const othersValue = remainingData.reduce((sum, item) => sum + item.value, 0);

  const chartData = useMemo(() => {
    const result = [...topData];
    if (othersValue > 0) {
      result.push({ name: 'Others', value: othersValue });
    }
    return result;
  }, [topData, othersValue]);

  const getHumanReadableStats = useMemo(() => {
    const totalItems = data.length;
    const totalValue = stats.total;
    const avgValue = stats.avg;

    return `${totalItems} ${t('items')}, ${t('total')} ${showDollarSign ? '$' : ''}${formatNumber(totalValue)}${avgValue ? `, ${t('avg')} ${showDollarSign ? '$' : ''}${formatNumber(avgValue)}${t('perItem')}.` : '.'}`;
  }, [data.length, stats.total, stats.avg, showDollarSign, t]);

  const pieChartLabel = useMemo(() => {
    return ({ name, percent }) => {
      const percentFormatted = (percent * 100).toFixed(0);
      return `${t(name)}  %${percentFormatted}`;
    };
  }, [t]);

  return (
    <Card className="hover:shadow-sm transition-shadow border bg-card">
      <CardHeader dir={i18n.language === "ar" ? "rtl" : "ltr"} className="pb-2 space-y-2">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">
              {title}
            </CardTitle>
            <CardDescription className="text-sm line-clamp-2">
              {context}
            </CardDescription>
          </div>
          
          {showTypeSelect && setSelectedType && (
            <Select 
              value={selectedType} 
              onValueChange={setSelectedType}
              dir={i18n.language === "ar" ? "rtl" : "ltr"}
            >
              <SelectTrigger className="md:w-[180px]">
                <SelectValue placeholder={t('selectContractType')} />
              </SelectTrigger>
              <SelectContent>
                {documentTypes?.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type === "all" ? t('allTypes') : t(`${type}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        
        <CardDescription className="text-xs text-muted-foreground">
          {getHumanReadableStats}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {chartData.length > 0 ? (
          <>
            <div className="h-[200px] md:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip 
                    content={<CustomTooltip showDollarSign={showDollarSign} />} 
                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  />
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={pieChartLabel}
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        stroke="var(--background)"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 grid grid-cols-1 gap-2">
              {chartData.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-2 rounded-md bg-muted/10"
                  dir={i18n.language === "ar" ? "rtl" : "ltr"}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full shrink-0" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm line-clamp-1">
                      {t(item.name)}
                    </span>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className="px-2 py-1 text-xs font-medium"
                  >
                    {formatNumber(item.value)}{showDollarSign ? t('SAR') : ''}
                  </Badge>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex justify-center items-center h-[200px] text-muted-foreground text-sm">
            {noDataMessage}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChartCard;

