import { NextResponse } from "next/server";
import { CAPTAIN_COOKIE } from "@/lib/captainAuth";

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(CAPTAIN_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
