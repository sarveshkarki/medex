import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ServiceFiltersPanel } from "./service-filters-panel";

import type { ServiceExplorerData } from "@/types/service";
import type { ServiceFilters } from "@/lib/service-filters";

interface ServiceFilterDrawerProps {
  open: boolean;
  data: ServiceExplorerData;
  filters: ServiceFilters;
  resultCount: number;
  onChange: (filters: ServiceFilters) => void;
  onClearFilters: () => void;
  onClose: () => void;
}

export function ServiceFilterDrawer({
  open,
  data,
  filters,
  resultCount,
  onChange,
  onClearFilters,
  onClose,
}: ServiceFilterDrawerProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/25 lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Filter results"
    >
      <button
        type="button"
        className="absolute inset-0 size-full cursor-default"
        onClick={onClose}
        aria-label="Close filter drawer"
      />

      <div className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold">Filter results</h2>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close filters"
          >
            <X />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <ServiceFiltersPanel
            data={data}
            filters={filters}
            onChange={onChange}
            mobile
          />
        </div>

        <div className="flex items-center gap-3 border-t border-slate-200 bg-white p-4">
          <Button variant="ghost" className="flex-1" onClick={onClearFilters}>
            Reset
          </Button>

          <Button
            className="flex-[2] bg-[#166b68] hover:bg-[#115a57]"
            onClick={onClose}
          >
            Show {resultCount} results
          </Button>
        </div>
      </div>
    </div>
  );
}
