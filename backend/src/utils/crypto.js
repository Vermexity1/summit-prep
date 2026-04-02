import crypto from "crypto";

export function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const derivedKey = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
}

export function verifyPassword(password, storedValue = "") {
  const [salt, hash] = storedValue.split(":");

  if (!salt || !hash) {
    return false;
  }

  const comparison = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(comparison, "hex"));
}

export function createToken() {
  return crypto.randomBytes(32).toString("hex");
}

