import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(request: Request) {
  return handlePing(request);
}

export async function POST(request: Request) {
  return handlePing(request);
}

async function handlePing(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  
  // If CRON_SECRET is set, verify authorization header or query secret parameter
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    const { searchParams } = new URL(request.url);
    const querySecret = searchParams.get("secret");

    const isHeaderValid = authHeader === `Bearer ${cronSecret}`;
    const isQueryValid = querySecret === cronSecret;

    if (!isHeaderValid && !isQueryValid) {
      return NextResponse.json(
        { error: "Unauthorized keep-alive request" },
        { status: 401 }
      );
    }
  }

  try {
    const startTime = Date.now();
    // 1. Lightweight DB ping
    await pool.query("SELECT 1");

    // 2. Ensure tournament_settings table exists & update keep-alive timestamp
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tournament_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `).catch(() => {});

    const timestamp = new Date().toISOString();
    await pool.query(`
      INSERT INTO tournament_settings (key, value, updated_at)
      VALUES ('last_db_keepalive', $1, NOW())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
    `, [timestamp]).catch(() => {});

    const durationMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      timestamp,
      durationMs,
      dbStatus: "active",
      message: "Supabase database keep-alive ping executed successfully.",
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Keep-alive DB ping error:", errorMessage);
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        dbStatus: "inactive_or_unreachable",
      },
      { status: 500 }
    );
  }
}
