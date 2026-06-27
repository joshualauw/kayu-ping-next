import { fetcher } from "@/hooks/swr/fetcher";
import { TableQuery } from "@/lib/schemas/table-query";
import useSWR, { SWRConfiguration } from "swr";
import type { GetAllInventoriesResponse } from "@/app/api/inventories/route";

export function useGetAllInventories(query: TableQuery, options?: SWRConfiguration<GetAllInventoriesResponse>) {
  const params = new URLSearchParams({
    page: String(query.page),
    size: String(query.size),
    search: query.search,
  });

  return useSWR<GetAllInventoriesResponse>(`/api/inventories?${params.toString()}`, fetcher, {
    keepPreviousData: true,
    errorRetryCount: 3,
    ...options,
  });
}
