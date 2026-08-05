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
    captain: "Kusal Mendis",
    email: "kusal@susl.ac.lk",
    contact: "+94773456789",
    players: [
      { name: "Kusal Mendis (C)", gender: "male" },
      { name: "Dinesh Chandimal", gender: "male" },
      { name: "Angelo Mathews", gender: "male" },
      { name: "Dhananjaya de Silva", gender: "male" },
      { name: "Dasun Shanaka", gender: "male" },
      { name: "Chamika Karunaratne", gender: "male" },
      { name: "Dushmantha Chameera", gender: "male" },
      { name: "Maheesh Theekshana", gender: "male" },
      { name: "Matheesha Pathirana", gender: "male" },
      { name: "Dilhani Manodara", gender: "female" },
      { name: "Inoka Ranaweera", gender: "female" },
    ],
  },
  {
    name: "Cyber Knights",
    batch: "4th Year",
    captain: "Lasith Malinga",
    email: "lasith@susl.ac.lk",
    contact: "+94774567890",
    players: [
      { name: "Lasith Malinga (C)", gender: "male" },
      { name: "Kumar Sangakkara", gender: "male" },
      { name: "Mahela Jayawardene", gender: "male" },
      { name: "Tillakaratne Dilshan", gender: "male" },
      { name: "Sanath Jayasuriya", gender: "male" },
      { name: "Muttiah Muralitharan", gender: "male" },
      { name: "Chaminda Vaas", gender: "male" },
      { name: "Nuwan Kulasekara", gender: "male" },
      { name: "Upul Tharanga", gender: "male" },
      { name: "Shashikala Siriwardena", gender: "female" },
      { name: "Chamari Athapaththu", gender: "female" },
    ],
  },
  {
    name: "Code Breakers",
    batch: "2nd Year",
    captain: "Dimuth Karunaratne",
    email: "dimuth@susl.ac.lk",
    contact: "+94775678901",
    players: [
      { name: "Dimuth Karunaratne (C)", gender: "male" },
      { name: "Lahiru Thirimanne", gender: "male" },
      { name: "Oshada Fernando", gender: "male" },
      { name: "Roshen Silva", gender: "male" },
      { name: "Niroshan Dickwella", gender: "male" },
      { name: "Suranga Lakmal", gender: "male" },
      { name: "Lahiru Kumara", gender: "male" },
      { name: "Vishwa Fernando", gender: "male" },
      { name: "Lasith Embuldeniya", gender: "male" },
      { name: "Sugandika Kumari", gender: "female" },
      { name: "Udeshika Prabodhani", gender: "female" },
    ],
  },
  {
    name: "Matrix Warriors",
    batch: "1st Year",
    captain: "Kamindu Mendis",
    email: "kamindu@susl.ac.lk",
    contact: "+94776789012",
    players: [
      { name: "Kamindu Mendis (C)", gender: "male" },
      { name: "Pathum Nissanka", gender: "male" },
      { name: "Sadeera Samarawickrama", gender: "male" },
      { name: "Dunith Wellalage", gender: "male" },
      { name: "Dilshan Madushanka", gender: "male" },
      { name: "Nuwan Thushara", gender: "male" },
      { name: "Vijayakanth Viyaskanth", gender: "male" },
      { name: "Binura Fernando", gender: "male" },
      { name: "Asitha Fernando", gender: "male" },
      { name: "Kavisha Dilhari", gender: "female" },
      { name: "Harshitha Samarawickrama", gender: "female" },
    ],
  },
  {
    name: "Legacy Kings",
    batch: "3rd Year",
    captain: "Thilan Samaraweera",
    email: "thilan@susl.ac.lk",
    contact: "+94777890123",
    players: [
      { name: "Thilan Samaraweera (C)", gender: "male" },
      { name: "Marvan Atapattu", gender: "male" },
      { name: "Arjuna Ranatunga", gender: "male" },
      { name: "Aravinda de Silva", gender: "male" },
      { name: "Roshan Mahanama", gender: "male" },
      { name: "Hashan Tillakaratne", gender: "male" },
      { name: "Romesh Kaluwitharana", gender: "male" },
      { name: "Farveez Maharoof", gender: "male" },
      { name: "Rangana Herath", gender: "male" },
      { name: "Eshani Lokusuryage", gender: "female" },
      { name: "Sripali Weerakkody", gender: "female" },
    ],
  },
  {
    name: "Quantum Strikers",
    batch: "4th Year",
    captain: "Avishka Fernando",
    email: "avishka@susl.ac.lk",
    contact: "+94778901234",
    players: [
      { name: "Avishka Fernando (C)", gender: "male" },
      { name: "Bhanuka Rajapaksa", gender: "male" },
      { name: "Minod Bhanuka", gender: "male" },
      { name: "Wanindu Hasaranga", gender: "male" },
      { name: "Isuru Udana", gender: "male" },
      { name: "Akila Dananjaya", gender: "male" },
      { name: "Kasun Rajitha", gender: "male" },
      { name: "Jeffrey Vandersay", gender: "male" },
      { name: "Praveen Jayawickrama", gender: "male" },
      { name: "Nilakshi de Silva", gender: "female" },
      { name: "Anushka Sanjeewani", gender: "female" },
    ],
  },
  {
    name: "Titan XI",
    batch: "2nd Year",
    captain: "Janith Liyanage",
    email: "janith@susl.ac.lk",
    contact: "+94779012345",
    players: [
      { name: "Janith Liyanage (C)", gender: "male" },
      { name: "Nishan Madushka", gender: "male" },
      { name: "Nuwanidu Fernando", gender: "male" },
      { name: "Sahan Arachchige", gender: "male" },
      { name: "Chamika Karunaratne", gender: "male" },
      { name: "Pramod Madushan", gender: "male" },
      { name: "Milan Rathnayake", gender: "male" },
      { name: "Nipun Ransika", gender: "male" },
      { name: "Eshan Malinga", gender: "male" },
      { name: "Inoka Ranaweera", gender: "female" },
      { name: "Achini Kulasuriya", gender: "female" },
    ],
  },
  {
    name: "Velocity Strikers",
    batch: "1st Year",
    captain: "Shevon Daniel",
    email: "shevon@susl.ac.lk",
    contact: "+94770123456",
    players: [
      { name: "Shevon Daniel (C)", gender: "male" },
      { name: "Treveen Mathew", gender: "male" },
      { name: "Matheesha Pathirana", gender: "male" },
      { name: "Wellalage Dunith", gender: "male" },
      { name: "Ranuda Somarathne", gender: "male" },
      { name: "Anjala Bandara", gender: "male" },
      { name: "Malsha Tharupathi", gender: "male" },
      { name: "Vunuja Sahan", gender: "male" },
      { name: "Duvindu Tillakaratne", gender: "male" },
      { name: "Vishmi Gunaratne", gender: "female" },
      { name: "Imesha Dulani", gender: "female" },
    ],
  },
  {
    name: "Royal Strikers",
    batch: "3rd Year",
    captain: "Jehan Mubarak",
    email: "jehan@susl.ac.lk",
    contact: "+94771122334",
    players: [
      { name: "Jehan Mubarak (C)", gender: "male" },
      { name: "Russell Arnold", gender: "male" },
      { name: "Upul Chandana", gender: "male" },
      { name: "Indika de Saram", gender: "male" },
      { name: "Dulip Samaraweera", gender: "male" },
      { name: "Eric Upashantha", gender: "male" },
      { name: "Sajeewa de Silva", gender: "male" },
      { name: "Ravindra Pushpakumara", gender: "male" },
      { name: "Niroshan Bandaratilleke", gender: "male" },
      { name: "Dedunu Silva", gender: "female" },
      { name: "Rose Fernando", gender: "female" },
    ],
  },
  {
    name: "Thunderbolts",
    batch: "4th Year",
    captain: "Kaushal Silva",
    email: "kaushal@susl.ac.lk",
    contact: "+94772233445",
    players: [
      { name: "Kaushal Silva (C)", gender: "male" },
      { name: "Prasanna Jayawardene", gender: "male" },
      { name: "Tharanga Paranavitana", gender: "male" },
      { name: "Malinda Warnapura", gender: "male" },
      { name: "Michael Vandort", gender: "male" },
      { name: "Chanaka Welegedara", gender: "male" },
      { name: "Nuwan Zoysa", gender: "male" },
      { name: "Dilhara Fernando", gender: "male" },
      { name: "Malinga Bandara", gender: "male" },
      { name: "Sanduni Abeywickrema", gender: "female" },
      { name: "Hansima Karunaratne", gender: "female" },
    ],
  },
  {
    name: "Vortex Strikers",
    batch: "3rd Year",
    captain: "Ramesh Mendis",
    email: "ramesh@susl.ac.lk",
    contact: "+94773344556",
    players: [
      { name: "Ramesh Mendis (C)", gender: "male" },
      { name: "Charith Asalanka", gender: "male" },
      { name: "Lakshan Sandakan", gender: "male" },
      { name: "Seekkuge Prasanna", gender: "male" },
      { name: "Ramith Rambukwella", gender: "male" },
      { name: "Lahiru Madushanka", gender: "male" },
      { name: "Asela Gunaratne", gender: "male" },
      { name: "Milinda Siriwardana", gender: "male" },
      { name: "Sachith Pathirana", gender: "male" },
      { name: "Thipatcha Putthawong", gender: "female" },
      { name: "Nattaya Boochatham", gender: "female" },
    ],
  },
  {
    name: "Phoenix Lions",
    batch: "4th Year",
    captain: "Angelo Perera",
    email: "angelo@susl.ac.lk",
    contact: "+94774455667",
    players: [
      { name: "Angelo Perera (C)", gender: "male" },
      { name: "Ashan Priyanjan", gender: "male" },
      { name: "Chaturanga de Silva", gender: "male" },
      { name: "Dilshan Munaweera", gender: "male" },
      { name: "Shehan Jayasuriya", gender: "male" },
      { name: "Jeffrey Vandersay", gender: "male" },
      { name: "Kasun Madushanka", gender: "male" },
      { name: "Vishwa Fernando", gender: "male" },
      { name: "Thikshila de Silva", gender: "male" },
      { name: "Ama Kanchana", gender: "female" },
      { name: "Nipuni Hansika", gender: "female" },
    ],
  },
];

async function main() {
  loadEnvLocal();
  if (!process.env.DATABASE_URL) {
    console.error("Error: DATABASE_URL not set.");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  try {
    console.log("Seeding 14 Teams into InfoBash Database...");
    await client.query("BEGIN");

    // 1. Create or ensure Groups exist (Group A, B, C, D)
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

    // 2. Insert or update 14 teams & assign to groups
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

      await client.query(`DELETE FROM players WHERE team_id = $1`, [teamId]);

      for (let pos = 1; pos <= t.players.length; pos++) {
        const p = t.players[pos - 1];
        const studentId = `SUSL/FOC/${t.batch.charAt(0)}Y/2026/${String(i * 11 + pos).padStart(3, "0")}`;
        await client.query(
          `INSERT INTO players (team_id, position, full_name, student_id, gender)
           VALUES ($1, $2, $3, $4, $5)`,
          [teamId, pos, p.name, studentId, p.gender]
        );
      }
      console.log(`Seeded team [${i + 1}/14]: ${t.name} (${t.batch}) in ${assignedGroup}`);
    }

    await client.query("COMMIT");
    console.log("\nSuccess! 14 teams with complete 11-player rosters seeded across 4 groups.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Seeding failed:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
