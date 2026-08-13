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

const SEED_TEAMS = [
  {
    teamName: "Thunder Strikers",
    batch: "3rd Year",
    captainName: "Kusal Perera",
    captainContact: "0771234567",
    captainEmail: "captain1@infobash.lk",
    viceCaptainName: "Wanindu Hasaranga",
    notes: "Ready for the championship!",
    players: [
      { fullName: "Kusal Perera", card: "Striker", studentId: "21CSE1001", gender: "male" },
      { fullName: "Wanindu Hasaranga", card: "Wani", studentId: "21CSE1002", gender: "male" },
      { fullName: "Pathum Nissanka", card: "Patu", studentId: "21CSE1003", gender: "male" },
      { fullName: "Charith Asalanka", card: "Asa", studentId: "21CSE1004", gender: "male" },
      { fullName: "Dasun Shanaka", card: "Dasa", studentId: "21CSE1005", gender: "male" },
      { fullName: "Maheesh Theekshana", card: "Thikku", studentId: "21CSE1006", gender: "male" },
      { fullName: "Matheesha Pathirana", card: "Baby Malinga", studentId: "21CSE1007", gender: "male" },
      { fullName: "Chamari Athapaththu", card: "Queen", studentId: "21CSE1008", gender: "female" },
      { fullName: "Harshitha Samarawickrama", card: "Harshi", studentId: "21CSE1009", gender: "female" },
      { fullName: "Kavisha Dilhari", card: "Kavi", studentId: "21CSE1010", gender: "female" },
    ],
  },
  {
    teamName: "Cyber Strikers",
    batch: "2nd Year",
    captainName: "Kasun Fernando",
    captainContact: "0712345678",
    captainEmail: "captain2@infobash.lk",
    viceCaptainName: "Nimal Jayasinghe",
    notes: "Defending champions of Batch 22.",
    players: [
      { fullName: "Kasun Fernando", card: "Kassa", studentId: "22CSE2001", gender: "male" },
      { fullName: "Nimal Jayasinghe", card: "Nima", studentId: "22CSE2002", gender: "male" },
      { fullName: "Ruwan Silva", card: "Ruwa", studentId: "22CSE2003", gender: "male" },
      { fullName: "Dinesh Chandimal", card: "Chandi", studentId: "22CSE2004", gender: "male" },
      { fullName: "Angelo Mathews", card: "Angie", studentId: "22CSE2005", gender: "male" },
      { fullName: "Dushmantha Chameera", card: "Chamee", studentId: "22CSE2006", gender: "male" },
      { fullName: "Dhananjaya de Silva", card: "Dhanu", studentId: "22CSE2007", gender: "male" },
      { fullName: "Inoka Ranaweera", card: "Inu", studentId: "22CSE2008", gender: "female" },
      { fullName: "Vishmi Gunaratne", card: "Vishwa", studentId: "22CSE2009", gender: "female" },
      { fullName: "Nilakshi de Silva", card: "Nila", studentId: "22CSE2010", gender: "female" },
    ],
  },
  {
    teamName: "Binary Titans",
    batch: "4th Year",
    captainName: "Nuwan Pradeep",
    captainContact: "0723456789",
    captainEmail: "captain3@infobash.lk",
    viceCaptainName: "Avishka Fernando",
    notes: "Senior squad playing final tournament.",
    players: [
      { fullName: "Nuwan Pradeep", card: "Express", studentId: "20APSE3001", gender: "male" },
      { fullName: "Avishka Fernando", card: "Avi", studentId: "20APSE3002", gender: "male" },
      { fullName: "Kusal Mendis", card: "Menda", studentId: "20APSE3003", gender: "male" },
      { fullName: "Bhanuka Rajapaksa", card: "Bhanu", studentId: "20APSE3004", gender: "male" },
      { fullName: "Dunith Wellalage", card: "Duni", studentId: "20APSE3005", gender: "male" },
      { fullName: "Lahiru Kumara", card: "Lahi", studentId: "20APSE3006", gender: "male" },
      { fullName: "Kamindu Mendis", card: "Kami", studentId: "20APSE3007", gender: "male" },
      { fullName: "Sugandika Kumari", card: "Suga", studentId: "20APSE3008", gender: "female" },
      { fullName: "Anushka Sanjeewani", card: "Anu", studentId: "20APSE3009", gender: "female" },
      { fullName: "Achini Kulasuriya", card: "Achi", studentId: "20APSE3010", gender: "female" },
    ],
  },
  {
    teamName: "Falcon Warriors",
    batch: "1st Year",
    captainName: "Sahan Arachchige",
    captainContact: "0754567890",
    captainEmail: "captain4@infobash.lk",
    viceCaptainName: "Pramod Madushan",
    notes: "Freshmen power squad.",
    players: [
      { fullName: "Sahan Arachchige", card: "Saha", studentId: "23CSE4001", gender: "male" },
      { fullName: "Pramod Madushan", card: "Para", studentId: "23CSE4002", gender: "male" },
      { fullName: "Asitha Fernando", card: "Asi", studentId: "23CSE4003", gender: "male" },
      { fullName: "Janith Liyanage", card: "Jana", studentId: "23CSE4004", gender: "male" },
      { fullName: "Nuwan Thushara", card: "Crusher", studentId: "23CSE4005", gender: "male" },
      { fullName: "Ramesh Mendis", card: "Ramee", studentId: "23CSE4006", gender: "male" },
      { fullName: "Jeffrey Vandersay", card: "Vandy", studentId: "23CSE4007", gender: "male" },
      { fullName: "Udeshika Prabodhani", card: "Ude", studentId: "23CSE4008", gender: "female" },
      { fullName: "Hasini Perera", card: "Hasi", studentId: "23CSE4009", gender: "female" },
      { fullName: "Ama Kanchana", card: "Kanchi", studentId: "23CSE4010", gender: "female" },
    ],
  },
  {
    teamName: "Matrix XI",
    batch: "2nd Year",
    captainName: "Sadeera Samarawickrama",
    captainContact: "0765678901",
    captainEmail: "captain5@infobash.lk",
    viceCaptainName: "Akila Dananjaya",
    notes: "Tactical squad with strong all-rounders.",
    players: [
      { fullName: "Sadeera Samarawickrama", card: "Sada", studentId: "22CIS5001", gender: "male" },
      { fullName: "Akila Dananjaya", card: "Aki", studentId: "22CIS5002", gender: "male" },
      { fullName: "Binura Fernando", card: "Binu", studentId: "22CIS5003", gender: "male" },
      { fullName: "Shevon Daniel", card: "Sheva", studentId: "22CIS5004", gender: "male" },
      { fullName: "Vijayakanth Viyaskanth", card: "Viyask", studentId: "22CIS5005", gender: "male" },
      { fullName: "Chamika Karunaratne", card: "Chami", studentId: "22CIS5006", gender: "male" },
      { fullName: "Minod Bhanuka", card: "Mino", studentId: "22CIS5007", gender: "male" },
      { fullName: "Oshadi Ranasinghe", card: "Osha", studentId: "22CIS5008", gender: "female" },
      { fullName: "Imesha Dulani", card: "Imes", studentId: "22CIS5009", gender: "female" },
      { fullName: "Inoshi Priyadharshani", card: "Ino", studentId: "22CIS5010", gender: "female" },
    ],
  },
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
    console.log("Ensuring database schema columns exist...");
    await pool.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`).catch(() => {});
    await pool.query(`
      CREATE TABLE IF NOT EXISTS captains (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS teams (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        team_name TEXT NOT NULL UNIQUE,
        batch TEXT NOT NULL,
        captain_name TEXT NOT NULL,
        captain_contact TEXT NOT NULL,
        captain_email TEXT NOT NULL,
        vice_captain_name TEXT,
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS players (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
        position SMALLINT NOT NULL CHECK (position BETWEEN 1 AND 10),
        full_name TEXT NOT NULL,
        card TEXT,
        student_id TEXT NOT NULL,
        gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
        UNIQUE (team_id, position)
      );
    `).catch(() => {});
    await pool.query(`ALTER TABLE players ADD COLUMN IF NOT EXISTS card TEXT;`).catch(() => {});
    await pool.query(`ALTER TABLE teams ADD COLUMN IF NOT EXISTS captain_id UUID REFERENCES captains(id) ON DELETE SET NULL;`).catch(() => {});

    console.log("Seeding 5 teams into database...\n");

    for (const teamData of SEED_TEAMS) {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        // 1. Create or fetch captain account
        let captainId;
        const capCheck = await client.query(`SELECT id FROM captains WHERE email = $1`, [teamData.captainEmail]);
        if (capCheck.rows.length > 0) {
          captainId = capCheck.rows[0].id;
        } else {
          const capInsert = await client.query(
            `INSERT INTO captains (name, email, password_hash)
             VALUES ($1, $2, $3) RETURNING id`,
            [teamData.captainName, teamData.captainEmail, "seeded_password_hash"]
          );
          captainId = capInsert.rows[0].id;
        }

        // 2. Check if team already exists
        const teamCheck = await client.query(`SELECT id FROM teams WHERE team_name = $1`, [teamData.teamName]);
        let teamId;
        if (teamCheck.rows.length > 0) {
          teamId = teamCheck.rows[0].id;
          console.log(`Team "${teamData.teamName}" already exists (ID: ${teamId}). Updating roster...`);
          await client.query(
            `UPDATE teams SET batch = $1, captain_name = $2, captain_contact = $3, captain_email = $4, vice_captain_name = $5, notes = $6, captain_id = $7 WHERE id = $8`,
            [teamData.batch, teamData.captainName, teamData.captainContact, teamData.captainEmail, teamData.viceCaptainName, teamData.notes, captainId, teamId]
          );
          await client.query(`DELETE FROM players WHERE team_id = $1`, [teamId]);
        } else {
          const teamInsert = await client.query(
            `INSERT INTO teams (team_name, batch, captain_name, captain_contact, captain_email, vice_captain_name, notes, captain_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
            [teamData.teamName, teamData.batch, teamData.captainName, teamData.captainContact, teamData.captainEmail, teamData.viceCaptainName, teamData.notes, captainId]
          );
          teamId = teamInsert.rows[0].id;
          console.log(`Created team "${teamData.teamName}" (ID: ${teamId}).`);
        }

        // 3. Insert players
        for (let i = 0; i < teamData.players.length; i++) {
          const p = teamData.players[i];
          await client.query(
            `INSERT INTO players (team_id, position, full_name, card, student_id, gender)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [teamId, i + 1, p.fullName, p.card, p.studentId, p.gender]
          );
        }

        await client.query("COMMIT");
        console.log(`  ✓ Successfully registered squad for "${teamData.teamName}" (10 players including 3 female players & cards).\n`);
      } catch (err) {
        await client.query("ROLLBACK");
        console.error(`  ✗ Error registering team "${teamData.teamName}":`, err.message);
      } finally {
        client.release();
      }
    }

    console.log("All 5 seed teams processed successfully!");
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Seeding failed:", err.message);
  process.exit(1);
});
