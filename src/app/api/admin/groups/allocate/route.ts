import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { ADMIN_COOKIE, verifyAdminSessionToken } from "@/lib/adminAuth";
import { allocateGroups } from "@/lib/tournament";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!verifyAdminSessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as { groupCount?: number };
  const groupCount = Number(body.groupCount);
  if (!Number.isInteger(groupCount) || groupCount < 1 || groupCount > 20) {
    return NextResponse.json({ error: "groupCount must be an integer between 1 and 20" }, { status: 422 });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const teamsResult = await client.query(`SELECT id FROM teams ORDER BY created_at ASC`);
    const teams = teamsResult.rows as { id: string }[];
    if (teams.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "No registered teams to allocate" }, { status: 422 });
    }

    // Reset existing allocation and wipe group-stage fixtures so re-allocating starts clean.
    await client.query(`UPDATE teams SET group_id = NULL`);
    await client.query(`DELETE FROM matches WHERE stage = 'group'`);
    await client.query(`DELETE FROM groups`);

    const assignments = allocateGroups(teams, groupCount);
    const groupIds: string[] = [];
    for (let i = 0; i < assignments.length; i++) {
      const name = `Group ${String.fromCharCode(65 + i)}`;
      const groupResult = await client.query(
        `INSERT INTO groups (name) VALUES ($1) RETURNING id`,
        [name]
      );
      const groupId = groupResult.rows[0].id as string;
      groupIds.push(groupId);
      for (const teamId of assignments[i].teamIds) {
        await client.query(`UPDATE teams SET group_id = $1 WHERE id = $2`, [groupId, teamId]);
      }
    }

    await client.query("COMMIT");
    return NextResponse.json({ success: true, groupCount: groupIds.length });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Group allocation error:", err);
    return NextResponse.json({ error: "Failed to allocate groups" }, { status: 500 });
  } finally {
    client.release();
  }
}
