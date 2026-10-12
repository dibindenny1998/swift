/** Normalise an Indian mobile number to +91XXXXXXXXXX, or null if it isn't one. */
export function normalizeIndianMobile(input: string): string | null {
  const digits = input.replace(/[\s()-]/g, "").replace(/^\+/, "");
  const m = /^(?:91|0)?([6-9]\d{9})$/.exec(digits);
  return m ? `+91${m[1]}` : null;
}
