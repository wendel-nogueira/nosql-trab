import { Request, Response } from "express";
import { connectToRedis } from "../../config/database";
import { CartService } from "./cart.service";
import { CartRepository } from "./repositories/cart.repository";
import { ValidateDto } from "../../utils/validator";
import { AddProductDto } from "./dto/add-product.dto";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
export class CartController {
  private cartService: CartService;

  constructor() {
    this.cartService = new CartService();
  }

  getCartItems = async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
      const cartItems = await this.cartService?.getCartItems(userId);
      console.log("oi");
      return res.status(200).json(cartItems);
    } catch (error) {
      console.error(error);
      return res.status(500).send();
    }
  };

  addCartItem = async (req: Request, res: Response) => {
    const { userId } = req.params;
    console.log("porfavor que use alguma função");
    const cartData = await this.cartService?.getCartItems(userIdFromToken.toString());
    if (!cartData) throw new Error("Carrinho vazio");
    console.log("Conteúdo do carrinho:", cartData);
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



  saveCartSql = async (req: Request, res: Response) => {
  const { userId } = req.params; // Removido, vamos obter do token
  const prisma = new PrismaClient();
  
  
  try {
    console.log("Iniciando checkout");

    // Recuperando o token do cabeçalho Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Token não fornecido" });
    }
    const token = authHeader.split(" ")[1];

    // Validando o token e obtendo o ID do usuário
    const decoded = jwt.verify(token, process.env.TOKEN as string) as { id: number };
    const userIdFromToken = decoded.id;
    console.log(userIdFromToken);
    // Buscando os itens do carrinho
    const cartData = await this.cartService?.getCartItems(userId);
    if (!cartData) throw new Error("Carrinho vazio");
    console.log("Conteúdo do carrinho:", cartData);
    let cartItems: Product[];
    try {
      cartItems = JSON.parse(cartData); // Certifique-se de que o JSON seja válido
    } catch {
      throw new Error("Formato inválido no carrinho");
    }

    // Criando o pedido no banco de dados
    const newPedido = await prisma.pedido.create({
      data: {
        usuario_id: userIdFromToken,
        data: new Date(),
        valor: cartItems.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        ),
        itens: {
          create: cartItems.map((item) => ({
            id_produto: item.id,
            quantidade: item.quantity,
          })),
        },
      },
    });

    // Limpando o carrinho após o pedido ser finalizado
    await this.clearCart(userIdFromToken.toString());

    res.status(200).json({
      message: "Pedido finalizado com sucesso!",
      pedido: newPedido,
    });
  } catch (error: any) {
    console.error("Erro no checkout:", error);
    res.status(500).json({
      message: "Erro ao finalizar o pedido",
      error: error.message || "Erro inesperado",
    });
  }
};


}
