import fs from "node:fs";
import path from "node:path";

import Database from "better-sqlite3";

import { env } from "../config/env";

let instance: Database.Database | undefined;

/**
 * Opened lazily (on first real use, e.g. inside migrate()) rather than at module load, so
 * that code which sets process.env.DB_PATH right after importing this module — before
 * calling into it — still targets the intended file. Opening eagerly here would read
 * env.dbPath too early: static imports are hoisted above ordinary statements under tsx/ESM,
 * so an eager open could run before a later `process.env.DB_PATH = ...` line.
 */
function open(): Database.Database {
  fs.mkdirSync(path.dirname(env.dbPath), { recursive: true });
  const db = new Database(env.dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  return db;
}

export const db: Database.Database = new Proxy({} as Database.Database, {
  get(_target, prop, receiver) {
    instance ??= open();
    const value = Reflect.get(instance, prop, instance);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
