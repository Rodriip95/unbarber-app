export type MembershipConfig = {
  /** Precio de lista de la membresía de acceso, pago único, en pesos. */
  priceArs: number;
  /** Descuento de la promo, de 0 a 100. 100 = sin cargo. */
  promoPercent: number;
  /** Fin de la promo en ISO 8601, o null si no tiene fecha. */
  promoUntil: string | null;
};

/** Valores decididos por Rodri el 20/11/2026: $20.000 con promo del 100 %. */
export const MEMBERSHIP_DEFAULTS: MembershipConfig = {
  priceArs: 20000,
  promoPercent: 100,
  promoUntil: null,
};

export function isPromoActive(cfg: MembershipConfig, now = new Date()): boolean {
  if (cfg.promoPercent <= 0) return false;
  if (!cfg.promoUntil) return true;
  const until = new Date(cfg.promoUntil);
  return Number.isNaN(until.getTime()) ? true : now <= until;
}

/** Precio que paga el barbero hoy, redondeado a pesos enteros. */
export function effectivePriceArs(cfg: MembershipConfig, now = new Date()): number {
  const pct = isPromoActive(cfg, now) ? Math.min(100, Math.max(0, cfg.promoPercent)) : 0;
  return Math.round(cfg.priceArs * (1 - pct / 100));
}

/** Formato de precio sin emojis (regla de diseño: nunca emojis en precios). */
export function formatArs(value: number): string {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(value);
}
