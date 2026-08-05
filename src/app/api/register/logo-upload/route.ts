import { NextRequest, NextResponse } from "next/server";
import { CAPTAIN_COOKIE, verifyCaptainSessionToken } from "@/lib/captainAuth";
import { uploadFileToGoogleDrive } from "@/lib/googleDrive";

const ALLOWED_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

export async function POST(req: NextRequest) {
  const token = req.cookies.get(CAPTAIN_COOKIE)?.value;
  const session = verifyCaptainSessionToken(token);
  if (!session) {
    return NextResponse.json(
      { error: "Sign in with your captain account before uploading a logo." },
      { status: 401 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("logo") as File | null;
    const teamName = (formData.get("teamName") as string | null) || "Team";

    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    const mimeType = file.type;
    const ext = ALLOWED_MIME[mimeType];
    if (!ext) {
      return NextResponse.json(
        { error: "Logo must be a PNG, JPEG, or WebP image." },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Logo image size must be less than 5MB." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const safeTeamName = teamName.replace(/[^a-zA-Z0-9_-]/g, "_");
    const fileName = `InfoBash_${safeTeamName}_Logo_${Date.now()}.${ext}`;

    // Upload to Google Drive Folder
    const driveResult = await uploadFileToGoogleDrive({
      fileName,
      fileBuffer: buffer,
      mimeType,
    });

    if (driveResult) {
      return NextResponse.json({
        success: true,
        logoUrl: driveResult.directUrl,
        webViewLink: driveResult.webViewLink,
        fileId: driveResult.fileId,
        source: "google_drive",
      });
    }

    // Safe fallback if Google Drive environment credentials are not yet configured
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${mimeType};base64,${base64}`;

    return NextResponse.json({
      success: true,
      logoUrl: dataUrl,
      source: "fallback",
    });
  } catch (err) {
    console.error("Logo upload handler error:", err);
    return NextResponse.json(
      { error: "Failed to upload logo image. Please try again." },
      { status: 500 }
    );
  }
}
