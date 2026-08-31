import os from "node:os";
import path from "node:path";

// Sets DB_PATH before db/client.ts opens its (lazily-created) connection. Static imports
// are hoisted above this statement under tsx/ESM, but db/client.ts doesn't actually touch
// process.env.DB_PATH until its connection is first used — which happens below in
// migrate(), a plain statement that runs after this one — so hoisting doesn't matter here.
const testDbPath = path.join(os.tmpdir(), `ventaris-test-transaction-service-${process.pid}-${Date.now()}.db`);
process.env.DB_PATH = testDbPath;
process.env.NODE_ENV = "test";

import fs from "node:fs";
import test, { after, beforeEach } from "node:test";
import assert from "node:assert/strict";

import { db } from "../db/client";
import { migrate } from "../db/migrate";
import { HttpError } from "../middleware/http-error";
import { clearCartItems, getCartItems, setCartItemQuantity } from "../repositories/cart.repository";
import { findProductById } from "../repositories/product.repository";
import { createTransaction } from "./transaction.service";

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

const VALID_ADDRESS = {
  fullName: "John Doe",
  phone: "08123456789",
  address: "Jl. Example No. 123",
  city: "Bandung",
  province: "West Java",
  postalCode: "40123",
};

function isHttpErrorWithStatus(status: number) {
  return (err: unknown) => err instanceof HttpError && err.status === status;
}

beforeEach(() => {
  db.exec("DELETE FROM transaction_items");
  db.exec("DELETE FROM transactions");
  db.exec("DELETE FROM products");
  clearCartItems();
});

after(() => {
  db.close();
  for (const suffix of ["", "-wal", "-shm"]) fs.rmSync(`${testDbPath}${suffix}`, { force: true });
});

test("throws 400 when an address field is missing", () => {
  assert.throws(
    () =>
      createTransaction({
        address: { ...VALID_ADDRESS, phone: "" },
        shipping: { id: "regular" },
        payment: { method: "bank_transfer" },
      }),
    isHttpErrorWithStatus(400),
  );
});

test("throws 400 for an unknown shipping option", () => {
  assert.throws(
    () =>
      createTransaction({
        address: VALID_ADDRESS,
        shipping: { id: "teleport" },
        payment: { method: "bank_transfer" },
      }),
    isHttpErrorWithStatus(400),
  );
});

test("throws 400 for an unknown payment method", () => {
  assert.throws(
    () =>
      createTransaction({
        address: VALID_ADDRESS,
        shipping: { id: "regular" },
        payment: { method: "crypto" },
      }),
    isHttpErrorWithStatus(400),
  );
});

test("throws 400 when the cart is empty", () => {
  assert.throws(
    () =>
      createTransaction({
        address: VALID_ADDRESS,
        shipping: { id: "regular" },
        payment: { method: "bank_transfer" },
      }),
    isHttpErrorWithStatus(400),
  );
});

test("throws 404 when a cart item references a product that no longer exists", () => {
  setCartItemQuantity(9999, 1);

  assert.throws(
    () =>
      createTransaction({
        address: VALID_ADDRESS,
        shipping: { id: "regular" },
        payment: { method: "bank_transfer" },
      }),
    isHttpErrorWithStatus(404),
  );
});

test("throws 409 when the requested quantity exceeds current stock", () => {
  const id = insertProduct({ name: "Widget", description: "d", price: 1000, stock: 2, image: "i" });
  setCartItemQuantity(id, 5);

  assert.throws(
    () =>
      createTransaction({
        address: VALID_ADDRESS,
        shipping: { id: "regular" },
        payment: { method: "bank_transfer" },
      }),
    isHttpErrorWithStatus(409),
  );
});

test("ignores client-submitted shipping price/name and recomputes totals from backend data", () => {
  const id = insertProduct({ name: "Widget", description: "d", price: 100000, stock: 10, image: "i" });
  setCartItemQuantity(id, 2);

  const transaction = createTransaction({
    address: VALID_ADDRESS,
    shipping: { id: "regular", name: "Free Shipping", price: 0 },
    payment: { method: "bank_transfer" },
  });

  assert.match(transaction.id, /^TRX-\d{8}-\d{4}$/);
  assert.equal(transaction.status, "PROCESSING");
  assert.deepEqual(transaction.payment, { method: "bank_transfer", status: "PENDING" });
  assert.deepEqual(transaction.shipping, { id: "regular", name: "Regular", price: 15000, estimatedDelivery: "2-4 days" });
  assert.equal(transaction.subtotal, 200000);
  assert.equal(transaction.shippingCost, 15000);
  assert.equal(transaction.total, 215000);
});

test("decrements stock and clears the cart on success", () => {
  const id = insertProduct({ name: "Widget", description: "d", price: 100000, stock: 10, image: "i" });
  setCartItemQuantity(id, 3);

  createTransaction({
    address: VALID_ADDRESS,
    shipping: { id: "regular" },
    payment: { method: "bank_transfer" },
  });

  assert.equal(findProductById(id)?.stock, 7);
  assert.deepEqual(getCartItems(), []);
});

test("a failed checkout leaves stock and the cart untouched", () => {
  const id = insertProduct({ name: "Widget", description: "d", price: 100000, stock: 2, image: "i" });
  setCartItemQuantity(id, 5);

  assert.throws(() =>
    createTransaction({
      address: VALID_ADDRESS,
      shipping: { id: "regular" },
      payment: { method: "bank_transfer" },
    }),
  );

  assert.equal(findProductById(id)?.stock, 2);
  assert.deepEqual(getCartItems(), [{ productId: id, quantity: 5 }]);
});
