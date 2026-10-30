import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  DEFAULT_SERVICE_FILTERS,
  type ServiceFilters,
} from "@/lib/service-filters";
import {
  parseServiceFilters,
  serializeServiceFilters,
} from "@/lib/service-filter-url";

interface UseServiceExplorerFiltersReturn {
  filters: ServiceFilters;
  searchInput: string;
  setSearchInput: (value: string) => void;
  setFilters: (
    update: ServiceFilters | ((current: ServiceFilters) => ServiceFilters),
  ) => void;
  clearFilters: () => void;
}

export function useServiceExplorerFilters(): UseServiceExplorerFiltersReturn {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isRestoringHistory = useRef(false);

  const filters = useMemo(
    () => ({
      ...parseServiceFilters(new URLSearchParams(searchParams.toString())),
      pageSize: 20,
    }),
    [searchParams],
  );
  const [searchInput, setSearchInput] = useState(filters.search);

  const debouncedSearch = useDebouncedValue(searchInput, 300);

  const setFilters = useCallback(
    (
      update: ServiceFilters | ((current: ServiceFilters) => ServiceFilters),
    ) => {
      const nextFilters =
        typeof update === "function" ? update(filters) : update;

      const params = serializeServiceFilters({
        ...nextFilters,
        pageSize: 20,
      });

      const query = params.toString();

      router.push(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [filters, pathname, router],
  );

  // Keep the search input synchronized with browser Back/Forward navigation.
  useEffect(() => {
    const handlePopState = () => {
      isRestoringHistory.current = true;

      const params = new URLSearchParams(window.location.search);
      setSearchInput(params.get("q") ?? "");
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // Update the URL only after the user stops typing.
  useEffect(() => {
    if (isRestoringHistory.current) {
      if (debouncedSearch !== filters.search) {
        return;
      }

      isRestoringHistory.current = false;
      return;
    }

    if (filters.search === debouncedSearch) return;

    const nextFilters = {
      ...filters,
      search: debouncedSearch,
      page: 1,
      pageSize: 20,
    };

    const params = serializeServiceFilters(nextFilters);
    const query = params.toString();

    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }, [debouncedSearch, filters, pathname, router]);

  const clearFilters = useCallback(() => {
    setSearchInput("");

    const params = serializeServiceFilters({
      ...DEFAULT_SERVICE_FILTERS,
      pageSize: 20,
    });

    const query = params.toString();

    router.push(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }, [pathname, router]);

  return {
    filters,
    searchInput,
    setSearchInput,
    setFilters,
    clearFilters,
  };
}
