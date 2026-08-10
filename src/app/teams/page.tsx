import type { Metadata } from "next";
import TeamsClient from "@/app/teams/TeamsClient";
import type { PublicTeam } from "@/app/api/teams/route";
import { MOCK_12_TEAMS } from "@/lib/mockTeams";

export const metadata: Metadata = {
  title: "Registered Teams — InfoBash V5.0",
  description:
    "See all teams registered for InfoBash V5.0, the Faculty of Computing SUSL's premier inter-batch cricket tournament.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getTeams(): Promise<PublicTeam[]> {
  try {
    const { pool } = await import("@/lib/db");
    const result = await pool.query<PublicTeam>(`
      SELECT
        t.id,
        t.team_name,
        t.batch,
        t.captain_name,
        t.captain_email,
        t.captain_contact,
        COUNT(p.id)::int                                       AS player_count,
        COUNT(p.id) FILTER (WHERE p.gender = 'female')::int   AS female_count,
        t.created_at                                           AS registered_at,
        COALESCE(
          json_agg(
            json_build_object(
              'fullName', p.full_name,
              'studentId', p.student_id,
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
    if (result.rows && result.rows.length > 0) {
      return result.rows;
    }
  } catch (err) {
    console.error("TeamsPage DB fetch error:", err);
  }
  return MOCK_12_TEAMS;
}

export default async function TeamsPage() {
  const teams = await getTeams();
  return <TeamsClient initialTeams={teams} />;
}
