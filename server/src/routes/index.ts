import { Router } from "express";

import { cartRouter } from "./cart.routes";
import { healthRouter } from "./health.routes";
import { helloRouter } from "./hello.routes";
import { paymentMethodRouter } from "./payment-method.routes";
import { productRouter } from "./product.routes";
import { shippingOptionRouter } from "./shipping-option.routes";
import { transactionRouter } from "./transaction.routes";

/** Everything mounted here lives under the /api prefix. */
export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/hello", helloRouter);
apiRouter.use("/products", productRouter);
apiRouter.use("/cart", cartRouter);
apiRouter.use("/shipping-options", shippingOptionRouter);
apiRouter.use("/payment-methods", paymentMethodRouter);
apiRouter.use("/transactions", transactionRouter);
