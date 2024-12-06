import { Router } from "express";
import { authMiddleware } from "./guards/auth.guard";
import { userIdMiddleware } from "./guards/userId.guard";

import { CatalogController } from "./models/catalog/catalog.controller";
import { CartController } from "./models/cart/cart.controller";
import { HistoryController } from "./models/history/history.controller";
import { OrderController } from "./models/order/order.controller";
import { UserController } from "./models/usuarios/usuarios";

const router = Router();

const catalogController = new CatalogController();
const cartService = new CartController();
const historyController = new HistoryController();

const orderService = new OrderController();
const usuario = new UserController();


router.get("/", (req, res) => {
  res.send("Hello World!");
});

router.post("/catalog", catalogController.getCatalog);
router.get("/catalog/search/query", catalogController.searchProducts);
router.get(
  "/catalog/recommendations/user",
  userIdMiddleware,
  catalogController.getRecommendations
);
router.get("/catalog/:id", catalogController.getProductById);
router.get("/categories", catalogController.getAllCategories);
router.get("/brands", catalogController.getAllBrands);

router.get("/cart/:userId", userIdMiddleware, cartService.getCartItems);
router.post("/cart/:userId", userIdMiddleware, cartService.addCartItem);
router.delete(
  "/cart/:userId/:productId",
  userIdMiddleware,
  cartService.removeCartItem
);
router.delete("/cart/:userId", userIdMiddleware, cartService.clearCart);

router.post("/register", usuario.criarConta);
router.post("/login", usuario.login);

router.post("/checkout", authMiddleware, orderService.createOrder);
router.get("/orders/user/:userId", authMiddleware, orderService.getOrders);
router.get("/orders/:orderId", authMiddleware, orderService.getOrderById);

router.get("/history/:userId", historyController.getCatalog);

export default router;
