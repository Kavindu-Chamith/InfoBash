import crypto from "crypto";

export interface CloudinaryUploadResult {
  url: string;
  public_id: string;
}

/**
 * Uploads an image file directly to Cloudinary Media Library.
 */
export async function uploadToCloudinary(params: {
  fileBuffer: Buffer;
  mimeType: string;
  folder?: string;
}): Promise<CloudinaryUploadResult | null> {
  try {
    let cloudName = (
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
      process.env.CLOUDINARY_CLOUD_NAME
    )?.trim();
    let apiKey = process.env.CLOUDINARY_API_KEY?.trim();
    let apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

    if ((!cloudName || !apiKey || !apiSecret) && process.env.CLOUDINARY_URL) {
      try {
        const urlStr = process.env.CLOUDINARY_URL.replace("cloudinary://", "http://");
        const url = new URL(urlStr);
        cloudName = cloudName || url.hostname;
        apiKey = apiKey || url.username;
        apiSecret = apiSecret || url.password;
      } catch {}
    }

    if (!cloudName || !apiKey || !apiSecret) {
      console.warn("Cloudinary upload skipped: missing cloud name, API key, or API secret.");
      return null;
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = params.folder || "infobash_team_logos";

    // Generate SHA-1 signature required by Cloudinary
    const signatureStr = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash("sha1").update(signatureStr).digest("hex");

    const base64Data = params.fileBuffer.toString("base64");
    const fileDataUrl = `data:${params.mimeType};base64,${base64Data}`;

    const formData = new FormData();
    formData.append("file", fileDataUrl);
    formData.append("api_key", apiKey);
    formData.append("timestamp", String(timestamp));
    formData.append("folder", folder);
    formData.append("signature", signature);

    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      console.error("Cloudinary upload failed:", errText);
      return null;
    }

    const data = (await uploadRes.json()) as {
      secure_url?: string;
      url?: string;
      public_id: string;
    };

    return {
      url: data.secure_url || data.url || "",
      public_id: data.public_id,
    };
  } catch (err) {
    console.error("Cloudinary error:", err);
    return null;
  }
}
