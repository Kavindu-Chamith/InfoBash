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

const SEED_TEAM_NAMES = [
  "Thunder Strikers",
  "Cyber Strikers",
  "Binary Titans",
  "Falcon Warriors",
  "Matrix XI",
];

async function main() {
  loadEnvLocal();
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set (checked process.env and .env.local).");
  }

  const cleanConnectionString = connectionString.replace(/([?&])sslmode=[^&]*/gi, "");
  const pool = new Pool({
    connectionString: cleanConnectionString,
    ssl: cleanConnectionString.includes("localhost") ? false : { rejectUnauthorized: false },
  });

  try {
    console.log("Removing seeded teams and associated captain accounts...");

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // 1. Delete seed teams (players are automatically deleted via CASCADE foreign key)
      const deleteTeamsRes = await client.query(
        `DELETE FROM teams WHERE team_name = ANY($1::text[]) RETURNING id, team_name`,
        [SEED_TEAM_NAMES]
      );
      console.log(`Deleted ${deleteTeamsRes.rowCount} seeded teams.`);

      // 2. Delete seed captain accounts
      const deleteCaptainsRes = await client.query(
        `DELETE FROM captains WHERE email LIKE '%@infobash.lk' RETURNING id, email`
      );
      console.log(`Deleted ${deleteCaptainsRes.rowCount} seeded captain accounts.`);

      // 3. Clear any generated matches referencing deleted teams or empty matches
      await client.query(`DELETE FROM matches WHERE team_a_id IS NULL AND team_b_id IS NULL AND status = 'scheduled'`).catch(() => {});

      await client.query("COMMIT");
      console.log("\n✓ Seed data successfully removed from database!");
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Failed to remove seed data:", err.message);
    } finally {
      client.release();
    }
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Cleanup script failed:", err.message);
  process.exit(1);
});
