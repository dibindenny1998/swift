import { adminApi } from "@/lib/admin";
import { db } from "@/lib/db";
import { error, json } from "@/lib/http";
import { normalizeIndianMobile } from "@/lib/phone";

/** Manual orders: find a returning customer by phone, with their saved addresses. */
export async function GET(request: Request) {
  const auth = await adminApi(request);
  if ("response" in auth) return auth.response;
  const phone = normalizeIndianMobile(new URL(request.url).searchParams.get("phone") ?? "");
  if (!phone) return error("Enter a 10-digit mobile number");
  const user = await db.user.findUnique({
    where: { phone },
    select: { name: true, email: true, role: true, _count: { select: { orders: true } }, addresses: { orderBy: [{ isDefault: "desc" }, { id: "desc" }], take: 5 } },
  });
  if (!user || user.role !== "CUSTOMER") return json({ customer: null });
  return json({
    customer: {
      name: user.name,
      email: user.email,
      orders: user._count.orders,
      addresses: user.addresses.map((a) => ({ name: a.name, phone: a.phone, line1: a.line1, line2: a.line2 ?? "", city: a.city, state: a.state, pincode: a.pincode })),
    },
  });
}
