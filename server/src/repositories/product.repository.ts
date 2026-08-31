import type { Statement } from "better-sqlite3";

import { db } from "../db/client";
import { type Product, type ProductRow, toProduct } from "../models/product";

// Prepared lazily, not at module load: this module is required (and thus
// `db.prepare`d) before src/index.ts runs migrate(), which would otherwise
// fail against a table that doesn't exist yet.
let selectAllStmt: Statement<[], ProductRow> | undefined;
let selectByIdStmt: Statement<[number], ProductRow> | undefined;
let selectByExactNameStmt: Statement<[string], ProductRow> | undefined;
let updateStockStmt: Statement<[number, number], unknown> | undefined;

function selectAll(): Statement<[], ProductRow> {
  return (selectAllStmt ??= db.prepare("SELECT * FROM products ORDER BY id ASC"));
}

function selectById(): Statement<[number], ProductRow> {
  return (selectByIdStmt ??= db.prepare("SELECT * FROM products WHERE id = ?"));
}

function selectByExactName(): Statement<[string], ProductRow> {
  return (selectByExactNameStmt ??= db.prepare("SELECT * FROM products WHERE LOWER(name) = LOWER(?)"));
}

function updateStock(): Statement<[number, number], unknown> {
  return (updateStockStmt ??= db.prepare("UPDATE products SET stock = ? WHERE id = ?"));
}

export function findAllProducts(): Product[] {
  return selectAll().all().map(toProduct);
}

export function findProductById(id: number): Product | undefined {
  const row = selectById().get(id);
  return row ? toProduct(row) : undefined;
}

/** Case-insensitive exact match against product.name — no partial or fuzzy matching. */
export function findProductsByExactName(name: string): Product[] {
  return selectByExactName().all(name).map(toProduct);
}

export function updateProductStock(id: number, stock: number): void {
  updateStock().run(stock, id);
}
