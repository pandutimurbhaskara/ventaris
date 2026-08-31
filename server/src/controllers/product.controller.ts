import type { Request, Response } from "express";

import { HttpError } from "../middleware/http-error";
import type { Product } from "../models/product";
import { findAllProducts, findProductById, findProductsByExactName } from "../repositories/product.repository";
import type { ApiSuccess } from "../types/api-response";

export function getProducts(req: Request, res: Response<ApiSuccess<Product[]>>): void {
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  const data = search ? findProductsByExactName(search) : findAllProducts();
  res.json({ success: true, data });
}

export function getProductById(req: Request<{ id: string }>, res: Response<ApiSuccess<Product>>): void {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw HttpError.badRequest(`Invalid product id: "${req.params.id}"`);
  }

  const product = findProductById(id);
  if (!product) {
    throw HttpError.notFound(`Product ${id} not found`);
  }

  res.json({ success: true, data: product });
}
