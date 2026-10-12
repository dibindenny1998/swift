import { createHash, randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { adminApi } from "@/lib/admin";
import { error, json } from "@/lib/http";
import { cloudinaryConfigured, IMAGE_TYPES, UPLOAD_DIR } from "@/lib/uploads";

const MAX_BYTES = 8 * 1024 * 1024;

/**
 * With Cloudinary: returns a signed upload ticket (JSON body {mode:"sign"}); the browser uploads straight to Cloudinary.
 * Without: accepts multipart "file" and stores it on the server, served from /uploads/….
 */
export async function POST(request: Request) {
  const auth = await adminApi(request);
  if ("response" in auth) return auth.response;

  if (cloudinaryConfigured() && request.headers.get("content-type")?.includes("application/json")) {
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = "swift";
    const signature = createHash("sha1").update(`folder=${folder}&timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`).digest("hex");
    return json({
      mode: "cloudinary",
      url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
      fields: { api_key: process.env.CLOUDINARY_API_KEY, timestamp: String(timestamp), signature, folder },
    });
  }
  if (request.headers.get("content-type")?.includes("application/json")) return json({ mode: "local" });

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return error("Choose an image");
  const ext = IMAGE_TYPES[file.type];
  if (!ext) return error("Use a JPG, PNG, WebP or AVIF image");
  if (file.size > MAX_BYTES) return error("Images must be under 8 MB");

  const name = `${new Date().toISOString().slice(0, 7)}/${randomBytes(12).toString("hex")}.${ext}`;
  const dest = path.join(UPLOAD_DIR, name);
  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(dest, Buffer.from(await file.arrayBuffer()));
  return json({ url: `/uploads/${name}` }, 201);
}
