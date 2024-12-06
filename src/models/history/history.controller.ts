import { Request, Response } from "express";
import { HistoryService } from "./history.service";
import { CatalogService } from "../catalog/catalog.service";

export class HistoryController {
  private historyService: HistoryService;
  private catalogService: CatalogService;

  constructor() {
    this.historyService = new HistoryService();
    this.catalogService = new CatalogService();
  }

  getCatalog = async (req: Request, res: Response) => {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "User ID é obrigatório." });
    }

    try {
      const catalog = await this.historyService.getUserPurchases(
        Number(userId)
      );

      const productsIds: string[] = [];

      for (const purchase of catalog) {
        for (const item of purchase.itens) {
          if (!productsIds.includes(item.id_produto))
            productsIds.push(item.id_produto);
        }
      }

      const products = await this.catalogService.getProductsByIds(productsIds);

      for (const purchase of catalog) {
        for (const item of purchase.itens) {
          const product = products.find(
            (product) => product.id === item.id_produto
          );

          if (product) {
            item.product = product;
          }
        }
      }

      return res.status(200).json(catalog);
    } catch (error) {
      console.error("Erro ao buscar histórico de compras:", error);
      return res
        .status(500)
        .json({ error: "Erro ao buscar histórico de compras." });
    }
  };
}
