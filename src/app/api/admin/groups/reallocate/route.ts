import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { ADMIN_COOKIE, verifyAdminSessionToken } from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!verifyAdminSessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, teamId, targetGroupId, teamAId, teamBId } = body;

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      if (action === "move") {
        if (!teamId || !targetGroupId) {
          await client.query("ROLLBACK");
          return NextResponse.json({ error: "teamId and targetGroupId are required" }, { status: 400 });
        }

        // Verify target group exists
        const groupRes = await client.query("SELECT name FROM groups WHERE id = $1", [targetGroupId]);
        if (groupRes.rowCount === 0) {
          await client.query("ROLLBACK");
          return NextResponse.json({ error: "Target group not found" }, { status: 404 });
        }
        const groupName = groupRes.rows[0].name;

        // Move team
        const teamRes = await client.query("UPDATE teams SET group_id = $1 WHERE id = $2 RETURNING team_name", [targetGroupId, teamId]);
        if (teamRes.rowCount === 0) {
          await client.query("ROLLBACK");
          return NextResponse.json({ error: "Team not found" }, { status: 404 });
        }

        await client.query("COMMIT");
        return NextResponse.json({
          success: true,
          message: `Moved ${teamRes.rows[0].team_name} to ${groupName}.`,
        });
      } else if (action === "swap") {
        if (!teamAId || !teamBId) {
          await client.query("ROLLBACK");
          return NextResponse.json({ error: "teamAId and teamBId are required for swap" }, { status: 400 });
        }

        const teamARes = await client.query("SELECT id, team_name, group_id FROM teams WHERE id = $1", [teamAId]);
        const teamBRes = await client.query("SELECT id, team_name, group_id FROM teams WHERE id = $2", [teamBId]);

        if (teamARes.rowCount === 0 || teamBRes.rowCount === 0) {
          await client.query("ROLLBACK");
          return NextResponse.json({ error: "One or both teams not found" }, { status: 404 });
        }

        const teamA = teamARes.rows[0];
        const teamB = teamBRes.rows[0];

        // Swap group_ids
        await client.query("UPDATE teams SET group_id = $1 WHERE id = $2", [teamB.group_id, teamA.id]);
        await client.query("UPDATE teams SET group_id = $1 WHERE id = $2", [teamA.group_id, teamB.id]);

        await client.query("COMMIT");
        return NextResponse.json({
          success: true,
          message: `Swapped ${teamA.team_name} and ${teamB.team_name} between groups.`,
        });
      } else {
        await client.query("ROLLBACK");
        return NextResponse.json({ error: "Invalid action type. Expected 'move' or 'swap'." }, { status: 400 });
      }
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Reallocation error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to reallocate team" },
      { status: 500 }
    );
  }
}
