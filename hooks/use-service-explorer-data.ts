import { useQuery } from "@tanstack/react-query";
import { getServiceExplorerData } from "@/lib/api/services";

export const serviceExplorerQueryKey = ["service-explorer"] as const;

export function useServiceExplorerData() {
  return useQuery({
    queryKey: serviceExplorerQueryKey,
    queryFn: () => getServiceExplorerData(),
  });
}
