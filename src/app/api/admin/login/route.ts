import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, createAdminSessionToken } from "@/lib/adminAuth";
import { pool } from "@/lib/db";

export async function GET() {
  return NextResponse.json({ status: "active", message: "Admin login endpoint is active." });
}

export async function POST(req: NextRequest) {
  try {
    const { password } = (await req.json().catch(() => ({}))) as {
      password?: string;
    };

    if (!password || typeof password !== "string") {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    const inputPassword = password.trim();
    let isAuthenticated = false;

    // 1. Try DB lookup using pgcrypto crypt verification if admin_users table exists
    try {
      const dbRes = await pool.query(
        "SELECT id FROM admin_users WHERE username = 'admin' AND password_hash = crypt($1, password_hash) LIMIT 1",
        [inputPassword]
      );
      if (dbRes.rowCount && dbRes.rowCount > 0) {
        isAuthenticated = true;
      }
    } catch {
      // Table may not exist yet if migration hasn't run
    }

    // 2. Fall back to process.env.ADMIN_PASSWORD if not matched via DB
    if (!isAuthenticated && process.env.ADMIN_PASSWORD) {
      if (inputPassword === process.env.ADMIN_PASSWORD.trim()) {
        isAuthenticated = true;
      }
    }

    if (!isAuthenticated) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
    }

    const token = createAdminSessionToken();
    const res = NextResponse.json({ success: true });
    res.cookies.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });
    return res;
  } catch (error) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
