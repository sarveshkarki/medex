import { useServiceExplorerData } from "@/hooks/use-service-explorer-data";

export function useServices() {
  const query = useServiceExplorerData();

  return {
    ...query,
    data: query.data?.services,
  };
}
