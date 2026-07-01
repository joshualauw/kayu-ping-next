import { fetcher } from "@/hooks/swr/fetcher";
import { TableQuery } from "@/lib/schemas/table-query";
import useSWR, { SWRConfiguration } from "swr";
import type { GetAllProcessingsResponse } from "@/app/api/processings/route";

export function useGetAllProcessings(query: TableQuery, options?: SWRConfiguration<GetAllProcessingsResponse>) {
  const params = new URLSearchParams({
    page: String(query.page),
    size: String(query.size),
    search: query.search,
  });

  return useSWR<GetAllProcessingsResponse>(`/api/processings?${params.toString()}`, fetcher, {
    keepPreviousData: true,
    errorRetryCount: 3,
    ...options,
  });
}
