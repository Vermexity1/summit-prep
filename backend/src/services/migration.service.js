import { readStore } from "../repositories/fileStore.js";
import { connectMongo, isMongoConnected, MongoModels } from "../repositories/mongo.js";

function bulkWriteCount(result) {
  return (result.upsertedCount || 0) + (result.modifiedCount || 0) + (result.matchedCount || 0);
}

async function bulkUpsert(model, operations) {
  if (!operations.length) {
    return 0;
  }

  const result = await model.bulkWrite(operations, { ordered: false });
  return bulkWriteCount(result);
}

function normalizeUser(user) {
  return {
    ...user,
    email: user.email.toLowerCase()
  };
}

export async function migrateFileStoreToMongo() {
  await connectMongo();

  if (!isMongoConnected()) {
    return {
      migrated: false,
      reason: "MongoDB is not connected."
    };
  }

  const store = await readStore();

  const summary = {
    migrated: true,
    users: store.users.length,
    sessions: store.sessions.length,
    issuedQuestions: store.issuedQuestions.length,
    mockTests: store.mockTests.length,
    practiceAttempts: store.practiceAttempts.length,
    testResults: store.testResults.length
  };

  await bulkUpsert(
    MongoModels.User,
    store.users.map((user) => ({
      updateOne: {
        filter: { email: user.email.toLowerCase() },
        update: { $set: normalizeUser(user) },
        upsert: true
      }
    }))
  );

  await bulkUpsert(
    MongoModels.Session,
    store.sessions.map((session) => ({
      updateOne: {
        filter: { token: session.token },
        update: { $set: session },
        upsert: true
      }
    }))
  );

  await bulkUpsert(
    MongoModels.IssuedQuestion,
    store.issuedQuestions.map((question) => ({
      updateOne: {
        filter: { id: question.id },
        update: { $set: question },
        upsert: true
      }
    }))
  );

  await bulkUpsert(
    MongoModels.MockTest,
    store.mockTests.map((test) => ({
      updateOne: {
        filter: { id: test.id },
        update: { $set: test },
        upsert: true
      }
    }))
  );

  await bulkUpsert(
    MongoModels.PracticeAttempt,
    store.practiceAttempts.map((attempt) => ({
      updateOne: {
        filter: {
          userId: attempt.userId,
          questionId: attempt.questionId,
          createdAt: attempt.createdAt
        },
        update: { $set: attempt },
        upsert: true
      }
    }))
  );

  await bulkUpsert(
    MongoModels.TestResult,
    store.testResults.map((result) => ({
      updateOne: {
        filter: { id: result.id },
        update: { $set: result },
        upsert: true
      }
    }))
  );

  return summary;
}
