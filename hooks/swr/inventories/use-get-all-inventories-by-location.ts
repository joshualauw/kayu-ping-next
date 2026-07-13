import { fetcher } from "@/hooks/swr/fetcher";
import { TableQuery } from "@/lib/schemas/table-query";
import useSWR, { SWRConfiguration } from "swr";
import type { GetGroupedInventoriesByLocationResponse } from "@/app/api/inventories/grouped/by-location/route";

export function useGetAllInventoriesByLocation(
  query: TableQuery,
  showEmptyInventory: boolean = false,
  options?: SWRConfiguration<GetGroupedInventoriesByLocationResponse>,
) {
  const params = new URLSearchParams({
    page: String(query.page),
    size: String(query.size),
    search: query.search,
    showEmptyInventory: String(showEmptyInventory),
  });

  return useSWR<GetGroupedInventoriesByLocationResponse>(`/api/inventories/grouped/by-location?${params.toString()}`, fetcher, {
    keepPreviousData: true,
    errorRetryCount: 3,
    ...options,
  });
}
