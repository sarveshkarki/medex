import {
  DEFAULT_SERVICE_FILTERS,
  type ServiceFilters,
  type ServiceSort,
} from "@/lib/service-filters";
import type { Currency, ServiceType } from "@/types/service";

const VALID_SERVICE_TYPES: ServiceType[] = [
  "package",
  "lab_test",
  "wellness",
  "service",
  "insurance",
];

const VALID_SORTS: ServiceSort[] = [
  "relevance",
  "price-asc",
  "price-desc",
  "rating",
];

const VALID_CURRENCIES: Currency[] = ["THB", "NPR", "INR"];

function parseNumber(value: string | null): number | null {
  if (value === null || value.trim() === "") return null;

  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function parseNumberList(value: string | null): number[] {
  if (!value) return [];

  return [
    ...new Set(
      value
        .split(",")
        .map(Number)
        .filter((item) => Number.isInteger(item) && item > 0),
    ),
  ];
}

function parseStringList(value: string | null): string[] {
  if (!value) return [];

  return [
    ...new Set(
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
}

export function parseServiceFilters(params: URLSearchParams): ServiceFilters {
  const rawTypes = parseStringList(params.get("type"));
  const rawSort = params.get("sort");
  const rawCurrency = params.get("currency");

  const page = Number(params.get("page"));

  return {
    ...DEFAULT_SERVICE_FILTERS,
    search: params.get("q") ?? "",
    serviceTypes: rawTypes.filter((type): type is ServiceType =>
      VALID_SERVICE_TYPES.includes(type as ServiceType),
    ),
    categoryIds: parseStringList(params.get("category")),
    subcategoryIds: parseStringList(params.get("subcategory")),
    providerIds: parseNumberList(params.get("provider")),
    cityNames: parseStringList(params.get("city")),
    countryIds: parseNumberList(params.get("country")),
    currency: VALID_CURRENCIES.includes(rawCurrency as Currency)
      ? (rawCurrency as Currency)
      : null,
    minPrice: parseNumber(params.get("min")),
    maxPrice: parseNumber(params.get("max")),
    homeTestOnly: params.get("home") === "true",
    sortBy: VALID_SORTS.includes(rawSort as ServiceSort)
      ? (rawSort as ServiceSort)
      : DEFAULT_SERVICE_FILTERS.sortBy,
    page:
      Number.isInteger(page) && page > 0 ? page : DEFAULT_SERVICE_FILTERS.page,
  };
}

export function serializeServiceFilters(
  filters: ServiceFilters,
): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.search) params.set("q", filters.search);

  if (filters.serviceTypes.length) {
    params.set("type", filters.serviceTypes.join(","));
  }

  if (filters.categoryIds.length) {
    params.set("category", filters.categoryIds.join(","));
  }

  if (filters.subcategoryIds.length) {
    params.set("subcategory", filters.subcategoryIds.join(","));
  }

  if (filters.providerIds.length) {
    params.set("provider", filters.providerIds.join(","));
  }

  if (filters.cityNames.length) {
    params.set("city", filters.cityNames.join(","));
  }

  if (filters.countryIds.length) {
    params.set("country", filters.countryIds.join(","));
  }

  if (filters.currency) params.set("currency", filters.currency);
  if (filters.minPrice !== null) params.set("min", String(filters.minPrice));
  if (filters.maxPrice !== null) params.set("max", String(filters.maxPrice));

  if (filters.homeTestOnly) params.set("home", "true");

  if (filters.sortBy !== DEFAULT_SERVICE_FILTERS.sortBy) {
    params.set("sort", filters.sortBy);
  }

  if (filters.page > 1) params.set("page", String(filters.page));

  return params;
}
