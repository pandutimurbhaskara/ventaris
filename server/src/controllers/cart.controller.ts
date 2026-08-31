import type { Request, Response } from "express";

import { HttpError } from "../middleware/http-error";
import type { CartItemView, CartResponse } from "../models/cart";
import {
  clearCartItems,
  deleteCartItem,
  getCartItemQuantity,
  getCartItems,
  setCartItemQuantity,
} from "../repositories/cart.repository";
import { findProductById } from "../repositories/product.repository";
import type { ApiSuccess } from "../types/api-response";

function parseProductId(raw: string): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) {
    throw HttpError.badRequest(`Invalid product id: "${raw}"`);
  }
  return id;
}

/** Accepts a number or numeric string (bodies come from JSON, but be lenient). */
function parseBodyProductId(raw: unknown): number {
  if (typeof raw !== "number" && typeof raw !== "string") {
    throw HttpError.badRequest("productId is required");
  }
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) {
    throw HttpError.badRequest(`Invalid product id: "${String(raw)}"`);
  }
  return id;
}

function parseQuantity(raw: unknown): number {
  if (typeof raw !== "number" || !Number.isInteger(raw) || raw <= 0) {
    throw HttpError.badRequest("quantity must be a positive integer");
  }
  return raw;
}

function buildCartResponse(): CartResponse {
  const items: CartItemView[] = [];
  let subtotal = 0;
  let itemCount = 0;

  for (const { productId, quantity } of getCartItems()) {
    const product = findProductById(productId);
    if (!product) continue;

    const itemSubtotal = product.price * quantity;
    items.push({
      productId,
      name: product.name,
      image: product.image,
      price: product.price,
      quantity,
      stock: product.stock,
      subtotal: itemSubtotal,
    });
    subtotal += itemSubtotal;
    itemCount += quantity;
  }

  return { items, subtotal, itemCount };
}

export function getCart(_req: Request, res: Response<ApiSuccess<CartResponse>>): void {
  res.json({ success: true, data: buildCartResponse() });
}

interface AddCartItemBody {
  productId?: unknown;
  quantity?: unknown;
}

export function addCartItem(
  req: Request<unknown, unknown, AddCartItemBody>,
  res: Response<ApiSuccess<CartResponse>>,
): void {
  const productId = parseBodyProductId(req.body.productId);
  const quantity = parseQuantity(req.body.quantity);

  const product = findProductById(productId);
  if (!product) {
    throw HttpError.notFound(`Product ${productId} not found`);
  }

  const nextQuantity = (getCartItemQuantity(productId) ?? 0) + quantity;
  if (nextQuantity > product.stock) {
    throw HttpError.conflict(`Requested quantity (${nextQuantity}) exceeds available stock (${product.stock})`);
  }

  setCartItemQuantity(productId, nextQuantity);

  res.json({ success: true, data: buildCartResponse() });
}

interface UpdateCartItemBody {
  quantity?: unknown;
}

export function updateCartItem(
  req: Request<{ productId: string }, unknown, UpdateCartItemBody>,
  res: Response<ApiSuccess<CartResponse>>,
): void {
  const productId = parseProductId(req.params.productId);
  const quantity = parseQuantity(req.body.quantity);

  if (getCartItemQuantity(productId) === undefined) {
    throw HttpError.notFound(`Cart item ${productId} not found`);
  }

  const product = findProductById(productId);
  if (!product) {
    throw HttpError.notFound(`Product ${productId} not found`);
  }

  if (quantity > product.stock) {
    throw HttpError.conflict(`Requested quantity (${quantity}) exceeds available stock (${product.stock})`);
  }

  setCartItemQuantity(productId, quantity);

  res.json({ success: true, data: buildCartResponse() });
}

export function removeCartItem(req: Request<{ productId: string }>, res: Response<ApiSuccess<CartResponse>>): void {
  const productId = parseProductId(req.params.productId);

  if (!deleteCartItem(productId)) {
    throw HttpError.notFound(`Cart item ${productId} not found`);
  }

  res.json({ success: true, data: buildCartResponse() });
}

export function clearCart(_req: Request, res: Response<ApiSuccess<CartResponse>>): void {
  clearCartItems();
  res.json({ success: true, data: buildCartResponse() });
}
