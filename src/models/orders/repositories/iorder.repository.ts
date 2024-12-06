import { Order } from "../entities/order.entity";

export interface IOrderRepository {
  createOrder(order: Order): Promise<Order>;

  getOrderById(id: number): Promise<Order | null>;

  getOrdersByUserID(userID: number): Promise<Order[]>;
}
