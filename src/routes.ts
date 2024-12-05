import { Router } from "express";

import { CatalogController } from "./models/catalog/catalog.controller";
import { CartController } from "./models/cart/cart.controller";
import { OrderController } from "./models/order/order.controller";

const router = Router();

const catalogController = new CatalogController();
const cartService = new CartController();
const orderService = new OrderController();

router.get("/", (req, res) => {
  res.send("Hello World!");
});

router.post("/catalog", catalogController.getCatalog);
router.get("/catalog/:id", catalogController.getProductById);
router.get("/categories", catalogController.getAllCategories);
router.get("/brands", catalogController.getAllBrands);
router.post("/stock", catalogController.updateProductStock);

router.get("/cart/:userId", cartService.getCartItems);
router.post("/cart/:userId", cartService.addCartItem);
router.delete("/cart/:userId/:productId", cartService.removeCartItem);
router.delete("/cart/:userId/clear", cartService.clearCart);

router.get("/orders/:userId", orderService.getOrders);
router.post("/checkout", orderService.createOrder);
router.get("/orders/:orderId", orderService.getOrderById);

export default router;
