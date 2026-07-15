import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { PaginationState, SortingState } from "@tanstack/react-table";
import { config } from "@/lib/config";

export function useDataTableState(defaultSortBy = "createdAt", defaultSortOrder: "asc" | "desc" = "desc") {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlPage = searchParams.get("page");
  const urlSize = searchParams.get("size");
  const urlSearch = searchParams.get("search") ?? "";
  const urlSortBy = searchParams.get("sortBy") || defaultSortBy;
  const urlSortOrder = (searchParams.get("sortOrder") as "asc" | "desc" | null) || defaultSortOrder;
  const urlStartDate = searchParams.get("startDate") ?? "";
  const urlEndDate = searchParams.get("endDate") ?? "";

  const pageIndex = urlPage ? parseInt(urlPage, 10) : config.DATA_TABLE.default_page_index;
  const pageSize = urlSize ? parseInt(urlSize, 10) : config.DATA_TABLE.default_page_size;

  const [search, setSearch] = useState(urlSearch);

  useEffect(() => {
    setSearch(urlSearch);
  }, [urlSearch]);

  useEffect(() => {
    if (search === urlSearch) return;

    const timeout = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (search) {
        params.set("search", search);
      } else {
        params.delete("search");
      }

      params.set("page", "0");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [search, urlSearch, pathname, router, searchParams]);

  const setPagination = (updater: PaginationState | ((current: PaginationState) => PaginationState)) => {
    const currentPagination: PaginationState = { pageIndex, pageSize };
    const nextPagination = typeof updater === "function" ? updater(currentPagination) : updater;

    const params = new URLSearchParams(searchParams.toString());
    params.set("page", nextPagination.pageIndex.toString());
    params.set("size", nextPagination.pageSize.toString());
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const sorting = useMemo<SortingState>(
    () => (urlSortBy ? [{ id: urlSortBy, desc: urlSortOrder === "desc" }] : []),
    [urlSortBy, urlSortOrder],
  );

  const dateRange = useMemo(() => {
    return {
      from: urlStartDate ? new Date(urlStartDate) : undefined,
      to: urlEndDate ? new Date(urlEndDate) : undefined,
    };
  }, [urlStartDate, urlEndDate]);

  const setDateRange = (range: { from?: Date; to?: Date } | undefined) => {
    const params = new URLSearchParams(searchParams.toString());
    if (range?.from) {
      params.set("startDate", range.from.toISOString());
    } else {
      params.delete("startDate");
    }
    if (range?.to) {
      params.set("endDate", range.to.toISOString());
    } else {
      params.delete("endDate");
    }
    params.set("page", "0");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const setSorting = (updater: SortingState | ((current: SortingState) => SortingState)) => {
    const nextSorting = typeof updater === "function" ? updater(sorting) : updater;
    const firstSort = nextSorting[0];

    const params = new URLSearchParams(searchParams.toString());
    if (firstSort) {
      params.set("sortBy", firstSort.id);
      params.set("sortOrder", firstSort.desc ? "desc" : "asc");
    } else {
      params.delete("sortBy");
      params.delete("sortOrder");
    }
    params.set("page", "0");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const resetAll = () => {
    setSearch("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    params.delete("startDate");
    params.delete("endDate");
    params.set("page", "0");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const pagination = useMemo<PaginationState>(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize],
  );

  const query = useMemo(
    () => ({
      page: pageIndex,
      size: pageSize,
      search: urlSearch,
      sortBy: urlSortBy,
      sortOrder: urlSortOrder,
      startDate: urlStartDate || undefined,
      endDate: urlEndDate || undefined,
    }),
    [pageIndex, pageSize, urlSearch, urlSortBy, urlSortOrder, urlStartDate, urlEndDate],
  );

  const getPageCount = (count: number) => {
    return Math.max(Math.ceil(count / pageSize), 1);
  };

  return {
    search,
    setSearch,
    pagination,
    setPagination,
    sorting,
    setSorting,
    dateRange,
    setDateRange,
    resetAll,
    query,
    getPageCount,
  };
}
