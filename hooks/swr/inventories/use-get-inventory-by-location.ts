import { fetcher } from "@/hooks/swr/fetcher";
import useSWR, { SWRConfiguration } from "swr";
import type { GetLocationInventoryResponse } from "@/app/api/inventories/by-location/route";

export function useGetInventoryByLocation(
  locationId: number | null,
  showEmptyInventory: boolean = false,
  options?: SWRConfiguration<GetLocationInventoryResponse>,
) {
  const url = locationId ? `/api/inventories/by-location?locationId=${locationId}&showEmptyInventory=${showEmptyInventory}` : null;
  return useSWR<GetLocationInventoryResponse>(url, fetcher, {
    errorRetryCount: 3,
    ...options,
  });
}
