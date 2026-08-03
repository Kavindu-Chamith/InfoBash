import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { ADMIN_COOKIE, verifyAdminSessionToken } from "@/lib/adminAuth";
import { generateRound1, type GroupAssignment } from "@/lib/tournament";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!verifyAdminSessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const groupsResult = await client.query(`SELECT id FROM groups ORDER BY name ASC`);
    const groups = groupsResult.rows as { id: string }[];
    if (groups.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: "Allocate teams into groups before generating round-1 matches" },
        { status: 422 }
      );
    }

    const teamsResult = await client.query(
      `SELECT id, group_id FROM teams WHERE group_id IS NOT NULL`
    );
    const teamsByGroup = new Map<string, string[]>();
    for (const row of teamsResult.rows as { id: string; group_id: string }[]) {
      const list = teamsByGroup.get(row.group_id) ?? [];
      list.push(row.id);
      teamsByGroup.set(row.group_id, list);
    }

    const assignments: GroupAssignment[] = groups.map((g, i) => ({
      groupIndex: i,
      teamIds: teamsByGroup.get(g.id) ?? [],
    }));

    // Clear any previously generated round-1 fixtures before regenerating.
    await client.query(`DELETE FROM matches WHERE stage = 'group' AND round = 1`);

    const pairings = generateRound1(assignments);
    let created = 0;
    for (const pairing of pairings) {
      const groupId = groups[pairing.groupIndex].id;
      const isBye = pairing.teamBId === null;
      await client.query(
        `INSERT INTO matches (stage, group_id, round, label, team_a_id, team_b_id, status, winner_id)
         VALUES ('group', $1, 1, $2, $3, $4, $5, $6)`,
        [
          groupId,
          isBye ? "Round 1 · Bye" : "Round 1",
          pairing.teamAId,
          pairing.teamBId,
          isBye ? "completed" : "scheduled",
          isBye ? pairing.teamAId : null,
        ]
      );
      created++;
    }

    await client.query("COMMIT");
    return NextResponse.json({ success: true, matchesCreated: created });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Round 1 generation error:", err);
    return NextResponse.json({ error: "Failed to generate round-1 matches" }, { status: 500 });
  } finally {
    client.release();
  }
}
