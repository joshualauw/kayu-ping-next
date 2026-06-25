import { useEffect, useMemo, useState } from "react";
import type { PaginationState } from "@tanstack/react-table";
import { config } from "@/lib/config";

export function useDataTableState() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: config.DATA_TABLE.default_page_index,
    pageSize: config.DATA_TABLE.default_page_size,
  });

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search);
      setPagination((current) => ({ ...current, pageIndex: 0 }));
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [search]);

  const query = useMemo(
    () => ({
      page: pagination.pageIndex,
      size: pagination.pageSize,
      search: debouncedSearch,
    }),
    [debouncedSearch, pagination.pageIndex, pagination.pageSize],
  );

  const getPageCount = (count: number) => {
    return Math.max(Math.ceil(count / pagination.pageSize), 1);
  };

  return {
    search,
    setSearch,
    pagination,
    setPagination,
    query,
    getPageCount,
  };
}
