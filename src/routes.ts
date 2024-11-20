import { Router } from "express";
import { container, setupContainer } from "./utils/setup";
import { CatalogController } from "./models/catalog/catalog.controller";

const router = Router();

export async function setupRoutes(): Promise<Router> {
  await setupContainer();

  const catalogController = container.get(CatalogController);

  router.get("/", (req, res) => {
    res.send("Hello World!");
  });

  router.post("/catalog", catalogController.getCatalog);
  router.get("/catalog/:id", catalogController.getProductById);
  router.get("/categories", catalogController.getAllCategories);
  router.get("/brands", catalogController.getAllBrands);

  return router;
}

export default router;
