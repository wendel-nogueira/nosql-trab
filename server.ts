import express from "express";
import cors from "cors";
import "reflect-metadata";
import "express-async-errors";
import router from "./src/routes";
import { ErrorHandler } from "./src/utils/error-handler";
import dotenv from "dotenv";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";

import {
  connectToDatabaseMongodb,
  connectToRedis,
  disconnectFromDatabaseMongoDb,
  disconnectFromRedis,
  mongoDbInstance,
  connectToQueue,
  createWebSocketServer,
} from "./src/config/database";

dotenv.config();

const app = express();
const port = process.env.APP_PORT || 3000;

const server = http.createServer(app);

app.use(express.json({ limit: "50mb" }));
app.use(express.json());
app.use(cors());
app.set("trust proxy", true);

connectToQueue();
createWebSocketServer(server);

app.use("/", router);
app.use(ErrorHandler);

server.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

process.on("SIGINT", async () => {
  disconnectFromDatabaseMongoDb();
  disconnectFromRedis();
  process.exit(0);
});

export default app;
