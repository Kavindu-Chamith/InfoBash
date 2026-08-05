import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { registrationSchema } from "@/lib/validation";
import { CAPTAIN_COOKIE, verifyCaptainSessionToken } from "@/lib/captainAuth";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(CAPTAIN_COOKIE)?.value;
  const session = verifyCaptainSessionToken(token);
  if (!session) {
    return NextResponse.json(
      { error: "Sign in with your captain account before registering a team." },
      { status: 401 }
    );
  }

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

    const captainResult = await client.query(
      `SELECT name, email FROM captains WHERE id = $1`,
      [session.captainId]
    );
    const captain = captainResult.rows[0] as { name: string; email: string } | undefined;
    if (!captain) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Your session has expired. Please sign in again." }, { status: 401 });
    }

    const existingTeam = await client.query(`SELECT id FROM teams WHERE captain_id = $1`, [
      session.captainId,
    ]);
    if (existingTeam.rows.length > 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: "You have already registered a team with this account." },
        { status: 409 }
      );
    }

    const finalCaptainName = data.captainName?.trim() || captain.name || "";
    if (finalCaptainName) {
      await client.query(`UPDATE captains SET name = $1 WHERE id = $2`, [
        finalCaptainName,
        session.captainId,
      ]);
    }

    const teamResult = await client.query(
      `INSERT INTO teams (team_name, batch, captain_name, captain_contact, captain_email, vice_captain_name, notes, captain_id, logo_s3_key)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [
        data.teamName,
        data.batch,
        finalCaptainName,
        data.captainContact,
        captain.email,
        data.viceCaptainName || null,
        data.notes || null,
        session.captainId,
        data.logoKey || null,
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
      const message = pgError.constraint?.includes("captain")
        ? "You have already registered a team with this account."
        : "A team with this name has already registered.";
      return NextResponse.json({ error: message }, { status: 409 });
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
