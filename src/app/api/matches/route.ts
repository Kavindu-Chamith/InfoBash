import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        m.id,
        m.stage,
        m.round,
        m.label,
        m.status,
        m.team_a_score,
        m.team_b_score,
        m.scheduled_at,
        m.venue,
        m.group_id,
        g.name AS group_name,
        ta.id AS team_a_id,
        ta.team_name AS team_a_name,
        tb.id AS team_b_id,
        tb.team_name AS team_b_name,
        m.winner_id,
        tw.team_name AS winner_name
      FROM matches m
      LEFT JOIN groups g ON g.id = m.group_id
      LEFT JOIN teams ta ON ta.id = m.team_a_id
      LEFT JOIN teams tb ON tb.id = m.team_b_id
      LEFT JOIN teams tw ON tw.id = m.winner_id
      ORDER BY
        CASE m.stage WHEN 'group' THEN 0 WHEN 'semifinal' THEN 1 WHEN 'final' THEN 2 ELSE 3 END,
        m.round ASC,
        m.scheduled_at ASC NULLS LAST,
        m.created_at ASC
    `);

    return NextResponse.json({ matches: result.rows });
  } catch (err) {
    console.error("Matches fetch error:", err);
    return NextResponse.json({ error: "Failed to load matches" }, { status: 500 });
  }
}
