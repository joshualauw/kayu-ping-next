import { fetcher } from "@/hooks/swr/fetcher";
import { TableQuery } from "@/lib/schemas/table-query";
import useSWR, { SWRConfiguration } from "swr";
import type { GetGroupedInventoriesResponse } from "@/app/api/inventories/grouped/by-wood-variant/route";

export function useGetAllInventoriesByWoodVariant(query: TableQuery, options?: SWRConfiguration<GetGroupedInventoriesResponse>) {
  const params = new URLSearchParams({
    page: String(query.page),
    size: String(query.size),
    search: query.search,
  });

  return useSWR<GetGroupedInventoriesResponse>(`/api/inventories/grouped/by-wood-variant?${params.toString()}`, fetcher, {
    keepPreviousData: true,
    errorRetryCount: 3,
    ...options,
  });
}
