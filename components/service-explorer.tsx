"use client";

import { HeartPulse, MapPin, ShieldCheck, UserRound, X } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { useServiceExplorerData } from "@/hooks/use-service-explorer-data";
import { filterServices } from "@/lib/service-filters";
import type {
  Provider,
  Service,
  ServiceExplorerData,
  ServiceType,
} from "@/types/service";

import { useServiceExplorerFilters } from "./hooks/use-service-explorer-filters";
import { ServiceFilterDrawer } from "./service-explorer/components/service-filter-drawer";
import { ServiceFiltersPanel } from "./service-explorer/components/service-filters-panel";
import { ServicePagination } from "./service-explorer/components/service-pagination";
import { ServiceResults } from "./service-explorer/components/service-results";
import { ServiceSearch } from "./service-explorer/components/service-search";
import { ServiceToolbar } from "./service-explorer/components/service-toolbar";

const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  package: "Health Packages",
  lab_test: "Lab Tests",
  wellness: "Wellness",
  service: "Services",
  insurance: "Insurance",
};

function flattenCategories(data: ServiceExplorerData) {
  const categories = new Map<
    string,
    { title: string; parentId: string | null }
  >();

  function visit(items: ServiceExplorerData["categories"]) {
    for (const category of items) {
      categories.set(category.id, {
        title: category.title,
        parentId: category.parentId,
      });

      if (category.children?.length) {
        visit(category.children);
      }
    }
  }

  visit(data.categories);
  return categories;
}

