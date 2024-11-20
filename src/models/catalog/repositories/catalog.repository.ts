import { Db, Collection } from "mongodb";
import { Product } from "../entities/product.model";
import { ICatalogRepository } from "./icatalog.repository";
import { Filters } from "../entities/filters.model";

export class CatalogRepository implements ICatalogRepository {
  private collection: Collection<Product>;

  constructor(database: Db) {
    this.collection = database.collection<Product>("video_games");
  }

  async getProductById(id: string): Promise<Product | null> {
    return this.collection.findOne({ id });
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
    const query = filters ? this.buildQuery(filters) : {};
    const sortQuery = this.buildSortQuery(sort);
    const products = await this.collection
      .find(query)
      .sort(sortQuery)
      .skip(offset)
      .limit(limit)
      .toArray();

    const count = await this.collection.countDocuments(query);
    const maxPrice = await this.collection
      .find()
      .sort({ price: -1 })
      .limit(1)
      .toArray()
      .then((result) => result[0]?.price || 0);

    const minPrice = await this.collection
      .find()
      .sort({ price: 1 })
      .limit(1)
      .toArray()
      .then((result) => result[0]?.price || 0);

    return { products, count, maxPrice, minPrice };
  }

  async getAllCategories(): Promise<string[]> {
    const categories = await this.collection
      .distinct("categories", {})
      .then((result) => result as string[]);

    categories.sort();

    return categories;
  }

  async getAllBrands(): Promise<string[]> {
    const brands = await this.collection
      .distinct("details.Manufacturer", {})
      .then((result) => result as string[]);

    brands.sort();

    return brands;
  }

  private buildQuery(filters: Filters) {
    const query: any = {};

    if (filters.categories && filters.categories.length) {
      query.categories = { $in: filters.categories };
    }

    if (filters.brands && filters.brands.length) {
      query["details.Manufacturer"] = { $in: filters.brands };
    }

    if (filters.price && filters.price.length === 2) {
      query.price = { $gte: filters.price[0], $lte: filters.price[1] };
    }

    if (filters.rating && filters.rating.length === 2) {
      query.average_rating = {
        $gte: filters.rating[0],
        $lte: filters.rating[1],
      };
    }

    return query;
  }

  private buildSortQuery(sort: string): {
    [key: string]: 1 | -1;
  } {
    switch (sort) {
      case "price-asc":
        return { price: 1 };
      case "price-desc":
        return { price: -1 };
      case "rating-asc":
        return { average_rating: 1 };
      case "rating-desc":
        return { average_rating: -1 };
      default:
        return {};
    }
  }
}
