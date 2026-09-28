import {
  discountPercent,
  formatPaise,
  pluralize,
  savingsPaise,
  toNumber,
} from "@/lib/format";
import { describe, expect, it } from "vitest";

describe("formatPaise", () => {
  it("formats whole-rupee paise without decimals", () => {
    expect(formatPaise(9000n)).toBe("₹90");
    expect(formatPaise(49900n)).toBe("₹499");
  });

  it("keeps paise when the amount is not a whole rupee", () => {
    expect(formatPaise(9050n)).toBe("₹90.50");
  });
});

describe("discountPercent", () => {
  it("computes the rounded percentage saved", () => {
    expect(discountPercent(12000n, 9000n)).toBe(25);
  });

  it("returns zero when there is no saving", () => {
    expect(discountPercent(9000n, 9000n)).toBe(0);
    expect(discountPercent(0n, 0n)).toBe(0);
  });
});

describe("savingsPaise", () => {
  it("returns the absolute saving and never goes negative", () => {
    expect(savingsPaise(12000n, 9000n)).toBe(3000n);
    expect(savingsPaise(9000n, 12000n)).toBe(0n);
  });
});

describe("pluralize", () => {
  it("uses the singular for one and plural otherwise", () => {
    expect(pluralize(1, "item")).toBe("1 item");
    expect(pluralize(3, "item")).toBe("3 items");
  });
});

describe("toNumber", () => {
  it("converts bigint counts to numbers", () => {
    expect(toNumber(5n)).toBe(5);
    expect(toNumber(7)).toBe(7);
  });
});
