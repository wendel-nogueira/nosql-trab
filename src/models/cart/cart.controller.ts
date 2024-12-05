import { Request, Response } from "express";
import { CartService } from "./cart.service";
import { ValidateDto } from "../../utils/validator";
import { AddProductDto } from "./dto/add-product.dto";

export class CartController {
  private cartService: CartService;

  constructor() {
    this.cartService = new CartService();
  }

  getCartItems = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const cartItems = await this.cartService?.getCartItems(userId);

    return res.status(200).json(cartItems);
  };

  addCartItem = async (req: Request, res: Response) => {
    const { userId } = req.params;

    const dto = await ValidateDto(req.body, AddProductDto);
    const { productId, quantity, image, price, title } = dto;

    await this.cartService?.addCartItem(userId, {
      id: productId!,
      quantity: quantity!,
    });

    return res.status(201).send();
  };

  removeCartItem = async (req: Request, res: Response) => {
    const { userId, productId } = req.params;

    await this.cartService?.removeCartItem(userId, productId);

    return res.status(200).send();
  };

  clearCart = async (req: Request, res: Response) => {
    const { userId } = req.params;

    await this.cartService?.clearCart(userId);

    return res.status(200).send();
  };
}
