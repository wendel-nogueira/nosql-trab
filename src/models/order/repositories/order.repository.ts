import { PrismaClient } from "@prisma/client";
import { Order } from "../entities/order.entity";
import { IOrderRepository } from "./iorder.repository";

export class OrderRepository implements IOrderRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async createOrder(order: Order): Promise<Order> {
    const id = (await this.prisma.pedido.findFirst({
      select: {
        id: true,
      },
      orderBy: {
        id: "desc",
      },
    })) || { id: 0 };

    const newOrder = await this.prisma.pedido.create({
      data: {
        usuario: {
          connect: {
            id: order.userId,
          },
        },
        data: order.date,
        valor: order.value,
        itens: {
          create: order.items.map((item) => {
            return {
              id_pedido: id.id + 1,
              id_produto: item.productId,
              quantidade: item.quantity,
            };
          }),
        },
      },
    });

    order.id = newOrder.id;

    return order;
  }

  async getOrderById(id: number): Promise<Order | null> {
    const order = await this.prisma.pedido.findUnique({
      where: {
        id: id,
      },
      include: {
        itens: true,
      },
    });

    if (!order) return null;

    return {
      id: order.id,
      userId: order.usuario_id,
      date: order.data,
      value: order.valor,
      items: order.itens.map((item) => {
        return {
          id: item.id,
          productId: item.id_produto,
          quantity: item.quantidade,
        };
      }),
    };
  }

  async getOrdersByUserID(userID: number): Promise<Order[]> {
    const orders = await this.prisma.pedido.findMany({
      where: {
        usuario_id: userID,
      },
      include: {
        itens: true,
      },
    });

    return orders.map((order) => {
      return {
        id: order.id,
        userId: order.usuario_id,
        date: order.data,
        value: order.valor,
        items: order.itens.map((item) => {
          return {
            id: item.id,
            productId: item.id_produto,
            quantity: item.quantidade,
          };
        }),
      };
    });
  }
}
