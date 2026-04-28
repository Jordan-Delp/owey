import { describe, it, expect } from "vitest";
import { calculateSettlement } from "./settlement";

describe("calculateSettlement", () => {

  it("returns empty object when no items are claimed", () => {
    const result = calculateSettlement(
      [{ id: "1", price: 10, claims: [] }],
      2,
      3
    );
    expect(result).toEqual({});
  });

  it("assigns full item price to sole claimer", () => {
    const result = calculateSettlement(
      [{ id: "1", price: 20, claims: [{ userId: "alice" }] }],
      0,
      0
    );
    expect(result["alice"].subtotal).toBe(20);
    expect(result["alice"].total).toBe(20);
  });

  it("splits shared item evenly between two claimers", () => {
    const result = calculateSettlement(
      [{ id: "1", price: 30, claims: [{ userId: "alice" }, { userId: "bob" }] }],
      0,
      0
    );
    expect(result["alice"].subtotal).toBe(15);
    expect(result["bob"].subtotal).toBe(15);
  });

  it("distributes tax and tip proportionally", () => {
    // alice has $20, bob has $10 — alice should pay 2/3 of tax/tip
    const result = calculateSettlement(
      [
        { id: "1", price: 20, claims: [{ userId: "alice" }] },
        { id: "2", price: 10, claims: [{ userId: "bob" }] },
      ],
      6,   // tax
      3    // tip
    );
    expect(result["alice"].tax).toBeCloseTo(4);   // 2/3 of $6
    expect(result["alice"].tip).toBeCloseTo(2);   // 2/3 of $3
    expect(result["bob"].tax).toBeCloseTo(2);     // 1/3 of $6
    expect(result["bob"].tip).toBeCloseTo(1);     // 1/3 of $3
  });

  it("calculates correct total as sum of subtotal + tax + tip", () => {
    const result = calculateSettlement(
      [{ id: "1", price: 100, claims: [{ userId: "alice" }] }],
      10,
      5
    );
    expect(result["alice"].total).toBeCloseTo(115);
  });

});