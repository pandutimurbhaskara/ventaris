import type { ErrorRequestHandler } from "express";

import { isProduction } from "../config/env";
import { HttpError } from "./http-error";

interface ErrorBody {
  success: false;
  message: string;
  details?: unknown;
  stack?: string;
}

/**
 * Express 5 forwards rejected promises from handlers here automatically,
 * so async routes need no try/catch wrapper.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const status = err instanceof HttpError ? err.status : 500;
  const message =
    err instanceof HttpError
      ? err.message
      : status === 500 && isProduction
        ? "Internal Server Error"
        : err instanceof Error
          ? err.message
          : "Internal Server Error";

  if (status >= 500) console.error(err);

  const body: ErrorBody = { success: false, message };
  if (err instanceof HttpError && err.details !== undefined) {
    body.details = err.details;
  }
  if (!isProduction && err instanceof Error && err.stack) {
    body.stack = err.stack;
  }

  res.status(status).json(body);
};
