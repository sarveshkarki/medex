import type {
  Currency,
  Provider,
  Service,
  ServiceExplorerData,
  ServiceType,
} from "@/types/service";
import { calculateServicePrice } from "@/lib/pricing";

export type ServiceSort = "relevance" | "price-asc" | "price-desc" | "rating";

export interface ServiceFilters {
  search: string;
  serviceTypes: ServiceType[];
  categoryIds: string[];
  subcategoryIds: string[];
  providerIds: number[];
  cityNames: string[];
  countryIds: number[];
  currency: Currency | null;
  minPrice: number | null;
  maxPrice: number | null;
  homeTestOnly: boolean;
  sortBy: ServiceSort;
  page: number;
  pageSize: number;
}

export interface FacetOption<T extends string | number> {
  value: T;
  label: string;
  count: number;
  disabled: boolean;
}

export interface ServiceFacets {
  serviceTypes: FacetOption<ServiceType>[];
  categories: FacetOption<string>[];
  subcategories: FacetOption<string>[];
  providers: FacetOption<number>[];
  cities: FacetOption<string>[];
  countries: FacetOption<number>[];
  currencies: FacetOption<Currency>[];
}

export interface ServiceFilterResult {
  services: Service[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  facets: ServiceFacets;
}

const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  package: "Packages",
  lab_test: "Lab tests",
  wellness: "Wellness",
  service: "Services",
  insurance: "Insurance",
};

export const DEFAULT_SERVICE_FILTERS: ServiceFilters = {
  search: "",
  serviceTypes: [],
  categoryIds: [],
  subcategoryIds: [],
  providerIds: [],
  cityNames: [],
  countryIds: [],
  currency: null,
  minPrice: null,
  maxPrice: null,
  homeTestOnly: false,
  sortBy: "relevance",
  page: 1,
  pageSize: 20,
};

function normalize(value: string | null | undefined): string {
  return (value ?? "").trim().toLocaleLowerCase();
}

function getProviderMap(data: ServiceExplorerData) {
  return new Map(data.providers.map((provider) => [provider.id, provider]));
}

type CategoryRecord = ServiceExplorerData["categories"][number];

const categoryMapCache = new WeakMap<
  ServiceExplorerData,
  Map<string, CategoryRecord>
>();

function getCategoryMap(
  data: ServiceExplorerData,
): Map<string, CategoryRecord> {
  const cached = categoryMapCache.get(data);

  if (cached) {
    return cached;
  }

  const categories = new Map(
    data.categories.map((category) => [category.id, category]),
  );

  categoryMapCache.set(data, categories);

  return categories;
}

function getSearchText(
  service: Service,
  provider: Provider | undefined,
  data: ServiceExplorerData,
): string {
  const categories = getCategoryMap(data);
  const category = categories.get(service.categoryId);
  const subcategory = service.subCategoryId
    ? categories.get(service.subCategoryId)
    : undefined;

  return normalize(
    [
      service.title,
      provider?.name,
      provider?.providerInformation.companyName,
      category?.title,
      subcategory?.title,
    ].join(" "),
  );
}

/**
 * Returns the final price used for filtering and sorting.
 * Wellness services use their lowest-priced available option.
 */
export function getComparableServicePrice(
  service: Service,
  provider: Provider | undefined,
): number | null {
  if (!provider) return null;

  const currency = provider.providerInformation.currency;

  if (service.type === "wellness") {
    const prices = service.wellnessPricing
      .map((option) => calculateServicePrice(service, currency, option))
      .filter((price): price is NonNullable<typeof price> => price !== null)
      .map((price) => price.finalPrice);

    return prices.length > 0 ? Math.min(...prices) : null;
  }

  return calculateServicePrice(service, currency)?.finalPrice ?? null;
}

type ExcludedFacet =
  | "search"
  | "serviceTypes"
  | "categories"
  | "subcategories"
  | "providers"
  | "cities"
  | "countries"
  | "price"
  | "homeTest";

