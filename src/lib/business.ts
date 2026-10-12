import "server-only";
import { formatINR } from "./money";
import { getSettings } from "./settings-server";

/** Settings formatted for the info/policy pages. */
export async function businessInfo() {
  const s = await getSettings();
  const lastOrder = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", timeZone: "Asia/Kolkata" }).format(new Date(`${s.lastOrderDate}T12:00:00+05:30`));
  const wa = s.whatsappNumber.replace(/\D/g, "");
  return {
    s,
    name: s.businessName,
    address: s.businessAddress,
    gstin: s.gstin,
    email: s.supportEmail,
    hours: s.supportHours,
    grievance: s.grievanceOfficer,
    whatsapp: wa ? { display: s.whatsappNumber, href: `https://wa.me/${wa}` } : null,
    freeShipping: formatINR(s.freeShippingThreshold),
    shippingFee: formatINR(s.shippingFee),
    codFee: s.codFee > 0 ? formatINR(s.codFee) : null,
    codEnabled: s.codEnabled,
    lastOrder,
  };
}
