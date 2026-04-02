import { createHttpError } from "../utils/helpers.js";
import {
  getCurrentUserFromLocalSession,
  upsertFirebaseUser,
  verifyFirebaseToken
} from "../services/auth.service.js";

async function resolveUserFromToken(token) {
  const localUser = await getCurrentUserFromLocalSession(token);
  if (localUser) {
    return localUser;
  }

  // If a local session is not found, try Firebase so the backend can support both auth modes.
  const firebaseToken = await verifyFirebaseToken(token);
  if (firebaseToken) {
    return upsertFirebaseUser(firebaseToken);
  }

  return null;
}

export async function requireAuth(req, _res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

    if (!token) {
      throw createHttpError("Authentication required.", 401);
    }

    const user = await resolveUserFromToken(token);

    if (!user) {
      throw createHttpError("Invalid or expired session.", 401);
    }

    req.authToken = token;
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

export async function optionalAuth(req, _res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

    if (token) {
      const user = await resolveUserFromToken(token);
      if (user) {
        req.authToken = token;
        req.user = user;
      }
    }

    next();
  } catch (error) {
    next(error);
  }
}
