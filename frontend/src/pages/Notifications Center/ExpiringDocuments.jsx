import PropTypes from "prop-types";
import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination } from "@/components/ui/Pagination";

/**
 * ExpiringDocuments component to display documents that are expiring within a month.
 * @param {Array} data - Array of expiring documents.
 */
function ExpiringDocuments({ data }) {
  const { t ,i18n} = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate total pages
  const totalPages = Math.ceil(data.length / itemsPerPage);

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
            <TableHead className={`${i18n.language === "ar" ? "text-right" : "text-left"}`}>{t("documentId")}</TableHead>
            <TableHead className={`${i18n.language === "ar" ? "text-right" : "text-left"}`}>{t("documentType")}</TableHead>
            <TableHead className={`${i18n.language === "ar" ? "text-right" : "text-left"}`}>{t("submitterId")}</TableHead>
            <TableHead className={`${i18n.language === "ar" ? "text-right" : "text-left"}`}>{t("expiringDate")}</TableHead>
            <TableHead className={`${i18n.language === "ar" ? "text-right" : "text-left"}`}>{t("role")}</TableHead>
            <TableHead className={`${i18n.language === "ar" ? "text-right" : "text-left"}`}>{t("action")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6}>{t("noExpiringDocuments")}</TableCell>
            </TableRow>
          ) : (
            paginatedData.map((doc) => {
              let expiryDateDisplay = t("notAvailable");
              try {
                const details = JSON.parse(doc.details);
                expiryDateDisplay = details.expiryDate
                  ? new Date(details.expiryDate).toLocaleDateString()
                  : t("notAvailable");
              } catch (err) {
                expiryDateDisplay = t("notAvailable");
              }

              return (
                <TableRow key={doc.id}>
                  <TableCell>{doc.id || t("notAvailable")}</TableCell>
                  <TableCell>{doc.type || t("notAvailable")}</TableCell>
                  <TableCell>{doc.submitter_id || t("notAvailable")}</TableCell>
                  <TableCell>{expiryDateDisplay}</TableCell>
                  <TableCell>{doc.role || t("notAvailable")}</TableCell>
                  <TableCell>{doc.action || t("notAvailable")}</TableCell>
                </TableRow>
              );
            })
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

ExpiringDocuments.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      type: PropTypes.string,
      submitter_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      details: PropTypes.string.isRequired, // JSON string containing expiryDate
      role: PropTypes.string,
      action: PropTypes.string, // last operation_type
    })
  ).isRequired,
};

export default ExpiringDocuments;
