import { fetcher } from "@/hooks/swr/fetcher";
import { TableQuery } from "@/lib/schemas/table-query";
import useSWR, { SWRConfiguration } from "swr";
import type { GetAllAdjustmentsResponse } from "@/app/api/adjustments/route";

export function useGetAllAdjustments(query: TableQuery, options?: SWRConfiguration<GetAllAdjustmentsResponse>) {
  const params = new URLSearchParams({
    page: String(query.page),
    size: String(query.size),
    search: query.search,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
  });

  return useSWR<GetAllAdjustmentsResponse>(`/api/adjustments?${params.toString()}`, fetcher, {
    keepPreviousData: true,
    errorRetryCount: 3,
    ...options,
  });
}
