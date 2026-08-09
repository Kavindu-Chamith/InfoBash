import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { ADMIN_COOKIE, verifyAdminSessionToken } from "@/lib/adminAuth";

const VALID_ROUNDS = ["round1", "semifinal", "final"] as const;

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
      `SELECT key, value FROM tournament_settings WHERE key IN ('active_live_round', 'matches_published')`
    );

    const settingsMap: Record<string, string> = {};
    for (const row of result.rows) {
      settingsMap[row.key] = row.value;
    }

    const activeRound = settingsMap["active_live_round"] || "round1";
    const matchesPublished = settingsMap["matches_published"] === "true";

    return NextResponse.json({ activeRound, matchesPublished });
  } catch (err) {
    console.error("Settings GET error:", err);
    return NextResponse.json({ activeRound: "round1", matchesPublished: false });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!verifyAdminSessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json().catch(() => ({}))) as {
      activeRound?: string;
      matchesPublished?: boolean;
    };

    await pool.query(`
      CREATE TABLE IF NOT EXISTS tournament_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    if (body.activeRound && VALID_ROUNDS.includes(body.activeRound as any)) {
      await pool.query(
        `INSERT INTO tournament_settings (key, value)
         VALUES ('active_live_round', $1)
         ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = CURRENT_TIMESTAMP`,
        [body.activeRound]
      );
    }

    if (typeof body.matchesPublished === "boolean") {
      await pool.query(
        `INSERT INTO tournament_settings (key, value)
         VALUES ('matches_published', $1)
         ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = CURRENT_TIMESTAMP`,
        [body.matchesPublished ? "true" : "false"]
      );
    }

    const result = await pool.query(
      `SELECT key, value FROM tournament_settings WHERE key IN ('active_live_round', 'matches_published')`
    );
    const settingsMap: Record<string, string> = {};
    for (const row of result.rows) {
      settingsMap[row.key] = row.value;
    }

    return NextResponse.json({
      success: true,
      activeRound: settingsMap["active_live_round"] || "round1",
      matchesPublished: settingsMap["matches_published"] === "true",
    });
  } catch (err) {
    console.error("Settings POST error:", err);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
