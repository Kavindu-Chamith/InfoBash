import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { initDatabaseSchema } from "@/lib/dbInit";

export interface Player {
  fullName: string;
  card?: string;
  studentId?: string;
  gender: "male" | "female";
  position?: number;
}

export interface PublicTeam {
  id: string;
  team_name: string;
  batch: string;
  captain_name: string;
  captain_email?: string;
  captain_contact?: string;
  player_count: number;
  female_count: number;
  registered_at: string;
  players: Player[];
  group_name: string | null;
  has_logo: boolean;
}

export async function GET() {
  try {
    await initDatabaseSchema();
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
            json_build_object(
              'fullName', p.full_name,
              'card', p.card,
              'gender', p.gender,
              'position', p.position
            )
            ORDER BY p.position
          ) FILTER (WHERE p.id IS NOT NULL),
          '[]'
        ) AS players,
        g.name AS group_name,
        (t.logo IS NOT NULL OR t.logo_s3_key IS NOT NULL) AS has_logo
      FROM teams t
      LEFT JOIN players p ON p.team_id = t.id
      LEFT JOIN groups g ON g.id = t.group_id
      GROUP BY t.id, g.name
      ORDER BY t.created_at ASC
    `);

    return NextResponse.json({ teams: result.rows });
  } catch (err) {
    console.error("Public teams fetch error:", err);
    return NextResponse.json({ error: "Failed to load teams" }, { status: 500 });
  }
}
