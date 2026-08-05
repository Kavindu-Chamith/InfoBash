import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { ADMIN_COOKIE, verifyAdminSessionToken } from "@/lib/adminAuth";

const VALID_BATCHES = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!verifyAdminSessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Team ID is required" }, { status: 400 });
  }

  try {
    const result = await pool.query(
      `DELETE FROM teams WHERE id = $1 RETURNING team_name`,
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const teamName = result.rows[0].team_name;
    return NextResponse.json({
      success: true,
      message: `Team "${teamName}" deleted successfully.`,
    });
  } catch (err) {
    console.error("Admin delete team error:", err);
    return NextResponse.json(
      { error: "Failed to delete team" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!verifyAdminSessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Team ID is required" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const {
      team_name,
      batch,
      captain_name,
      captain_contact,
      captain_email,
      vice_captain_name,
      notes,
      players,
    } = body;

    // Basic validations
    if (!team_name || typeof team_name !== "string" || !team_name.trim()) {
      return NextResponse.json(
        { error: "Team name is required" },
        { status: 400 }
      );
    }
    if (!batch || !VALID_BATCHES.includes(batch)) {
      return NextResponse.json(
        { error: "Valid batch is required" },
        { status: 400 }
      );
    }
    if (!captain_name || !captain_contact || !captain_email) {
      return NextResponse.json(
        { error: "Captain details (name, contact, email) are required" },
        { status: 400 }
      );
    }

    // Check unique team name (excluding current team)
    const existing = await pool.query(
      `SELECT id FROM teams WHERE LOWER(team_name) = LOWER($1) AND id != $2`,
      [team_name.trim(), id]
    );
    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: "Another team with this name already exists" },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      await client.query(
        `UPDATE teams
         SET team_name = $1,
             batch = $2,
             captain_name = $3,
             captain_contact = $4,
             captain_email = $5,
             vice_captain_name = $6,
             notes = $7
         WHERE id = $8`,
        [
          team_name.trim(),
          batch,
          captain_name.trim(),
          captain_contact.trim(),
          captain_email.trim(),
          vice_captain_name ? vice_captain_name.trim() : null,
          notes ? notes.trim() : null,
          id,
        ]
      );

      if (Array.isArray(players) && players.length > 0) {
        // Delete existing players for team and insert updated squad
        await client.query(`DELETE FROM players WHERE team_id = $1`, [id]);

        for (let i = 0; i < players.length; i++) {
          const p = players[i];
          const pos = p.position || i + 1;
          const fullName = p.full_name || p.fullName || "";
          const studentId = p.student_id || p.studentId || "";
          const gender = p.gender === "female" ? "female" : "male";

          await client.query(
            `INSERT INTO players (team_id, position, full_name, student_id, gender)
             VALUES ($1, $2, $3, $4, $5)`,
            [id, pos, fullName.trim(), studentId.trim(), gender]
          );
        }
      }

      await client.query("COMMIT");

      return NextResponse.json({
        success: true,
        message: `Team "${team_name.trim()}" updated successfully.`,
      });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Admin update team error:", err);
    return NextResponse.json(
      { error: "Failed to update team details" },
      { status: 500 }
    );
  }
}
