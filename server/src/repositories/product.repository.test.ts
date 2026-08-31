import os from "node:os";
import path from "node:path";

// Must run before any import that transitively pulls in config/env.ts (which
// resolves DB_PATH at module-load time), so this points db/client.ts at a
// throwaway file instead of the real dev database.
const testDbPath = path.join(os.tmpdir(), `ventaris-test-product-repo-${process.pid}-${Date.now()}.db`);
process.env.DB_PATH = testDbPath;
process.env.NODE_ENV = "test";

import fs from "node:fs";
import test, { after, beforeEach } from "node:test";
import assert from "node:assert/strict";

import { db } from "../db/client";
import { migrate } from "../db/migrate";
import { findAllProducts, findProductById, findProductsByExactName, updateProductStock } from "./product.repository";

migrate();

interface FixtureProduct {
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
}

function insertProduct(row: FixtureProduct): number {
  const { lastInsertRowid } = db
    .prepare("INSERT INTO products (name, description, price, stock, image) VALUES (?, ?, ?, ?, ?)")
    .run(row.name, row.description, row.price, row.stock, row.image);
  return Number(lastInsertRowid);
}

beforeEach(() => {
  db.exec("DELETE FROM products");
});

after(() => {
  db.close();
  for (const suffix of ["", "-wal", "-shm"]) fs.rmSync(`${testDbPath}${suffix}`, { force: true });
});

test("findAllProducts returns rows ordered by id", () => {
  const idA = insertProduct({ name: "A", description: "a", price: 100, stock: 1, image: "a.png" });
  const idB = insertProduct({ name: "B", description: "b", price: 200, stock: 2, image: "b.png" });

  assert.deepEqual(
    findAllProducts().map((p) => p.id),
    [idA, idB],
  );
});

test("findProductById returns the matching product", () => {
  const id = insertProduct({ name: "Widget", description: "a widget", price: 500, stock: 10, image: "w.png" });
  assert.deepEqual(findProductById(id), {
    id,
    name: "Widget",
    description: "a widget",
    price: 500,
    stock: 10,
    image: "w.png",
  });
});

test("findProductById returns undefined for a missing id", () => {
  assert.equal(findProductById(999999), undefined);
});

test("findProductsByExactName matches case-insensitively but not partially", () => {
  insertProduct({ name: "Wireless Headphones", description: "d", price: 1, stock: 1, image: "i" });

  assert.equal(findProductsByExactName("wireless headphones").length, 1);
  assert.deepEqual(findProductsByExactName("Wireless"), []);
  assert.deepEqual(findProductsByExactName("Wireless Headphones Pro"), []);
});

test("findProductsByExactName returns [] when nothing matches", () => {
  assert.deepEqual(findProductsByExactName("Nonexistent"), []);
});

test("updateProductStock persists the new stock value", () => {
  const id = insertProduct({ name: "Widget", description: "d", price: 1, stock: 10, image: "i" });
  updateProductStock(id, 3);
  assert.equal(findProductById(id)?.stock, 3);
});
