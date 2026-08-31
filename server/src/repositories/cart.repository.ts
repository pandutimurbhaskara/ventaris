import type { CartItem } from "../models/cart";

/**
 * In-memory cart for the single demo user (no auth, no persistence).
 * Keyed by productId -> quantity.
 */
const cart = new Map<number, number>();

export function getCartItems(): CartItem[] {
  return Array.from(cart.entries()).map(([productId, quantity]) => ({ productId, quantity }));
}

export function getCartItemQuantity(productId: number): number | undefined {
  return cart.get(productId);
}

export function setCartItemQuantity(productId: number, quantity: number): void {
  cart.set(productId, quantity);
}

export function deleteCartItem(productId: number): boolean {
  return cart.delete(productId);
}

export function clearCartItems(): void {
  cart.clear();
}
