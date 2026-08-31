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

async function ping() {
  loadEnvLocal();
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not defined in environment or .env.local.");
  }

  const cleanConnectionString = connectionString.replace(/([?&])sslmode=[^&]*/gi, "");
  const pool = new Pool({
    connectionString: cleanConnectionString,
    ssl: cleanConnectionString.includes("localhost") ? false : { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  try {
    const start = Date.now();
    await pool.query("SELECT 1");
    const timestamp = new Date().toISOString();
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tournament_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `).catch(() => {});

    await pool.query(`
      INSERT INTO tournament_settings (key, value, updated_at)
      VALUES ('last_db_keepalive', $1, NOW())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
    `, [timestamp]).catch(() => {});

    console.log(`[${timestamp}] ✓ Supabase DB Keep-Alive Ping Successful (${Date.now() - start}ms)`);
  } catch (err) {
    console.error("✗ Supabase DB Ping Failed:", err.message);
    process.exit(1);
  } finally {
    await pool.end().catch(() => {});
  }
}

ping();
