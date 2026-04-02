import cors from "cors";
import express from "express";
import { config } from "./config/env.js";
import authRoutes from "./routes/auth.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import learnRoutes from "./routes/learn.routes.js";
import metaRoutes from "./routes/meta.routes.js";
import questionsRoutes from "./routes/questions.routes.js";
import testsRoutes from "./routes/tests.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { getMongoConnectionInfo, isMongoConnected } from "./repositories/mongo.js";

function originMatchesPattern(origin, pattern) {
  if (pattern === "*") {
    return true;
  }

  if (!pattern.includes("*")) {
    return origin === pattern;
  }

  const escapedPattern = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
  const regex = new RegExp(`^${escapedPattern}$`);
  return regex.test(origin);
}

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin(origin, callback) {
        const normalizedOrigin = origin?.replace(/\/$/, "");
        const isAllowed =
          !normalizedOrigin ||
          config.corsOrigins.some((pattern) => originMatchesPattern(normalizedOrigin, pattern));

        if (isAllowed) {
          callback(null, true);
          return;
        }

        callback(new Error(`Origin ${origin} is not allowed by CORS.`));
      },
      credentials: true
    })
  );
  app.use(express.json());

  app.get("/", (_req, res) => {
    res.type("text/plain").send(
      "Summit Prep backend is running.\nOpen the frontend at http://localhost:5173\nAPI health: http://localhost:4000/api/health"
    );
  });

  app.get("/api/health", (_req, res) => {
    const mongoConnected = isMongoConnected();
    const mongoInfo = getMongoConnectionInfo();

    res.json({
      status: "ok",
      databaseProvider: config.databaseProvider,
      storageMode: mongoConnected ? "mongo" : "file",
      mongoConnected,
      mongoDatabaseName: mongoInfo.databaseName,
      mongoHost: mongoInfo.host
    });
  });

  app.use("/api/meta", metaRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/questions", questionsRoutes);
  app.use("/api/tests", testsRoutes);
  app.use("/api/learn", learnRoutes);
  app.use("/api/dashboard", dashboardRoutes);
  app.use(errorHandler);

  return app;
}
