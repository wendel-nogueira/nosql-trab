import { Request, Response } from "express";
import { CatalogService } from "./catalog.service";
import { connectToDatabaseMongodb } from "../../config/database";
import { CatalogRepository } from "./repositories/catalog.repository";
import { NotFoundException } from "../../utils/exceptions";
import { GetProductsDto } from "./dto/get-products.dto";
import { ValidateDto } from "../../utils/validator";
import { Filters } from "./entities/filters.model";

export class CatalogController {
  private catalogService: CatalogService | undefined;

  constructor() {
    this.init();
  }

  private async init() {
    connectToDatabaseMongodb().then(
      (database) => {
        const catalogRepository = new CatalogRepository(database);
        this.catalogService = new CatalogService(catalogRepository);
      },
      (error) => {
        console.error("Error connecting to database", error);
        throw new Error("Error connecting to database");
      }
    );
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
}