export function ServiceExplorerPage() {
  const {
    data: explorerData,
    isLoading,
    isError,
    refetch,
  } = useServiceExplorerData();

  const { filters, searchInput, setSearchInput, setFilters, clearFilters } =
    useServiceExplorerFilters();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [listView, setListView] = useState(false);

  const categories = useMemo(
    () => (explorerData ? flattenCategories(explorerData) : new Map()),
    [explorerData],
  );

  const filteredResult = useMemo(() => {
    if (!explorerData) return null;

    return filterServices(explorerData, filters);
  }, [explorerData, filters]);

  const groupedProviders = useMemo(() => {
    if (!explorerData || !filteredResult) return [];

    const providerMap = new Map(
      explorerData.providers.map((provider) => [provider.id, provider]),
    );

    const groups = new Map<number, Service[]>();

    for (const service of filteredResult.services) {
      const services = groups.get(service.userId) ?? [];
      services.push(service);
      groups.set(service.userId, services);
    }

    return Array.from(groups.entries())
      .map(([providerId, services]) => ({
        provider: providerMap.get(providerId),
        services,
      }))
      .filter(
        (group): group is { provider: Provider; services: Service[] } =>
          group.provider !== undefined,
      );
  }, [explorerData, filteredResult]);

  const updateSearch = (value: string) => {
    setSearchInput(value);
  };

  if (isLoading) {
    return (
      <main
        className="mx-auto max-w-7xl space-y-6 p-6"
        aria-busy="true"
        aria-label="Loading services"
      >
        <div className="h-10 w-64 animate-pulse rounded bg-slate-100" />
        <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
        <div className="h-52 animate-pulse rounded-xl bg-slate-100" />
        <div className="h-52 animate-pulse rounded-xl bg-slate-100" />
      </main>
    );
  }

  if (isError || !explorerData || !filteredResult) {
    return (
      <main className="mx-auto max-w-7xl space-y-4 p-6">
        <h1 className="text-xl font-semibold text-slate-900">
          Unable to load services
        </h1>
        <p role="alert" className="text-sm text-slate-600">
          Something went wrong while loading the service catalogue.
        </p>
        <Button onClick={() => void refetch()}>Try again</Button>
      </main>
    );
  }

  const activeFilterCount =
    filters.serviceTypes.length +
    filters.categoryIds.length +
    filters.subcategoryIds.length +
    filters.providerIds.length +
    filters.cityNames.length +
    filters.countryIds.length +
    Number(filters.homeTestOnly) +
    Number(filters.currency !== null) +
    Number(filters.minPrice !== null) +
    Number(filters.maxPrice !== null);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-8 px-5 lg:px-8">
          <a
            href="/task-one"
            className="flex items-center gap-2.5"
            aria-label="MedEx home"
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#e4f5f3] text-[#14756f]">
              <HeartPulse className="size-5" />
            </span>
            <span className="text-xl font-bold tracking-[-0.04em] text-[#123b4a]">
              Med<span className="text-[#20837e]">Ex</span>
            </span>
          </a>

          <nav className="hidden items-center gap-6 text-sm text-slate-500 md:flex">
            <a className="font-medium text-[#166b68]" href="#services">
              Explore Services
            </a>
            <a href="#providers" className="hover:text-slate-900">
              Hospitals &amp; Clinics
            </a>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <span className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 sm:flex">
              <MapPin className="size-4 text-[#20837e]" />
              All locations
            </span>
            <Button variant="outline" size="icon-sm" aria-label="Account">
              <UserRound className="size-4" />
            </Button>
          </div>
        </div>
      </header>

      <main id="services" className="mx-auto max-w-[1440px] px-5 pb-16 lg:px-8">
        <section className="border-b border-slate-200 py-9 lg:py-11">
          <div className="max-w-3xl">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#20837e]">
              <ShieldCheck className="size-3.5" />
              Trusted care, easier to compare
            </div>

            <h1 className="text-3xl font-bold tracking-[-0.04em] text-[#123b4a] sm:text-4xl">
              Find the right healthcare for you
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Compare health packages, lab tests, and wellness services from
              providers across Thailand, Nepal, and India.
            </p>

            <ServiceSearch value={searchInput} onChange={setSearchInput} />
          </div>
        </section>

        <ServiceToolbar
          total={filteredResult.total}
          providerCount={groupedProviders.length}
          activeFilterCount={activeFilterCount}
          sortBy={filters.sortBy}
          listView={listView}
          onSortChange={(sortBy) =>
            setFilters((current) => ({
              ...current,
              sortBy,
              page: 1,
            }))
          }
          onListViewChange={setListView}
          onOpenFilters={() => setDrawerOpen(true)}
        />

        <div
          className="flex flex-wrap items-center gap-2 py-3"
          aria-live="polite"
        >
          {filters.serviceTypes.map((type) => (
            <span
              key={type}
              className="flex items-center gap-1 rounded-full bg-[#e6f5f3] px-2.5 py-1 text-xs font-medium text-[#166b68]"
            >
              {SERVICE_TYPE_LABELS[type]}
              <button
                type="button"
                onClick={() =>
                  setFilters((current) => ({
                    ...current,
                    serviceTypes: current.serviceTypes.filter(
                      (item) => item !== type,
                    ),
                    page: 1,
                  }))
                }
                aria-label={`Remove ${SERVICE_TYPE_LABELS[type]} filter`}
              >
                <X className="size-3" />
              </button>
            </span>
          ))}

          {filters.search && (
            <span className="flex items-center gap-1 rounded-full bg-[#e6f5f3] px-2.5 py-1 text-xs font-medium text-[#166b68]">
              “{filters.search}”
              <button
                type="button"
                onClick={() => updateSearch("")}
                aria-label="Remove search filter"
              >
                <X className="size-3" />
              </button>
            </span>
          )}

          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={clearFilters}
              className="ml-1 text-xs font-medium text-slate-500 underline underline-offset-2"
            >
              Clear all
            </button>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-[270px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-5 rounded-xl border border-slate-200 bg-white px-4">
              <div className="flex items-center justify-between border-b border-slate-100 py-4">
                <h2 className="text-sm font-semibold">Filter results</h2>
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-xs text-[#166b68]"
                  >
                    Reset
                  </button>
                )}
              </div>

              <ServiceFiltersPanel
                data={explorerData}
                filters={filters}
                onChange={setFilters}
              />
            </div>
          </aside>

          <section id="providers" aria-label="Service results">
            <ServiceResults
              groupedProviders={groupedProviders}
              categories={categories}
              listView={listView}
              onClearFilters={clearFilters}
            />
            <ServicePagination
              page={filteredResult.page}
              pageCount={filteredResult.pageCount}
              pageSize={filteredResult.pageSize}
              total={filteredResult.total}
              onPageChange={(page) =>
                setFilters((current) => ({
                  ...current,
                  page,
                }))
              }
            />
          </section>
        </div>
      </main>

      <ServiceFilterDrawer
        open={drawerOpen}
        data={explorerData}
        filters={filters}
        resultCount={filteredResult.total}
        onChange={setFilters}
        onClearFilters={clearFilters}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
