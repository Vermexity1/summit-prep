import mongoose from "mongoose";
import { config, isMongoEnabled } from "../config/env.js";
import { connectMongo, isMongoConnected } from "../repositories/mongo.js";

async function run() {
  if (config.databaseProvider !== "mongodb") {
    console.error(
      "DATABASE_PROVIDER is not set to mongodb. Update backend/.env and try again."
    );
    process.exit(1);
  }

  if (!config.mongoUri) {
    console.error("MONGODB_URI is empty. Paste your Atlas connection string into backend/.env.");
    process.exit(1);
  }

  if (!isMongoEnabled) {
    console.error("MongoDB is not enabled. Check DATABASE_PROVIDER and MONGODB_URI.");
    process.exit(1);
  }

  const connected = await connectMongo();

  if (!connected || !isMongoConnected()) {
    console.error("MongoDB connection failed. Double-check the URI, Atlas user, and IP access.");
    process.exit(1);
  }

  const { host, name } = mongoose.connection;
  console.log(`MongoDB connection successful: ${name} on ${host}`);

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((error) => {
  console.error("MongoDB check failed.");
  console.error(error.message);
  process.exit(1);
});
