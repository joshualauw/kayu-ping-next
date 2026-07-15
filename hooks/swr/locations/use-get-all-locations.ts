import { fetcher } from "@/hooks/swr/fetcher";
import { TableQuery } from "@/lib/schemas/table-query";
import useSWR, { SWRConfiguration } from "swr";
import type { GetAllLocationsResponse } from "@/app/api/locations/route";

export function useGetAllLocations(query: TableQuery, options?: SWRConfiguration<GetAllLocationsResponse>) {
  const params = new URLSearchParams({
    page: String(query.page),
    size: String(query.size),
    search: query.search,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
  });
  if (query.startDate) params.set("startDate", query.startDate);
  if (query.endDate) params.set("endDate", query.endDate);

  return useSWR<GetAllLocationsResponse>(`/api/locations?${params.toString()}`, fetcher, {
    keepPreviousData: true,
    errorRetryCount: 3,
    ...options,
  });
}
