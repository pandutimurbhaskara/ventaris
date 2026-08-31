import { Router } from "express";

import { getPaymentMethods } from "../controllers/payment-method.controller";

export const paymentMethodRouter = Router();

paymentMethodRouter.get("/", getPaymentMethods);
