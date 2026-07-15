import { fetcher } from "@/hooks/swr/fetcher";
import { TableQuery } from "@/lib/schemas/table-query";
import useSWR, { SWRConfiguration } from "swr";
import type { GetAllStockMutationsResponse } from "@/app/api/stock-mutations/route";

export function useGetAllStockMutations(query: TableQuery, options?: SWRConfiguration<GetAllStockMutationsResponse>) {
  const params = new URLSearchParams({
    page: String(query.page),
    size: String(query.size),
    search: query.search,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
  });

  return useSWR<GetAllStockMutationsResponse>(`/api/stock-mutations?${params.toString()}`, fetcher, {
    keepPreviousData: true,
    errorRetryCount: 3,
    ...options,
  });
}
