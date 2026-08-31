import { clearCartItems, getCartItems } from "../repositories/cart.repository";
import { findPaymentMethodById } from "../repositories/payment-method.repository";
import { findProductById } from "../repositories/product.repository";
import { findShippingOptionById } from "../repositories/shipping-option.repository";
import { createTransaction as persistTransaction, type StockUpdate } from "../repositories/transaction.repository";
import { HttpError } from "../middleware/http-error";
import type { Address, Transaction, TransactionItem } from "../models/transaction";
import type { ShippingOption } from "../models/shipping-option";

const ADDRESS_FIELDS: (keyof Address)[] = ["fullName", "phone", "address", "city", "province", "postalCode"];

function validateAddress(raw: unknown): Address {
  if (typeof raw !== "object" || raw === null) {
    throw HttpError.badRequest("address is required");
  }

  const source = raw as Record<string, unknown>;
  const address = {} as Address;

  for (const field of ADDRESS_FIELDS) {
    const value = source[field];
    if (typeof value !== "string" || value.trim().length === 0) {
      throw HttpError.badRequest(`address.${field} is required`);
    }
    address[field] = value.trim();
  }

  return address;
}

function validateShippingSelection(raw: unknown): ShippingOption {
  const id = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>).id : undefined;
  if (typeof id !== "string" || id.length === 0) {
    throw HttpError.badRequest("shipping.id is required");
  }

  // Recomputed from backend data — the submitted name/price are never trusted.
  const option = findShippingOptionById(id);
  if (!option) {
    throw HttpError.badRequest(`Invalid shipping option: "${id}"`);
  }

  return option;
}

function validatePaymentSelection(raw: unknown): string {
  const method = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>).method : undefined;
  if (typeof method !== "string" || method.length === 0) {
    throw HttpError.badRequest("payment.method is required");
  }

  if (!findPaymentMethodById(method)) {
    throw HttpError.badRequest(`Invalid payment method: "${method}"`);
  }

  return method;
}

export interface CreateTransactionInput {
  address?: unknown;
  shipping?: unknown;
  payment?: unknown;
}

export function createTransaction(input: CreateTransactionInput): Transaction {
  const address = validateAddress(input.address);
  const shippingOption = validateShippingSelection(input.shipping);
  const paymentMethod = validatePaymentSelection(input.payment);

  const cartItems = getCartItems();
  if (cartItems.length === 0) {
    throw HttpError.badRequest("Cart is empty");
  }

  const items: TransactionItem[] = [];
  const stockUpdates: StockUpdate[] = [];
  let subtotal = 0;

  for (const { productId, quantity } of cartItems) {
    const product = findProductById(productId);
    if (!product) {
      throw HttpError.notFound("Product not found");
    }
    if (quantity > product.stock) {
      throw HttpError.conflict(`Insufficient stock for "${product.name}"`);
    }

    const itemSubtotal = product.price * quantity;
    items.push({
      productId: product.id,
      productName: product.name,
      image: product.image,
      price: product.price,
      quantity,
      subtotal: itemSubtotal,
    });
    stockUpdates.push({ productId: product.id, newStock: product.stock - quantity });
    subtotal += itemSubtotal;
  }

  const shippingCost = shippingOption.price;
  const total = subtotal + shippingCost;

  const transaction = persistTransaction(
    {
      createdAt: new Date().toISOString(),
      status: "PROCESSING",
      items,
      address,
      shipping: shippingOption,
      payment: { method: paymentMethod, status: "PENDING" },
      subtotal,
      shippingCost,
      total,
    },
    stockUpdates,
  );

  clearCartItems();

  return transaction;
}
