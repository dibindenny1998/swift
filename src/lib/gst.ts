/** Split a GST-inclusive amount (paise) into taxable value and tax. Intra-state → CGST + SGST, inter-state → IGST. */
export function gstBreakdown(inclusive: number, ratePercent: number, intraState: boolean) {
  const taxable = Math.round((inclusive * 100) / (100 + ratePercent));
  const tax = inclusive - taxable;
  if (intraState) {
    const cgst = Math.floor(tax / 2);
    return { taxable, cgst, sgst: tax - cgst, igst: 0, tax };
  }
  return { taxable, cgst: 0, sgst: 0, igst: tax, tax };
}
