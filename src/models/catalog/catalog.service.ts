import { CatalogRepository } from "./repositories/catalog.repository";
import { Product } from "./entities/product.model";
import { Filters } from "./entities/filters.model";

export class CatalogService {
  constructor(private catalogRepository: CatalogRepository) {}

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
}
