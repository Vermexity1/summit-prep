import { isMongoEnabled } from "../config/env.js";
import { readStore, updateStore } from "../repositories/fileStore.js";
import { connectMongo, isMongoConnected, MongoModels } from "../repositories/mongo.js";

async function getStorageMode() {
  if (isMongoEnabled && !isMongoConnected()) {
    await connectMongo();
  }

  return isMongoConnected() ? "mongo" : "file";
}

export async function findUserByEmail(email) {
  const normalizedEmail = email.toLowerCase();
  const mode = await getStorageMode();

  if (mode === "mongo") {
    return MongoModels.User.findOne({ email: normalizedEmail }).lean();
  }

  const store = await readStore();
  return store.users.find((user) => user.email === normalizedEmail) || null;
}

export async function findUserById(id) {
  const mode = await getStorageMode();

  if (mode === "mongo") {
    return MongoModels.User.findOne({ id }).lean();
  }

  const store = await readStore();
  return store.users.find((user) => user.id === id) || null;
}

export async function findUserByFirebaseUid(firebaseUid) {
  const mode = await getStorageMode();

  if (mode === "mongo") {
    return MongoModels.User.findOne({ firebaseUid }).lean();
  }

  const store = await readStore();
  return store.users.find((user) => user.firebaseUid === firebaseUid) || null;
}

export async function createUser(user) {
  const mode = await getStorageMode();

  if (mode === "mongo") {
    return MongoModels.User.create(user);
  }

  await updateStore((store) => ({
    ...store,
    users: [...store.users, user]
  }));

  return user;
}

export async function updateUser(id, updater) {
  const mode = await getStorageMode();

  if (mode === "mongo") {
    const current = await MongoModels.User.findOne({ id });
    if (!current) {
      return null;
    }

    const next = updater(current.toObject());
    await MongoModels.User.updateOne({ id }, next);
    return next;
  }

  let updatedUser = null;
  await updateStore((store) => {
    const users = store.users.map((user) => {
      if (user.id !== id) {
        return user;
      }

      updatedUser = updater(user);
      return updatedUser;
    });

    return {
      ...store,
      users
    };
  });

  return updatedUser;
}

export async function createSession(session) {
  const mode = await getStorageMode();

  if (mode === "mongo") {
    return MongoModels.Session.create(session);
  }

  await updateStore((store) => ({
    ...store,
    sessions: [...store.sessions, session]
  }));

  return session;
}

export async function findSessionByToken(token) {
  const mode = await getStorageMode();

  if (mode === "mongo") {
    return MongoModels.Session.findOne({ token }).lean();
  }

  const store = await readStore();
  return store.sessions.find((session) => session.token === token) || null;
}

export async function deleteSession(token) {
  const mode = await getStorageMode();

  if (mode === "mongo") {
    await MongoModels.Session.deleteOne({ token });
    return;
  }

  await updateStore((store) => ({
    ...store,
    sessions: store.sessions.filter((session) => session.token !== token)
  }));
}

export async function saveIssuedQuestion(issuedQuestion) {
  const mode = await getStorageMode();

  if (mode === "mongo") {
    return MongoModels.IssuedQuestion.create(issuedQuestion);
  }

  await updateStore((store) => ({
    ...store,
    issuedQuestions: [...store.issuedQuestions, issuedQuestion]
  }));

  return issuedQuestion;
}

export async function getIssuedQuestion(id) {
  const mode = await getStorageMode();

  if (mode === "mongo") {
    return MongoModels.IssuedQuestion.findOne({ id }).lean();
  }

  const store = await readStore();
  return store.issuedQuestions.find((question) => question.id === id) || null;
}

export async function saveMockTest(test) {
  const mode = await getStorageMode();

  if (mode === "mongo") {
    return MongoModels.MockTest.create(test);
  }

  await updateStore((store) => ({
    ...store,
    mockTests: [...store.mockTests, test]
  }));

  return test;
}

export async function getMockTest(id) {
  const mode = await getStorageMode();

  if (mode === "mongo") {
    return MongoModels.MockTest.findOne({ id }).lean();
  }

  const store = await readStore();
  return store.mockTests.find((test) => test.id === id) || null;
}

export async function addPracticeAttempt(attempt) {
  const mode = await getStorageMode();

  if (mode === "mongo") {
    return MongoModels.PracticeAttempt.create(attempt);
  }

  await updateStore((store) => ({
    ...store,
    practiceAttempts: [...store.practiceAttempts, attempt]
  }));

  return attempt;
}

export async function listPracticeAttemptsByUser(userId) {
  const mode = await getStorageMode();

  if (mode === "mongo") {
    return MongoModels.PracticeAttempt.find({ userId }).sort({ createdAt: -1 }).lean();
  }

  const store = await readStore();
  return store.practiceAttempts
    .filter((attempt) => attempt.userId === userId)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export async function addTestResult(result) {
  const mode = await getStorageMode();

  if (mode === "mongo") {
    return MongoModels.TestResult.create(result);
  }

  await updateStore((store) => ({
    ...store,
    testResults: [...store.testResults, result]
  }));

  return result;
}

export async function listTestResultsByUser(userId) {
  const mode = await getStorageMode();

  if (mode === "mongo") {
    return MongoModels.TestResult.find({ userId }).sort({ createdAt: -1 }).lean();
  }

  const store = await readStore();
  return store.testResults
    .filter((result) => result.userId === userId)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}
