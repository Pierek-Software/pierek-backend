import { Request, Response, Router, NextFunction } from "express";
import DatabaseService from "../services/DatabaseService";
import { ForbiddenError } from "../errors";
import config from "../config";

export interface ApiRouter {
  databaseService: DatabaseService;
}

export function verifyAdminKey(key?: string | string[]) {
  if (!key) {
    throw new ForbiddenError("No key");
  }

  if (key !== config.adminKey) {
    throw new ForbiddenError("Bad key");
  }
}

function checkAdminKeyMiddleware(req: Request, _: Response, next: NextFunction) {
  verifyAdminKey(req.headers.key);
  next();
}

function createApiRouter({ databaseService }: ApiRouter) {
  const router = Router();

  router.get("/products/:id", async (req, res) => {
    const response = await databaseService.getProductById(+req.params.id);
    res.json(response);
  });

  router.get("/pages/:id", checkAdminKeyMiddleware, async (req, res) => {
    const response = await databaseService.getPageById(req.params.id);
    res.json(response);
  });

  router.post("/pages", checkAdminKeyMiddleware, async (req, res) => {
    const response = await databaseService.createPage(req.body);
    res.json(response);
  });

  router.put("/pages/:id", checkAdminKeyMiddleware, async (req, res) => {
    const response = await databaseService.updatePage(req.body);
    res.json(response);
  });

  return router;
}

export default createApiRouter;
