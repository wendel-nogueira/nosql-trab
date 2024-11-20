import { Request, Response } from "express";
import { connectToRedis } from "../../config/database";
import { CartService } from "./cart.service";
import { CartRepository } from "./repositories/cart.repository";
import { ValidateDto } from "../../utils/validator";
import { AddProductDto } from "./dto/add-product.dto";

export class CartController {
  private cartService: CartService | undefined;

  constructor() {
    this.init();
  }

  private async init() {
    const client = await connectToRedis();
    const cartRepository = new CartRepository(client);
    this.cartService = new CartService(cartRepository);
  }

  getCartItems = async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
      const cartItems = await this.cartService?.getCartItems(userId);
      return res.status(200).json(cartItems);
    } catch (error) {
      console.error(error);
      return res.status(500).send();
    }
  };

  addCartItem = async (req: Request, res: Response) => {
    const { userId } = req.params;

    const dto = await ValidateDto(req.body, AddProductDto);
    const { productId, quantity } = dto;

    try {
      await this.cartService?.addCartItem(userId, {
        id: productId!,
        quantity: quantity!,
      });
    } catch (error) {
      console.error(error);
    }

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
