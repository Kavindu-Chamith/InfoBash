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

const TEAMS_DATA = [
  {
    name: "Rantharu",
    batch: "2nd Year",
    captain: "Nobody",
    email: "nobody@susl.ac.lk",
    contact: "+94771234567",
    players: [
      { name: "Nobody (C)", gender: "male" },
      { name: "Kavindu Chamith", gender: "male" },
      { name: "Sahan Perera", gender: "male" },
      { name: "Nuwan Silva", gender: "male" },
      { name: "Kasun Fernando", gender: "male" },
      { name: "Dilshan Jayasuriya", gender: "male" },
      { name: "Pathum Nissanka", gender: "male" },
      { name: "Charith Asalanka", gender: "male" },
      { name: "Wanindu Hasaranga", gender: "male" },
      { name: "Ama Perera", gender: "female" },
      { name: "Kavindi Silva", gender: "female" },
    ],
  },
  {
    name: "Apex Predators",
    batch: "1st Year",
    captain: "Alice Johnson",
    email: "alice@susl.ac.lk",
    contact: "+94772345678",
    players: [
      { name: "Alice Johnson (C)", gender: "female" },
      { name: "Bob Smith", gender: "male" },
      { name: "Charlie Davis", gender: "male" },
      { name: "David Miller", gender: "male" },
      { name: "Eric Cantona", gender: "male" },
      { name: "Frank Lampard", gender: "male" },
      { name: "Gareth Bale", gender: "male" },
      { name: "Harry Kane", gender: "male" },
      { name: "Ian Rush", gender: "male" },
      { name: "Jenny Taylor", gender: "female" },
      { name: "Karen Gillan", gender: "female" },
    ],
  },
  {
    name: "Byte Force",
    batch: "3rd Year",
    captain: "Charlie Brown",
    email: "charlie@susl.ac.lk",
    contact: "+94773456789",
    players: [
      { name: "Charlie Brown (C)", gender: "male" },
      { name: "Lucy van Pelt", gender: "female" },
      { name: "Linus van Pelt", gender: "male" },
      { name: "Snoopy Dog", gender: "male" },
      { name: "Woodstock Bird", gender: "male" },
      { name: "Schroeder Piano", gender: "male" },
      { name: "Peppermint Patty", gender: "female" },
      { name: "Marcie Carlin", gender: "female" },
      { name: "Franklin Armstrong", gender: "male" },
      { name: "Pig-Pen Miller", gender: "male" },
      { name: "Sally Brown", gender: "female" },
    ],
  },
  {
    name: "Cyber Knights",
    batch: "4th Year",
    captain: "Diana Prince",
    email: "diana@susl.ac.lk",
    contact: "+94774567890",
    players: [
      { name: "Diana Prince (C)", gender: "female" },
      { name: "Bruce Wayne", gender: "male" },
      { name: "Clark Kent", gender: "male" },
      { name: "Barry Allen", gender: "male" },
      { name: "Hal Jordan", gender: "male" },
      { name: "Arthur Curry", gender: "male" },
      { name: "Victor Stone", gender: "male" },
      { name: "Oliver Queen", gender: "male" },
      { name: "Dinah Lance", gender: "female" },
      { name: "Shayera Hol", gender: "female" },
      { name: "J'onn J'onzz", gender: "male" },
    ],
  },
  {
    name: "Titan XI",
    batch: "1st Year",
    captain: "Ethan Hunt",
    email: "ethan@susl.ac.lk",
    contact: "+94775678901",
    players: [
      { name: "Ethan Hunt (C)", gender: "male" },
      { name: "Luther Stickell", gender: "male" },
      { name: "Benji Dunn", gender: "male" },
      { name: "Ilsa Faust", gender: "female" },
      { name: "William Brandt", gender: "male" },
      { name: "Alan Hunley", gender: "male" },
      { name: "August Walker", gender: "male" },
      { name: "Grace Miller", gender: "female" },
      { name: "Paris Alana", gender: "female" },
      { name: "Solomon Lane", gender: "male" },
      { name: "Zola Mitsopolis", gender: "female" },
    ],
  },
  {
    name: "Velocity Strikers",
    batch: "1st Year",
    captain: "Fiona Gallagher",
    email: "fiona@susl.ac.lk",
    contact: "+94776789012",
    players: [
      { name: "Fiona Gallagher (C)", gender: "female" },
      { name: "Lip Gallagher", gender: "male" },
      { name: "Ian Gallagher", gender: "male" },
      { name: "Debbie Gallagher", gender: "female" },
      { name: "Carl Gallagher", gender: "male" },
      { name: "Liam Gallagher", gender: "male" },
      { name: "Veronica Fisher", gender: "female" },
      { name: "Kevin Ball", gender: "male" },
      { name: "Mickey Milkovich", gender: "male" },
      { name: "Svetlana Yevgenivna", gender: "female" },
      { name: "Mandy Milkovich", gender: "female" },
    ],
  },
  {
    name: "Royal Strikers",
    batch: "2nd Year",
    captain: "George Clark",
    email: "george@susl.ac.lk",
    contact: "+94777890123",
    players: [
      { name: "George Clark (C)", gender: "male" },
      { name: "William Turner", gender: "male" },
      { name: "Elizabeth Swann", gender: "female" },
      { name: "Jack Sparrow", gender: "male" },
      { name: "Hector Barbossa", gender: "male" },
      { name: "Joshamee Gibbs", gender: "male" },
      { name: "James Norrington", gender: "male" },
      { name: "Tia Dalma", gender: "female" },
      { name: "Davy Jones", gender: "male" },
      { name: "Anamaria Pirate", gender: "female" },
      { name: "Pintel Pirate", gender: "male" },
    ],
  },
  {
    name: "Thunderbolts",
    batch: "2nd Year",
    captain: "Hannah Abbott",
    email: "hannah@susl.ac.lk",
    contact: "+94778901234",
    players: [
      { name: "Hannah Abbott (C)", gender: "female" },
      { name: "Harry Potter", gender: "male" },
      { name: "Ron Weasley", gender: "male" },
      { name: "Hermione Granger", gender: "female" },
      { name: "Neville Longbottom", gender: "male" },
      { name: "Ginny Weasley", gender: "female" },
      { name: "Luna Lovegood", gender: "female" },
      { name: "Fred Weasley", gender: "male" },
      { name: "George Weasley", gender: "male" },
      { name: "Cedric Diggory", gender: "male" },
      { name: "Cho Chang", gender: "female" },
    ],
  },
  {
    name: "Code Breakers",
    batch: "3rd Year",
    captain: "Ian Malcolm",
    email: "ian@susl.ac.lk",
    contact: "+94779012345",
    players: [
      { name: "Ian Malcolm (C)", gender: "male" },
      { name: "Alan Grant", gender: "male" },
      { name: "Ellie Sattler", gender: "female" },
      { name: "John Hammond", gender: "male" },
      { name: "Dennis Nedry", gender: "male" },
      { name: "Ray Arnold", gender: "male" },
      { name: "Robert Muldoon", gender: "male" },
      { name: "Lex Murphy", gender: "female" },
      { name: "Tim Murphy", gender: "male" },
      { name: "Claire Dearing", gender: "female" },
      { name: "Owen Grady", gender: "male" },
    ],
  },
  {
    name: "Matrix Warriors",
    batch: "3rd Year",
    captain: "Julia Roberts",
    email: "julia@susl.ac.lk",
    contact: "+94770123456",
    players: [
      { name: "Julia Roberts (C)", gender: "female" },
      { name: "Neo Anderson", gender: "male" },
      { name: "Trinity Matrix", gender: "female" },
      { name: "Morpheus Captain", gender: "male" },
      { name: "Agent Smith", gender: "male" },
      { name: "Cypher Reagan", gender: "male" },
      { name: "Tank Matrix", gender: "male" },
      { name: "Dozer Matrix", gender: "male" },
      { name: "Niobe Captain", gender: "female" },
      { name: "Persephone Matrix", gender: "female" },
      { name: "Oracle Matrix", gender: "female" },
    ],
  },
  {
    name: "Legacy Kings",
    batch: "4th Year",
    captain: "Kevin Spacey",
    email: "kevin@susl.ac.lk",
    contact: "+94771122334",
    players: [
      { name: "Kevin Spacey (C)", gender: "male" },
      { name: "Keyser Soze", gender: "male" },
      { name: "Verbal Kint", gender: "male" },
      { name: "Dean Keaton", gender: "male" },
      { name: "Michael McManus", gender: "male" },
      { name: "Fred Fenster", gender: "male" },
      { name: "Todd Hockney", gender: "male" },
      { name: "Dave Kujan", gender: "male" },
      { name: "Edie Finneran", gender: "female" },
      { name: "Kobayashi Counsel", gender: "male" },
      { name: "Rachel Keaton", gender: "female" },
    ],
  },
  {
    name: "Quantum Strikers",
    batch: "4th Year",
    captain: "Laura Croft",
    email: "laura@susl.ac.lk",
    contact: "+94772233445",
    players: [
      { name: "Laura Croft (C)", gender: "female" },
      { name: "Nathan Drake", gender: "male" },
      { name: "Victor Sullivan", gender: "male" },
      { name: "Elena Fisher", gender: "female" },
      { name: "Chloe Frazer", gender: "female" },
      { name: "Samuel Drake", gender: "male" },
      { name: "Charlie Cutter", gender: "male" },
      { name: "Nadine Ross", gender: "female" },
      { name: "Rafe Adler", gender: "male" },
      { name: "Gabriel Roman", gender: "male" },
      { name: "Marisa Chase", gender: "female" },
    ],
  },
];

