"use client";

import { adminFetch } from "./fields";

type Ticket = { mode: "cloudinary"; url: string; fields: Record<string, string> } | { mode: "local" };

/** Upload one image: straight to Cloudinary when configured, otherwise to our server. Returns the image URL. */
export async function uploadImage(file: File): Promise<string> {
  const ticket = await adminFetch<Ticket>("POST", "/api/admin/upload", { mode: "sign" });
  if (ticket.mode === "cloudinary") {
    const fd = new FormData();
    Object.entries(ticket.fields).forEach(([k, v]) => fd.append(k, v));
    fd.append("file", file);
    const res = await fetch(ticket.url, { method: "POST", body: fd });
    const data = (await res.json()) as { secure_url?: string; error?: { message?: string } };
    if (!res.ok || !data.secure_url) throw new Error(data.error?.message ?? "Upload failed");
    // Ask Cloudinary for auto format/quality on delivery.
    return data.secure_url.replace("/upload/", "/upload/f_auto,q_auto/");
  }
  const fd = new FormData();
  fd.append("file", file);
  const { url } = await adminFetch<{ url: string }>("POST", "/api/admin/upload", fd);
  return url;
}
