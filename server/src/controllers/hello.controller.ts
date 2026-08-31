import type { Request, Response } from "express";

export interface HelloResponse {
  message: string;
}

export function getHello(req: Request, res: Response<HelloResponse>): void {
  const name = typeof req.query.name === "string" ? req.query.name.trim() : "";
  res.json({ message: `Hello from Express, ${name || "world"}!` });
}
