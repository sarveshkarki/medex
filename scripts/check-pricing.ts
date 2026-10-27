import assert from "node:assert/strict";
import dataset from "../data/task1-service-explorer.json";
import { calculateServicePrice, formatPrice } from "../lib/pricing";
import type { Service, Currency } from "../types/service";

const service = dataset.services.find(
  (item) => item.id === "5f0c1a52-6b1e-4c1f-9a51-000000000001",
)! as Service;

const price = calculateServicePrice(service, "THB");

assert.ok(price);
assert.equal(price.basePrice, 6200);
assert.equal(price.discountAmount, 620);
assert.equal(price.priceAfterDiscount, 5580);
assert.ok(Math.abs(price.serviceChargeAmount - 390.6) < 0.000001);
assert.ok(Math.abs(price.finalPrice - 5970.6) < 0.000001);

// Amount-based discount and service charge.
const amountBasedPrice = calculateServicePrice(
  {
    ...service,
    price: "3500.00",
    discount: "500.00",
    discountType: "amount",
    serviceCharge: "100.00",
    serviceChargeType: "amount",
  },
  "NPR",
);

assert.ok(amountBasedPrice);
assert.equal(amountBasedPrice.discountAmount, 500);
assert.equal(amountBasedPrice.priceAfterDiscount, 3000);
assert.equal(amountBasedPrice.serviceChargeAmount, 100);
assert.equal(amountBasedPrice.finalPrice, 3100);
assert.equal(amountBasedPrice.currency, "NPR");

// Wellness uses a duration-specific option.
const wellness = dataset.services.find(
  (item) => item.type === "wellness" && item.wellnessPricing.length > 0,
)! as Service;

assert.equal(calculateServicePrice(wellness, "THB"), null);

const wellnessOption = wellness.wellnessPricing[1];
const wellnessPrice = calculateServicePrice(wellness, "THB", wellnessOption);

assert.ok(wellnessPrice);
assert.equal(wellnessPrice.basePrice, 2400);
assert.equal(wellnessPrice.discountAmount, 360);
assert.equal(wellnessPrice.priceAfterDiscount, 2040);
assert.equal(wellnessPrice.finalPrice, 2040);

// Formatting rounds only for display.
assert.equal(formatPrice(5970.599, "THB"), "THB 5,970.60");

// Null price stays unavailable rather than becoming zero.
assert.equal(calculateServicePrice({ ...service, price: null }, "NPR"), null);

console.log("Pricing verification passed.");
