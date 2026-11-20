import { getRemoteConfig } from "firebase-admin/remote-config";

export type MembershipSnapshot = { priceArs: number; promoPercent: number; promoUntil: string | null };

const DEFAULTS: MembershipSnapshot = { priceArs: 20000, promoPercent: 100, promoUntil: null };

/** Lee precio y promo de Remote Config en el servidor (no se confía en el valor del navegador). */
export async function readMembershipConfig(): Promise<MembershipSnapshot> {
  try {
    const t = await getRemoteConfig().getTemplate();
    const val = (k: string) => {
      const d = t.parameters[k]?.defaultValue;
      return d && "value" in d ? d.value : undefined;
    };
    const price = Number(val("membership_price_ars"));
    const promo = Number(val("membership_promo_percent"));
    const until = val("membership_promo_until");
    return {
      priceArs: Number.isFinite(price) ? price : DEFAULTS.priceArs,
      promoPercent: Number.isFinite(promo) ? promo : DEFAULTS.promoPercent,
      promoUntil: until ? until : null,
    };
  } catch {
    return DEFAULTS;
  }
}

export function promoActive(c: MembershipSnapshot, now = new Date()): boolean {
  if (c.promoPercent <= 0) return false;
  if (!c.promoUntil) return true;
  const d = new Date(c.promoUntil);
  return Number.isNaN(d.getTime()) || now <= d;
}
