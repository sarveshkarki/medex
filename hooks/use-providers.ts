import { useServiceExplorerData } from "@/hooks/use-service-explorer-data";

export function useProviders() {
  const query = useServiceExplorerData();

  return {
    ...query,
    data: query.data?.providers,
  };
}
