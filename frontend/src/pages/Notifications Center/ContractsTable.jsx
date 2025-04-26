import PropTypes from "prop-types";
import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination } from "@/components/ui/Pagination";

function ContractsTable({ data }) {
  const { t, i18n } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  }, [data, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className={`${i18n.language === "ar" ? "text-right" : "text-left"}`}>{t("documentId")}</TableHead>
            <TableHead className={`${i18n.language === "ar" ? "text-right" : "text-left"}`}>{t("documentType")}</TableHead>
            <TableHead className={`${i18n.language === "ar" ? "text-right" : "text-left"}`}>{t("clientName")}</TableHead>
            <TableHead className={`${i18n.language === "ar" ? "text-right" : "text-left"}`}>{t("date")}</TableHead>
            <TableHead className={`${i18n.language === "ar" ? "text-right" : "text-left"}`}>{t("performedBy")}</TableHead>
            <TableHead className={`${i18n.language === "ar" ? "text-right" : "text-left"}`}>{t("action")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6}>{t("noAuditLogsFound")}</TableCell>
            </TableRow>
          ) : (
            paginatedData.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{log.sales_contract_id || t("notAvailable")}</TableCell>
                <TableCell>{log.new_data?.type || t("notAvailable")}</TableCell>
                <TableCell>{log.new_data?.client || t("notAvailable")}</TableCell>
                <TableCell>
                  {log.timestamp
                    ? new Date(log.timestamp).toLocaleDateString()
                    : t("notAvailable")}
                </TableCell>
                <TableCell>{log.performer?.name || t("notAvailable")}</TableCell>
                <TableCell>{log.operation_type || t("notAvailable")}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}

ContractsTable.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      sales_contract_id: PropTypes.number,
      new_data: PropTypes.shape({
        type: PropTypes.string,
        client: PropTypes.string,
      }),
      timestamp: PropTypes.string,
      performer: PropTypes.shape({
        name: PropTypes.string,
      }),
      operation_type: PropTypes.string,
    })
  ).isRequired,
};

export default ContractsTable;