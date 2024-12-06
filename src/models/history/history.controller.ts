import { Request, Response } from "express";
import { HistoryService } from "./history.service";

export class HistoryController 
{
    private historyService: HistoryService;

    constructor() 
    {
        this.historyService = new HistoryService();
    }

    getCatalog = async (req: Request, res: Response) => 
    {
        const { userId } = req.params;

        if (!userId) 
        {
            return res.status(400).json({ error: "User ID é obrigatório." });
        }

        try 
        {
            const catalog = await this.historyService.getUserPurchases(Number(userId)); 
            return res.status(200).json(catalog); 
        } catch (error) {
            console.error("Erro ao buscar histórico de compras:", error);
            return res.status(500).json({ error: "Erro ao buscar histórico de compras." });
        }
    }
}