import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { format, parseISO } from "date-fns";
import { enUS, arSA } from 'date-fns/locale';
import { ChevronDown } from 'lucide-react';

import {
  Card,
  CardContent,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

import { TIME_RANGES, LINES_CONFIG } from "./constants";
import { CustomTooltip } from "./CustomTooltip";
import { useChartData } from "./useChartData";

const formatYAxisTick = (value, language) => {
  if (Math.abs(value) >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)}B`;
  } else if (Math.abs(value) >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return `${value}`;
};

export function Overview({ data, className }) {
  const { t, i18n } = useTranslation();
  const [timeRange, setTimeRange] = useState("3M");
  const [selectedData, setSelectedData] = useState("all");
  const [lineVisibility, setLineVisibility] = useState(
    LINES_CONFIG.reduce((acc, line) => ({ ...acc, [line.dataKey]: true }), {})
  );

  const chartData = useChartData(data, timeRange);

  const visibleLines = useMemo(() => {
    if (selectedData === "all") {
      return LINES_CONFIG.filter(line => lineVisibility[line.dataKey]);
    }
    return LINES_CONFIG.filter(line => line.dataKey === selectedData);
  }, [selectedData, lineVisibility]);

  const handleDataSelection = (dataKey) => {
    setSelectedData(dataKey);
    if (dataKey === "all") {
      setLineVisibility(
        LINES_CONFIG.reduce((acc, line) => ({ ...acc, [line.dataKey]: true }), {})
      );
    } else {
      setLineVisibility(
        LINES_CONFIG.reduce((acc, line) => ({ ...acc, [line.dataKey]: line.dataKey === dataKey }), {})
      );
    }
  };

  const toggleLineVisibility = (dataKey) => {
    if (selectedData === "all") {
      setLineVisibility(prev => ({ ...prev, [dataKey]: !prev[dataKey] }));
    } else {
      setSelectedData("all");
      setLineVisibility(
        LINES_CONFIG.reduce((acc, line) => ({ ...acc, [line.dataKey]: true }), {})
      );
    }
  };

  const formatYAxis = useCallback((value) => {
    return formatYAxisTick(value, i18n.language);
  }, [i18n.language]);

  // Determine if the current language is RTL
  const isRTL = i18n.language === 'ar';

  return (
    <Card className={`${className} p-10 shadow-lg rounded-lg border-none`}>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2 sm:mb-0">
          {t('overview')}
        </CardTitle>
        <div className="flex items-center space-x-4 gap-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-[300px] justify-between dark:hover:bg-gray-200/5">
                {selectedData === "all" ? t('allData') : t(LINES_CONFIG.find(line => line.dataKey === selectedData)?.name)}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[200px] bg-popover hover:bg-popover" dir={isRTL ? 'rtl' : 'ltr'}>
              <DropdownMenuItem onSelect={() => handleDataSelection("all")}>
                {t('allData')}
              </DropdownMenuItem>
              {LINES_CONFIG.map(line => (
                <DropdownMenuItem key={line.dataKey} onSelect={() => handleDataSelection(line.dataKey)}>
                  {t(line.name)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Select value={timeRange} onValueChange={setTimeRange} dir={isRTL ? 'rtl' : 'ltr'}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder={t('selectRange')} />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(TIME_RANGES).map((range) => (
                <SelectItem key={range} value={range}>
                  {t(range)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col w-full">
        <div className="w-full h-80 sm:h-96">
          {/* Set the container's direction based on RTL */}
          <div style={{ direction: isRTL ? 'rtl' : 'ltr', width: '100%', height: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 20,
                  right: isRTL ? 30 : 20, // Adjust right margin for RTL
                  left: isRTL ? 20 : 30,   // Adjust left margin for LTR
                  bottom: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis
                  dataKey="report_date"
                  tickFormatter={(value) => format(parseISO(`${value}-01`), "MMM yyyy", { locale: isRTL ? arSA : enUS })}
                  padding={{ left: 10, right: 10 }}
                  tick={{ 
                    fontSize: 12, 
                    fill: "#ffffff", // Corrected color code
                    textAnchor: isRTL ? 'end' : 'middle', // Adjust as needed
                    dx: isRTL ? -10 : 0, // Adjust horizontal position if necessary
                  }}
                  axisLine={{ stroke: "#e0e0e0" }}
                  tickLine={false}
                  minTickGap={10}
                />
                <YAxis
                  orientation={isRTL ? 'right' : 'left'}
                  tickFormatter={formatYAxis}
                  tick={{ 
                    fontSize: 12, 
                    fill: "#ffffff", 
                    textAnchor: isRTL ? 'start' : 'end',
                    dx: isRTL ? 40 : -10, 
                  }}
                  axisLine={{ stroke: "#e0e0e0" }}
                  tickLine={false}
                  width={80}
                  allowDecimals={false}
                />
                <Tooltip 
                  content={<CustomTooltip />} 
                  wrapperStyle={{
                    direction: isRTL ? 'rtl' : 'ltr',
                  }}
                />
                {visibleLines.map((line, index) => (
                  <Line
                    key={line.dataKey}
                    type="monotone"
                    dataKey={line.dataKey}
                    name={t(line.name)}
                    stroke={line.stroke}
                    strokeWidth={2}
                    connectNulls
                    isAnimationActive={true}
                    animationDuration={1500}
                    animationEasing="ease-in-out"
                    animationBegin={index * 300}
                    dot={{ r: 3, stroke: line.stroke, strokeWidth: 1, fill: "#fff" }}
                    activeDot={{ r: 6, stroke: line.stroke, strokeWidth: 2, fill: "#fff" }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="w-full mt-4 flex flex-wrap justify-center">
          {LINES_CONFIG.map((line) => (
            <button
              key={line.dataKey}
              onClick={() => toggleLineVisibility(line.dataKey)}
              className={`flex items-center mr-4 mb-2 focus:outline-none ${
                lineVisibility[line.dataKey] ? 'opacity-100' : 'opacity-50'
              }`}
            >
              <span
                className="inline-block w-4 h-4 mr-2 rounded-full"
                style={{ backgroundColor: line.stroke }}
              ></span>
              <span className="text-md text-gray-700 dark:text-gray-300">
                {t(line.name)}
              </span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
