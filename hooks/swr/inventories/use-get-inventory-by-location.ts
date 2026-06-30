import { fetcher } from "@/hooks/swr/fetcher";
import useSWR, { SWRConfiguration } from "swr";
import type { GetLocationInventoryResponse } from "@/app/api/inventories/by-location/route";

export function useGetInventoryByLocation(locationId: number | null, options?: SWRConfiguration<GetLocationInventoryResponse>) {
  return useSWR<GetLocationInventoryResponse>(locationId ? `/api/inventories/by-location?locationId=${locationId}` : null, fetcher, {
    errorRetryCount: 3,
    ...options,
  });
}
