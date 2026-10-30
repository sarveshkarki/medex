import { useServiceExplorerData } from "@/hooks/use-service-explorer-data";

export function useCategories() {
  const query = useServiceExplorerData();

  return {
    ...query,
    data: query.data?.categories,
  };
}