async function main() {
  loadEnvLocal();
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL not set");

  const pool = new Pool({
    connectionString,
    ssl: connectionString.includes("localhost") ? false : { rejectUnauthorized: false },
  });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Ensure 4 Groups exist: Group A, Group B, Group C, Group D
    const groupNames = ["Group A", "Group B", "Group C", "Group D"];
    const groupMap = new Map();
    for (const gName of groupNames) {
      const gRes = await client.query(
        `INSERT INTO groups (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
        [gName]
      );
      groupMap.set(gName, gRes.rows[0].id);
    }

    console.log("Groups created / verified:", Array.from(groupMap.keys()));

    // 2. Insert or update 12 teams & assign evenly to 4 groups (3 teams per group)
    for (let i = 0; i < TEAMS_DATA.length; i++) {
      const t = TEAMS_DATA[i];
      const assignedGroup = groupNames[i % 4];
      const groupId = groupMap.get(assignedGroup);

      const teamRes = await client.query(
        `INSERT INTO teams (team_name, batch, captain_name, captain_contact, captain_email, group_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (team_name) DO UPDATE SET
           batch = EXCLUDED.batch,
           captain_name = EXCLUDED.captain_name,
           captain_contact = EXCLUDED.captain_contact,
           captain_email = EXCLUDED.captain_email,
           group_id = EXCLUDED.group_id
         RETURNING id`,
        [t.name, t.batch, t.captain, t.contact, t.email, groupId]
      );
      const teamId = teamRes.rows[0].id;

      // Clear existing players for re-seeding full 11 roster
      await client.query(`DELETE FROM players WHERE team_id = $1`, [teamId]);

      // Insert 11 players for team
      for (let pos = 1; pos <= t.players.length; pos++) {
        const p = t.players[pos - 1];
        const studentId = `SUSL/FOC/${t.batch.charAt(0)}Y/2026/${String(i * 11 + pos).padStart(3, "0")}`;
        await client.query(
          `INSERT INTO players (team_id, position, full_name, student_id, gender)
           VALUES ($1, $2, $3, $4, $5)`,
          [teamId, pos, p.name, studentId, p.gender]
        );
      }
      console.log(`Seeded team [${i + 1}/12]: ${t.name} (${t.batch}) in ${assignedGroup} with 11 players.`);
    }

    await client.query("COMMIT");
    console.log("\nSuccess! 12 teams with complete 11-player rosters seeded across 4 groups.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Seeding failed:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
