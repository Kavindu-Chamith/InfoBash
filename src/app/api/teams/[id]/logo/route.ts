import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const result = await pool.query(`SELECT logo, logo_mime FROM teams WHERE id = $1`, [id]);
    const row = result.rows[0] as { logo: Buffer | null; logo_mime: string | null } | undefined;

    if (!row || !row.logo) {
      return NextResponse.json({ error: "Logo not found" }, { status: 404 });
    }

    return new NextResponse(new Uint8Array(row.logo), {
      status: 200,
      headers: {
        "Content-Type": row.logo_mime || "application/octet-stream",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    console.error("Logo fetch error:", err);
    return NextResponse.json({ error: "Failed to load logo" }, { status: 500 });
  }
}
