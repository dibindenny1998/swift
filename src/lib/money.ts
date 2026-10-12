// All money is integer paise. These helpers are the only place we convert to rupees.

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

const inrWithPaise = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** 12499900 → "₹1,24,999". Shows paise only when they are non-zero. */
export function formatINR(paise: number): string {
  const fmt = paise % 100 === 0 ? inr : inrWithPaise;
  return fmt.format(paise / 100);
}

export function rupees(r: number): number {
  return Math.round(r * 100);
}

/** Whole-number percentage saved, e.g. price 85000 vs mrp 100000 → 15. */
export function percentOff(price: number, mrp: number): number {
  if (mrp <= 0 || price >= mrp) return 0;
  return Math.floor(((mrp - price) / mrp) * 100);
}
