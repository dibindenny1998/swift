import { z } from "zod";
import { adminApi } from "@/lib/admin";
import { reminderText } from "@/lib/cart-reminder";
import { db } from "@/lib/db";
import { emailConfigured, sendEmail } from "@/lib/email";
import { error, json, readJson } from "@/lib/http";

const schema = z.object({ channel: z.enum(["email", "whatsapp"]) });
const escape = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/** Record a cart reminder; for email, also send it. (WhatsApp opens on the admin's phone with the message filled in.) */
export async function POST(request: Request, ctx: RouteContext<"/api/admin/carts/[id]/remind">) {
  const auth = await adminApi(request);
  if ("response" in auth) return auth.response;
  const parsed = schema.safeParse(await readJson(request));
  if (!parsed.success) return error("Choose email or WhatsApp");
  const { id } = await ctx.params;
  const cart = await db.cart.findUnique({
    where: { id },
    include: { user: true, items: { include: { variant: { include: { product: true } }, bundle: true } } },
  });
  if (!cart?.user) return error("Cart not found", 404);

  if (parsed.data.channel === "email") {
    if (!cart.user.email) return error("This customer hasn't given an email — use WhatsApp", 400);
    const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const items = cart.items.map((i) => i.variant?.product.title ?? i.bundle?.title ?? "an item");
    const text = reminderText({ name: cart.user.name, items, site });
    await sendEmail(
      cart.user.email,
      "Your swift.in cart is waiting 🎄",
      `<!doctype html><html><body style="font-family:Arial,sans-serif;background:#FBF7EE;padding:24px;color:#1F1B14">
<div style="max-width:520px;margin:auto;background:#fff;border:1px solid #ECE3CF;border-radius:16px;padding:24px">
<p style="font-family:Georgia,serif;font-size:24px;color:#C21F31;margin:0 0 12px">swift<i>.in</i></p>
${text.split("\n").map((l) => `<p>${escape(l)}</p>`).join("")}
<p><a href="${site}/cart" style="display:inline-block;background:#0B5E3E;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:bold">Go to my cart</a></p></div></body></html>`,
    );
    if (!emailConfigured()) {
      await db.cart.update({ where: { id }, data: { remindedAt: new Date(), updatedAt: cart.updatedAt } });
      return json({ ok: true, note: "Email isn't set up yet (no Resend key), so it was only logged on the server." });
    }
  }
  // Keep updatedAt as-is so the cart still shows how long it has been idle.
  await db.cart.update({ where: { id }, data: { remindedAt: new Date(), updatedAt: cart.updatedAt } });
  return json({ ok: true });
}
