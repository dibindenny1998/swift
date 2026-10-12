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
