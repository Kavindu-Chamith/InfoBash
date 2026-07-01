import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(
      `SELECT batch, COUNT(*)::int AS count FROM teams GROUP BY batch`
    );
    const totalResult = await pool.query(`SELECT COUNT(*)::int AS count FROM teams`);
    return NextResponse.json({
      total: totalResult.rows[0]?.count ?? 0,
      byBatch: result.rows,
    });
  } catch (err) {
    console.error("Stats error:", err);
    // Fail soft — the homepage should still render even if the DB isn't reachable yet.
    return NextResponse.json({ total: 0, byBatch: [] }, { status: 200 });
  }
}
