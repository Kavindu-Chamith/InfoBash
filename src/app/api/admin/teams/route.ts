import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { ADMIN_COOKIE, verifyAdminSessionToken } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!verifyAdminSessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const teamsResult = await pool.query(
      `SELECT t.id, t.team_name, t.batch, t.captain_name, t.captain_contact, t.captain_email,
              t.vice_captain_name, t.notes, t.created_at, t.group_id, g.name AS group_name
       FROM teams t
       LEFT JOIN groups g ON g.id = t.group_id
       ORDER BY t.created_at DESC`
    );
    const playersResult = await pool.query(
      `SELECT team_id, position, full_name, card, student_id, gender
       FROM players ORDER BY team_id, position`
    );

    const playersByTeam = new Map<string, unknown[]>();
    for (const p of playersResult.rows) {
      const list = playersByTeam.get(p.team_id) ?? [];
      list.push(p);
      playersByTeam.set(p.team_id, list);
    }

    const teams = teamsResult.rows.map((t) => ({
      ...t,
      players: playersByTeam.get(t.id) ?? [],
    }));

    return NextResponse.json({ teams });
  } catch (err) {
    console.error("Admin teams fetch error:", err);
    return NextResponse.json({ error: "Failed to load teams" }, { status: 500 });
  }
}
