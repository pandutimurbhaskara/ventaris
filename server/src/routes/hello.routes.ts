import { Router } from "express";

import { getHello } from "../controllers/hello.controller";

export const helloRouter = Router();

helloRouter.get("/", getHello);
