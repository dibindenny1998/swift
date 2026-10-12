import { addressSchema } from "@/lib/address-schema";
import { db } from "@/lib/db";
import { error, json, readJson, sameOrigin } from "@/lib/http";
import { getSession } from "@/lib/session";

const MAX_ADDRESSES = 10;

export async function GET() {
  const session = await getSession();
  if (!session) return error("Sign in first", 401);
  const addresses = await db.address.findMany({ where: { userId: session.uid }, orderBy: [{ isDefault: "desc" }, { id: "desc" }] });
  return json({ addresses });
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return error("Forbidden", 403);
  const session = await getSession();
  if (!session) return error("Sign in first", 401);
  const parsed = addressSchema.safeParse(await readJson(request));
  if (!parsed.success) return json({ error: parsed.error.issues[0]?.message, fields: parsed.error.flatten().fieldErrors }, 400);

  const count = await db.address.count({ where: { userId: session.uid } });
  if (count >= MAX_ADDRESSES) return error(`You can save up to ${MAX_ADDRESSES} addresses`);
  const makeDefault = parsed.data.isDefault || count === 0;
  const address = await db.$transaction(async (tx) => {
    if (makeDefault) await tx.address.updateMany({ where: { userId: session.uid }, data: { isDefault: false } });
    return tx.address.create({ data: { ...parsed.data, isDefault: makeDefault, userId: session.uid } });
  });
  return json({ address }, 201);
}
