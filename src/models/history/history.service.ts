const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

export class HistoryService {
  async getUserPurchases(user_id: number): Promise<any[]> {
    try {
      const purchases = await prisma.pedido.findMany({
        where: { usuario_id: user_id },
        include: {
          itens: {},
        },
        orderBy: {
          data: "desc",
        },
      });
      return purchases;
    } catch (error) {
      console.error("Erro ao buscar compras:", error);
      throw new Error("Erro ao buscar histórico de compras.");
    }
  }
}
