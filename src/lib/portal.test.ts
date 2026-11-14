import { describe, it, expect } from "vitest";
import { portalPriceRub, formatMoney } from "./portal";

describe("portal pricing", () => {
  it("landing starts at 30 000 ₽", () => {
    expect(portalPriceRub({ type: "landing", style: "void", features: [], time: "std" })).toBe(30000);
  });
  it("express adds 25%", () => {
    expect(portalPriceRub({ type: "landing", style: "void", features: [], time: "fast" })).toBe(37500);
  });
  it("features add to base", () => {
    expect(portalPriceRub({ type: "corp", style: "void", features: ["3d", "cms"], time: "std" })).toBe(140000);
  });
  it("converts to AMD and USD", () => {
    expect(formatMoney(30000, "AMD")).toBe("135,000 ֏");
    expect(formatMoney(30000, "USD")).toBe("$330");
  });
});
