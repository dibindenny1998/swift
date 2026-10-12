import { describe, expect, it } from "vitest";
import { csvObjects, parseCsv, slugify } from "@/lib/csv";

describe("parseCsv", () => {
  it("handles quotes, commas, newlines and CRLF", () => {
    const text = 'a,b,c\r\n"x, y","he said ""hi""","line1\nline2"\r\n\r\n1,2,3';
    expect(parseCsv(text)).toEqual([
      ["a", "b", "c"],
      ["x, y", 'he said "hi"', "line1\nline2"],
      ["1", "2", "3"],
    ]);
  });
  it("maps rows to objects by normalised header", () => {
    expect(csvObjects("Variant Name,SKU\n5 ft,TRE-5\n")).toEqual([{ variant_name: "5 ft", sku: "TRE-5" }]);
  });
  it("strips a BOM", () => {
    expect(parseCsv("﻿slug\nx")).toEqual([["slug"], ["x"]]);
  });
});

describe("slugify", () => {
  it("makes URL-safe slugs", () => {
    expect(slugify("Cinnamon & Pine Candle!")).toBe("cinnamon-and-pine-candle");
    expect(slugify("  Crème Brûlée  ")).toBe("creme-brulee");
  });
});

import { couponStatus } from "@/lib/coupon-status";

describe("couponStatus", () => {
  const now = new Date("2026-11-20T00:00:00Z");
  const base = { isActive: true, startsAt: null, endsAt: null, usageLimit: null };
  it("derives status from flags, dates and usage", () => {
    expect(couponStatus(base, 0, now)).toBe("active");
    expect(couponStatus({ ...base, isActive: false }, 0, now)).toBe("disabled");
    expect(couponStatus({ ...base, startsAt: new Date("2026-12-01") }, 0, now)).toBe("scheduled");
    expect(couponStatus({ ...base, endsAt: new Date("2026-11-01") }, 0, now)).toBe("expired");
    expect(couponStatus({ ...base, usageLimit: 10 }, 10, now)).toBe("used up");
  });
});

import { gstBreakdown } from "@/lib/gst";

describe("gstBreakdown", () => {
  it("splits inclusive prices into taxable value and tax", () => {
    expect(gstBreakdown(118000, 18, false)).toEqual({ taxable: 100000, cgst: 0, sgst: 0, igst: 18000, tax: 18000 });
    expect(gstBreakdown(118000, 18, true)).toEqual({ taxable: 100000, cgst: 9000, sgst: 9000, igst: 0, tax: 18000 });
  });
  it("never loses a paisa to rounding", () => {
    const g = gstBreakdown(69900, 12, true);
    expect(g.taxable + g.cgst + g.sgst).toBe(69900);
  });
});
