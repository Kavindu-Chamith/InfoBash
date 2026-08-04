import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { ADMIN_COOKIE, verifyAdminSessionToken } from "@/lib/adminAuth";

const VALID_ROUNDS = ["round1", "quarterfinal", "semifinal", "final"] as const;

export async function GET() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tournament_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const result = await pool.query(
      `SELECT value FROM tournament_settings WHERE key = 'active_live_round'`
    );

    const activeRound = result.rows[0]?.value || "round1";
    return NextResponse.json({ activeRound });
  } catch (err) {
    console.error("Settings GET error:", err);
    return NextResponse.json({ activeRound: "round1" });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!verifyAdminSessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json().catch(() => ({}))) as { activeRound?: string };
    if (!body.activeRound || !VALID_ROUNDS.includes(body.activeRound as any)) {
      return NextResponse.json({ error: "Invalid round" }, { status: 400 });
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS tournament_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(
      `INSERT INTO tournament_settings (key, value)
       VALUES ('active_live_round', $1)
       ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = CURRENT_TIMESTAMP`,
      [body.activeRound]
    );

    return NextResponse.json({ success: true, activeRound: body.activeRound });
  } catch (err) {
    console.error("Settings POST error:", err);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
