import { Button } from "@/components/ui/button";
import { calculateServicePrice, formatPrice } from "@/lib/pricing";
import { Provider, Service, ServiceType } from "@/types/service";
import { Clock3, Home } from "lucide-react";

const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  package: "Health Packages",
  lab_test: "Lab Tests",
  wellness: "Wellness",
  service: "Services",
  insurance: "Insurance",
};

interface ServiceCardProps {
  service: Service;
  provider: Provider;
  category: string;
}

export function ServiceCard({ service, provider, category }: ServiceCardProps) {
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
