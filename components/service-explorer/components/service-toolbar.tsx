import { LayoutGrid, List, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ServiceFilters } from "@/lib/service-filters";

interface ServiceToolbarProps {
  total: number;
  providerCount: number;
  activeFilterCount: number;
  sortBy: ServiceFilters["sortBy"];
  listView: boolean;
  onSortChange: (sortBy: ServiceFilters["sortBy"]) => void;
  onListViewChange: (listView: boolean) => void;
  onOpenFilters: () => void;
}

export function ServiceToolbar({
  total,
  providerCount,
  activeFilterCount,
  sortBy,
  listView,
  onSortChange,
  onListViewChange,
  onOpenFilters,
}: ServiceToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 py-5">
      <div>
        <h2 className="text-lg font-semibold tracking-[-0.02em] text-slate-950">
          Explore healthcare services
        </h2>

        <p className="mt-1 text-xs text-slate-500" aria-live="polite">
          <span className="font-semibold text-slate-700">
            {total.toLocaleString()} services
          </span>
          {" from "}
          <span className="font-semibold text-slate-700">
            {providerCount} providers
          </span>
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" className="lg:hidden" onClick={onOpenFilters}>
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
            onClick={() => onListViewChange(false)}
          >
            <LayoutGrid />
          </Button>

          <Button
            variant={listView ? "secondary" : "ghost"}
            size="icon-sm"
            aria-label="List view"
            aria-pressed={listView}
            onClick={() => onListViewChange(true)}
          >
            <List />
          </Button>
        </div>

        <label className="hidden items-center gap-2 text-xs text-slate-500 sm:flex">
          Sort by
          <select
            value={sortBy}
            onChange={(event) =>
              onSortChange(event.target.value as ServiceFilters["sortBy"])
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
  );
}
