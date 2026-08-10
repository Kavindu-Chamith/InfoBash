import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { autoProgressKnockoutMatches } from "@/lib/knockoutProgression";

export async function GET() {
  try {
    const res = await pool.query(
      `SELECT key, value FROM tournament_settings WHERE key LIKE 'qualifier_override_%'`
    );
    const overrides: Record<string, string> = {};
    for (const row of res.rows) {
      const groupName = row.key.replace("qualifier_override_", "");
      overrides[groupName] = row.value;
    }
    return NextResponse.json({ overrides });
  } catch (err) {
    console.error("Fetch qualifier overrides error:", err);
    return NextResponse.json({ error: "Failed to fetch overrides" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { groupName, teamId } = (await req.json().catch(() => ({}))) as {
      groupName?: string;
      teamId?: string | null;
    };

    if (!groupName) {
      return NextResponse.json({ error: "groupName is required" }, { status: 400 });
    }

    const settingKey = `qualifier_override_${groupName}`;

    if (!teamId) {
      // Clear override
      await pool.query(`DELETE FROM tournament_settings WHERE key = $1`, [settingKey]);
    } else {
      // Upsert override
      await pool.query(
        `INSERT INTO tournament_settings (key, value)
         VALUES ($1, $2)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP`,
        [settingKey, teamId]
      );
    }

    // Auto update Semifinal & Final fixtures with new qualification
    await autoProgressKnockoutMatches();

    return NextResponse.json({ success: true, groupName, teamId: teamId || null });
  } catch (err) {
    console.error("Save qualifier override error:", err);
    return NextResponse.json({ error: "Failed to save override" }, { status: 500 });
  }
}
