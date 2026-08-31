import type { PaymentMethod } from "../models/payment-method";

/** Fixed enumeration, not DB-backed — mirrors shipping-option.repository.ts. */
const PAYMENT_METHODS: PaymentMethod[] = [
  { id: "bank_transfer", name: "Bank Transfer" },
  { id: "e_wallet", name: "E-Wallet" },
  { id: "credit_card", name: "Credit Card" },
  { id: "cod", name: "Cash on Delivery" },
];

export function findAllPaymentMethods(): PaymentMethod[] {
  return PAYMENT_METHODS;
}

export function findPaymentMethodById(id: string): PaymentMethod | undefined {
  return PAYMENT_METHODS.find((method) => method.id === id);
}
