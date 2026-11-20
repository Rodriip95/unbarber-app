import { describe, expect, it } from "vitest";
import { normalizeArMobile } from "@/lib/phone";
import { effectivePriceArs, MEMBERSHIP_DEFAULTS } from "@/lib/membership";
import { waLink, waMessage } from "@/lib/whatsapp";
import { displayDistanceKm } from "@/lib/geo";

describe("normalizeArMobile", () => {
  it.each([
    ["11 15 2345-6789", "+5491123456789"],
    ["011 2345 6789", "+5491123456789"],
    ["+54 9 11 2345-6789", "+5491123456789"],
    ["0351 15 456-7890", "+5493514567890"],
    ["5491123456789", "+5491123456789"],
  ])("%s → %s", (input, out) => expect(normalizeArMobile(input)).toBe(out));
  it("rechaza números cortos", () => expect(normalizeArMobile("1234")).toBeNull());
});

describe("membresía", () => {
  it("con promo 100 % es sin cargo", () => expect(effectivePriceArs(MEMBERSHIP_DEFAULTS)).toBe(0));
  it("sin promo cobra el precio de lista", () =>
    expect(effectivePriceArs({ ...MEMBERSHIP_DEFAULTS, promoPercent: 0 })).toBe(20000));
  it("promo vencida cobra el precio de lista", () =>
    expect(
      effectivePriceArs({ ...MEMBERSHIP_DEFAULTS, promoUntil: "2027-01-01T00:00:00-03:00" }, new Date("2027-02-01")),
    ).toBe(20000));
  it("promo parcial", () => expect(effectivePriceArs({ ...MEMBERSHIP_DEFAULTS, promoPercent: 50 })).toBe(10000));
});

describe("whatsapp", () => {
  it("arma el link con el mensaje codificado", () => {
    const msg = waMessage("ahora", { barberName: "Matías", area: "Palermo" });
    expect(waLink("+5491123456789", msg)).toBe(`https://wa.me/5491123456789?text=${encodeURIComponent(msg)}`);
  });
});

describe("geo", () => {
  it("redondea distancias a 0,5 km", () => {
    expect(displayDistanceKm(1.26)).toBe(1.5);
    expect(displayDistanceKm(0.1)).toBe(0.5);
  });
});
