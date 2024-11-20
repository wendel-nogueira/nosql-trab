import { Filters } from "../entities/filters.model";
import { Product } from "../entities/product.model";

export interface ICatalogRepository {
  getProducts(
    filters: Filters,
    limit: 10 | 25 | 50 | 100,
    offset: number,
    sort: "default" | "price-asc" | "price-desc" | "rating-asc" | "rating-desc"
  ): Promise<{
    products: Product[];
    count: number;
    maxPrice: number;
    minPrice: number;
  }>;

  getProductById(id: string): Promise<Product | null>;

  getAllCategories(): Promise<string[]>;

  getAllBrands(): Promise<string[]>;
}
