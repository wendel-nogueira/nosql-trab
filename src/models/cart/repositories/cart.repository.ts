import { RedisClientType } from "redis";
import { Product } from "../entities/product.entity";
import { ICartRepository } from "./icart.repository";

export class CartRepository implements ICartRepository {
  private client: RedisClientType;

  constructor(client: RedisClientType) {
    this.client = client;
  }

  async getCartItems(userId: string): Promise<Product[]> {
    const items = await this.client.get(userId);

    if (!items) return [];

    return JSON.parse(items);
  }

  async addCartItem(userId: string, products: Product[]): Promise<Product[]> {
    const expirationTime = 259200;

    await this.client.set(userId, JSON.stringify(products), {
      EX: expirationTime,
    });

    const cartItems = await this.getCartItems(userId);
    return cartItems!;
  }

  async clearCart(userId: string): Promise<void> {
    await this.client.del(userId);
  }
}
