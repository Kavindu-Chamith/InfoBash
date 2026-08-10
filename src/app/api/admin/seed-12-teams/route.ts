import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { initDatabaseSchema } from "@/lib/dbInit";

const TEAMS_DATA = [
  {
    name: "Rantharu",
    batch: "2nd Year",
    captain: "Kavindu Chamith",
    email: "kavindu@susl.ac.lk",
    contact: "+94771234567",
    players: [
      { name: "Kavindu Chamith (C)", gender: "male" },
      { name: "Sahan Perera", gender: "male" },
      { name: "Nuwan Silva", gender: "male" },
      { name: "Kasun Fernando", gender: "male" },
      { name: "Dilshan Jayasuriya", gender: "male" },
      { name: "Pathum Nissanka", gender: "male" },
      { name: "Charith Asalanka", gender: "male" },
      { name: "Wanindu Hasaranga", gender: "male" },
      { name: "Bhanuka Rajapaksa", gender: "male" },
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
    name: "Algo Strikers",
    batch: "2nd Year",
    captain: "Ethan Hunt",
    email: "ethan@susl.ac.lk",
    contact: "+94775678901",
    players: [
      { name: "Ethan Hunt (C)", gender: "male" },
      { name: "Luther Stickell", gender: "male" },
      { name: "Benji Dunn", gender: "male" },
      { name: "Ilsa Faust", gender: "female" },
      { name: "Julia Meade", gender: "female" },
      { name: "William Brandt", gender: "male" },
      { name: "Alan Hunley", gender: "male" },
      { name: "August Walker", gender: "male" },
      { name: "Solomon Lane", gender: "male" },
      { name: "Grace Kelly", gender: "female" },
      { name: "Alanna Mitsopolis", gender: "female" },
    ],
  },
  {
    name: "Data Strikers",
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
      { name: "Kevin Ball", gender: "male" },
      { name: "Veronica Fisher", gender: "female" },
      { name: "Mickey Milkovich", gender: "male" },
      { name: "Mandy Milkovich", gender: "female" },
      { name: "Sheila Jackson", gender: "female" },
    ],
  },
  {
    name: "Code Warriors",
    batch: "3rd Year",
    captain: "George Clark",
    email: "george@susl.ac.lk",
    contact: "+94777890123",
    players: [
      { name: "George Clark (C)", gender: "male" },
      { name: "Hannah Abbott", gender: "female" },
      { name: "Katie Bell", gender: "female" },
      { name: "Susan Bones", gender: "female" },
      { name: "Terry Boot", gender: "male" },
      { name: "Lavender Brown", gender: "female" },
      { name: "Millicent Bulstrode", gender: "female" },
      { name: "Cho Chang", gender: "female" },
      { name: "Penelope Clearwater", gender: "female" },
      { name: "Michael Corner", gender: "male" },
      { name: "Colin Creevey", gender: "male" },
    ],
  },
  {
    name: "Dev Titans",
    batch: "4th Year",
    captain: "Harry Potter",
    email: "harry@susl.ac.lk",
    contact: "+94778901234",
    players: [
      { name: "Harry Potter (C)", gender: "male" },
      { name: "Ron Weasley", gender: "male" },
      { name: "Hermione Granger", gender: "female" },
      { name: "Neville Longbottom", gender: "male" },
      { name: "Ginny Weasley", gender: "female" },
      { name: "Luna Lovegood", gender: "female" },
      { name: "Draco Malfoy", gender: "male" },
      { name: "Fred Weasley", gender: "male" },
      { name: "George Weasley", gender: "male" },
      { name: "Cedric Diggory", gender: "male" },
      { name: "Viktor Krum", gender: "male" },
    ],
  },
  {
    name: "Net Ninjas",
    batch: "2nd Year",
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
      { name: "Sarah Harding", gender: "female" },
      { name: "Nick Van Owen", gender: "male" },
    ],
  },
  {
    name: "Stack Smashers",
    batch: "1st Year",
    captain: "Julia Roberts",
    email: "julia@susl.ac.lk",
    contact: "+94770123456",
    players: [
      { name: "Julia Roberts (C)", gender: "female" },
      { name: "Brad Pitt", gender: "male" },
      { name: "George Clooney", gender: "male" },
      { name: "Matt Damon", gender: "male" },
      { name: "Casey Affleck", gender: "male" },
      { name: "Scott Caan", gender: "male" },
      { name: "Don Cheadle", gender: "male" },
      { name: "Bernie Mac", gender: "male" },
      { name: "Carl Reiner", gender: "male" },
      { name: "Elliott Gould", gender: "male" },
      { name: "Catherine Zeta-Jones", gender: "female" },
    ],
  },
  {
    name: "Quantum XI",
    batch: "3rd Year",
    captain: "Kevin Flynn",
    email: "kevin@susl.ac.lk",
    contact: "+94771122334",
    players: [
      { name: "Kevin Flynn (C)", gender: "male" },
      { name: "Sam Flynn", gender: "male" },
      { name: "Quorra Digital", gender: "female" },
      { name: "Tron Program", gender: "male" },
      { name: "Clu Copy", gender: "male" },
      { name: "Jarvis AI", gender: "male" },
      { name: "Gem Siren", gender: "female" },
      { name: "Castor Zuse", gender: "male" },
      { name: "Rinzler Guard", gender: "male" },
      { name: "Yori Program", gender: "female" },
      { name: "Sark Commander", gender: "male" },
    ],
  },
  {
    name: "Uncharted XI",
    batch: "4th Year",
    captain: "Nathan Drake",
    email: "nathan@susl.ac.lk",
    contact: "+94772233445",
    players: [
      { name: "Nathan Drake (C)", gender: "male" },
      { name: "Victor Sullivan", gender: "male" },
      { name: "Elena Fisher", gender: "female" },
      { name: "Chloe Frazer", gender: "female" },
      { name: "Samuel Drake", gender: "male" },
      { name: "Charlie Cutter", gender: "male" },
      { name: "Nadine Ross", gender: "female" },
      { name: "Rafe Adler", gender: "male" },
      { name: "Gabriel Roman", gender: "male" },
      { name: "Marisa Chase", gender: "female" },
      { name: "Atoq Navarro", gender: "male" },
    ],
  },
];

