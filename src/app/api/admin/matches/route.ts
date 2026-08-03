import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { ADMIN_COOKIE, verifyAdminSessionToken } from "@/lib/adminAuth";

const STAGES = ["group", "semifinal", "final", "custom"] as const;

export async function POST(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!verifyAdminSessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    stage?: string;
    label?: string;
    teamAId?: string | null;
    teamBId?: string | null;
    scheduledAt?: string | null;
    venue?: string | null;
    round?: number;
  };

  if (!body.stage || !STAGES.includes(body.stage as (typeof STAGES)[number])) {
    return NextResponse.json({ error: `stage must be one of ${STAGES.join(", ")}` }, { status: 422 });
  }

  try {
    const result = await pool.query(
      `INSERT INTO matches (stage, round, label, team_a_id, team_b_id, scheduled_at, venue, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'scheduled')
       RETURNING id`,
      [
        body.stage,
        body.round ?? 1,
        body.label || null,
        body.teamAId || null,
        body.teamBId || null,
        body.scheduledAt || null,
        body.venue || null,
      ]
    );
    return NextResponse.json({ success: true, matchId: result.rows[0].id }, { status: 201 });
  } catch (err) {
    console.error("Match creation error:", err);
    return NextResponse.json({ error: "Failed to create match" }, { status: 500 });
  }
}
