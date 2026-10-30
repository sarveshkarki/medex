import { useMemo, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { filterServices, type ServiceFilters } from "@/lib/service-filters";
import type { ServiceExplorerData, ServiceType } from "@/types/service";

const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  package: "Health Packages",
  lab_test: "Lab Tests",
  wellness: "Wellness",
  service: "Services",
  insurance: "Insurance",
};

interface CheckboxRowProps {
  label: string;
  count: number;
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
}

function CheckboxRow({
  label,
  count,
  checked,
  disabled,
  onChange,
}: CheckboxRowProps) {
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

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: FilterSectionProps) {
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

interface ServiceFiltersPanelProps {
  data: ServiceExplorerData;
  filters: ServiceFilters;
  onChange: (filters: ServiceFilters) => void;
  mobile?: boolean;
}

export function ServiceFiltersPanel({
  data,
  filters,
  onChange,
  mobile = false,
}: ServiceFiltersPanelProps) {
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
          <input
            aria-label="Search providers"
            className="h-8 w-full rounded-md border border-slate-200 px-2 text-xs outline-none focus:border-[#20837e] focus:ring-2 focus:ring-[#20837e]/15"
            placeholder="Search providers"
            value={providerSearch}
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
          count={data.services.filter((service) => service.testAtHome).length}
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