export async function GET() {
  return handleSeed();
}

export async function POST() {
  return handleSeed();
}

async function handleSeed() {
  try {
    await initDatabaseSchema();

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // 1. Ensure 4 Groups exist
      const groupNames = ["Group A", "Group B", "Group C", "Group D"];
      const groupMap = new Map<string, string>();

      for (const gName of groupNames) {
        const gRes = await client.query(
          `INSERT INTO groups (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
          [gName]
        );
        groupMap.set(gName, gRes.rows[0].id);
      }

      const results = [];

      // 2. Insert or update 12 teams & assign 3 teams per group
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

        // Clear existing players for team re-seeding
        await client.query(`DELETE FROM players WHERE team_id = $1`, [teamId]);

        // Insert 11 players per team
        for (let pos = 1; pos <= t.players.length; pos++) {
          const p = t.players[pos - 1];
          const studentId = `SUSL/FOC/${t.batch.charAt(0)}Y/2026/${String(i * 11 + pos).padStart(3, "0")}`;
          await client.query(
            `INSERT INTO players (team_id, position, full_name, student_id, gender)
             VALUES ($1, $2, $3, $4, $5)`,
            [teamId, pos, p.name, studentId, p.gender]
          );
        }

        results.push({
          index: i + 1,
          team: t.name,
          batch: t.batch,
          group: assignedGroup,
          captain: t.captain,
          playersCount: t.players.length,
        });
      }

      await client.query("COMMIT");

      return NextResponse.json({
        success: true,
        message: "Successfully seeded 12 teams with 11-player squad rosters into Aiven PostgreSQL database!",
        teamsSeeded: results,
      });
    } catch (err: any) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Seeding failed" },
      { status: 500 }
    );
  }
}
