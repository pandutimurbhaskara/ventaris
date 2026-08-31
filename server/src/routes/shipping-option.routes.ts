import { Router } from "express";

import { getShippingOptions } from "../controllers/shipping-option.controller";

export const shippingOptionRouter = Router();

shippingOptionRouter.get("/", getShippingOptions);
