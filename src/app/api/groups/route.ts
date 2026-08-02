import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const groupsResult = await pool.query(`
      SELECT
        g.id,
        g.name,
        COALESCE(
          json_agg(
            json_build_object(
              'id', t.id,
              'teamName', t.team_name,
              'batch', t.batch,
              'wins', COALESCE(w.wins, 0),
              'losses', COALESCE(l.losses, 0)
            )
            ORDER BY t.team_name
          ) FILTER (WHERE t.id IS NOT NULL),
          '[]'
        ) AS teams
      FROM groups g
      LEFT JOIN teams t ON t.group_id = g.id
      LEFT JOIN (
        SELECT winner_id AS team_id, COUNT(*)::int AS wins
        FROM matches
        WHERE status = 'completed' AND winner_id IS NOT NULL
        GROUP BY winner_id
      ) w ON w.team_id = t.id
      LEFT JOIN (
        SELECT
          CASE WHEN winner_id = team_a_id THEN team_b_id ELSE team_a_id END AS team_id,
          COUNT(*)::int AS losses
        FROM matches
        WHERE status = 'completed' AND winner_id IS NOT NULL
          AND team_a_id IS NOT NULL AND team_b_id IS NOT NULL
        GROUP BY 1
      ) l ON l.team_id = t.id
      GROUP BY g.id
      ORDER BY g.name ASC
    `);

    return NextResponse.json({ groups: groupsResult.rows });
  } catch (err) {
    console.error("Groups fetch error:", err);
    return NextResponse.json({ error: "Failed to load groups" }, { status: 500 });
  }
}
