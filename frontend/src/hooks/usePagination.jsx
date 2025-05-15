import { useState, useCallback } from "react";

export default function usePagination({ initialPage = 1, totalPages = 1, onPageChange }) {
  const [page, setPage] = useState(initialPage);

  // Khi totalPages thay đổi, reset về trang 1 nếu page > totalPages
  // (Có thể thêm useEffect nếu muốn tự động reset)

  const goToPage = useCallback(
    (newPage) => {
      if (newPage < 1 || newPage > totalPages) return;
      setPage(newPage);
      if (onPageChange) onPageChange(newPage);
    },
    [totalPages, onPageChange]
  );

  const nextPage = useCallback(() => {
    goToPage(page + 1);
  }, [page, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(page - 1);
  }, [page, goToPage]);

  return {
    page,
    totalPages,
    setPage: goToPage,
    nextPage,
    prevPage,
    isFirstPage: page === 1,
    isLastPage: page === totalPages,
  };
}