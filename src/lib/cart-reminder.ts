// The abandoned-cart nudge, shared by the WhatsApp link (client) and the email (server).

export function reminderText(o: { name: string | null; items: string[]; site: string; lastOrderDate?: string }) {
  const first = o.name?.trim().split(/\s+/)[0];
  const what = o.items.length <= 2 ? o.items.join(" and ") : `${o.items.slice(0, 2).join(", ")} and ${o.items.length - 2} more`;
  return [
    `Hi${first ? ` ${first}` : ""}! You left ${what} in your swift.in cart 🎄`,
    `It's saved for you — finish your order here: ${o.site}/cart`,
    o.lastOrderDate ? `Order by ${o.lastOrderDate} for delivery before Christmas.` : "",
    "Reply here if you have any questions.",
  ]
    .filter(Boolean)
    .join("\n");
}

/** wa.me link with the message filled in (Indian numbers: +91XXXXXXXXXX → 91XXXXXXXXXX). */
export const whatsappLink = (phone: string, text: string) => `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
