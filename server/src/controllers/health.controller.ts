import type { Request, Response } from "express";

import { env } from "../config/env";

export interface HealthResponse {
  status: "ok";
  env: string;
  uptime: number;
  timestamp: string;
}

export function getHealth(_req: Request, res: Response<HealthResponse>): void {
  res.json({
    status: "ok",
    env: env.nodeEnv,
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
}
