import { describe, expect, it } from "vitest";
import { calcPrice } from "./pricing";

describe("calcPrice", () => {
  it("returns base price with no capabilities and neutral scope", () => {
    expect(calcPrice({ type: "landing", style: "void", capabilities: [], scope: "standard" })).toBe(30000);
  });

  it("adds capability costs", () => {
    expect(calcPrice({ type: "landing", style: "void", capabilities: ["3d", "cms"], scope: "standard" })).toBe(90000);
  });

  it("applies scope multiplier", () => {
    expect(calcPrice({ type: "corp", style: "void", capabilities: [], scope: "premium" })).toBe(100000);
    expect(calcPrice({ type: "corp", style: "void", capabilities: [], scope: "sprint" })).toBe(92000);
  });

  it("ignores unknown ids gracefully", () => {
    expect(calcPrice({ type: "nope", style: "void", capabilities: ["nope"], scope: "nope" })).toBe(0);
  });
});
