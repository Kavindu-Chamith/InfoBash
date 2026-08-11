import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { CAPTAIN_COOKIE, createCaptainSessionToken, hashPassword } from "@/lib/captainAuth";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { credential, accessToken, code, redirectUri } = body;

    let googleEmail: string | undefined;
    let googleName: string | undefined;

    const reqHost = req.headers.get("x-forwarded-host") || req.headers.get("host");
    const isLocal = reqHost?.includes("localhost") || reqHost?.includes("127.0.0.1");
    const reqProto = req.headers.get("x-forwarded-proto") || (isLocal ? "http" : "https");
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://infobash2026.vercel.app";
    const defaultOrigin = isLocal ? "http://localhost:3000" : appUrl.replace(/\/$/, "");
    const detectedOrigin = req.headers.get("origin") || (reqHost ? `${reqProto}://${reqHost}` : defaultOrigin);
    const finalRedirectUri = redirectUri || detectedOrigin;

    // 0. Exchange authorization code for tokens if authorization code provided
    if (code && typeof code === "string") {
      try {
        const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            code,
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
            client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
            redirect_uri: finalRedirectUri,
            grant_type: "authorization_code",
          }),
        });

        if (tokenRes.ok) {
          const tokenData = await tokenRes.json();
          if (tokenData.access_token) {
            const userinfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
              headers: { Authorization: `Bearer ${tokenData.access_token}` },
            });
            if (userinfoRes.ok) {
              const payload = await userinfoRes.json();
              googleEmail = payload.email;
              googleName = payload.name;
            }
          }
        }
      } catch (e) {
        console.warn("Failed to exchange OAuth code:", e);
      }
    }

    // 1. Verify Google ID token via Google TokenInfo API if credential provided
    if (!googleEmail && credential && typeof credential === "string") {
      try {
        const verifyRes = await fetch(
          `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
        );
        if (verifyRes.ok) {
          const payload = await verifyRes.json();
          if (payload.email) {
            googleEmail = payload.email;
            googleName = payload.name || payload.given_name;
          }
        }
      } catch (e) {
        console.warn("Failed to verify Google credential token:", e);
      }
    }

    // 2. Verify Google Access Token via UserInfo API if accessToken provided
    if (!googleEmail && accessToken && typeof accessToken === "string") {
      try {
        const userinfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (userinfoRes.ok) {
          const payload = await userinfoRes.json();
          if (payload.email) {
            googleEmail = payload.email;
            googleName = payload.name;
          }
        }
      } catch (e) {
        console.warn("Failed to verify Google access token:", e);
      }
    }

    if (!googleEmail) {
      return NextResponse.json(
        { error: "Google authentication verification failed. Please sign in via Google again." },
        { status: 401 }
      );
    }

    const cleanEmail = googleEmail.trim().toLowerCase();
    const cleanName = googleName ? googleName.trim() : (body.name ? String(body.name).trim() : "");

    // Check existing captain or insert new captain account
    const result = await pool.query(
      `SELECT id, name, email FROM captains WHERE LOWER(email) = $1`,
      [cleanEmail]
    );

    let captainId: string;
    let captainName = cleanName;

    if (result.rows.length === 0) {
      const randomPassword = crypto.randomBytes(16).toString("hex");
      const passwordHash = hashPassword(randomPassword);

      const insertRes = await pool.query(
        `INSERT INTO captains (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id`,
        [cleanName, cleanEmail, passwordHash]
      );
      captainId = insertRes.rows[0].id;
    } else {
      captainId = result.rows[0].id;
      captainName = result.rows[0].name;
    }

    // Create captain session token & HTTP cookie
    const token = createCaptainSessionToken(captainId);

    const teamRes = await pool.query(
      `SELECT id, team_name FROM teams WHERE captain_id = $1`,
      [captainId]
    );
    const hasTeam = teamRes.rows.length > 0;
    const teamName = hasTeam ? teamRes.rows[0].team_name : null;

    const res = NextResponse.json({
      success: true,
      name: captainName,
      email: cleanEmail,
      hasTeam,
      teamName,
    });

    res.cookies.set(CAPTAIN_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return res;
  } catch (err) {
    console.error("Google authentication error:", err);
    return NextResponse.json(
      { error: "Google authentication failed. Please try again." },
      { status: 500 }
    );
  }
}
