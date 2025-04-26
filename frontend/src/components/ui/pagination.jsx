import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

export function Pagination({ currentPage, totalPages, onPageChange }) {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const getVisiblePages = () => {
    if (totalPages <= 5) {
      return [...Array(totalPages).keys()].map((x) => x + 1);
    } else if (currentPage <= 3) {
      return [1, 2, 3, 4, 5];
    } else if (currentPage >= totalPages - 2) {
      return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    } else {
      return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
    }
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="mt-6 flex items-center justify-center space-x-2 gap-1"
    dir={i18n.language === "ar" ? "rtl" : "ltr"}>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="hover:bg-[#d4ab71] hover:text-white"
      >
        {isRtl ? <ChevronsRight /> : <ChevronsLeft />}
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="hover:bg-[#d4ab71] hover:text-white"
      >
        {isRtl ? <ChevronRight /> : <ChevronLeft />}
      </Button>

      {visiblePages.map((page, index) => (
        <Button
          key={index}
          variant={page === currentPage ? "solid" : "outline"}
          size="icon"
          onClick={() => onPageChange(page)}
          disabled={page === "..." || page < 1 || page > totalPages}
          className={
            page === currentPage
              ? "bg-[#d4ab71] text-white"
              : "hover:bg-[#d4ab71] hover:text-white"
          }
        >
          {page}
        </Button>
      ))}

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="hover:bg-[#d4ab71] hover:text-white"
      >
        {isRtl ? <ChevronLeft /> : <ChevronRight />}
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="hover:bg-[#d4ab71] hover:text-white"
      >
        {isRtl ? <ChevronsLeft /> : <ChevronsRight />}
      </Button>
    </div>
  );
}
