import { MongoClient, Db } from "mongodb";
import { createClient, RedisClientType } from "redis";
import { OrderService } from "../models/orders/order.service";
import { WebSocketServer, WebSocket } from "ws";
import { Client } from "@elastic/elasticsearch";
import { driver, auth, Driver } from "neo4j-driver";

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

  return redisClient;
}

export async function disconnectFromRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    console.log("Desconectado do Redis");
  }
}

export async function connectToQueue(): Promise<void> {
  const client = await connectToRedis();

  client.on("error", (error) => console.error("Redis Client Error", error));

  const subscriber = client.duplicate();

  await subscriber.connect();

  const orderService = new OrderService();

  while (true) {
    const orderData = await subscriber.blPop("orders", 0);

    if (orderData) {
      const order = JSON.parse(orderData.element);
      await orderService.processOrder(order);
    }
  }
}

let wss: WebSocketServer;
const clients = new Set<WebSocket>();

export function createWebSocketServer(server: any): WebSocketServer {
  wss = new WebSocketServer({ server });

  wss.on("connection", (ws: WebSocket) => {
    clients.add(ws);

    ws.on("close", () => {
      clients.delete(ws);
    });
  });

  return wss;
}

let elasticsearchClient: Client;

export function connectToElasticsearch(): Client {
  if (elasticsearchClient) {
    return elasticsearchClient;
  }

  elasticsearchClient = new Client({
    node: process.env.ELASTICSEARCH_URI || "",
    auth: {
      apiKey: process.env.ELASTICSEARCH_API_KEY || "",
    },
    sniffOnStart: true,
  });

  elasticsearchClient
    .info()
    .then((resp) => console.log(resp))
    .catch((error) => console.error("erro:", error));

  console.log("Cliente Elasticsearch inicializado.");

  return elasticsearchClient;
}

export async function disconnectFromElasticsearch(): Promise<void> {
  if (elasticsearchClient) {
    await elasticsearchClient.close();
    console.log("Desconectado do Elasticsearch");
  }
}

let neo4jDriver: Driver;

export function connectToNeo4j(): any {
  if (neo4jDriver) {
    return neo4jDriver;
  }

  neo4jDriver = driver(
    process.env.NEO4J_URI || "bolt://localhost:7687",
    auth.basic(
      process.env.NEO4J_USER || "neo4j",
      process.env.NEO4J_PASSWORD || "admin"
    )
  );

  console.log("Conectado ao Neo4j");

  return neo4jDriver;
}

export async function disconnectFromNeo4j(): Promise<void> {
  if (neo4jDriver) {
    await neo4jDriver.close();
    console.log("Desconectado do Neo4j");
  }
}

export {
  mongoDbInstance,
  redisClient,
  wss,
  clients,
  elasticsearchClient,
  neo4jDriver,
};
