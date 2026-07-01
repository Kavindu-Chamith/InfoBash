import { Pool } from "pg";

declare global {
  var _infobashPool: Pool | undefined;
}

function createPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add it to your .env.local file — see .env.example."
    );
  }
  return new Pool({
    connectionString,
    ssl: connectionString.includes("localhost")
      ? false
      : { rejectUnauthorized: false },
  });
}

// Reuse the pool across hot reloads in dev so we don't exhaust connections.
export const pool = globalThis._infobashPool ?? createPool();
if (process.env.NODE_ENV !== "production") {
  globalThis._infobashPool = pool;
}
