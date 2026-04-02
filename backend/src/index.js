import { createApp } from "./app.js";
import { config } from "./config/env.js";
import { readStore } from "./repositories/fileStore.js";
import { connectMongo } from "./repositories/mongo.js";
import { migrateFileStoreToMongo } from "./services/migration.service.js";

async function start() {
  await readStore();
  const mongoConnected = await connectMongo();

  if (mongoConnected) {
    const migration = await migrateFileStoreToMongo();

    if (migration.migrated) {
      console.log(
        `Mongo sync complete: ${migration.users} users, ${migration.sessions} sessions, ${migration.practiceAttempts} practice attempts.`
      );
    }
  }

  const app = createApp();
  const server = app.listen(config.port, () => {
    console.log(`Summit Prep backend running on http://localhost:${config.port}`);
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(
        `Port ${config.port} is already in use. If Summit Prep is already running, reuse that backend instead of starting a second copy.`
      );
      process.exit(1);
    }

    throw error;
  });
}

start().catch((error) => {
  console.error("Failed to start the backend.");
  console.error(error);
  process.exit(1);
});
