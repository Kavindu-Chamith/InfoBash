import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { ADMIN_COOKIE, createAdminSessionToken } from "@/lib/adminAuth";

function getAdminPassword(): string {
  if (process.env.ADMIN_PASSWORD) {
    return process.env.ADMIN_PASSWORD.trim();
  }
  try {
    const envPath = path.join(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf8");
      for (const line of content.split(/\r?\n/)) {
        if (line.startsWith("ADMIN_PASSWORD=")) {
          return line.slice("ADMIN_PASSWORD=".length).trim();
        }
      }
    }
  } catch {}
  return "Infobash0587#";
}

export async function POST(req: NextRequest) {
  const { password } = (await req.json().catch(() => ({}))) as {
    password?: string;
  };

  if (!password) {
    return NextResponse.json({ error: "Password is required" }, { status: 400 });
  }

  const inputPassword = password.trim();
  const envPassword = process.env.ADMIN_PASSWORD?.trim();

  // Accept Infobash0587#, infobash2026admin, or whatever ADMIN_PASSWORD environment variable is set
  const validPasswords = [
    "Infobash0587#",
    "infobash2026admin",
    envPassword,
  ].filter(Boolean);

  if (!validPasswords.includes(inputPassword)) {
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
}
