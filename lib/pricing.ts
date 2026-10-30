import type { Currency, Service, WellnessPricing } from "@/types/service";

export interface PriceBreakdown {
  basePrice: number;
  discountAmount: number;
  priceAfterDiscount: number;
  serviceChargeAmount: number;
  finalPrice: number;
  currency: Currency;
}

type PricingFields = Pick<
  Service,
  "price" | "discount" | "discountType" | "serviceCharge" | "serviceChargeType"
>;

function toAmount(value: string | null): number {
  if (value === null) return 0;

  const amount = Number(value);

  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error(`Invalid monetary amount: ${value}`);
  }

  return amount;
}

function calculateBreakdown(
  pricing: PricingFields,
  currency: Currency,
): PriceBreakdown | null {
  if (pricing.price === null) return null;

  const basePrice = toAmount(pricing.price);
  const discount = toAmount(pricing.discount);

  const discountAmount =
    pricing.discountType === "percent"
      ? (basePrice * discount) / 100
      : pricing.discountType === "amount"
        ? discount
        : 0;

  const priceAfterDiscount = basePrice - discountAmount;

  if (priceAfterDiscount < 0) {
    return null;
  }

  const serviceCharge = toAmount(pricing.serviceCharge);

  const serviceChargeAmount =
    pricing.serviceChargeType === "percent"
      ? (priceAfterDiscount * serviceCharge) / 100
      : pricing.serviceChargeType === "amount"
        ? serviceCharge
        : 0;

  return {
    basePrice,
    discountAmount,
    priceAfterDiscount,
    serviceChargeAmount,
    finalPrice: priceAfterDiscount + serviceChargeAmount,
    currency,
  };
}

export function calculateServicePrice(
  service: Service,
  currency: Currency,
  wellnessOption?: WellnessPricing,
): PriceBreakdown | null {
  // Wellness services are priced by duration, not by the top-level price.
  if (service.type === "wellness") {
    if (!wellnessOption) return null;

    return calculateBreakdown(
      {
        price: wellnessOption.price,
        discount: wellnessOption.discount,
        discountType: wellnessOption.discountType,
        serviceCharge: wellnessOption.serviceCharge,
        serviceChargeType: wellnessOption.serviceChargeType,
      },
      currency,
    );
  }

  return calculateBreakdown(service, currency);
}

// Formatting is the presentation boundary: calculation values remain unrounded.

export function formatPrice(
  amount: number,
  currency: Currency,
  locale = "en",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
