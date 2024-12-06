import { Filters } from "../entities/filters.entity";
import { Product } from "../entities/product.entity";

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

  searchProducts(query: string): Promise<Product[]>;

  getRecommendedProducts(userId: string, limit: number): Promise<Product[]>;

  getProductById(id: string): Promise<Product | null>;

  getProductsByIDs(ids: string[]): Promise<Product[]>;

  getAllCategories(): Promise<string[]>;

  getAllBrands(): Promise<string[]>;

  updateProductStock(productId: string, quantity: number): Promise<void>;
}
