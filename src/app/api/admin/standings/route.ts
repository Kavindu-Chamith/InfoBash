import { NextResponse } from "next/server";
import { calculate1stRoundStandings } from "@/lib/knockoutProgression";

export async function GET() {
  try {
    const standings = await calculate1stRoundStandings();
    return NextResponse.json({ standings });
  } catch (err) {
    console.error("Fetch standings error:", err);
    return NextResponse.json({ error: "Failed to calculate standings" }, { status: 500 });
  }
}
