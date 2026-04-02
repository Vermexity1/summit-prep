import mongoose from "mongoose";
import { config, isMongoEnabled } from "../config/env.js";

let connected = false;

const userSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, index: true },
    name: String,
    email: { type: String, unique: true, index: true },
    passwordHash: String,
    firebaseUid: String,
    createdAt: String,
    preferences: Object
  },
  { collection: "users" }
);

const sessionSchema = new mongoose.Schema(
  {
    token: { type: String, unique: true, index: true },
    userId: String,
    createdAt: String
  },
  { collection: "sessions" }
);

const practiceAttemptSchema = new mongoose.Schema(
  {
    userId: String,
    questionId: String,
    section: String,
    type: String,
    domain: String,
    examType: String,
    difficulty: String,
    year: Number,
    userAnswer: String,
    correct: Boolean,
    timeSpentSeconds: Number,
    createdAt: String
  },
  { collection: "practiceAttempts" }
);

const testResultSchema = new mongoose.Schema(
  {
    id: String,
    userId: String,
    testId: String,
    examType: String,
    totalScore: Number,
    verbalScore: Number,
    mathScore: Number,
    timeSpentSeconds: Number,
    questionCount: Number,
    sectionBreakdown: Object,
    questionTypeBreakdown: Array,
    questionReviews: Array,
    createdAt: String
  },
  { collection: "testResults" }
);

const issuedQuestionSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, index: true },
    ownerUserId: String,
    payload: Object,
    createdAt: String
  },
  { collection: "issuedQuestions" }
);

const mockTestSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, index: true },
    ownerUserId: String,
    examType: String,
    totalQuestions: Number,
    totalTimeMinutes: Number,
    questions: Array,
    createdAt: String
  },
  { collection: "mockTests" }
);

export const MongoModels = {
  User: mongoose.models.User || mongoose.model("User", userSchema),
  Session: mongoose.models.Session || mongoose.model("Session", sessionSchema),
  PracticeAttempt:
    mongoose.models.PracticeAttempt || mongoose.model("PracticeAttempt", practiceAttemptSchema),
  TestResult: mongoose.models.TestResult || mongoose.model("TestResult", testResultSchema),
  IssuedQuestion:
    mongoose.models.IssuedQuestion || mongoose.model("IssuedQuestion", issuedQuestionSchema),
  MockTest: mongoose.models.MockTest || mongoose.model("MockTest", mockTestSchema)
};

export async function connectMongo() {
  if (!isMongoEnabled || connected) {
    return connected;
  }

  try {
    await mongoose.connect(config.mongoUri, {
      dbName: config.mongoDbName
    });
    connected = true;
    console.log(
      `MongoDB connected to database "${mongoose.connection.name}" on host "${mongoose.connection.host}"`
    );
    return true;
  } catch (error) {
    console.warn("MongoDB unavailable, falling back to file store.");
    console.warn(error.message);
    connected = false;
    return false;
  }
}

export function isMongoConnected() {
  return connected;
}

export function getMongoConnectionInfo() {
  return {
    host: mongoose.connection.host || "",
    databaseName: mongoose.connection.name || config.mongoDbName
  };
}
