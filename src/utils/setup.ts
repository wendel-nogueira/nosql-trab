import { Container } from "inversify";
import { connectToDatabaseMongodb } from "../config/database";
import { Db } from "mongodb";

const container = new Container();

export async function setupContainer(): Promise<Container> {
  const database: Db = await connectToDatabaseMongodb();

  container.bind<Db>(Db).toConstantValue(database);

  return container;
}

export { container };
