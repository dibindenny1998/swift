import "server-only";
import { z } from "zod";
import { addressSchema } from "./address-schema";
import { db } from "./db";
import { orderLabel, stockNeeds, type StockComponent } from "./order-utils";
import { CheckoutError, sendOrderEmails, takeStock, type AddressSnapshot } from "./orders";
import { normalizeIndianMobile } from "./phone";
import { bundlePrice } from "./pricing";
import { getSettings } from "./settings-server";

export const manualOrderSchema = z.object({
  phone: z.string().transform((v, ctx) => {
    const n = normalizeIndianMobile(v);
    if (!n) ctx.addIssue({ code: "custom", message: "Enter the customer's 10-digit mobile number" });
    return n ?? "";
  }),
  name: z.string().trim().min(2, "Enter the customer's name").max(80),
  email: z.union([z.email("That email doesn't look right").max(254), z.literal("")]).optional(),
  address: addressSchema.omit({ isDefault: true }),
  items: z
    .array(z.object({ variantId: z.string().optional(), bundleId: z.string().optional(), qty: z.number().int().min(1).max(50) }))
    .min(1, "Add at least one item"),
  payment: z.enum(["COD", "OFFLINE"]),
  paymentRef: z.string().trim().max(120).optional(), // UPI ref / "cash" — shown in the order history
  discount: z.number().int().min(0).default(0), // paise
  shipping: z.union([z.literal("auto"), z.number().int().min(0)]).default("auto"), // paise
  codFee: z.boolean().default(true),
  giftWrap: z.boolean().default(false),
  giftMessage: z.string().trim().max(200).optional(),
});
export type ManualOrderInput = z.infer<typeof manualOrderSchema>;

/** An order taken over WhatsApp / phone and entered by staff. Prices come from the catalogue; stock is reserved now. */
export async function createManualOrder(input: ManualOrderInput, by: string) {
  const settings = await getSettings();

  // Price every line from current data.
  const lines: { variantId: string | null; bundleId: string | null; title: string; detail: string | null; unitPrice: number; qty: number; components: StockComponent[] }[] = [];
  for (const it of input.items) {
    if (it.variantId) {
      const v = await db.variant.findUnique({ where: { id: it.variantId }, include: { product: { include: { _count: { select: { variants: true } } } } } });
      if (!v) throw new CheckoutError("One of the items no longer exists", 400);
      lines.push({ variantId: v.id, bundleId: null, title: v.product.title, detail: v.product._count.variants > 1 ? v.name : null, unitPrice: v.price, qty: it.qty, components: [{ variantId: v.id, qty: 1 }] });
    } else if (it.bundleId) {
      const b = await db.bundle.findUnique({ where: { id: it.bundleId }, include: { items: { include: { variant: { include: { product: true } } } } } });
      if (!b || b.type !== "FIXED") throw new CheckoutError("That kit can't be added to a manual order", 400);
      const { price } = bundlePrice(b.items.map((i) => ({ price: i.variant.price, qty: i.qty })), b.discountType, b.discountValue);
      lines.push({
        variantId: null,
        bundleId: b.id,
        title: b.title,
        detail: b.items.map((i) => `${i.qty > 1 ? `${i.qty} × ` : ""}${i.variant.product.title}`).join(", "),
        unitPrice: price,
        qty: it.qty,
        components: b.items.map((i) => ({ variantId: i.variantId, qty: i.qty })),
      });
    }
  }
  if (!lines.length) throw new CheckoutError("Add at least one item", 400);

  const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.qty, 0);
  const discount = Math.min(input.discount, subtotal);
  const afterDiscount = subtotal - discount;
  const shipping = input.shipping === "auto" ? (afterDiscount >= settings.freeShippingThreshold ? 0 : settings.shippingFee) : input.shipping;
  const codFee = input.payment === "COD" && input.codFee ? settings.codFee : 0;
  const giftWrap = input.giftWrap ? settings.giftWrapPrice : 0;
  const total = afterDiscount + shipping + codFee + giftWrap;

  // Find or create the customer by phone.
  const email = input.email || null;
  let user = await db.user.findUnique({ where: { phone: input.phone } });
  if (user && user.role !== "CUSTOMER") throw new CheckoutError("That number belongs to a staff account", 400);
  if (!user) user = await db.user.create({ data: { phone: input.phone, name: input.name } });
  else if (!user.name) user = await db.user.update({ where: { id: user.id }, data: { name: input.name } });
  if (email && !user.email && !(await db.user.findFirst({ where: { email }, select: { id: true } }))) {
    await db.user.update({ where: { id: user.id }, data: { email } });
  }

  const a = input.address;
  const snapshot: AddressSnapshot = { name: a.name, phone: a.phone, line1: a.line1, line2: a.line2, city: a.city, state: a.state, pincode: a.pincode, email };
  const paidHow = input.payment === "OFFLINE" ? `Paid offline${input.paymentRef ? ` — ${input.paymentRef}` : ""}` : "Cash on delivery";

  const order = await db.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        user: { connect: { id: user.id } },
        source: "MANUAL",
        status: "PAID", // staff took the order, so it's confirmed straight away
        events: {
          create: [
            { status: "PENDING", note: `Manual order entered by ${by}` },
            { status: "PAID", note: `Confirmed · ${paidHow}` },
          ],
        },
        addressSnapshot: snapshot,
        paymentMethod: input.payment,
        subtotal,
        discount,
        discountNote: discount ? "Manual discount" : null,
        shipping,
        codFee,
        giftWrap,
        giftWrapped: input.giftWrap,
        giftMessage: input.giftWrap ? input.giftMessage || null : null,
        total,
        items: {
          create: lines.map((l) => ({
            variantId: l.variantId,
            bundleId: l.bundleId,
            titleSnapshot: l.title,
            detailSnapshot: l.detail,
            priceSnapshot: l.unitPrice,
            qty: l.qty,
            components: l.components,
          })),
        },
      },
    });
    const short = await takeStock(tx, stockNeeds(lines.map((l) => ({ qty: l.qty, components: l.components }))));
    if (short.length) {
      const names = await tx.variant.findMany({ where: { id: { in: short } }, include: { product: { select: { title: true } } } });
      throw new CheckoutError(`Not enough stock: ${names.map((v) => `${v.product.title}${v.name !== "Default" ? ` (${v.name})` : ""} — ${v.stock} left`).join(", ")}`);
    }
    // Remember the address for next time.
    const same = await tx.address.findFirst({ where: { userId: user.id, line1: a.line1, pincode: a.pincode } });
    if (!same) {
      const hasAny = await tx.address.count({ where: { userId: user.id } });
      await tx.address.create({ data: { userId: user.id, name: a.name, phone: a.phone, line1: a.line1, line2: a.line2, city: a.city, state: a.state, pincode: a.pincode, isDefault: hasAny === 0 } });
    }
    return order;
  });

  // Customer gets the usual confirmation email if we have their address; the team already knows.
  void sendOrderEmails(order.id, "paid", [], { notifyAdmin: false });
  return { id: order.id, label: orderLabel(order.number) };
}
