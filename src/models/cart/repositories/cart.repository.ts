import { RedisClientType } from "redis";
import { Product } from "../entities/product.entity";
import { ICartRepository } from "./icart.repository";
import { connectToRedis } from "../../../config/database";

export class CartRepository implements ICartRepository {
  private client: any;

  constructor() {
    this.client = undefined;
    this.init();
  }

  async init(): Promise<void> {
    this.client = await connectToRedis();
  }

  async getCartItems(userId: string): Promise<Product[]> {
    if (!this.client) await this.init();

    const items = await this.client.get(userId);

    if (!items) return [];

    return JSON.parse(items);
  }

  async addCartItem(userId: string, products: Product[]): Promise<Product[]> {
    if (!this.client) await this.init();

    const expirationTime = 259200;

    await this.client.set(userId, JSON.stringify(products), {
      EX: expirationTime,
    });

    const cartItems = await this.getCartItems(userId);
    return cartItems!;
  }

  async clearCart(userId: string): Promise<void> {
    if (!this.client) await this.init();

    await this.client.del(userId);
  }
}
