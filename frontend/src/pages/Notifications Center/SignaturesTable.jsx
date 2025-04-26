import PropTypes from "prop-types";
import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination } from "@/components/ui/Pagination";

/**
 * OrdersTable component to display order audit logs with pagination.
 * @param {Array} data - Array of order audit log entries.
 */
function OrdersTable({ data }) {
  const { t, i18n } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate total pages
  const totalPages = useMemo(() => Math.ceil(data.length / itemsPerPage), [data.length, itemsPerPage]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  }, [data, currentPage, itemsPerPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className={`${i18n.language === "ar" ? "text-right" : "text-left"}`}>{t("orderID")}</TableHead>
            <TableHead className={`${i18n.language === "ar" ? "text-right" : "text-left"}`}>{t("submitterId")}</TableHead>
            <TableHead className={`${i18n.language === "ar" ? "text-right" : "text-left"}`}>{t("date")}</TableHead>
            <TableHead className={`${i18n.language === "ar" ? "text-right" : "text-left"}`}>{t("role")}</TableHead>
            <TableHead className={`${i18n.language === "ar" ? "text-right" : "text-left"}`}>{t("action")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                {t("noOrderLogs")}
              </TableCell>
            </TableRow>
          ) : (
            paginatedData.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{log.order_id || t("notAvailable")}</TableCell>
                <TableCell>{log.submitter_id || t("notAvailable")}</TableCell>
                <TableCell>
                  {log.timestamp ? new Date(log.timestamp).toLocaleDateString() : t("notAvailable")}
                </TableCell>
                <TableCell>{log.role || t("notAvailable")}</TableCell>
                <TableCell>{log.operation_type || t("notAvailable")}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}

OrdersTable.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      order_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      submitter_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      timestamp: PropTypes.string,
      role: PropTypes.string,
      operation_type: PropTypes.string,
    })
  ).isRequired,
};

export default OrdersTable;
