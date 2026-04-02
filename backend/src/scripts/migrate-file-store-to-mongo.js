import { migrateFileStoreToMongo } from "../services/migration.service.js";

async function run() {
  const summary = await migrateFileStoreToMongo();

  if (!summary.migrated) {
    console.error(summary.reason || "Mongo migration failed.");
    process.exit(1);
  }

  console.log("Local file store migrated to MongoDB.");
  console.log(JSON.stringify(summary, null, 2));
  process.exit(0);
}

run().catch((error) => {
  console.error("Failed to migrate local file store to MongoDB.");
  console.error(error);
  process.exit(1);
});
