import { config, isFirebaseEnabled } from "../config/env.js";
import { createToken, hashPassword, verifyPassword } from "../utils/crypto.js";
import { createHttpError, createId } from "../utils/helpers.js";
import {
  createSession,
  createUser,
  deleteSession,
  findSessionByToken,
  findUserByEmail,
  findUserByFirebaseUid,
  findUserById
} from "./data.service.js";

let firebaseAdminAuthPromise = null;

function sanitizeUser(user) {
  if (!user) {
    return null;
  }

  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

async function getFirebaseAdminAuth() {
  if (!isFirebaseEnabled) {
    return null;
  }

  if (!firebaseAdminAuthPromise) {
    firebaseAdminAuthPromise = (async () => {
      try {
        const [{ cert, getApps, initializeApp }, { getAuth }] = await Promise.all([
          import("firebase-admin/app"),
          import("firebase-admin/auth")
        ]);

        if (!getApps().length) {
          initializeApp({
            credential: cert({
              projectId: config.firebase.projectId,
              clientEmail: config.firebase.clientEmail,
              privateKey: config.firebase.privateKey
            })
          });
        }

        return getAuth();
      } catch (error) {
        console.warn(
          "Firebase auth is enabled in env, but firebase-admin is not installed. Falling back to local auth only."
        );
        console.warn(error.message);
        return null;
      }
    })();
  }

  return firebaseAdminAuthPromise;
}

async function createLocalSession(userId) {
  const token = createToken();
  await createSession({
    token,
    userId,
    createdAt: new Date().toISOString()
  });

  return token;
}

export async function registerLocalUser({ name, email, password, targetExam = "SAT" }) {
  if (!name || !email || !password) {
    throw createHttpError("Name, email, and password are required.");
  }

  if (password.length < 6) {
    throw createHttpError("Password must be at least 6 characters long.");
  }

  const normalizedEmail = email.toLowerCase();
  const existingUser = await findUserByEmail(normalizedEmail);

  if (existingUser) {
    throw createHttpError("An account with that email already exists.", 409);
  }

  const user = {
    id: createId("user"),
    name,
    email: normalizedEmail,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
    preferences: {
      targetExam,
      goalScore: targetExam === "PSAT" ? 1300 : 1400
    }
  };

  await createUser(user);
  const token = await createLocalSession(user.id);

  return {
    user: sanitizeUser(user),
    token
  };
}

export async function loginLocalUser({ email, password }) {
  if (!email || !password) {
    throw createHttpError("Email and password are required.");
  }

  const normalizedEmail = email.toLowerCase();
  const user = await findUserByEmail(normalizedEmail);

  if (!user || !verifyPassword(password, user.passwordHash)) {
    throw createHttpError("Invalid email or password.", 401);
  }

  const token = await createLocalSession(user.id);

  return {
    user: sanitizeUser(user),
    token
  };
}

export async function logoutByToken(token) {
  if (!token) {
    return;
  }

  await deleteSession(token);
}

export async function getCurrentUserFromLocalSession(token) {
  const session = await findSessionByToken(token);

  if (!session) {
    return null;
  }

  const user = await findUserById(session.userId);
  return sanitizeUser(user);
}

export async function verifyFirebaseToken(token) {
  const adminAuth = await getFirebaseAdminAuth();

  if (!adminAuth) {
    return null;
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return decoded;
  } catch (error) {
    console.warn("Firebase token verification failed.");
    console.warn(error.code || error.message);
    return null;
  }
}

export async function upsertFirebaseUser(decodedToken) {
  if (!decodedToken?.uid || !decodedToken?.email) {
    throw createHttpError("Firebase token is missing user information.", 401);
  }

  const existingByUid = await findUserByFirebaseUid(decodedToken.uid);
  if (existingByUid) {
    return sanitizeUser(existingByUid);
  }

  const existingByEmail = await findUserByEmail(decodedToken.email.toLowerCase());
  if (existingByEmail) {
    return sanitizeUser(existingByEmail);
  }

  const user = {
    id: createId("user"),
    name: decodedToken.name || decodedToken.email.split("@")[0],
    email: decodedToken.email.toLowerCase(),
    firebaseUid: decodedToken.uid,
    createdAt: new Date().toISOString(),
    preferences: {
      targetExam: "SAT",
      goalScore: 1400
    }
  };

  await createUser(user);
  return sanitizeUser(user);
}
