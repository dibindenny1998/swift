// Pure helpers shared by checkout, webhooks and admin.

export const orderLabel = (n: number) => `SW${n}`;

export function parseOrderLabel(label: string): number | null {
  const m = /^SW(\d{4,9})$/i.exec(label.trim());
  return m ? Number(m[1]) : null;
}

export type StockComponent = { variantId: string; qty: number };

/** Total units per variant across order lines (components are per unit of the line). */
export function stockNeeds(lines: { qty: number; components: StockComponent[] }[]): Map<string, number> {
  const needs = new Map<string, number>();
  for (const line of lines) {
    for (const c of line.components) needs.set(c.variantId, (needs.get(c.variantId) ?? 0) + c.qty * line.qty);
  }
  return needs;
}

export function readComponents(json: unknown): StockComponent[] {
  if (!Array.isArray(json)) return [];
  return json.filter(
    (c): c is StockComponent =>
      !!c && typeof c === "object" && typeof (c as StockComponent).variantId === "string" && Number.isInteger((c as StockComponent).qty),
  );
}
