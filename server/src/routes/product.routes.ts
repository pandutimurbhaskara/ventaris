import { Router } from "express";

import { getProductById, getProducts } from "../controllers/product.controller";

export const productRouter = Router();

productRouter.get("/", getProducts);
productRouter.get("/:id", getProductById);
