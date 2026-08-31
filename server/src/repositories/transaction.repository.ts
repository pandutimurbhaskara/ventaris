import type { Statement } from "better-sqlite3";

import { db } from "../db/client";
import type { Transaction, TransactionItem, TransactionSummary } from "../models/transaction";
import { updateProductStock } from "./product.repository";

interface TransactionRow {
  id: string;
  created_at: string;
  status: string;
  full_name: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  shipping_id: string;
  shipping_name: string;
  shipping_price: number;
  shipping_estimated_delivery: string;
  payment_method: string;
  payment_status: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
}

interface TransactionItemRow {
  transaction_id: string;
  product_id: number;
  product_name: string;
  image: string;
  price: number;
  quantity: number;
  subtotal: number;
}

interface TransactionSummaryRow {
  id: string;
  created_at: string;
  status: string;
  total: number;
  item_count: number;
}

function toTransaction(row: TransactionRow, itemRows: TransactionItemRow[]): Transaction {
  const items: TransactionItem[] = itemRows.map((item) => ({
    productId: item.product_id,
    productName: item.product_name,
    image: item.image,
    price: item.price,
    quantity: item.quantity,
    subtotal: item.subtotal,
  }));

  return {
    id: row.id,
    createdAt: row.created_at,
    status: row.status,
    items,
    address: {
      fullName: row.full_name,
      phone: row.phone,
      address: row.address,
      city: row.city,
      province: row.province,
      postalCode: row.postal_code,
    },
    shipping: {
      id: row.shipping_id,
      name: row.shipping_name,
      price: row.shipping_price,
      estimatedDelivery: row.shipping_estimated_delivery,
    },
    payment: {
      method: row.payment_method,
      status: row.payment_status,
    },
    subtotal: row.subtotal,
    shippingCost: row.shipping_cost,
    total: row.total,
  };
}

type InsertTransactionParams = [
  id: string,
  createdAt: string,
  status: string,
  fullName: string,
  phone: string,
  address: string,
  city: string,
  province: string,
  postalCode: string,
  shippingId: string,
  shippingName: string,
  shippingPrice: number,
  shippingEstimatedDelivery: string,
  paymentMethod: string,
  paymentStatus: string,
  subtotal: number,
  shippingCost: number,
  total: number,
];
type InsertTransactionItemParams = [
  transactionId: string,
  productId: number,
  productName: string,
  image: string,
  price: number,
  quantity: number,
  subtotal: number,
];

// Prepared lazily — see product.repository.ts for why.
let insertTransactionStmt: Statement<InsertTransactionParams, unknown> | undefined;
let insertTransactionItemStmt: Statement<InsertTransactionItemParams, unknown> | undefined;
let selectTransactionByIdStmt: Statement<[string], TransactionRow> | undefined;
let selectTransactionItemsStmt: Statement<[string], TransactionItemRow> | undefined;
let selectAllSummariesStmt: Statement<[], TransactionSummaryRow> | undefined;
let countTransactionsForDatePrefixStmt: Statement<[string], { count: number }> | undefined;

function insertTransaction(): Statement<InsertTransactionParams, unknown> {
  return (insertTransactionStmt ??= db.prepare(
    `INSERT INTO transactions (
      id, created_at, status,
      full_name, phone, address, city, province, postal_code,
      shipping_id, shipping_name, shipping_price, shipping_estimated_delivery,
      payment_method, payment_status,
      subtotal, shipping_cost, total
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ));
}

function insertTransactionItem(): Statement<InsertTransactionItemParams, unknown> {
  return (insertTransactionItemStmt ??= db.prepare(
    `INSERT INTO transaction_items (transaction_id, product_id, product_name, image, price, quantity, subtotal)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ));
}

function selectTransactionById(): Statement<[string], TransactionRow> {
  return (selectTransactionByIdStmt ??= db.prepare("SELECT * FROM transactions WHERE id = ?"));
}

function selectTransactionItems(): Statement<[string], TransactionItemRow> {
  return (selectTransactionItemsStmt ??= db.prepare(
    "SELECT * FROM transaction_items WHERE transaction_id = ? ORDER BY id ASC",
  ));
}

function selectAllSummaries(): Statement<[], TransactionSummaryRow> {
  return (selectAllSummariesStmt ??= db.prepare(`
    SELECT t.id AS id, t.created_at AS created_at, t.status AS status, t.total AS total,
           COALESCE(SUM(ti.quantity), 0) AS item_count
    FROM transactions t
    LEFT JOIN transaction_items ti ON ti.transaction_id = t.id
    GROUP BY t.id
    ORDER BY t.created_at DESC, t.id DESC
  `));
}

function countTransactionsForDatePrefix(): Statement<[string], { count: number }> {
  return (countTransactionsForDatePrefixStmt ??= db.prepare(
    "SELECT COUNT(*) AS count FROM transactions WHERE id LIKE ?",
  ));
}

function generateTransactionId(date: Date): string {
  const datePrefix = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  const { count } = countTransactionsForDatePrefix().get(`TRX-${datePrefix}-%`) ?? { count: 0 };
  const sequence = String(count + 1).padStart(4, "0");
  return `TRX-${datePrefix}-${sequence}`;
}

export interface StockUpdate {
  productId: number;
  newStock: number;
}

/**
 * Atomically generates the transaction id, persists the transaction + its
 * items, and applies the resulting stock updates — all in one SQLite
 * transaction so a failure leaves neither the order nor the stock changed.
 */
export function createTransaction(
  input: Omit<Transaction, "id">,
  stockUpdates: StockUpdate[],
): Transaction {
  const run = db.transaction((now: Date) => {
    const id = generateTransactionId(now);

    insertTransaction().run(
      id,
      input.createdAt,
      input.status,
      input.address.fullName,
      input.address.phone,
      input.address.address,
      input.address.city,
      input.address.province,
      input.address.postalCode,
      input.shipping.id,
      input.shipping.name,
      input.shipping.price,
      input.shipping.estimatedDelivery,
      input.payment.method,
      input.payment.status,
      input.subtotal,
      input.shippingCost,
      input.total,
    );

    for (const item of input.items) {
      insertTransactionItem().run(id, item.productId, item.productName, item.image, item.price, item.quantity, item.subtotal);
    }

    for (const { productId, newStock } of stockUpdates) {
      updateProductStock(productId, newStock);
    }

    return id;
  });

  const id = run(new Date());
  return { id, ...input };
}

export function findTransactionById(id: string): Transaction | undefined {
  const row = selectTransactionById().get(id);
  if (!row) return undefined;

  const itemRows = selectTransactionItems().all(id);
  return toTransaction(row, itemRows);
}

export function findAllTransactionSummaries(): TransactionSummary[] {
  return selectAllSummaries()
    .all()
    .map((row) => ({
      id: row.id,
      createdAt: row.created_at,
      status: row.status,
      itemCount: row.item_count,
      total: row.total,
    }));
}
