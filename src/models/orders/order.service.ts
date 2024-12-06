import { BadRequestException, NotFoundException } from "../../utils/exceptions";
import { CartRepository } from "../cart/repositories/cart.repository";
import { ICartRepository } from "../cart/repositories/icart.repository";
import { CatalogRepository } from "../catalog/repositories/catalog.repository";
import { ICatalogRepository } from "../catalog/repositories/icatalog.repository";
import { Item } from "./entities/item.entity";
import { Order } from "./entities/order.entity";
import { IOrderRepository } from "./repositories/iorder.repository";
import { OrderRepository } from "./repositories/order.repository";
import { connectToRedis, wss } from "../../config/database";

export class OrderService {
  private orderRepository: IOrderRepository;
  private cartRepository: ICartRepository;
  private catalogRepository: ICatalogRepository;

  constructor() {
    this.orderRepository = new OrderRepository();
    this.cartRepository = new CartRepository();
    this.catalogRepository = new CatalogRepository();
  }

  async getOrders(userId: number) {
    return this.orderRepository.getOrdersByUserID(userId);
  }

  async createOrder(userId: number, cartId: string) {
    const client = await connectToRedis();
    const userCart = await this.cartRepository.getCartItems(cartId);

    console.log("User cart", userCart);
    if (!userCart || userCart.length === 0)
      throw new NotFoundException("Cart not found");

    const products = await this.catalogRepository.getProductsByIDs(
      userCart.map((item) => item.id)
    );

    const inProcess = await client.lRange("orders", 0, -1);
    const ordersInProcess = inProcess.map((order: string) => JSON.parse(order));
    const ordersContainsProduct = ordersInProcess.filter((order: Order) =>
      order.items.some((item) =>
        userCart.some((cartItem) => cartItem.id === item.productId)
      )
    );

    ordersContainsProduct.forEach((order) => {
      order.items.forEach((item: Item) => {
        const product = products.find((p) => p.id === item.productId);

        if (product) product.stock -= item.quantity;
      });
    });

    let total = 0;

    const items: Item[] = userCart.map((cartItem) => {
      const product = products.find((p) => p.id === cartItem.id);

      if (!product) throw new NotFoundException("Product not found");

      if (cartItem.quantity > product.stock)
        throw new BadRequestException("Product out of stock");

      total += product.price * cartItem.quantity;

      return {
        productId: product.id,
        quantity: cartItem.quantity,
        price: product.price,
      };
    });

    const order: Order = {
      userId,
      date: new Date(),
      value: total,
      items,
    };

    await client.rPush("orders", JSON.stringify(order));
    await this.cartRepository.clearCart(cartId);

    return order;
  }

  async getOrderById(id: number) {
    return this.orderRepository.getOrderById(id);
  }

  async processOrder(order: Order) {
    const result = await this.orderRepository.createOrder(order);

    for (const item of order.items) {
      await this.catalogRepository.updateProductStock(
        item.productId,
        item.quantity
      );

      const clients = wss.clients;

      for (const client of clients) {
        client.send(
          JSON.stringify({
            type: "update_stock",
            productId: item.productId,
            quantity: item.quantity,
          })
        );
      }
    }

    console.log("Order processed", result);
  }
}
