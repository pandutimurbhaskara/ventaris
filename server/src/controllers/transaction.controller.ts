import type { Request, Response } from "express";

import { HttpError } from "../middleware/http-error";
import type { Transaction, TransactionSummary } from "../models/transaction";
import { findAllTransactionSummaries, findTransactionById } from "../repositories/transaction.repository";
import { createTransaction, type CreateTransactionInput } from "../services/transaction.service";
import type { ApiSuccess } from "../types/api-response";

export function postTransaction(
  req: Request<unknown, unknown, CreateTransactionInput>,
  res: Response<ApiSuccess<Transaction>>,
): void {
  const transaction = createTransaction(req.body);
  res.status(201).json({ success: true, data: transaction });
}

export function getTransactions(_req: Request, res: Response<ApiSuccess<TransactionSummary[]>>): void {
  res.json({ success: true, data: findAllTransactionSummaries() });
}

export function getTransactionById(req: Request<{ id: string }>, res: Response<ApiSuccess<Transaction>>): void {
  const transaction = findTransactionById(req.params.id);
  if (!transaction) {
    throw HttpError.notFound(`Transaction ${req.params.id} not found`);
  }

  res.json({ success: true, data: transaction });
}
