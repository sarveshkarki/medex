import { ChevronDown, MapPin, Star } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import type { Provider, Service } from "@/types/service";

import { ServiceCard } from "./service-card";

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

interface ProviderGroupProps {
  provider: Provider;
  services: Service[];
  categories: Map<string, { title: string; parentId: string | null }>;
  listView: boolean;
}

export function ProviderGroup({
  provider,
  services,
  categories,
  listView,
}: ProviderGroupProps) {
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
        <button
          type="button"
          className="mt-3 inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-[#166b68] hover:bg-slate-50"
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
        </button>
      )}
    </section>
  );
}
