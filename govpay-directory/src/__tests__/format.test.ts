import { describe, it, expect } from "vitest";
import { formatCurrency, formatNumber } from "@/lib/format";

describe("formatCurrency", () => {
  it("formats a standard salary", () => {
    expect(formatCurrency(85000)).toBe("$85,000");
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("$0");
  });

  it("rounds down fractional cents", () => {
    expect(formatCurrency(85000.49)).toBe("$85,000");
  });

  it("rounds up fractional cents", () => {
    expect(formatCurrency(85000.5)).toBe("$85,001");
  });

  it("formats large salaries with commas", () => {
    expect(formatCurrency(159012)).toBe("$159,012");
  });

  it("formats negative values", () => {
    expect(formatCurrency(-5000)).toBe("-$5,000");
  });
});

describe("formatNumber", () => {
  it("returns raw number for values under 1000", () => {
    expect(formatNumber(999)).toBe("999");
  });

  it("formats thousands with K suffix", () => {
    expect(formatNumber(1500)).toBe("2K");
  });

  it("formats exact thousands", () => {
    expect(formatNumber(5000)).toBe("5K");
  });

  it("formats millions with M suffix", () => {
    expect(formatNumber(2300000)).toBe("2.3M");
  });

  it("formats exactly one million", () => {
    expect(formatNumber(1000000)).toBe("1.0M");
  });

  it("handles zero", () => {
    expect(formatNumber(0)).toBe("0");
  });
});
