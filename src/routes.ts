import { Router } from "express";

import { CatalogController } from "./models/catalog/catalog.controller";

const router = Router();

const catalogController = new CatalogController();

router.get("/", (req, res) => {
  res.send("Hello World!");
});

router.post("/catalog", catalogController.getCatalog);
router.get("/catalog/:id", catalogController.getProductById);
router.get("/categories", catalogController.getAllCategories);
router.get("/brands", catalogController.getAllBrands);

export default router;
