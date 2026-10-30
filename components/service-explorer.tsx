"use client";

import {
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  HeartPulse,
  Home,
  LayoutGrid,
  List,
  MapPin,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  UserRound,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useServiceExplorerData } from "@/hooks/use-service-explorer-data";
import { calculateServicePrice, formatPrice } from "@/lib/pricing";
import {
  DEFAULT_SERVICE_FILTERS,
  filterServices,
  type ServiceFilters,
} from "@/lib/service-filters";
import { cn } from "@/lib/utils";
import type {
  Provider,
  Service,
  ServiceExplorerData,
  ServiceType,
} from "@/types/service";

const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  package: "Health Packages",
  lab_test: "Lab Tests",
  wellness: "Wellness",
  service: "Services",
  insurance: "Insurance",
};

const PROVIDER_TONES = [
  "bg-[#dff3f1] text-[#13776f]",
  "bg-[#e8e9fb] text-[#5155a6]",
  "bg-[#fef0dc] text-[#a25b16]",
];

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

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

function CheckboxRow({
  label,
  count,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  count: number;
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={cn(
        "flex items-center gap-2.5 py-1.5 text-sm",
        disabled
          ? "cursor-not-allowed text-slate-300"
          : "cursor-pointer text-slate-700",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded border",
          checked
            ? "border-[#166b68] bg-[#166b68] text-white"
            : "border-slate-300 bg-white",
        )}
      >
        {checked && <Check className="size-3" />}
      </span>

      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className="sr-only"
      />

      <span className="flex-1">{label}</span>
      <span className="text-xs text-slate-400">{count}</span>
    </label>
  );
}

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultOpen);

  return (
    <section className="border-b border-slate-100 py-5 last:border-0">
      <button
        type="button"
        className="flex w-full items-center justify-between text-left text-sm font-semibold text-slate-900"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
      >
        {title}
        <ChevronDown
          className={cn(
            "size-4 text-slate-400 transition-transform",
            !expanded && "-rotate-90",
          )}
        />
      </button>

      {expanded && <div className="mt-3">{children}</div>}
    </section>
  );
}

