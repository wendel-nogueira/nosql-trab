import { Product } from "../entities/product.entity";

export interface ICartRepository {
  getCartItems(userId: string): Promise<Product[]>;

  addCartItem(userId: string, products: Product[]): Promise<Product[]>;

  clearCart(userId: string): Promise<void>;
}
