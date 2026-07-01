import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { ADMIN_COOKIE, verifyAdminSessionToken } from "@/lib/adminAuth";

function csvEscape(value: unknown) {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!verifyAdminSessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await pool.query(
      `SELECT t.team_name, t.batch, t.captain_name, t.captain_contact, t.captain_email,
              t.vice_captain_name, p.position, p.full_name, p.student_id, p.gender, t.created_at
       FROM teams t
       JOIN players p ON p.team_id = t.id
       ORDER BY t.created_at DESC, p.position ASC`
    );

    const header = [
      "Team Name",
      "Batch",
      "Captain",
      "Captain Contact",
      "Captain Email",
      "Vice Captain",
      "Player #",
      "Player Name",
      "Student ID",
      "Gender",
      "Registered At",
    ];

    const rows = result.rows.map((r) =>
      [
        r.team_name,
        r.batch,
        r.captain_name,
        r.captain_contact,
        r.captain_email,
        r.vice_captain_name,
        r.position,
        r.full_name,
        r.student_id,
        r.gender,
        new Date(r.created_at).toISOString(),
      ]
        .map(csvEscape)
        .join(",")
    );

    const csv = [header.join(","), ...rows].join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="infobash-registrations.csv"`,
      },
    });
  } catch (err) {
    console.error("Admin export error:", err);
    return NextResponse.json({ error: "Failed to export teams" }, { status: 500 });
  }
}
