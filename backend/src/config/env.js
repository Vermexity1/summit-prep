import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../..");
const defaultCorsOrigins = ["http://localhost:5173", "http://127.0.0.1:5173"];

function parseCorsOrigins(value) {
  if (!value) {
    return defaultCorsOrigins;
  }

  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export const config = {
  port: Number(process.env.PORT || 4000),
  sessionSecret: process.env.SESSION_SECRET || "summit-prep-local-secret",
  authProvider: process.env.AUTH_PROVIDER || "local",
  dataFile: path.resolve(projectRoot, process.env.DATA_FILE || "./src/data/app-data.json"),
  databaseProvider: process.env.DATABASE_PROVIDER || "file",
  mongoUri: process.env.MONGODB_URI || "",
  aiMode: process.env.AI_MODE || "local",
  openAiApiKey: process.env.OPENAI_API_KEY || "",
  openAiModel: process.env.OPENAI_MODEL || "gpt-4.1-mini",
  corsOrigins: parseCorsOrigins(process.env.CORS_ORIGINS),
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || "",
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || "",
    privateKey: process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
      : ""
  }
};

export const isMongoEnabled = config.databaseProvider === "mongodb" && Boolean(config.mongoUri);
export const isOpenAiEnabled = config.aiMode === "openai" && Boolean(config.openAiApiKey);
export const isFirebaseEnabled =
  config.authProvider === "firebase" &&
  Boolean(config.firebase.projectId && config.firebase.clientEmail && config.firebase.privateKey);
