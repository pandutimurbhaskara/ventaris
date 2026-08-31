import type { Request, Response } from "express";

import type { ShippingOption } from "../models/shipping-option";
import { findAllShippingOptions } from "../repositories/shipping-option.repository";
import type { ApiSuccess } from "../types/api-response";

export function getShippingOptions(_req: Request, res: Response<ApiSuccess<ShippingOption[]>>): void {
  res.json({ success: true, data: findAllShippingOptions() });
}
