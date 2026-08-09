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

    const groupsResult = await client.query(`SELECT id, name FROM groups ORDER BY name ASC`);
    const groups = groupsResult.rows as { id: string; name: string }[];
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

    // Clear any previously generated round-1 or group stage fixtures before regenerating.
    await client.query(`DELETE FROM matches WHERE stage IN ('group', 'round1')`);

    const pairings = generateRound1(assignments);
    let created = 0;
    const matchCountByGroup = new Map<string, number>();

    for (const pairing of pairings) {
      const groupRow = groups[pairing.groupIndex];
      const groupId = groupRow.id;
      const currentMatchNum = (matchCountByGroup.get(groupId) ?? 0) + 1;
      matchCountByGroup.set(groupId, currentMatchNum);

      const groupName = groupRow.name || `Group ${pairing.groupIndex + 1}`;

      await client.query(
        `INSERT INTO matches (stage, group_id, round, label, team_a_id, team_b_id, status)
         VALUES ('group', $1, 1, $2, $3, $4, 'scheduled')`,
        [
          groupId,
          `${groupName} · Match ${currentMatchNum}`,
          pairing.teamAId,
          pairing.teamBId,
        ]
      );
      created++;
    }

    await client.query("COMMIT");
    return NextResponse.json({ success: true, matchesCreated: created });
  } catch (err: unknown) {
    await client.query("ROLLBACK");
    const errMsg = err instanceof Error ? err.message : "Failed to generate round-1 matches";
    console.error("Round 1 generation error:", err);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  } finally {
    client.release();
  }
}