function ServiceFiltersPanel({
  data,
  filters,
  onChange,
  mobile = false,
}: {
  data: ServiceExplorerData;
  filters: ServiceFilters;
  onChange: (filters: ServiceFilters) => void;
  mobile?: boolean;
}) {
  const [providerSearch, setProviderSearch] = useState("");
  const result = useMemo(() => filterServices(data, filters), [data, filters]);

  const toggleServiceType = (type: ServiceType) => {
    const serviceTypes = filters.serviceTypes.includes(type)
      ? filters.serviceTypes.filter((item) => item !== type)
      : [...filters.serviceTypes, type];

    onChange({ ...filters, serviceTypes, page: 1 });
  };

  const toggleProvider = (providerId: number) => {
    const providerIds = filters.providerIds.includes(providerId)
      ? filters.providerIds.filter((id) => id !== providerId)
      : [...filters.providerIds, providerId];

    onChange({ ...filters, providerIds, page: 1 });
  };

  return (
    <div className={cn("flex flex-col", mobile && "px-5 pb-6")}>
      <FilterSection title="Service type">
        {result.facets.serviceTypes.map((option) => (
          <CheckboxRow
            key={option.value}
            label={SERVICE_TYPE_LABELS[option.value]}
            count={option.count}
            checked={filters.serviceTypes.includes(option.value)}
            disabled={
              option.disabled && !filters.serviceTypes.includes(option.value)
            }
            onChange={() => toggleServiceType(option.value)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Category">
        {result.facets.categories.map((option) => (
          <CheckboxRow
            key={option.value}
            label={option.label}
            count={option.count}
            checked={filters.categoryIds.includes(option.value)}
            disabled={
              option.disabled && !filters.categoryIds.includes(option.value)
            }
            onChange={() => {
              const categoryIds = filters.categoryIds.includes(option.value)
                ? filters.categoryIds.filter((id) => id !== option.value)
                : [...filters.categoryIds, option.value];

              onChange({
                ...filters,
                categoryIds,
                subcategoryIds: [],
                page: 1,
              });
            }}
          />
        ))}
      </FilterSection>

      {filters.categoryIds.length > 0 && (
        <FilterSection title="Subcategory">
          {result.facets.subcategories.map((option) => (
            <CheckboxRow
              key={option.value}
              label={option.label}
              count={option.count}
              checked={filters.subcategoryIds.includes(option.value)}
              disabled={
                option.disabled &&
                !filters.subcategoryIds.includes(option.value)
              }
              onChange={() => {
                const subcategoryIds = filters.subcategoryIds.includes(
                  option.value,
                )
                  ? filters.subcategoryIds.filter((id) => id !== option.value)
                  : [...filters.subcategoryIds, option.value];

                onChange({ ...filters, subcategoryIds, page: 1 });
              }}
            />
          ))}
        </FilterSection>
      )}

      <FilterSection title="Provider">
        <div className="relative mb-2">
          <Search className="absolute left-3 top-2.5 size-3.5 text-slate-400" />
          <input
            aria-label="Search providers"
            className="h-8 w-full rounded-md border border-slate-200 pl-8 pr-2 text-xs outline-none focus:border-[#20837e] focus:ring-2 focus:ring-[#20837e]/15"
            placeholder="Search providers"
            onChange={(event) => setProviderSearch(event.target.value)}
          />
        </div>

        {result.facets.providers
          .filter((option) =>
            option.label.toLowerCase().includes(providerSearch.toLowerCase()),
          )
          .map((option) => (
            <CheckboxRow
              key={option.value}
              label={option.label}
              count={option.count}
              checked={filters.providerIds.includes(option.value)}
              disabled={
                option.disabled && !filters.providerIds.includes(option.value)
              }
              onChange={() => toggleProvider(option.value)}
            />
          ))}
      </FilterSection>

      <FilterSection title="Location">
        <label className="mb-1 block text-xs text-slate-500">City</label>
        <select
          value={filters.cityNames[0] ?? ""}
          onChange={(event) =>
            onChange({
              ...filters,
              cityNames: event.target.value ? [event.target.value] : [],
              page: 1,
            })
          }
          className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-sm"
        >
          <option value="">All cities</option>
          {result.facets.cities.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label} ({option.count})
            </option>
          ))}
        </select>

        <label className="mb-1 mt-3 block text-xs text-slate-500">
          Country
        </label>
        <select
          value={filters.countryIds[0]?.toString() ?? ""}
          onChange={(event) =>
            onChange({
              ...filters,
              countryIds: event.target.value
                ? [Number(event.target.value)]
                : [],
              page: 1,
            })
          }
          className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-sm"
        >
          <option value="">All countries</option>
          {result.facets.countries.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label} ({option.count})
            </option>
          ))}
        </select>
      </FilterSection>

      <FilterSection title="Price range">
        <label className="mb-1 block text-xs text-slate-500">Currency</label>
        <select
          value={filters.currency ?? ""}
          onChange={(event) =>
            onChange({
              ...filters,
              currency: (event.target.value ||
                null) as ServiceFilters["currency"],
              minPrice: null,
              maxPrice: null,
              page: 1,
            })
          }
          className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-sm"
        >
          <option value="">All currencies (no price filter)</option>
          {result.facets.currencies.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <input
            aria-label="Minimum price"
            type="number"
            min="0"
            placeholder="Min"
            value={filters.minPrice ?? ""}
            disabled={!filters.currency}
            onChange={(event) =>
              onChange({
                ...filters,
                minPrice: event.target.value
                  ? Number(event.target.value)
                  : null,
                page: 1,
              })
            }
            className="h-9 min-w-0 rounded-md border border-slate-200 px-2 text-sm disabled:bg-slate-50"
          />
          <input
            aria-label="Maximum price"
            type="number"
            min="0"
            placeholder="Max"
            value={filters.maxPrice ?? ""}
            disabled={!filters.currency}
            onChange={(event) =>
              onChange({
                ...filters,
                maxPrice: event.target.value
                  ? Number(event.target.value)
                  : null,
                page: 1,
              })
            }
            className="h-9 min-w-0 rounded-md border border-slate-200 px-2 text-sm disabled:bg-slate-50"
          />
        </div>

        <p className="mt-2 text-[11px] leading-4 text-slate-400">
          Choose a currency before filtering by price. Amounts in different
          currencies are never compared directly.
        </p>
      </FilterSection>

      <FilterSection title="At-home availability">
        <CheckboxRow
          label="Available as a home test"
          count={
            result.facets.serviceTypes.length >= 0
              ? data.services.filter((service) => service.testAtHome).length
              : 0
          }
          checked={filters.homeTestOnly}
          onChange={() =>
            onChange({
              ...filters,
              homeTestOnly: !filters.homeTestOnly,
              page: 1,
            })
          }
        />
      </FilterSection>
    </div>
  );
}

