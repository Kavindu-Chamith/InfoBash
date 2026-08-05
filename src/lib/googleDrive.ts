import crypto from "crypto";

export interface GoogleDriveUploadResult {
  fileId: string;
  webViewLink: string;
  directUrl: string;
}

export async function uploadFileToGoogleDrive(params: {
  fileName: string;
  fileBuffer: Buffer;
  mimeType: string;
}): Promise<GoogleDriveUploadResult | null> {
  try {
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID?.trim();
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
    let privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

    if (!folderId || !clientEmail || !privateKey) {
      return null;
    }

    privateKey = privateKey.replace(/\\n/g, "\n");

    const now = Math.floor(Date.now() / 1000);
    const claim = {
      iss: clientEmail,
      scope: "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    };

    const header = { alg: "RS256", typ: "JWT" };
    const base64Header = Buffer.from(JSON.stringify(header)).toString("base64url");
    const base64Claim = Buffer.from(JSON.stringify(claim)).toString("base64url");
    const signatureInput = `${base64Header}.${base64Claim}`;

    const signer = crypto.createSign("RSA-SHA256");
    signer.update(signatureInput);
    const signature = signer.sign(privateKey, "base64url");
    const jwt = `${signatureInput}.${signature}`;

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }),
    });

    if (!tokenRes.ok) {
      return null;
    }

    const tokenData = (await tokenRes.json()) as { access_token?: string };
    const accessToken = tokenData.access_token;
    if (!accessToken) return null;

    const metadata = {
      name: params.fileName,
      parents: [folderId],
    };

    const boundary = "-------314159265358979323846";
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const multipartRequestBody = Buffer.concat([
      Buffer.from(
        `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(
          metadata
        )}`
      ),
      Buffer.from(`${delimiter}Content-Type: ${params.mimeType}\r\n\r\n`),
      params.fileBuffer,
      Buffer.from(closeDelimiter),
    ]);

    const uploadRes = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink,webContentLink",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": `multipart/related; boundary=${boundary}`,
        },
        body: multipartRequestBody,
      }
    );

    if (!uploadRes.ok) {
      return null;
    }

    const fileData = (await uploadRes.json()) as {
      id: string;
      webViewLink?: string;
    };
    const fileId = fileData.id;

    try {
      await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role: "reader", type: "anyone" }),
        }
      );
    } catch {}

    const webViewLink = fileData.webViewLink || `https://drive.google.com/file/d/${fileId}/view`;
    const directUrl = `https://lh3.googleusercontent.com/d/${fileId}`;

    return { fileId, webViewLink, directUrl };
  } catch {
    return null;
  }
}
