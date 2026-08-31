import { Router } from "express";

import { healthRouter } from "./health.routes";
import { helloRouter } from "./hello.routes";

/** Everything mounted here lives under the /api prefix. */
export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/hello", helloRouter);
