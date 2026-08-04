import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { ADMIN_COOKIE, verifyAdminSessionToken } from "@/lib/adminAuth";

const STATUSES = ["scheduled", "live", "completed"] as const;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!verifyAdminSessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as {
    teamAId?: string | null;
    teamBId?: string | null;
    teamAScore?: number | null;
    teamBScore?: number | null;
    teamAWickets?: number | null;
    teamBWickets?: number | null;
    teamAOvers?: string | null;
    teamBOvers?: string | null;
    status?: string;
    winnerId?: string | null;
    scheduledAt?: string | null;
    venue?: string | null;
    label?: string | null;
  };

  if (body.status && !STATUSES.includes(body.status as (typeof STATUSES)[number])) {
    return NextResponse.json({ error: `status must be one of ${STATUSES.join(", ")}` }, { status: 422 });
  }

  // Auto-derive the winner from scores if the match is marked complete and no explicit winner was given.
  let winnerId = body.winnerId;
  if (
    body.status === "completed" &&
    winnerId === undefined &&
    typeof body.teamAScore === "number" &&
    typeof body.teamBScore === "number" &&
    body.teamAScore !== body.teamBScore
  ) {
    winnerId = body.teamAScore > body.teamBScore ? body.teamAId : body.teamBId;
  }

  const fields: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  function set(column: string, value: unknown) {
    fields.push(`${column} = $${i}`);
    values.push(value);
    i++;
  }

  if (body.teamAId !== undefined) set("team_a_id", body.teamAId);
  if (body.teamBId !== undefined) set("team_b_id", body.teamBId);
  if (body.teamAScore !== undefined) set("team_a_score", body.teamAScore);
  if (body.teamBScore !== undefined) set("team_b_score", body.teamBScore);
  if (body.teamAWickets !== undefined) set("team_a_wickets", body.teamAWickets);
  if (body.teamBWickets !== undefined) set("team_b_wickets", body.teamBWickets);
  if (body.teamAOvers !== undefined) set("team_a_overs", body.teamAOvers);
  if (body.teamBOvers !== undefined) set("team_b_overs", body.teamBOvers);
  if (body.status !== undefined) set("status", body.status);
  if (winnerId !== undefined) set("winner_id", winnerId);
  if (body.scheduledAt !== undefined) set("scheduled_at", body.scheduledAt);
  if (body.venue !== undefined) set("venue", body.venue);
  if (body.label !== undefined) set("label", body.label);

  if (fields.length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 422 });
  }

  values.push(id);

  try {
    const result = await pool.query(
      `UPDATE matches SET ${fields.join(", ")} WHERE id = $${i} RETURNING id`,
      values
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Match update error:", err);
    return NextResponse.json({ error: "Failed to update match" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!verifyAdminSessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const result = await pool.query(`DELETE FROM matches WHERE id = $1 RETURNING id`, [id]);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Match delete error:", err);
    return NextResponse.json({ error: "Failed to delete match" }, { status: 500 });
  }
}