function matchesFilters(
  service: Service,
  provider: Provider | undefined,
  data: ServiceExplorerData,
  filters: ServiceFilters,
  exclude?: ExcludedFacet,
): boolean {
  if (!provider || provider.status !== "active" || !service.status) {
    return false;
  }

  const providerInfo = provider.providerInformation;

  if (exclude !== "search" && filters.search.trim()) {
    const query = normalize(filters.search);
    if (!getSearchText(service, provider, data).includes(query)) {
      return false;
    }
  }

  if (
    exclude !== "serviceTypes" &&
    filters.serviceTypes.length > 0 &&
    !filters.serviceTypes.includes(service.type)
  ) {
    return false;
  }

  if (
    exclude !== "categories" &&
    filters.categoryIds.length > 0 &&
    !filters.categoryIds.includes(service.categoryId)
  ) {
    return false;
  }

  if (
    exclude !== "subcategories" &&
    filters.subcategoryIds.length > 0 &&
    (!service.subCategoryId ||
      !filters.subcategoryIds.includes(service.subCategoryId))
  ) {
    return false;
  }

  if (
    exclude !== "providers" &&
    filters.providerIds.length > 0 &&
    !filters.providerIds.includes(provider.id)
  ) {
    return false;
  }

  if (
    exclude !== "cities" &&
    filters.cityNames.length > 0 &&
    !filters.cityNames.includes(providerInfo.city.name)
  ) {
    return false;
  }

  if (
    exclude !== "countries" &&
    filters.countryIds.length > 0 &&
    !filters.countryIds.includes(providerInfo.country.id)
  ) {
    return false;
  }

  if (exclude !== "homeTest" && filters.homeTestOnly && !service.testAtHome) {
    return false;
  }

  if (exclude !== "price") {
    const hasPriceFilter =
      filters.minPrice !== null || filters.maxPrice !== null;

    if (hasPriceFilter) {
      // Never compare prices from different currencies.
      if (!filters.currency || providerInfo.currency !== filters.currency) {
        return false;
      }

      const price = getComparableServicePrice(service, provider);

      // Services without a usable price cannot match a price range.
      if (price === null) return false;

      if (filters.minPrice !== null && price < filters.minPrice) {
        return false;
      }

      if (filters.maxPrice !== null && price > filters.maxPrice) {
        return false;
      }
    }
  }

  return true;
}

