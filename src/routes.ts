import { Router } from "express";

import { CatalogController } from "./models/catalog/catalog.controller";
import { CartController } from "./models/cart/cart.controller";
import { HistoryController } from "./models/history/history.controller";

const router = Router();

const catalogController = new CatalogController();
const cartService = new CartController();
const historyController = new HistoryController();

router.get("/", (req, res) => {
  res.send("Hello World!");
});

router.post("/catalog", catalogController.getCatalog);
router.get("/catalog/:id", catalogController.getProductById);
router.get("/categories", catalogController.getAllCategories);
router.get("/brands", catalogController.getAllBrands);

router.get("/cart/:userId", cartService.getCartItems);
router.post("/cart/:userId", cartService.addCartItem);
router.delete("/cart/:userId/:productId", cartService.removeCartItem);
router.delete("/cart/:userId/clear", cartService.clearCart);

router.get("/history/:userId", historyController.getCatalog);

export default router;
