import fs from "fs/promises";
import path from "path";
import { config } from "../config/env.js";
import { createId } from "../utils/helpers.js";
import { hashPassword } from "../utils/crypto.js";

const initialState = {
  users: [],
  sessions: [],
  issuedQuestions: [],
  mockTests: [],
  practiceAttempts: [],
  testResults: []
};

let writeChain = Promise.resolve();

async function ensureDataFile() {
  const directory = path.dirname(config.dataFile);
  await fs.mkdir(directory, { recursive: true });

  try {
    await fs.access(config.dataFile);
  } catch {
    // The local-first demo store is created automatically so the app boots with no manual setup.
    const demoUser = {
      id: createId("user"),
      name: "Demo Student",
      email: "demo@summitprep.dev",
      passwordHash: hashPassword("demo1234"),
      createdAt: new Date().toISOString(),
      preferences: {
        targetExam: "SAT",
        goalScore: 1400
      }
    };

    await fs.writeFile(
      config.dataFile,
      JSON.stringify({ ...initialState, users: [demoUser] }, null, 2),
      "utf8"
    );
  }
}

export async function readStore() {
  await ensureDataFile();
  const raw = await fs.readFile(config.dataFile, "utf8");
  return { ...initialState, ...JSON.parse(raw) };
}

export async function writeStore(nextState) {
  await ensureDataFile();

  // Serialize writes so the file store stays stable during quick local testing.
  writeChain = writeChain.then(async () => {
    await fs.writeFile(config.dataFile, JSON.stringify(nextState, null, 2), "utf8");
  });

  return writeChain;
}

export async function updateStore(updater) {
  const current = await readStore();
  const nextState = await updater(current);
  await writeStore(nextState);
  return nextState;
}
