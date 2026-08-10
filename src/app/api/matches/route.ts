import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { autoProgressKnockoutMatches } from "@/lib/knockoutProgression";
import { initDatabaseSchema } from "@/lib/dbInit";

export async function GET() {
  try {
    // Auto-create missing database tables if only teams & players exist
    await initDatabaseSchema();

    // Automatically progress knockout matches (Semifinals & Final) based on completed round winners
    await autoProgressKnockoutMatches();

    const result = await pool.query(`
      SELECT
        m.id,
        m.stage,
        m.round,
        m.label,
        m.status,
        m.team_a_score,
        m.team_b_score,
        m.team_a_wickets,
        m.team_b_wickets,
        m.team_a_overs,
        m.team_b_overs,
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
        CASE m.stage WHEN 'group' THEN 0 WHEN 'round1' THEN 1 WHEN 'semifinal' THEN 2 WHEN 'final' THEN 3 ELSE 4 END,
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
