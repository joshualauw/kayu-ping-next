import { fetcher } from "@/hooks/swr/fetcher";
import { TableQuery } from "@/lib/schemas/table-query";
import useSWR, { SWRConfiguration } from "swr";
import type { GetAllContactsResponse } from "@/app/api/contacts/route";

export function useGetAllContacts(query: TableQuery, options?: SWRConfiguration<GetAllContactsResponse>) {
  const params = new URLSearchParams({
    page: String(query.page),
    size: String(query.size),
    search: query.search,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
  });
  if (query.startDate) params.set("startDate", query.startDate);
  if (query.endDate) params.set("endDate", query.endDate);

  return useSWR<GetAllContactsResponse>(`/api/contacts?${params.toString()}`, fetcher, {
    keepPreviousData: true,
    errorRetryCount: 3,
    ...options,
  });
}
