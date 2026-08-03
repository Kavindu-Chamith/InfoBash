import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { captainSignupSchema } from "@/lib/validation";
import { CAPTAIN_COOKIE, createCaptainSessionToken, hashPassword } from "@/lib/captainAuth";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = captainSignupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { name, email, password } = parsed.data;
  const passwordHash = hashPassword(password);

  try {
    const result = await pool.query(
      `INSERT INTO captains (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id`,
      [name, email.toLowerCase(), passwordHash]
    );
    const captainId = result.rows[0].id as string;

    const token = createCaptainSessionToken(captainId);
    const res = NextResponse.json({ success: true, name, email }, { status: 201 });
    res.cookies.set(CAPTAIN_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  } catch (err: unknown) {
    const pgError = err as { code?: string };
    if (pgError.code === "23505") {
      return NextResponse.json(
        { error: "An account with this email already exists. Try logging in instead." },
        { status: 409 }
      );
    }
    console.error("Captain signup error:", err);
    return NextResponse.json(
      { error: "Something went wrong while creating your account. Please try again." },
      { status: 500 }
    );
  }
}
