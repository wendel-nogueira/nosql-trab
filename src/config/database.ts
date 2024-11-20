import { MongoClient, Db } from "mongodb";
import { createClient, RedisClientType } from "redis";

import dotenv from "dotenv";

dotenv.config();

const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const client = new MongoClient(mongoURI);

let mongoDbInstance: Db | null = null;

export async function connectToDatabaseMongodb(): Promise<Db> {
  if (mongoDbInstance) {
    return mongoDbInstance;
  }

  await client.connect();
  mongoDbInstance = client.db("ecommerce");
  console.log("Conectado ao MongoDB");

  return mongoDbInstance;
}

export async function disconnectFromDatabaseMongoDb(): Promise<void> {
  await client.close();
  console.log("Desconectado do MongoDB");
}

let redisClient: RedisClientType;

export async function connectToRedis(): Promise<RedisClientType> {
  if (redisClient) {
    return redisClient;
  }

  redisClient = createClient({
    url: process.env.REDIS_URI || "redis://localhost:6379",
  });
  redisClient.on("error", (error) =>
    console.error("Redis Client Error", error)
  );
  await redisClient.connect();
  console.log("Conectado ao Redis");

  return redisClient;
}

export async function disconnectFromRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    console.log("Desconectado do Redis");
  }
}
