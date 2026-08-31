import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Pool } from "pg";
import crypto from "crypto";

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

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

const DEFAULT_CAPTAIN_PASSWORD = "Infobash@2026";

const SEED_TEAMS = [
  {
    teamName: "Thunder Strikers",
    batch: "3rd Year",
    captainName: "Kusal Perera",
    captainContact: "0771234567",
    captainEmail: "captain1@infobash.lk",
    viceCaptainName: "Wanindu Hasaranga",
    notes: "Ready for the championship! Strong batting lineup.",
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
  {
    teamName: "Quantum XI",
    batch: "3rd Year",
    captainName: "Dimuth Karunaratne",
    captainContact: "0776789012",
    captainEmail: "captain6@infobash.lk",
    viceCaptainName: "Lahiru Thirimanne",
    notes: "High energy team with pace attack.",
    players: [
      { fullName: "Dimuth Karunaratne", card: "Dimu", studentId: "21CSE6001", gender: "male" },
      { fullName: "Lahiru Thirimanne", card: "Thiri", studentId: "21CSE6002", gender: "male" },
      { fullName: "Suranga Lakmal", card: "Suri", studentId: "21CSE6003", gender: "male" },
      { fullName: "Dilruwan Perera", card: "Dilru", studentId: "21CSE6004", gender: "male" },
      { fullName: "Seekkuge Prasanna", card: "Seekku", studentId: "21CSE6005", gender: "male" },
      { fullName: "Isuru Udana", card: "Isu", studentId: "21CSE6006", gender: "male" },
      { fullName: "Kasun Rajitha", card: "Raji", studentId: "21CSE6007", gender: "male" },
      { fullName: "Prasadani Weerakkody", card: "Prasa", studentId: "21CSE6008", gender: "female" },
      { fullName: "Sripali Weerakkody", card: "Sri", studentId: "21CSE6009", gender: "female" },
      { fullName: "Dilani Manodara", card: "Dila", studentId: "21CSE6010", gender: "female" },
    ],
  },
  {
    teamName: "Code Breakers",
    batch: "1st Year",
    captainName: "Upul Tharanga",
    captainContact: "0787890123",
    captainEmail: "captain7@infobash.lk",
    viceCaptainName: "Farveez Maharoof",
    notes: "Aggressive batting & spin options.",
    players: [
      { fullName: "Upul Tharanga", card: "Thara", studentId: "23CIS7001", gender: "male" },
      { fullName: "Farveez Maharoof", card: "Farvy", studentId: "23CIS7002", gender: "male" },
      { fullName: "Dhammika Prasad", card: "Dhammi", studentId: "23CIS7003", gender: "male" },
      { fullName: "Rangana Herath", card: "Rangy", studentId: "23CIS7004", gender: "male" },
      { fullName: "Ajantha Mendis", card: "Menda", studentId: "23CIS7005", gender: "male" },
      { fullName: "Thilan Samaraweera", card: "Thila", studentId: "23CIS7006", gender: "male" },
      { fullName: "Chamara Silva", card: "Chamu", studentId: "23CIS7007", gender: "male" },
      { fullName: "Eshani Lokusuriyage", card: "Esha", studentId: "23CIS7008", gender: "female" },
      { fullName: "Sanduni Abeywickrama", card: "Sandu", studentId: "23CIS7009", gender: "female" },
      { fullName: "Malsha Shehani", card: "Mali", studentId: "23CIS7010", gender: "female" },
    ],
  },
  {
    teamName: "Dev Dynamos",
    batch: "4th Year",
    captainName: "Tillakaratne Dilshan",
    captainContact: "0798901234",
    captainEmail: "captain8@infobash.lk",
    viceCaptainName: "Lasith Malinga",
    notes: "Veteran squad with explosive finishers.",
    players: [
      { fullName: "Tillakaratne Dilshan", card: "Dilscoop", studentId: "20CSE8001", gender: "male" },
      { fullName: "Lasith Malinga", card: "Slinga", studentId: "20CSE8002", gender: "male" },
      { fullName: "Chaminda Vaas", card: "Vaasy", studentId: "20CSE8003", gender: "male" },
      { fullName: "Muttiah Muralitharan", card: "Murali", studentId: "20CSE8004", gender: "male" },
      { fullName: "Romesh Kaluwitharana", card: "Kalu", studentId: "20CSE8005", gender: "male" },
      { fullName: "Marvan Atapattu", card: "Marva", studentId: "20CSE8006", gender: "male" },
      { fullName: "Roshen Silva", card: "Roshi", studentId: "20CSE8007", gender: "male" },
      { fullName: "Chandima Gunaratne", card: "Chandi", studentId: "20CSE8008", gender: "female" },
      { fullName: "Deepika Rasangika", card: "Deepi", studentId: "20CSE8009", gender: "female" },
      { fullName: "Rebeca Vandort", card: "Beca", studentId: "20CSE8010", gender: "female" },
    ],
  },
  {
    teamName: "Data Knights",
    batch: "3rd Year",
    captainName: "Sanath Jayasuriya",
    captainContact: "0701234567",
    captainEmail: "captain9@infobash.lk",
    viceCaptainName: "Aravinda de Silva",
    notes: "Balanced unit with hard hitters.",
    players: [
      { fullName: "Sanath Jayasuriya", card: "Matara Marauder", studentId: "21APSE9001", gender: "male" },
      { fullName: "Aravinda de Silva", card: "Mad Max", studentId: "21APSE9002", gender: "male" },
      { fullName: "Arjuna Ranatunga", card: "Captain Cool", studentId: "21APSE9003", gender: "male" },
      { fullName: "Hashan Tillakaratne", card: "Hasha", studentId: "21APSE9004", gender: "male" },
      { fullName: "Asanka Gurusinha", card: "Guru", studentId: "21APSE9005", gender: "male" },
      { fullName: "Pramodya Wickramasinghe", card: "Pramo", studentId: "21APSE9006", gender: "male" },
      { fullName: "Upul Chandana", card: "Chanda", studentId: "21APSE9007", gender: "male" },
      { fullName: "Dedunu Silva", card: "Dedu", studentId: "21APSE9008", gender: "female" },
      { fullName: "Rose Fernando", card: "Rosy", studentId: "21APSE9009", gender: "female" },
      { fullName: "Thilaka Gunaratne", card: "Thili", studentId: "21APSE9010", gender: "female" },
    ],
  },
  {
    teamName: "Byte Legends",
    batch: "2nd Year",
    captainName: "Kumar Sangakkara",
    captainContact: "0711122334",
    captainEmail: "captain10@infobash.lk",
    viceCaptainName: "Mahela Jayawardene",
    notes: "Classy stroke-makers and clinical fielding.",
    players: [
      { fullName: "Kumar Sangakkara", card: "Sanga", studentId: "22APSE101", gender: "male" },
      { fullName: "Mahela Jayawardene", card: "Maiya", studentId: "22APSE102", gender: "male" },
      { fullName: "Nuwan Zoysa", card: "Zoysa", studentId: "22APSE103", gender: "male" },
      { fullName: "Russ Arnold", card: "Rusty", studentId: "22APSE104", gender: "male" },
      { fullName: "Suresh Perera", card: "Suri", studentId: "22APSE105", gender: "male" },
      { fullName: "Avishka Gunawardene", card: "Avish", studentId: "22APSE106", gender: "male" },
      { fullName: "Pramodya Wickramasinghe", card: "Pramod", studentId: "22APSE107", gender: "male" },
      { fullName: "Nipuni Hansika", card: "Nipu", studentId: "22APSE108", gender: "female" },
      { fullName: "Hansima Karunaratne", card: "Hansi", studentId: "22APSE109", gender: "female" },
      { fullName: "Sathya Sandeepani", card: "Sathya", studentId: "22APSE110", gender: "female" },
    ],
  },
  {
    teamName: "Pixel Ninjas",
    batch: "1st Year",
    captainName: "Pathum Nissanka",
    captainContact: "0722233445",
    captainEmail: "captain11@infobash.lk",
    viceCaptainName: "Kusal Mendis",
    notes: "Young swift runners and sharp fielders.",
    players: [
      { fullName: "Pathum Nissanka", card: "Pathi", studentId: "23CSE1101", gender: "male" },
      { fullName: "Kusal Mendis", card: "Mendi", studentId: "23CSE1102", gender: "male" },
      { fullName: "Charith Asalanka", card: "Chari", studentId: "23CSE1103", gender: "male" },
      { fullName: "Sadeera Samarawickrama", card: "Samara", studentId: "23CSE1104", gender: "male" },
      { fullName: "Dasun Shanaka", card: "Shan", studentId: "23CSE1105", gender: "male" },
      { fullName: "Dushan Hemantha", card: "Hema", studentId: "23CSE1106", gender: "male" },
      { fullName: "Dunith Wellalage", card: "Wellalage", studentId: "23CSE1107", gender: "male" },
      { fullName: "Rashmi Silva", card: "Rash", studentId: "23CSE1108", gender: "female" },
      { fullName: "Kawya Kavindi", card: "Kawya", studentId: "23CSE1109", gender: "female" },
      { fullName: "Malki Madara", card: "Malki", studentId: "23CSE1110", gender: "female" },
    ],
  },
  {
    teamName: "Logic Lions",
    batch: "4th Year",
    captainName: "Angelo Mathews",
    captainContact: "0733344556",
    captainEmail: "captain12@infobash.lk",
    viceCaptainName: "Dinesh Chandimal",
    notes: "Experienced match winners and power hitters.",
    players: [
      { fullName: "Angelo Mathews", card: "Mathews", studentId: "20CIS1201", gender: "male" },
      { fullName: "Dinesh Chandimal", card: "Chandimal", studentId: "20CIS1202", gender: "male" },
      { fullName: "Dhananjaya de Silva", card: "DDS", studentId: "20CIS1203", gender: "male" },
      { fullName: "Kasun Rajitha", card: "Rajitha", studentId: "20CIS1204", gender: "male" },
      { fullName: "Prabath Jayasuriya", card: "Prabath", studentId: "20CIS1205", gender: "male" },
      { fullName: "Vishwa Fernando", card: "Vishwa", studentId: "20CIS1206", gender: "male" },
      { fullName: "Asitha Fernando", card: "Asitha", studentId: "20CIS1207", gender: "male" },
      { fullName: "Nimasha Madushani", card: "Nima", studentId: "20CIS1208", gender: "female" },
      { fullName: "Janadi Anali", card: "Jana", studentId: "20CIS1209", gender: "female" },
      { fullName: "Tharika Sewwandi", card: "Thari", studentId: "20CIS1210", gender: "female" },
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

  const passwordHash = hashPassword(DEFAULT_CAPTAIN_PASSWORD);
  console.log(`Seeding ${SEED_TEAMS.length} teams into Supabase DB...\n`);

  for (const teamData of SEED_TEAMS) {
    const pool = new Pool({
      connectionString: cleanConnectionString,
      ssl: cleanConnectionString.includes("localhost") ? false : { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
    });
    pool.on("error", (err) => {
      // Ignore background pool connection drop
    });

    let client;
    try {
      client = await pool.connect();
      await client.query("BEGIN");

      // 1. Create or fetch captain account
      let captainId;
      const capCheck = await client.query(`SELECT id FROM captains WHERE email = $1`, [teamData.captainEmail]);
      if (capCheck.rows.length > 0) {
        captainId = capCheck.rows[0].id;
        await client.query(`UPDATE captains SET name = $1, password_hash = $2 WHERE id = $3`, [teamData.captainName, passwordHash, captainId]);
      } else {
        const capInsert = await client.query(
          `INSERT INTO captains (name, email, password_hash)
           VALUES ($1, $2, $3) RETURNING id`,
          [teamData.captainName, teamData.captainEmail, passwordHash]
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
      console.log(`  ✓ Successfully registered squad for "${teamData.teamName}".`);
    } catch (err) {
      if (client) await client.query("ROLLBACK").catch(() => {});
      console.error(`  ✗ Error registering team "${teamData.teamName}":`, err.message);
    } finally {
      if (client) client.release();
      await pool.end().catch(() => {});
    }
  }

  console.log(`\nCompleted processing all ${SEED_TEAMS.length} seed teams!`);
}

main().catch((err) => {
  console.error("Seeding failed:", err.message);
  process.exit(1);
});
