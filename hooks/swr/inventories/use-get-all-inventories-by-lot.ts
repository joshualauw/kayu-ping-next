import { fetcher } from "@/hooks/swr/fetcher";
import { TableQuery } from "@/lib/schemas/table-query";
import useSWR, { SWRConfiguration } from "swr";
import type { GetGroupedInventoriesByLotResponse } from "@/app/api/inventories/grouped/by-lot/route";

export function useGetAllInventoriesByLot(
  query: TableQuery,
  showEmptyInventory: boolean = false,
  options?: SWRConfiguration<GetGroupedInventoriesByLotResponse>,
) {
  const params = new URLSearchParams({
    page: String(query.page),
    size: String(query.size),
    search: query.search,
    showEmptyInventory: String(showEmptyInventory),
  });

  return useSWR<GetGroupedInventoriesByLotResponse>(`/api/inventories/grouped/by-lot?${params.toString()}`, fetcher, {
    keepPreviousData: true,
    errorRetryCount: 3,
    ...options,
  });
}
