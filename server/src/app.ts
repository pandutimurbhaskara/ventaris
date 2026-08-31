import cors from "cors";
import express, { type Express } from "express";

import { env } from "./config/env";
import { errorHandler } from "./middleware/error-handler";
import { notFound } from "./middleware/not-found";
import { apiRouter } from "./routes";

export function createApp(): Express {
  const app = express();

  app.use(
    cors({
      origin: env.corsOrigin === "*" ? true : env.corsOrigin.split(",").map((o) => o.trim()),
    }),
  );
  app.use(express.json());

  app.use("/api", apiRouter);

  // Must stay last: 404 first, then the error serializer.
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
