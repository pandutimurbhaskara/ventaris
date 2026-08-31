import path from "node:path";

import "dotenv/config";

type NodeEnv = "development" | "production" | "test";

function requireNumber(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw === "") return fallback;

  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Invalid ${name}: expected a positive integer, got "${raw}"`);
  }
  return parsed;
}

function readNodeEnv(): NodeEnv {
  const raw = process.env.NODE_ENV;
  return raw === "production" || raw === "test" ? raw : "development";
}

export const env = {
  nodeEnv: readNodeEnv(),
  port: requireNumber("PORT", 3000),
  /** Comma-separated list; "*" (default) allows any origin. */
  corsOrigin: process.env.CORS_ORIGIN?.trim() || "*",
  /**
   * SQLite file path. Relative paths resolve against the server package root. A getter (not a
   * frozen value) so tests that set process.env.DB_PATH after this module has already loaded
   * — but before db/client.ts's lazily-created connection is first used — still take effect.
   */
  get dbPath(): string {
    return path.resolve(process.cwd(), process.env.DB_PATH?.trim() || "data/marketplace.db");
  },
} as const;

export const isProduction = env.nodeEnv === "production";
