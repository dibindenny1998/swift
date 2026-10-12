import "server-only";

const BASE = "https://apiv2.shiprocket.in/v1/external";
let token: { value: string; expires: number } | null = null;

export function shiprocketConfigured() {
  return Boolean(process.env.SHIPROCKET_EMAIL && process.env.SHIPROCKET_PASSWORD);
}

async function getToken(): Promise<string> {
  if (token && token.expires > Date.now()) return token.value;
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: process.env.SHIPROCKET_EMAIL, password: process.env.SHIPROCKET_PASSWORD }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Shiprocket login failed (${res.status})`);
  const data = (await res.json()) as { token: string };
  // Tokens last 10 days; refresh well before that.
  token = { value: data.token, expires: Date.now() + 8 * 24 * 60 * 60 * 1000 };
  return data.token;
}

type Courier = { estimated_delivery_days?: string | number; cod?: number };

/** Courier serviceability between two pincodes. Returns null when no courier serves the route. */
export async function serviceability(pickup: string, delivery: string, weightKg: number, cod: boolean) {
  const url = new URL(`${BASE}/courier/serviceability/`);
  url.search = new URLSearchParams({
    pickup_postcode: pickup,
    delivery_postcode: delivery,
    weight: weightKg.toFixed(2),
    cod: cod ? "1" : "0",
  }).toString();
  const res = await fetch(url, { headers: { Authorization: `Bearer ${await getToken()}` }, cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Shiprocket serviceability failed (${res.status})`);
  const data = (await res.json()) as { data?: { available_courier_companies?: Courier[] } };
  const couriers = data.data?.available_courier_companies ?? [];
  if (couriers.length === 0) return null;
  const days = couriers.map((c) => Number(c.estimated_delivery_days)).filter((d) => Number.isFinite(d) && d > 0);
  return {
    minDays: days.length ? Math.min(...days) : 3,
    maxDays: days.length ? Math.max(...days) : 7,
    cod: couriers.some((c) => c.cod === 1),
  };
}

async function srPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${await getToken()}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as T & { message?: string };
  if (!res.ok) throw new Error(`Shiprocket: ${(data as { message?: string }).message ?? res.status}`);
  return data;
}

export type ShipmentRequest = {
  orderLabel: string;
  orderDate: Date;
  pickupLocation: string;
  customer: { name: string; phone: string; email: string | null; line1: string; line2: string | null; city: string; state: string; pincode: string };
  items: { name: string; sku: string; units: number; sellingPrice: number }[]; // rupees
  subTotal: number; // rupees
  cod: boolean;
  weightKg: number;
  dims: { length: number; breadth: number; height: number };
};

/** Create the Shiprocket order, assign a courier (AWB) and generate the label. */
export async function createShipment(r: ShipmentRequest) {
  const [first, ...rest] = r.customer.name.trim().split(/\s+/);
  const created = await srPost<{ order_id?: number; shipment_id?: number }>("/orders/create/adhoc", {
    order_id: r.orderLabel,
    order_date: r.orderDate.toISOString().slice(0, 16).replace("T", " "),
    pickup_location: r.pickupLocation,
    billing_customer_name: first,
    billing_last_name: rest.join(" ") || ".",
    billing_address: r.customer.line1,
    billing_address_2: r.customer.line2 ?? "",
    billing_city: r.customer.city,
    billing_pincode: r.customer.pincode,
    billing_state: r.customer.state,
    billing_country: "India",
    billing_email: r.customer.email ?? "orders@swift.in",
    billing_phone: r.customer.phone.replace(/^\+91/, ""),
    shipping_is_billing: true,
    order_items: r.items.map((i) => ({ name: i.name, sku: i.sku, units: i.units, selling_price: i.sellingPrice })),
    payment_method: r.cod ? "COD" : "Prepaid",
    sub_total: r.subTotal,
    length: r.dims.length,
    breadth: r.dims.breadth,
    height: r.dims.height,
    weight: Math.max(0.1, Number(r.weightKg.toFixed(2))),
  });
  if (!created.shipment_id) throw new Error("Shiprocket didn't return a shipment id");

  const awb = await srPost<{ awb_assign_status?: number; response?: { data?: { awb_code?: string; courier_name?: string } } }>("/courier/assign/awb", {
    shipment_id: created.shipment_id,
  });
  const awbCode = awb.response?.data?.awb_code ?? null;
  const courier = awb.response?.data?.courier_name ?? null;

  let labelUrl: string | null = null;
  try {
    const label = await srPost<{ label_url?: string }>("/courier/generate/label", { shipment_id: [created.shipment_id] });
    labelUrl = label.label_url ?? null;
  } catch {
    // label can be generated later from the Shiprocket panel
  }
  return {
    shiprocketOrderId: String(created.order_id ?? ""),
    shipmentId: String(created.shipment_id),
    awb: awbCode,
    courier,
    labelUrl,
    trackingUrl: awbCode ? `https://shiprocket.co/tracking/${awbCode}` : null,
  };
}
