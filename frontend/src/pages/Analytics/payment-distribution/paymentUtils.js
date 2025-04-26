import { subMonths } from 'date-fns';
import i18next from 'i18next';

export const COLORS = [
  "var(--pie-chart-1, #0073e6)",
  "var(--pie-chart-2, #82ca9d)",
  "var(--pie-chart-3, #ffc658)",
  "var(--pie-chart-4, #d0ed57)",
  "var(--pie-chart-5, #a4de6c)",
  "var(--pie-chart-6, #8dd1e1)",
  "var(--pie-chart-7, #83a6ed)",
  "var(--pie-chart-8, #8e4585)",
];

export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';

  const absNum = Math.abs(num);

  if (absNum >= 1.0e+9) {
    return (num / 1.0e+9).toFixed(1).replace(/\.0$/, '') + i18next.t('billion');
  } 
  if (absNum >= 1.0e+6) {
    return (num / 1.0e+6).toFixed(1).replace(/\.0$/, '') + i18next.t('million');
  } 
  if (absNum >= 1.0e+3) {
    return (num / 1.0e+3).toFixed(1).replace(/\.0$/, '') + i18next.t('thousand');
  }
  
  return new Intl.NumberFormat(i18next.language).format(num);
};

export const safeParseDate = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;
  return date;
};

export const filterDocuments = (documents, selectedMonths) => {
  if (selectedMonths === "all") return documents;

  const monthsNumber = parseInt(selectedMonths, 10);
  const cutoffDate = subMonths(new Date(), monthsNumber);

  return documents.filter((doc) => {
    const docDate = safeParseDate(doc.updated_at || doc.created_at);
    if (!docDate) return false;
    return docDate >= cutoffDate;
  });
};

export const aggregateData = (documents, selectedType) => {
  const typeMap = {};
  const entityMap = {};

  documents.forEach((doc) => {
    if (selectedType !== "all" && doc.type.toLowerCase() !== selectedType.toLowerCase()) return;

    const { companyDetails, vendorDetails, modified_contract_value, type } = doc;
    const revenue = parseFloat(modified_contract_value) || 0;

    const typeKey = type.toLowerCase();
    typeMap[typeKey] = (typeMap[typeKey] || 0) + revenue;

    let entityName;
    if (companyDetails) {
      entityName = (companyDetails.name || "Unknown Company").toUpperCase();
    } else if (vendorDetails) {
      entityName = (vendorDetails.name || "Unknown Vendor").toUpperCase();
    } else {
      entityName = "UNASSIGNED";
    }
    entityMap[entityName] = (entityMap[entityName] || 0) + revenue;
  });

  return { typeMap, entityMap };
};

export const prepareChartData = (aggregatedData, chartType) => {
  const dataMap = chartType === 'type' ? aggregatedData.typeMap : aggregatedData.entityMap;
  return Object.entries(dataMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
};

export const calculateStats = (data) => {
  if (!data || data.length === 0) return { total: 0, avg: 0, change: 0 };
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const avg = total / data.length;
  const change = 0; // Placeholder for change calculation
  return { total, avg, change };
};

export const prepareSalesContractsData = (salesContracts) => {
  return salesContracts
    .filter(contract => contract.name && contract.total_paid && contract.created_at)
    .map(contract => ({
      name: translateContractType(contract.name),
      value: parseFloat(contract.total_paid) || 0,
      createdAt: contract.created_at
    }))
    .sort((a, b) => b.value - a.value);
};

export const filterSalesContracts = (salesContracts, selectedMonths) => {
  if (selectedMonths === "all") return salesContracts;

  const monthsNumber = parseInt(selectedMonths, 10);
  const cutoffDate = subMonths(new Date(), monthsNumber);

  return salesContracts.filter((contract) => {
    const contractDate = safeParseDate(contract.createdAt);
    if (!contractDate) return false;
    return contractDate >= cutoffDate;
  });
};

export const prepareSalesContractsStatusData = (salesContracts) => {
  const statusCounts = salesContracts.reduce((acc, contract) => {
    const status = translateStatus(contract.status || 'Unknown');
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(statusCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
};

export const prepareTicketStatusData = (tickets) => {
  const awaitingResponse = tickets.filter(
    (ticket) => ticket.status.status_name === "Open"
  ).length;
  const resolvedTickets = tickets.filter(
    (ticket) => ticket.status.status_name === "Resolved"
  ).length;

  return [
    { name: translateStatus("Unresolved"), value: awaitingResponse },
    { name: translateStatus("Resolved"), value: resolvedTickets }
  ];
};

export const prepareLegalServicesStatusData = (legalServices) => {
  const unresolvedServices = legalServices.filter(
    (service) => service.status.status_name === "Open" || service.status.status_name === "In Progress"
  ).length;
  const resolvedServices = legalServices.filter(
    (service) => service.status.status_name === "Resolved"
  ).length;

  return [
    { name: translateStatus("Unresolved"), value: unresolvedServices },
    { name: translateStatus("Resolved"), value: resolvedServices }
  ];
};

export const translateStatus = (status) => {
  return i18next.t(`${status}`);
};

export const translateContractType = (contractType) => {
  return i18next.t(`${contractType}`);
};

export const calculateAverages = (documents) => {
  const typeMap = {};

  documents.forEach((doc) => {
    const { type, amount_paid, amount_due } = doc;
    if (!typeMap[type]) {
      typeMap[type] = { totalPaid: 0, totalDue: 0, count: 0 };
    }
    typeMap[type].totalPaid += amount_paid || 0;
    typeMap[type].totalDue += amount_due || 0;
    typeMap[type].count++;
  });

  return Object.entries(typeMap).map(([type, data]) => ({
    name: type,
    avgPaid: data.totalPaid / data.count,
    avgDue: data.totalDue / data.count
  }));
};

export const prepareAverageChartData = (averages, dataType) => {
  return averages.map(item => ({
    name: item.name,
    value: dataType === 'paid' ? item.avgPaid : item.avgDue
  }));
};

export const prepareAmountPaidVsDueData = (documents, selectedType) => {
  const filteredDocs = selectedType === 'all' 
    ? documents 
    : documents.filter(doc => doc.type === selectedType);

  const totalPaid = filteredDocs.reduce((sum, doc) => sum + (doc.amount_paid || 0), 0);
  const totalDue = filteredDocs.reduce((sum, doc) => sum + (doc.amount_due || 0), 0);

  return [
    { name: 'Amount Paid', value: totalPaid },
    { name: 'Amount Due', value: totalDue }
  ];
};

