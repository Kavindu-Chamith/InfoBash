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
    const cloudName = (
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
      process.env.CLOUDINARY_CLOUD_NAME
    )?.trim();
    const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
    const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

    if (!cloudName || !apiKey || !apiSecret) {
      console.warn("Cloudinary upload skipped: missing cloud name, API key, or API secret.");
      return null;
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = params.folder || "infobash_team_logos";

    // Generate SHA-1 signature required by Cloudinary
    const signatureStr = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash("sha1").update(signatureStr).digest("hex");

    const formData = new FormData();
    const uint8Array = new Uint8Array(params.fileBuffer);
    const blob = new Blob([uint8Array], { type: params.mimeType });
    formData.append("file", blob);
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
