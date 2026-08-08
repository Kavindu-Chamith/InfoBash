import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import pg from "pg";

const { Pool } = pg;
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

const SCRYPT_KEYLEN = 64;
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, SCRYPT_KEYLEN).toString("hex");
  return `${salt}:${hash}`;
}

const DEFAULT_CAPTAIN_PASSWORD = "TestCaptain123!";

async function main() {
  loadEnvLocal();
  if (!process.env.DATABASE_URL) {
    console.error("Error: DATABASE_URL not set in environment or .env.local.");
    process.exit(1);
  }

  const jsonPath = path.join(__dirname, "..", "db", "seeds", "teams-14.json");
  if (!fs.existsSync(jsonPath)) {
    console.error(`Error: Seed data file not found at ${jsonPath}`);
    process.exit(1);
  }

  const teamsData = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  console.log(`Loaded ${teamsData.length} teams from db/seeds/teams-14.json`);

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  try {
    console.log("Seeding 14 Teams and Captain Accounts into InfoBash Database...");
    await client.query("BEGIN");

    // 1. Create or verify 4 tournament Groups (Group A, Group B, Group C, Group D)
    const groupNames = ["Group A", "Group B", "Group C", "Group D"];
    const groupMap = new Map();
    for (const gName of groupNames) {
      const gRes = await client.query(
        `INSERT INTO groups (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
        [gName]
      );
      groupMap.set(gName, gRes.rows[0].id);
    }
    console.log("Groups verified:", Array.from(groupMap.keys()));

    // 2. Insert Captains, Teams & Players
    for (let i = 0; i < teamsData.length; i++) {
      const t = teamsData[i];
      const assignedGroup = groupNames[i % 4];
      const groupId = groupMap.get(assignedGroup);

      // A. Create or update Captain User Account
      const defaultPassHash = hashPassword(DEFAULT_CAPTAIN_PASSWORD);
      const captRes = await client.query(
        `INSERT INTO captains (name, email, password_hash)
         VALUES ($1, $2, $3)
         ON CONFLICT (email) DO UPDATE SET
           name = EXCLUDED.name,
           password_hash = EXCLUDED.password_hash
         RETURNING id`,
        [t.captain, t.email.toLowerCase(), defaultPassHash]
      );
      const captainId = captRes.rows[0].id;

      // B. Create or update Team linked to Captain and Group
      const teamRes = await client.query(
        `INSERT INTO teams (team_name, batch, captain_name, captain_contact, captain_email, captain_id, group_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (team_name) DO UPDATE SET
           batch = EXCLUDED.batch,
           captain_name = EXCLUDED.captain_name,
           captain_contact = EXCLUDED.captain_contact,
           captain_email = EXCLUDED.captain_email,
           captain_id = EXCLUDED.captain_id,
           group_id = EXCLUDED.group_id
         RETURNING id`,
        [t.name, t.batch, t.captain, t.contact, t.email.toLowerCase(), captainId, groupId]
      );
      const teamId = teamRes.rows[0].id;

      // C. Clear old players for this team and insert 11 squad players
      await client.query(`DELETE FROM players WHERE team_id = $1`, [teamId]);

      const batchNum = t.batch.charAt(0);
      for (let pos = 1; pos <= t.players.length; pos++) {
        const p = t.players[pos - 1];
        const studentId = `SUSL/FOC/${batchNum}Y/2026/${String(i * 11 + pos).padStart(3, "0")}`;
        await client.query(
          `INSERT INTO players (team_id, position, full_name, student_id, gender)
           VALUES ($1, $2, $3, $4, $5)`,
          [teamId, pos, p.name, studentId, p.gender]
        );
      }

      console.log(`✓ Seeded team [${i + 1}/${teamsData.length}]: "${t.name}" (${t.batch}) -> ${assignedGroup} (Captain: ${t.email}, ID: ${teamId})`);
    }

    await client.query("COMMIT");
    console.log("\nSuccess! All 14 teams, captain accounts, and 11-player squad rosters seeded properly into PostgreSQL database.");
    console.log(`Default Captain Password: "${DEFAULT_CAPTAIN_PASSWORD}"`);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Seeding failed:", err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
