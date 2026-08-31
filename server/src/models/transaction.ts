import type { ShippingOption } from "./shipping-option";

export interface Address {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
}

export interface TransactionItem {
  productId: number;
  productName: string;
  image: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface TransactionPayment {
  method: string;
  status: string;
}

export interface Transaction {
  id: string;
  createdAt: string;
  status: string;
  items: TransactionItem[];
  address: Address;
  shipping: ShippingOption;
  payment: TransactionPayment;
  subtotal: number;
  shippingCost: number;
  total: number;
}

/** Lightweight projection for GET /api/transactions (history list). */
export interface TransactionSummary {
  id: string;
  createdAt: string;
  status: string;
  itemCount: number;
  total: number;
}
