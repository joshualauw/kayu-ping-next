import { fetcher } from "@/hooks/swr/fetcher";
import { TableQuery } from "@/lib/schemas/table-query";
import useSWR, { SWRConfiguration } from "swr";
import type { GetAllGradingsResponse } from "@/app/api/gradings/route";

export function useGetAllGradings(query: TableQuery, options?: SWRConfiguration<GetAllGradingsResponse>) {
  const params = new URLSearchParams({
    page: String(query.page),
    size: String(query.size),
    search: query.search,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
  });
  if (query.startDate) params.set("startDate", query.startDate);
  if (query.endDate) params.set("endDate", query.endDate);

  return useSWR<GetAllGradingsResponse>(`/api/gradings?${params.toString()}`, fetcher, {
    keepPreviousData: true,
    errorRetryCount: 3,
    ...options,
  });
}
