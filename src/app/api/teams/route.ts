import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export interface Player {
  fullName: string;
  gender: "male" | "female";
}

export interface PublicTeam {
  id: string;
  team_name: string;
  batch: string;
  captain_name: string;
  player_count: number;
  female_count: number;
  registered_at: string;
  players: Player[];
}

export async function GET() {
  try {
    const result = await pool.query<PublicTeam>(`
      SELECT
        t.id,
        t.team_name,
        t.batch,
        t.captain_name,
        COUNT(p.id)::int                                          AS player_count,
        COUNT(p.id) FILTER (WHERE p.gender = 'female')::int      AS female_count,
        t.created_at                                              AS registered_at,
        COALESCE(
          json_agg(
            json_build_object('fullName', p.full_name, 'gender', p.gender)
            ORDER BY p.position
          ) FILTER (WHERE p.id IS NOT NULL),
          '[]'
        ) AS players
      FROM teams t
      LEFT JOIN players p ON p.team_id = t.id
      GROUP BY t.id
      ORDER BY t.created_at ASC
    `);

    return NextResponse.json({ teams: result.rows });
  } catch (err) {
    console.error("Public teams fetch error:", err);
    return NextResponse.json({ error: "Failed to load teams" }, { status: 500 });
  }
}
