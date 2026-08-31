import { Router } from "express";

import { addCartItem, clearCart, getCart, removeCartItem, updateCartItem } from "../controllers/cart.controller";

export const cartRouter = Router();

cartRouter.get("/", getCart);
cartRouter.post("/items", addCartItem);
cartRouter.patch("/items/:productId", updateCartItem);
cartRouter.delete("/items/:productId", removeCartItem);
cartRouter.delete("/", clearCart);
