import type { Metadata } from "next";
import TeamsClient from "@/app/teams/TeamsClient";
import type { PublicTeam } from "@/app/api/teams/route";

export const metadata: Metadata = {
  title: "Registered Teams — InfoBash V5.0",
  description:
    "See all teams registered for InfoBash V5.0, the Faculty of Computing SUSL's premier inter-batch cricket tournament.",
};

// Re-fetch every 60 seconds so the page stays fresh without a full rebuild.
export const revalidate = 60;

async function getTeams(): Promise<PublicTeam[]> {
  try {
    const { pool } = await import("@/lib/db");
    const result = await pool.query<PublicTeam>(`
      SELECT
        t.id,
        t.team_name,
        t.batch,
        t.captain_name,
        COUNT(p.id)::int                                       AS player_count,
        COUNT(p.id) FILTER (WHERE p.gender = 'female')::int   AS female_count,
        t.created_at                                           AS registered_at
      FROM teams t
      LEFT JOIN players p ON p.team_id = t.id
      GROUP BY t.id
      ORDER BY t.created_at ASC
    `);
    return result.rows;
  } catch {
    return [];
  }
}

export default async function TeamsPage() {
  const teams = await getTeams();
  return <TeamsClient initialTeams={teams} />;
}
