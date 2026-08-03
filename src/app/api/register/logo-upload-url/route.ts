import { NextRequest, NextResponse } from "next/server";
import { CAPTAIN_COOKIE, verifyCaptainSessionToken } from "@/lib/captainAuth";
import { getPresignedPutUrl, logoKey } from "@/lib/s3";

const ALLOWED_LOGO_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

export async function GET(req: NextRequest) {
  const token = req.cookies.get(CAPTAIN_COOKIE)?.value;
  const session = verifyCaptainSessionToken(token);
  if (!session) {
    return NextResponse.json(
      { error: "Sign in with your captain account before uploading a logo." },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const contentType = searchParams.get("contentType") ?? "";
  const ext = ALLOWED_LOGO_MIME[contentType];
  if (!ext) {
    return NextResponse.json(
      { error: "Logo must be a PNG, JPEG, or WebP image" },
      { status: 400 }
    );
  }

  const key = logoKey(session.captainId, ext);
  const url = await getPresignedPutUrl(key, contentType);

  return NextResponse.json({ url, key });
}
