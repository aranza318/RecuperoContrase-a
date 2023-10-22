import { Router } from "express";
import CartManager from "../dao/cartManager.js";
import cartController from "../controllers/cart.controller.js";
import { authorization, passportCall } from "../midsIngreso/passAuth.js";

const cartsRouter = Router();
const CM = new CartManager();

cartsRouter.post("/", cartController.createCart.bind(cartController));

cartsRouter.get("/:cid", cartController.getCart.bind(cartController));

cartsRouter.post("/:cid/products/:pid", passportCall('jwt'), authorization(['user']), cartController.addProductToCart.bind(cartController));

cartsRouter.put("/:cid/products/:pid", cartController.updateQuantityProductFromCart.bind(cartController));

cartsRouter.put("/:cid", cartController.updateCart.bind(cartController));

cartsRouter.delete("/:cid/products/:pid", cartController.deleteProductFromCart.bind(cartController));

cartsRouter.delete("/:cid", cartController.deleteProductsFromCart.bind(cartController));

cartsRouter.post("/:cid/purchase", (req, res, next) => {
    console.log('Ruta de compra accedida');
    next();
  }, passportCall("jwt"), cartController.createPurchaseTicket.bind(cartController));


export default cartsRouter;
