import { Request, Response } from "express";
import { CatalogService } from "./catalog.service";
import { NotFoundException } from "../../utils/exceptions";
import { GetProductsDto } from "./dto/get-products.dto";
import { ValidateDto } from "../../utils/validator";
import { Filters } from "./entities/filters.entity";

export class CatalogController {
  private catalogService: CatalogService;

  constructor() {
    this.catalogService = new CatalogService();
  }

  getCatalog = async (req: Request, res: Response) => {
    const dto = await ValidateDto(req.body, GetProductsDto);
    const { filters, limit, offset, sort } = dto;

    const catalog = await this.catalogService?.getProducts(
      filters as Filters,
      limit as any,
      offset!,
      sort as any
    );

    return res.status(200).json(catalog);
  };

  getProductById = async (req: Request, res: Response) => {
    const { id } = req.params;

    const product = await this.catalogService?.getProductById(id);

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    return res.status(200).json(product);
  };

  getAllCategories = async (req: Request, res: Response): Promise<Response> => {
    const categories = await this.catalogService?.getAllCategories();
    return res.status(200).json(categories);
  };

  getAllBrands = async (req: Request, res: Response): Promise<Response> => {
    const brands = await this.catalogService?.getAllBrands();
    return res.status(200).json(brands);
  };

  updateProductStock = async (req: Request, res: Response) => {
    const { productId, quantity } = req.body;

    await this.catalogService?.updateProductStock(productId, quantity);

    return res.status(200).send();
  };
}
