import { Router } from "express";

import { CatalogController } from "./models/catalog/catalog.controller";
import { CartController } from "./models/cart/cart.controller";
import { login, criarConta} from "./models/usuarios/usuarios";
import { verificaToken } from "./models/usuarios/usuarios";
const router = Router();

const catalogController = new CatalogController();
const cartService = new CartController();

router.get("/", (req, res) => {
  res.send("Hello World!");
});

router.post("/catalog", catalogController.getCatalog);
router.get("/catalog/:id", catalogController.getProductById);
router.get("/categories", catalogController.getAllCategories);
router.get("/brands", catalogController.getAllBrands);

router.get("/cart/:userId",(req, res, next) => {
  console.log("Rota /cart/:userId chamada");
  next();
},verificaToken, cartService.getCartItems);
router.post("/cart/:userId",(req, res, next) => {
  console.log("Rota adicionar item chamada");
  next();
},verificaToken, cartService.saveCartSql);
router.delete("/cart/:userId/:productId",(req, res, next) => {
  console.log("Rota dele chamada");
  next();
},verificaToken, cartService.removeCartItem);
router.delete("/cart/:userId/clear",(req, res, next) => {
  console.log("Rota clear chamada");
  next();
},verificaToken, cartService.clearCart);
router.post("/cart/checkout",(req, res, next) => {
  console.log("Rota chek chamada");
  next();
},verificaToken,cartService.saveCartSql);
router.post("/login", login);
router.post("/register", criarConta);

export default router;
