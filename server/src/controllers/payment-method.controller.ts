import type { Request, Response } from "express";

import type { PaymentMethod } from "../models/payment-method";
import { findAllPaymentMethods } from "../repositories/payment-method.repository";
import type { ApiSuccess } from "../types/api-response";

export function getPaymentMethods(_req: Request, res: Response<ApiSuccess<PaymentMethod[]>>): void {
  res.json({ success: true, data: findAllPaymentMethods() });
}
