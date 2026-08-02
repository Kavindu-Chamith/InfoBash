import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { CAPTAIN_COOKIE, verifyCaptainSessionToken } from "@/lib/captainAuth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(CAPTAIN_COOKIE)?.value;
  const session = verifyCaptainSessionToken(token);
  if (!session) {
    return NextResponse.json({ captain: null });
  }

  try {
    const result = await pool.query(
      `SELECT c.name, c.email, t.id AS team_id, t.team_name
       FROM captains c
       LEFT JOIN teams t ON t.captain_id = c.id
       WHERE c.id = $1`,
      [session.captainId]
    );
    const row = result.rows[0];
    if (!row) {
      return NextResponse.json({ captain: null });
    }
    return NextResponse.json({
      captain: {
        name: row.name as string,
        email: row.email as string,
        hasTeam: Boolean(row.team_id),
        teamName: (row.team_name as string | null) ?? null,
      },
    });
  } catch (err) {
    console.error("Session lookup error:", err);
    return NextResponse.json({ captain: null });
  }
}
