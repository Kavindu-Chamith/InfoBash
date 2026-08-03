import crypto from "crypto";

export const CAPTAIN_COOKIE = "infobash_captain";
const SESSION_DAYS = 30;
const SCRYPT_KEYLEN = 64;

function getSecret() {
  const secret = process.env.CAPTAIN_SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "CAPTAIN_SESSION_SECRET is not set. Add it to your .env.local file — see .env.example."
    );
  }
  return secret;
}

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, SCRYPT_KEYLEN).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = crypto.scryptSync(password, salt, SCRYPT_KEYLEN);
  const expected = Buffer.from(hash, "hex");
  if (candidate.length !== expected.length) return false;
  return crypto.timingSafeEqual(candidate, expected);
}

export function createCaptainSessionToken(captainId: string) {
  const expires = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const payload = `${captainId}.${expires}`;
  const signature = crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
  return `${payload}.${signature}`;
}

export function verifyCaptainSessionToken(token: string | undefined | null) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [captainId, expiresStr, signature] = parts;
  const payload = `${captainId}.${expiresStr}`;
  const expected = crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
  const valid =
    signature.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  if (!valid) return null;
  if (Number(expiresStr) <= Date.now()) return null;
  return { captainId };
}
