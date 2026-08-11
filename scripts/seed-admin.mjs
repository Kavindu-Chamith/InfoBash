// Seeds default admin user into admin_users table with bcrypt/pgcrypto hashed password
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
    throw new Error("DATABASE_URL is not set.");
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    throw new Error("ADMIN_PASSWORD is not set in environment or .env.local.");
  }
  const cleanConnectionString = connectionString.replace(/([?&])sslmode=[^&]*/gi, "");
  const pool = new Pool({
    connectionString: cleanConnectionString,
    ssl: cleanConnectionString.includes("localhost") ? false : { rejectUnauthorized: false },
  });

  try {
    await pool.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    await pool.query(
      `
      INSERT INTO admin_users (username, password_hash)
      VALUES ('admin', crypt($1, gen_salt('bf')))
      ON CONFLICT (username) 
      DO UPDATE SET password_hash = crypt($1, gen_salt('bf'));
      `,
      [adminPassword]
    );

    console.log("Admin user seeded successfully into database.");
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Admin seed failed:", err.message);
  process.exit(1);
});
