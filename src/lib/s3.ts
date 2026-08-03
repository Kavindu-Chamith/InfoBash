import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  // SDK v3.x adds CRC32 checksums to PutObject by default. A presigned PUT
  // URL embeds that checksum and then rejects any browser upload whose body
  // doesn't match it, so this must stay WHEN_REQUIRED.
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

const BUCKET = process.env.S3!;

export async function getPresignedPutUrl(
  key: string,
  contentType: string,
  expiresIn = 900
): Promise<string> {
  const command = new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType });
  return getSignedUrl(s3, command, { expiresIn });
}

export function logoKey(captainId: string, ext: string): string {
  return `team-logos/${captainId}.${ext}`;
}

export async function getObjectBytes(
  key: string
): Promise<{ data: Uint8Array; contentType: string } | null> {
  try {
    const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
    const response = await s3.send(command);
    if (!response.Body) return null;
    const data = await (
      response.Body as { transformToByteArray(): Promise<Uint8Array> }
    ).transformToByteArray();
    return { data, contentType: response.ContentType ?? "application/octet-stream" };
  } catch {
    return null;
  }
}