function ServiceCard({
  service,
  provider,
  category,
}: {
  service: Service;
  provider: Provider;
  category: string;
}) {
  const currency = provider.providerInformation.currency;

  const wellnessOption =
    service.type === "wellness"
      ? service.wellnessPricing
          .map((option) => ({
            option,
            price: calculateServicePrice(service, currency, option),
          }))
          .filter((item) => item.price !== null)
          .sort((a, b) => a.price!.finalPrice - b.price!.finalPrice)[0]
      : undefined;

  const price =
    service.type === "wellness"
      ? (wellnessOption?.price ?? null)
      : calculateServicePrice(service, currency);

  return (
    <article className="flex min-h-[198px] flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-[0_2px_10px_rgba(15,34,58,0.03)] transition-shadow hover:shadow-[0_8px_24px_rgba(15,34,58,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#20837e]">
            {SERVICE_TYPE_LABELS[service.type]}
          </span>
          <h4 className="mt-1.5 line-clamp-2 text-sm font-semibold leading-5 text-slate-900">
            {service.title}
          </h4>
          <p className="mt-1 text-xs text-slate-500">{category}</p>
        </div>

        {service.testAtHome && (
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-[#effaf8] px-2 py-1 text-[10px] font-medium text-[#18766e]">
            <Home className="size-3" />
            Home test
          </span>
        )}
      </div>

      <div className="mt-auto">
        <div className="mt-4 flex items-end justify-between gap-2">
          <div>
            <p className="text-[11px] text-slate-400">
              {service.type === "wellness"
                ? `From ${wellnessOption?.option.durationInMinutes ?? ""} min`
                : "Final price"}
            </p>

            <p className="mt-0.5 text-base font-bold text-slate-950">
              {price
                ? formatPrice(price.finalPrice, currency)
                : "Price on request"}
            </p>
          </div>

          {price && price.discountAmount > 0 && (
            <span className="rounded-full bg-[#fff5e7] px-2 py-1 text-[10px] font-semibold text-[#a8621b]">
              Save {Math.round((price.discountAmount / price.basePrice) * 100)}%
            </span>
          )}
        </div>

        {price && price.discountAmount > 0 && (
          <p className="text-right text-[11px] text-slate-400 line-through">
            {formatPrice(price.basePrice, currency)}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <span className="flex items-center gap-1 text-[11px] text-slate-500">
            <Clock3 className="size-3" />
            {service.type === "wellness" && wellnessOption
              ? `${wellnessOption.option.durationInMinutes} minutes`
              : service.testAtHome
                ? "Home test available"
                : "Service details available"}
          </span>

          <Button
            className={
              "bg-[#dff3f1] text-[#13776f] hover:text-[#dff3f1] hover:bg-[#13776f] cursor-pointer"
            }
            variant={"outline"}
            size="xs"
            type="button"
          >
            View service
          </Button>
        </div>
      </div>
    </article>
  );
}

function ProviderGroup({
  provider,
  services,
  categories,
  listView,
}: {
  provider: Provider;
  services: Service[];
  categories: Map<string, { title: string; parentId: string | null }>;
  listView: boolean;
}) {
  const [showAll, setShowAll] = useState(false);

  const visibleServices = showAll ? services : services.slice(0, 3);
  const info = provider.providerInformation;

  return (
    <section
      className="border-b border-slate-200 pb-7 pt-7 first:pt-0"
      aria-labelledby={`provider-${provider.id}-heading`}
    >
      <header className="mb-4 flex flex-wrap items-center gap-3">
        <div
          className={cn(
            "flex size-11 items-center justify-center rounded-xl text-xs font-bold",
            PROVIDER_TONES[provider.id % PROVIDER_TONES.length],
          )}
        >
          {getInitials(provider.name)}
        </div>

        <div className="min-w-0 flex-1">
          <h3
            id={`provider-${provider.id}-heading`}
            className="font-semibold text-slate-950"
          >
            {provider.name}
          </h3>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin className="size-3" />
            {info.city.name}, {info.country.name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600">
            {info.currency}
          </span>

          {typeof info.rating === "number" && info.rating > 0 ? (
            <span className="flex items-center gap-1 text-xs font-medium text-slate-600">
              <Star className="size-3.5 fill-amber-400 text-amber-400" />
              {info.rating}
              <span className="font-normal text-slate-400">
                ({info.reviewCount.toLocaleString()})
              </span>
            </span>
          ) : (
            <span className="text-xs text-slate-400">No ratings yet</span>
          )}
        </div>
      </header>

      <div
        className={cn(
          "grid gap-3",
          listView ? "grid-cols-1" : "md:grid-cols-2 xl:grid-cols-3",
        )}
      >
        {visibleServices.map((service) => {
          const category =
            categories.get(service.subCategoryId ?? "")?.title ??
            categories.get(service.categoryId)?.title ??
            "Other";

          return (
            <ServiceCard
              key={service.id}
              service={service}
              provider={provider}
              category={category}
            />
          );
        })}
      </div>

      {services.length > 3 && (
        <Button
          variant="ghost"
          size="sm"
          className="mt-3 text-[#166b68]"
          onClick={() => setShowAll((value) => !value)}
        >
          {showAll
            ? "Show fewer services"
            : `View all ${services.length} services`}
          <ChevronDown
            className={cn(
              "ml-1 size-3.5 transition-transform",
              showAll && "rotate-180",
            )}
          />
        </Button>
      )}
    </section>
  );
}

export function ServiceExplorerPage() {
  const {
    data: explorerData,
    isLoading,
    isError,
    refetch,
  } = useServiceExplorerData();

  const [filters, setFilters] = useState<ServiceFilters>({
    ...DEFAULT_SERVICE_FILTERS,
    pageSize: 3200,
  });
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, 300);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [listView, setListView] = useState(false);

  const categories = useMemo(
    () => (explorerData ? flattenCategories(explorerData) : new Map()),
    [explorerData],
  );

  const filteredResult = useMemo(() => {
    if (!explorerData) return null;
    return filterServices(explorerData, {
      ...filters,
      search: debouncedSearch,
    });
  }, [explorerData, filters, debouncedSearch]);

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

  const clearFilters = () => {
    setSearchInput("");
    setFilters({
      ...DEFAULT_SERVICE_FILTERS,
      pageSize: 3200,
    });
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

            <label className="relative mt-6 flex min-h-12 items-center rounded-xl border border-slate-300 bg-white shadow-sm focus-within:border-[#20837e] focus-within:ring-4 focus-within:ring-[#20837e]/10">
              <Search className="ml-4 size-4 text-slate-400" />
              <input
                value={searchInput}
                onChange={(event) => updateSearch(event.target.value)}
                className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-slate-400"
                placeholder="Search services, providers, or categories..."
                aria-label="Search services"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => updateSearch("")}
                  className="mr-3 rounded p-1 text-slate-400 hover:text-slate-700"
                  aria-label="Clear search"
                >
                  <X className="size-4" />
                </button>
              )}
            </label>
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 py-5">
          <div>
            <h2 className="text-lg font-semibold tracking-[-0.02em] text-slate-950">
              Explore healthcare services
            </h2>
            <p className="mt-1 text-xs text-slate-500" aria-live="polite">
              <span className="font-semibold text-slate-700">
                {filteredResult.total.toLocaleString()} services
              </span>{" "}
              from{" "}
              <span className="font-semibold text-slate-700">
                {groupedProviders.length} providers
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="lg:hidden"
              onClick={() => setDrawerOpen(true)}
            >
              <SlidersHorizontal className="mr-2 size-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-2 rounded-full bg-[#166b68] px-1.5 py-0.5 text-[10px] text-white">
                  {activeFilterCount}
                </span>
              )}
            </Button>

            <div className="hidden items-center rounded-lg border border-slate-200 bg-white p-0.5 sm:flex">
              <Button
                variant={listView ? "ghost" : "secondary"}
                size="icon-sm"
                aria-label="Grid view"
                aria-pressed={!listView}
                onClick={() => setListView(false)}
              >
                <LayoutGrid />
              </Button>
              <Button
                variant={listView ? "secondary" : "ghost"}
                size="icon-sm"
                aria-label="List view"
                aria-pressed={listView}
                onClick={() => setListView(true)}
              >
                <List />
              </Button>
            </div>

            <label className="hidden items-center gap-2 text-xs text-slate-500 sm:flex">
              Sort by
              <select
                value={filters.sortBy}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    sortBy: event.target.value as ServiceFilters["sortBy"],
                    page: 1,
                  }))
                }
                className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 outline-none"
              >
                <option value="relevance">Relevance</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </label>
          </div>
        </div>

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
            {groupedProviders.length > 0 ? (
              groupedProviders.map(({ provider, services }) => (
                <ProviderGroup
                  key={provider.id}
                  provider={provider}
                  services={services}
                  categories={categories}
                  listView={listView}
                />
              ))
            ) : (
              <div className="flex min-h-80 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 text-center">
                <CircleHelp className="size-8 text-[#7bbcb8]" />
                <h3 className="mt-4 font-semibold text-slate-900">
                  No services match those filters
                </h3>
                <p className="mt-1 max-w-sm text-sm text-slate-500">
                  Try another search or remove a filter to see more care
                  options.
                </p>
                <Button
                  variant="outline"
                  className="mt-5"
                  onClick={clearFilters}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </section>
        </div>
      </main>

      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/25 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Filter results"
        >
          <button
            type="button"
            className="absolute inset-0 size-full cursor-default"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close filter drawer"
          />

          <div className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h2 className="font-semibold">Filter results</h2>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close filters"
              >
                <X />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <ServiceFiltersPanel
                data={explorerData}
                filters={filters}
                onChange={setFilters}
                mobile
              />
            </div>

            <div className="flex items-center gap-3 border-t border-slate-200 bg-white p-4">
              <Button variant="ghost" className="flex-1" onClick={clearFilters}>
                Reset
              </Button>
              <Button
                className="flex-[2] bg-[#166b68] hover:bg-[#115a57]"
                onClick={() => setDrawerOpen(false)}
              >
                Show {filteredResult.total} results
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
