import { CatalogRepository } from "./repositories/catalog.repository";
import { Product } from "./entities/product.entity";
import { Filters } from "./entities/filters.entity";
import { BadRequestException } from "../../utils/exceptions";

export class CatalogService {
  private catalogRepository: CatalogRepository;

  constructor() {
    this.catalogRepository = new CatalogRepository();
  }

  async getProducts(
    filters: Filters | undefined,
    limit: 10 | 25 | 50 | 100,
    offset: number,
    sort: "default" | "price-asc" | "price-desc" | "rating-asc" | "rating-desc"
  ): Promise<{
    products: Product[];
    count: number;
    maxPrice: number;
    minPrice: number;
  }> {
    return this.catalogRepository.getProducts(filters, limit, offset, sort);
  }

  async searchProducts(query: any): Promise<Product[]> {
    if (!query || query === "")
      throw new BadRequestException("Query is required");

    return this.catalogRepository.searchProducts(query);
  }

  async getRecommendedProducts(userId: string): Promise<Product[]> {
    return this.catalogRepository.getRecommendedProducts(userId, 20);
  }

  async getProductById(id: string): Promise<Product> {
    var product = await this.catalogRepository.getProductById(id);

    if (!product) {
      throw new Error("Product not found");
    }

    return product;
  }

  async getAllCategories(): Promise<string[]> {
    var categories = await this.catalogRepository.getAllCategories();
    return categories;
  }

  async getAllBrands(): Promise<string[]> {
    var brands = await this.catalogRepository.getAllBrands();

    return brands;
  }

  async updateProductStock(productId: string, quantity: number) {
    return this.catalogRepository.updateProductStock(productId, quantity);
  }
}
