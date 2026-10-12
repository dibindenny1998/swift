import "server-only";

export function msg91Configured() {
  return Boolean(process.env.MSG91_AUTH_KEY && process.env.MSG91_TEMPLATE_ID);
}

/** Send a login code through MSG91's OTP API using our own generated code. */
export async function sendOtpSms(phone: string, code: string) {
  const url = new URL("https://control.msg91.com/api/v5/otp");
  url.search = new URLSearchParams({
    template_id: process.env.MSG91_TEMPLATE_ID!,
    mobile: phone.replace(/^\+/, ""),
    otp: code,
    otp_expiry: "5",
  }).toString();
  const res = await fetch(url, {
    method: "POST",
    headers: { authkey: process.env.MSG91_AUTH_KEY!, "Content-Type": "application/json" },
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as { type?: string; message?: string };
  if (!res.ok || data.type === "error") throw new Error(`MSG91: ${data.message ?? res.status}`);
}
