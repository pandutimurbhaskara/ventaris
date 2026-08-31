import { Router } from "express";

import { getTransactionById, getTransactions, postTransaction } from "../controllers/transaction.controller";

export const transactionRouter = Router();

transactionRouter.get("/", getTransactions);
transactionRouter.post("/", postTransaction);
transactionRouter.get("/:id", getTransactionById);
