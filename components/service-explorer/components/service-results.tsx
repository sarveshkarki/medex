import { CircleHelp } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Provider, Service } from "@/types/service";

import { ProviderGroup } from "./provider-group";

interface ProviderGroupData {
  provider: Provider;
  services: Service[];
}

interface ServiceResultsProps {
  groupedProviders: ProviderGroupData[];
  categories: Map<string, { title: string; parentId: string | null }>;
  listView: boolean;
  onClearFilters: () => void;
}

export function ServiceResults({
  groupedProviders,
  categories,
  listView,
  onClearFilters,
}: ServiceResultsProps) {
  if (groupedProviders.length === 0) {
    return (
      <div className="flex min-h-80 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 text-center">
        <CircleHelp className="size-8 text-[#7bbcb8]" />

        <h3 className="mt-4 font-semibold text-slate-900">
          No services match those filters
        </h3>

        <p className="mt-1 max-w-sm text-sm text-slate-500">
          Try another search or remove a filter to see more care options.
        </p>

        <Button variant="outline" className="mt-5" onClick={onClearFilters}>
          Clear filters
        </Button>
      </div>
    );
  }

  return (
    <div>
      {groupedProviders.map(({ provider, services }) => (
        <ProviderGroup
          key={provider.id}
          provider={provider}
          services={services}
          categories={categories}
          listView={listView}
        />
      ))}
    </div>
  );
}
