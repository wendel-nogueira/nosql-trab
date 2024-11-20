import express from "express";
import cors from "cors";
import "reflect-metadata";
import "express-async-errors";
import { router } from "./routes";
import { ErrorHandler } from "./utils/error-handler";
import dotenv from "dotenv";

import {
  disconnectFromDatabaseMongoDb,
  disconnectFromRedis,
} from "./config/database";

dotenv.config();

const app = express();
const port = process.env.APP_PORT || 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.json());
app.use(cors());
app.set("trust proxy", true);

app.use("/", router);
app.use(ErrorHandler);

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

process.on("SIGINT", async () => {
  await disconnectFromDatabaseMongoDb();
  await disconnectFromRedis();
  process.exit(0);
});

export default app;