function buildFacet<T extends string | number>(
  values: T[],
  getLabel: (value: T) => string,
  countFor: (value: T) => number,
): FacetOption<T>[] {
  return [...new Set(values)]
    .map((value) => {
      const count = countFor(value);
      return {
        value,
        label: getLabel(value),
        count,
        disabled: count === 0,
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));
}

function calculateFacets(
  data: ServiceExplorerData,
  filters: ServiceFilters,
  providers: Map<number, Provider>,
): ServiceFacets {
  const allServices = data.services;

  const countWith = (value: string | number, facet: ExcludedFacet): number => {
    const candidateFilters = { ...filters };

    switch (facet) {
      case "serviceTypes":
        candidateFilters.serviceTypes = [value as ServiceType];
        break;
      case "categories":
        candidateFilters.categoryIds = [value as string];
        // A category count should not be constrained by subcategory.
        candidateFilters.subcategoryIds = [];
        break;
      case "subcategories":
        candidateFilters.subcategoryIds = [value as string];
        break;
      case "providers":
        candidateFilters.providerIds = [value as number];
        break;
      case "cities":
        candidateFilters.cityNames = [value as string];
        break;
      case "countries":
        candidateFilters.countryIds = [value as number];
        break;
    }

    return allServices.filter((service) =>
      matchesFilters(
        service,
        providers.get(service.userId),
        data,
        candidateFilters,
        facet,
      ),
    ).length;
  };

  const countForFacet = (
    value: string | number,
    facet: ExcludedFacet,
  ): number => {
    const candidateFilters: ServiceFilters = { ...filters };

    switch (facet) {
      case "serviceTypes":
        candidateFilters.serviceTypes = [value as ServiceType];
        break;
      case "categories":
        candidateFilters.categoryIds = [value as string];
        candidateFilters.subcategoryIds = [];
        break;
      case "subcategories":
        candidateFilters.subcategoryIds = [value as string];
        break;
      case "providers":
        candidateFilters.providerIds = [value as number];
        break;
      case "cities":
        candidateFilters.cityNames = [value as string];
        break;
      case "countries":
        candidateFilters.countryIds = [value as number];
        break;
      default:
        return 0;
    }

    return allServices.filter((service) =>
      matchesFilters(
        service,
        providers.get(service.userId),
        data,
        candidateFilters,
      ),
    ).length;
  };

  const categoryById = getCategoryMap(data);
  const providerValues = data.providers
    .filter((provider) => provider.status === "active")
    .map((provider) => provider.id);

  const categoryOptions = data.categories.filter(
    (category) => category.status && !category.parentId,
  );
  const subcategoryOptions = data.categories.filter(
    (category) => category.status && category.parentId,
  );

  // Keep only facet values present in the supplied dataset.
  const cityValues = data.providers
    .filter((provider) => provider.status === "active")
    .map((provider) => provider.providerInformation.city.name);

  const countryValues = data.providers
    .filter((provider) => provider.status === "active")
    .map((provider) => provider.providerInformation.country.id);

  const currencyValues = data.providers
    .filter((provider) => provider.status === "active")
    .map((provider) => provider.providerInformation.currency);

  return {
    serviceTypes: buildFacet(
      allServices.map((service) => service.type),
      (type) => SERVICE_TYPE_LABELS[type],
      (type) => countForFacet(type, "serviceTypes"),
    ),
    categories: buildFacet(
      categoryOptions.map((category) => category.id),
      (id) => categoryById.get(id)?.title ?? id,
      (id) => countForFacet(id, "categories"),
    ),
    subcategories: buildFacet(
      subcategoryOptions.map((category) => category.id),
      (id) => categoryById.get(id)?.title ?? id,
      (id) => countForFacet(id, "subcategories"),
    ),
    providers: buildFacet(
      providerValues,
      (id) => providers.get(id)?.name ?? `Provider ${id}`,
      (id) => countForFacet(id, "providers"),
    ),
    cities: buildFacet(
      cityValues,
      (city) => city,
      (city) => countForFacet(city, "cities"),
    ),
    countries: buildFacet(
      countryValues,
      (id) =>
        data.providers.find(
          (provider) => provider.providerInformation.country.id === id,
        )?.providerInformation.country.name ?? String(id),
      (id) => countForFacet(id, "countries"),
    ),
    currencies: buildFacet(
      currencyValues,
      (currency) => currency,
      (currency) =>
        allServices.filter((service) => {
          const provider = providers.get(service.userId);
          return (
            provider?.status === "active" &&
            service.status &&
            provider.providerInformation.currency === currency &&
            matchesFilters(
              service,
              provider,
              data,
              { ...filters, currency, minPrice: null, maxPrice: null },
              "price",
            )
          );
        }).length,
    ),
  };
}

function getRelevanceScore(
  service: Service,
  provider: Provider | undefined,
  data: ServiceExplorerData,
  search: string,
): number {
  const query = normalize(search);
  if (!query) return 0;

  const title = normalize(service.title);
  const providerName = normalize(provider?.name);
  const categories = getCategoryMap(data);
  const categoryName = normalize(categories.get(service.categoryId)?.title);
  const subcategoryName = normalize(
    service.subCategoryId ? categories.get(service.subCategoryId)?.title : "",
  );

  if (title === query) return 100;
  if (title.startsWith(query)) return 80;
  if (title.includes(query)) return 60;
  if (providerName.includes(query)) return 40;
  if (categoryName.includes(query) || subcategoryName.includes(query)) {
    return 20;
  }

  return 0;
}

function sortServices(
  services: Service[],
  data: ServiceExplorerData,
  providers: Map<number, Provider>,
  filters: ServiceFilters,
): Service[] {
  const sorted = [...services];

  sorted.sort((a, b) => {
    const providerA = providers.get(a.userId);
    const providerB = providers.get(b.userId);

    if (filters.sortBy === "relevance") {
      const scoreDifference =
        getRelevanceScore(b, providerB, data, filters.search) -
        getRelevanceScore(a, providerA, data, filters.search);

      if (scoreDifference !== 0) return scoreDifference;
    }

    if (filters.sortBy === "price-asc" || filters.sortBy === "price-desc") {
      const priceA = getComparableServicePrice(a, providerA);
      const priceB = getComparableServicePrice(b, providerB);
      const currencyA = providerA?.providerInformation.currency ?? "";
      const currencyB = providerB?.providerInformation.currency ?? "";

      // Without FX rates, currencies are grouped, never compared as
      // if their numeric amounts had the same value.
      if (currencyA !== currencyB) {
        return currencyA.localeCompare(currencyB);
      }

      if (priceA === null && priceB !== null) return 1;
      if (priceA !== null && priceB === null) return -1;

      if (priceA !== null && priceB !== null && priceA !== priceB) {
        return filters.sortBy === "price-asc"
          ? priceA - priceB
          : priceB - priceA;
      }
    }

    if (filters.sortBy === "rating") {
      const ratingA = providerA?.providerInformation.rating;
      const ratingB = providerB?.providerInformation.rating;

      const validA = typeof ratingA === "number" && Number.isFinite(ratingA);
      const validB = typeof ratingB === "number" && Number.isFinite(ratingB);

      if (validA !== validB) return validA ? -1 : 1;
      if (validA && validB && ratingA !== ratingB) {
        return ratingB - ratingA;
      }
    }

    // Stable deterministic tie-breaker.
    return a.id.localeCompare(b.id);
  });

  return sorted;
}

export function filterServices(
  data: ServiceExplorerData,
  filters: ServiceFilters,
): ServiceFilterResult {
  const providers = getProviderMap(data);

  const matchingServices = data.services.filter((service) =>
    matchesFilters(service, providers.get(service.userId), data, filters),
  );

  const sortedServices = sortServices(
    matchingServices,
    data,
    providers,
    filters,
  );

  const pageSize = Math.max(1, Math.floor(filters.pageSize) || 20);
  const pageCount = Math.ceil(sortedServices.length / pageSize);
  const page = Math.min(
    Math.max(1, Math.floor(filters.page) || 1),
    Math.max(1, pageCount),
  );
  const start = (page - 1) * pageSize;

  return {
    services: sortedServices.slice(start, start + pageSize),
    total: sortedServices.length,
    page,
    pageSize,
    pageCount,
    facets: calculateFacets(data, filters, providers),
  };
}
