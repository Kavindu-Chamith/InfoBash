import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { captainLoginSchema } from "@/lib/validation";
import { CAPTAIN_COOKIE, createCaptainSessionToken, verifyPassword } from "@/lib/captainAuth";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = captainLoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { email, password } = parsed.data;

  try {
    const result = await pool.query(
      `SELECT id, name, email, password_hash FROM captains WHERE email = $1`,
      [email.toLowerCase()]
    );
    const captain = result.rows[0] as
      | { id: string; name: string; email: string; password_hash: string }
      | undefined;

    if (!captain || !verifyPassword(password, captain.password_hash)) {
      return NextResponse.json({ error: "Incorrect email or password" }, { status: 401 });
    }

    const token = createCaptainSessionToken(captain.id);
    const res = NextResponse.json({ success: true, name: captain.name, email: captain.email });
    res.cookies.set(CAPTAIN_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  } catch (err) {
    console.error("Captain login error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
