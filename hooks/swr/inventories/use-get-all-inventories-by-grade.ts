import { fetcher } from "@/hooks/swr/fetcher";
import { TableQuery } from "@/lib/schemas/table-query";
import useSWR, { SWRConfiguration } from "swr";
import type { GetGroupedInventoriesByGradeResponse } from "@/app/api/inventories/grouped/by-grade/route";

export function useGetAllInventoriesByGrade(query: TableQuery, options?: SWRConfiguration<GetGroupedInventoriesByGradeResponse>) {
  const params = new URLSearchParams({
    page: String(query.page),
    size: String(query.size),
    search: query.search,
  });

  return useSWR<GetGroupedInventoriesByGradeResponse>(`/api/inventories/grouped/by-grade?${params.toString()}`, fetcher, {
    keepPreviousData: true,
    errorRetryCount: 3,
    ...options,
  });
}
