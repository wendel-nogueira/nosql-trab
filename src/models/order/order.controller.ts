import { Request, Response } from "express";
import { OrderService } from "./order.service";
import { ValidateDto } from "../../utils/validator";
import { AddOrderDto } from "./dto/add-order.dto";
import { Order } from "./entities/order.entity";

export class OrderController {
  private orderService: OrderService;

  constructor() {
    this.orderService = new OrderService();
  }

  getOrders = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const orders = await this.orderService.getOrders(parseInt(userId));

    return res.status(200).json(orders);
  };

  createOrder = async (req: Request, res: Response) => {
    const dto = await ValidateDto(req.body, AddOrderDto);
    const { cartId } = dto;

    const order = await this.orderService.createOrder(2, cartId!);

    return res.status(201).json("order");
  };

  getOrderById = async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const order = await this.orderService.getOrderById(parseInt(orderId));

    return res.status(200).json(order);
  };
}
