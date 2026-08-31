import type { ShippingOption } from "../models/shipping-option";

/** Fixed enumeration, not DB-backed — mirrors payment-method.repository.ts. */
const SHIPPING_OPTIONS: ShippingOption[] = [
  { id: "regular", name: "Regular", price: 15000, estimatedDelivery: "2-4 days" },
  { id: "express", name: "Express", price: 30000, estimatedDelivery: "1-2 days" },
  { id: "same_day", name: "Same Day", price: 50000, estimatedDelivery: "Today" },
];

export function findAllShippingOptions(): ShippingOption[] {
  return SHIPPING_OPTIONS;
}

export function findShippingOptionById(id: string): ShippingOption | undefined {
  return SHIPPING_OPTIONS.find((option) => option.id === id);
}
