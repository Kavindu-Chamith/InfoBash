import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { ADMIN_COOKIE, verifyAdminSessionToken } from "@/lib/adminAuth";
import {
  allocateTournamentGroups,
  getGroupNamesForTeamCount,
  MIN_TOURNAMENT_TEAMS,
  MAX_TOURNAMENT_TEAMS,
} from "@/lib/tournament";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!verifyAdminSessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const teamsResult = await client.query(`SELECT id FROM teams ORDER BY created_at ASC`);
    const teams = teamsResult.rows as { id: string }[];
    const teamCount = teams.length;

    if (teamCount < MIN_TOURNAMENT_TEAMS || teamCount > MAX_TOURNAMENT_TEAMS) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        {
          error: `Group allocation requires between ${MIN_TOURNAMENT_TEAMS} and ${MAX_TOURNAMENT_TEAMS} registered teams (currently ${teamCount} team${teamCount === 1 ? "" : "s"} registered).`,
        },
        { status: 422 }
      );
    }

    // Reset existing allocation and wipe fixtures so re-allocating starts clean.
    await client.query(`UPDATE teams SET group_id = NULL`);
    await client.query(`DELETE FROM matches`);
    await client.query(`DELETE FROM groups`);

    const assignments = allocateTournamentGroups(teams);
    const groupNames = getGroupNamesForTeamCount(teamCount);
    const groupIds: string[] = [];

    for (let i = 0; i < assignments.length; i++) {
      const name = groupNames[i] ?? `Group ${String.fromCharCode(65 + i)}`;
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
    const groupNamesList = assignments.length === 2 ? "Group A and Group B" : "Group A, Group B, Group C, and Group D";
    return NextResponse.json({
      success: true,
      groupCount: groupIds.length,
      teamCount,
      message: `Successfully allocated ${teamCount} teams into ${groupNamesList}.`,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Group allocation error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to allocate groups" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
