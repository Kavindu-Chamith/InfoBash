// Applies db/schema.sql against DATABASE_URL. Safe to run repeatedly (idempotent DDL).
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Pool } from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnvLocal() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i === -1) continue;
    const key = line.slice(0, i).trim();
    const value = line.slice(i + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

async function main() {
  loadEnvLocal();
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set (checked process.env and .env.local).");
  }

  const sql = fs.readFileSync(path.join(__dirname, "..", "db", "schema.sql"), "utf8");
  const cleanConnectionString = connectionString.replace(/([?&])sslmode=[^&]*/gi, "");
  const pool = new Pool({
    connectionString: cleanConnectionString,
    ssl: cleanConnectionString.includes("localhost") ? false : { rejectUnauthorized: false },
  });

  try {
    await pool.query(sql);
    console.log("Migration applied successfully.");
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
