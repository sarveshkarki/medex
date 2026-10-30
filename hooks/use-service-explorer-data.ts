import { useQueries } from "@tanstack/react-query";

import { getCategories, getProviders, getServices } from "@/lib/api/services";

export function useServiceExplorerData() {
  const [categoriesQuery, providersQuery, servicesQuery] = useQueries({
    queries: [
      {
        queryKey: ["categories"],
        queryFn: () => getCategories(),
      },
      {
        queryKey: ["providers"],
        queryFn: () => getProviders(),
      },
      {
        queryKey: ["services"],
        queryFn: () => getServices(),
      },
    ],
  });

  const isLoading =
    categoriesQuery.isLoading ||
    providersQuery.isLoading ||
    servicesQuery.isLoading;

  const isError =
    categoriesQuery.isError || providersQuery.isError || servicesQuery.isError;

  const data =
    categoriesQuery.data && providersQuery.data && servicesQuery.data
      ? {
          categories: categoriesQuery.data,
          providers: providersQuery.data,
          services: servicesQuery.data,
        }
      : undefined;

  const refetch = async () => {
    await Promise.all([
      categoriesQuery.refetch(),
      providersQuery.refetch(),
      servicesQuery.refetch(),
    ]);
  };

  return {
    data,
    isLoading,
    isError,
    refetch,
  };
}
