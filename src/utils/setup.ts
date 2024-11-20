import { Container } from "inversify";
import { connectToDatabaseMongodb } from "../config/database";
import { CatalogController } from "../models/catalog/catalog.controller";
import { CatalogService } from "../models/catalog/catalog.service";
import { CatalogRepository } from "../models/catalog/repositories/catalog.repository";
import { Db } from "mongodb";

const container = new Container();

export async function setupContainer(): Promise<Container> {
  const database: Db = await connectToDatabaseMongodb();

  container.bind<Db>(Db).toConstantValue(database);
  container.bind<CatalogRepository>(CatalogRepository).to(CatalogRepository);
  container.bind<CatalogService>(CatalogService).to(CatalogService);
  container.bind<CatalogController>(CatalogController).to(CatalogController);

  return container;
}

export { container };
