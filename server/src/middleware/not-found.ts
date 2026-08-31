import type { RequestHandler } from "express";

import { HttpError } from "./http-error";

/** Terminates unmatched routes with a 404 handled by the error middleware. */
export const notFound: RequestHandler = (req, _res, next) => {
  next(HttpError.notFound(`Cannot ${req.method} ${req.originalUrl}`));
};
