import { Product } from "./entities/product.entity";
import { CartRepository } from "./repositories/cart.repository";

export class CartService {
  constructor(private cartRepository: CartRepository) {}

  async getCartItems(userId: string) {
    return this.cartRepository.getCartItems(userId);
  }

  async addCartItem(userId: string, product: Product) {
    let cartItems = await this.cartRepository.getCartItems(userId);

    await this.cartRepository.clearCart(userId);

    const productIndex = cartItems.findIndex((item) => item.id === product.id);

    if (productIndex !== -1) {
      cartItems[productIndex].quantity += product.quantity;
    } else {
      cartItems = [...cartItems, product];
    }

    this.cartRepository.addCartItem(userId, cartItems);
  }

  async removeCartItem(userId: string, productId: string) {
    let cartItems = await this.cartRepository.getCartItems(userId);

    await this.cartRepository.clearCart(userId);

    const productIndex = cartItems.findIndex((item) => item.id === productId);

    if (productIndex !== -1) {
      cartItems.splice(productIndex, 1);
    }

    this.cartRepository.addCartItem(userId, cartItems);
  }

  async clearCart(userId: string) {
    await this.cartRepository.clearCart(userId);
  }
}
