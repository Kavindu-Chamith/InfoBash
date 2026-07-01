import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { registrationSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = registrationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const data = parsed.data;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const teamResult = await client.query(
      `INSERT INTO teams (team_name, batch, captain_name, captain_contact, captain_email, vice_captain_name, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        data.teamName,
        data.batch,
        data.captainName,
        data.captainContact,
        data.captainEmail,
        data.viceCaptainName || null,
        data.notes || null,
      ]
    );

    const teamId = teamResult.rows[0].id as string;

    for (let i = 0; i < data.players.length; i++) {
      const player = data.players[i];
      await client.query(
        `INSERT INTO players (team_id, position, full_name, student_id, gender)
         VALUES ($1, $2, $3, $4, $5)`,
        [teamId, i + 1, player.fullName, player.studentId, player.gender]
      );
    }

    await client.query("COMMIT");
    return NextResponse.json({ success: true, teamId }, { status: 201 });
  } catch (err: unknown) {
    await client.query("ROLLBACK");
    const pgError = err as { code?: string; constraint?: string };
    if (pgError.code === "23505") {
      return NextResponse.json(
        { error: "A team with this name has already registered." },
        { status: 409 }
      );
    }
    console.error("Registration error:", err);
    return NextResponse.json(
      { error: "Something went wrong while saving your registration. Please try again." },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
