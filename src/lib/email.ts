import "server-only";
import { paymentLabel, type PaymentMethod } from "./order-status";

export function emailConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

/** Send through Resend. Without a key the message is logged instead, so nothing breaks in dev. */
export async function sendEmail(to: string, subject: string, html: string) {
  if (!emailConfigured()) {
    console.info(`[email:dev] to=${to} subject="${subject}"`);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.EMAIL_FROM ?? "swift.in <orders@swift.in>", to, subject, html }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text().catch(() => "")}`);
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export type EmailOrder = {
  label: string;
  name: string;
  items: { title: string; detail: string | null; qty: number; price: number }[];
  subtotal: number;
  discount: number;
  shipping: number;
  codFee: number;
  giftWrap: number;
  total: number;
  paymentMethod: PaymentMethod;
  address: string;
  url: string;
};

const inr = (p: number) => `₹${new Intl.NumberFormat("en-IN").format(Math.round(p / 100))}`;

/** Simple, table-based email that renders in Gmail/Outlook. */
export function orderEmailHtml(o: EmailOrder, heading: string, intro: string) {
  const rows = o.items
    .map(
      (i) => `<tr><td style="padding:8px 0;border-bottom:1px solid #E6DCC4">${esc(i.title)}${i.qty > 1 ? ` × ${i.qty}` : ""}${
        i.detail ? `<br><span style="color:#6B6352;font-size:13px">${esc(i.detail)}</span>` : ""
      }</td><td style="padding:8px 0;border-bottom:1px solid #E6DCC4;text-align:right;white-space:nowrap">${inr(i.price * i.qty)}</td></tr>`,
    )
    .join("");
  const line = (label: string, value: string) =>
    `<tr><td style="padding:4px 0;color:#6B6352">${label}</td><td style="padding:4px 0;text-align:right">${value}</td></tr>`;
  return `<!doctype html><html><body style="margin:0;background:#FBF7EE;font-family:Arial,sans-serif;color:#1F1B14">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#FBF7EE"><tr><td align="center" style="padding:24px 12px">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border:1px solid #ECE3CF;border-radius:16px;overflow:hidden">
<tr><td style="background:#C21F31;padding:20px;text-align:center;font-family:Georgia,serif;font-size:26px;color:#F3DC98">swift<i style="color:#FBF7EE">.in</i></td></tr>
<tr><td style="padding:24px">
<h1 style="margin:0 0 8px;font-family:Georgia,serif;font-weight:normal;color:#0A3D29;font-size:24px">${esc(heading)}</h1>
<p style="margin:0 0 16px;color:#6B6352">${esc(intro)}</p>
<p style="margin:0 0 16px"><b>Order ${esc(o.label)}</b></p>
<table width="100%" cellpadding="0" cellspacing="0" style="font-size:15px">${rows}</table>
<table width="100%" cellpadding="0" cellspacing="0" style="font-size:15px;margin-top:12px">
${line("Subtotal", inr(o.subtotal))}${o.discount ? line("Discount", `−${inr(o.discount)}`) : ""}${line("Shipping", o.shipping ? inr(o.shipping) : "Free")}${
    o.giftWrap ? line("Gift wrap", inr(o.giftWrap)) : ""
  }${o.codFee ? line("Cash on delivery fee", inr(o.codFee)) : ""}
<tr><td style="padding:8px 0;font-weight:bold;border-top:1px solid #E6DCC4">Total</td><td style="padding:8px 0;font-weight:bold;text-align:right;border-top:1px solid #E6DCC4">${inr(o.total)}</td></tr>
</table>
<p style="margin:16px 0 4px;color:#6B6352;font-size:13px">${paymentLabel(o.paymentMethod)} · prices include GST</p>
<p style="margin:0 0 16px;color:#6B6352;font-size:13px">Delivering to: ${esc(o.address)}</p>
<p style="margin:0"><a href="${esc(o.url)}" style="display:inline-block;background:#0B5E3E;color:#FBF7EE;text-decoration:none;padding:12px 24px;border-radius:999px;font-weight:bold">View your order</a></p>
</td></tr></table></td></tr></table></body></html>`;
}
