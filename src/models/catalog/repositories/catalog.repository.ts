import { Product } from "../entities/product.entity";
import { ICatalogRepository } from "./icatalog.repository";
import { Filters } from "../entities/filters.entity";
import {
  connectToDatabaseMongodb,
  neo4jDriver,
} from "../../../config/database";
import { Collection, Db, ObjectId } from "mongodb";
import { Client } from "@elastic/elasticsearch";

import dotenv from "dotenv";

dotenv.config();

export class CatalogRepository implements ICatalogRepository {
  private db: Db | undefined;
  private collection: Collection<Product> | undefined;

  constructor() {
    this.init();
  }

  async init(): Promise<void> {
    this.db = await connectToDatabaseMongodb();
    this.collection = this.db.collection("video_games");
  }

  async getProductById(id: string): Promise<Product | null> {
    if (!this.db) await this.init();

    const product = await this.collection!.findOne({
      id: id,
    });

    return product;
  }

  async getProductsByIDs(ids: string[]): Promise<Product[]> {
    if (!this.db) await this.init();

    const products = await this.collection!.find({
      id: { $in: ids },
    }).toArray();

    return products;
  }

  async searchProducts(query: string): Promise<Product[]> {
    const elasticsearchClient = new Client({
      node: process.env.ELASTICSEARCH_URI || "",
      auth: {
        apiKey: process.env.ELASTICSEARCH_API_KEY || "",
      },
      sniffOnStart: true,
    });

    const searchResult = await elasticsearchClient
      .search({
        index: "connector-nosql",
        body: {
          query: {
            query_string: {
              query: query,
              fields: [
                "title",
                "main_category",
                "categories",
                "details.Manufacturer",
                "details.Brand",
              ],
              fuzziness: "AUTO",
            },
          },
        },
      })
      .then((result) => result.hits.hits.map((hit: any) => hit._source));

    return searchResult;
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
    if (!this.db) await this.init();

    const query = filters ? this.buildQuery(filters) : {};
    const sortQuery = this.buildSortQuery(sort);
    const products = await this.collection!.find(query)
      .sort(sortQuery)
      .skip(offset)
      .limit(limit)
      .toArray();

    const count = await this.collection!.countDocuments(query);
    const maxPrice = await this.collection!.find()
      .sort({ price: -1 })
      .limit(1)
      .toArray()
      .then((result: any) => result[0]?.price || 0);

    const minPrice = await this.collection!.find()
      .sort({ price: 1 })
      .limit(1)
      .toArray()
      .then((result: any) => result[0]?.price || 0);

    return { products, count, maxPrice, minPrice };
  }

  async getRecommendedProducts(
    userId: string,
    limit: number
  ): Promise<Product[]> {
    let products: Product[] = [];

    if (userId && userId !== "") {
      const session = neo4jDriver.session();

      const result = await session.run(
        `MATCH (u:Usuario)-[c:COMPROU]->(p:Produto)-[:PERTENCE_A]->(categ:Categoria)
        WHERE u.id = $userId
        MATCH (recomendado:Produto)-[:PERTENCE_A]->(categ)
        WHERE NOT (u)-[:COMPROU]->(recomendado)
        RETURN DISTINCT recomendado, SUM(c.quantidade) AS relevancia
        ORDER BY relevancia DESC
        LIMIT 20;`,
        { userId }
      );

      const ids = result.records.map(
        (record) => record.get("recomendado").properties.id
      );

      products = await this.getProductsByIDs(ids);

      session.close();
    } else {
      products = await this.collection!.find()
        .sort({ average_rating: -1 })
        .limit(20)
        .toArray();
    }

    return products;
  }

  async getAllCategories(): Promise<string[]> {
    if (!this.db) await this.init();

    const categories = await this.collection!.distinct("categories", {}).then(
      (result: any) => result as string[]
    );

    categories.sort();

    return categories;
  }

  async getAllBrands(): Promise<string[]> {
    if (!this.db) await this.init();

    const brands = await this.collection!.distinct(
      "details.Manufacturer",
      {}
    ).then((result: any) => result as string[]);

    brands.sort();

    return brands;
  }

  async updateProductStock(id: string, quantity: number): Promise<void> {
    if (!this.db) await this.init();

    await this.collection!.updateOne(
      { id: id },
      { $inc: { stock: -quantity } }
    );
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
