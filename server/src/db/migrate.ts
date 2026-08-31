import { db } from "./client";

/** Idempotent — safe to call on every boot. */
export function migrate(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT    NOT NULL,
      description TEXT    NOT NULL,
      price       INTEGER NOT NULL CHECK (price >= 0),
      stock       INTEGER NOT NULL CHECK (stock >= 0),
      image       TEXT    NOT NULL
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id                          TEXT    PRIMARY KEY,
      created_at                  TEXT    NOT NULL,
      status                      TEXT    NOT NULL,
      full_name                   TEXT    NOT NULL,
      phone                       TEXT    NOT NULL,
      address                     TEXT    NOT NULL,
      city                        TEXT    NOT NULL,
      province                    TEXT    NOT NULL,
      postal_code                 TEXT    NOT NULL,
      shipping_id                 TEXT    NOT NULL,
      shipping_name               TEXT    NOT NULL,
      shipping_price              INTEGER NOT NULL CHECK (shipping_price >= 0),
      shipping_estimated_delivery TEXT    NOT NULL,
      payment_method              TEXT    NOT NULL,
      payment_status              TEXT    NOT NULL,
      subtotal                    INTEGER NOT NULL CHECK (subtotal >= 0),
      shipping_cost               INTEGER NOT NULL CHECK (shipping_cost >= 0),
      total                       INTEGER NOT NULL CHECK (total >= 0)
    );

    CREATE TABLE IF NOT EXISTS transaction_items (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      transaction_id TEXT    NOT NULL REFERENCES transactions(id),
      product_id     INTEGER NOT NULL,
      product_name   TEXT    NOT NULL,
      image          TEXT    NOT NULL,
      price          INTEGER NOT NULL CHECK (price >= 0),
      quantity       INTEGER NOT NULL CHECK (quantity > 0),
      subtotal       INTEGER NOT NULL CHECK (subtotal >= 0)
    );

    CREATE INDEX IF NOT EXISTS idx_transaction_items_transaction_id
      ON transaction_items (transaction_id);
  `);
}
