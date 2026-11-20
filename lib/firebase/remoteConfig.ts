"use client";

import { fetchAndActivate, getRemoteConfig, getValue } from "firebase/remote-config";
import { app } from "./client";
import { MEMBERSHIP_DEFAULTS, type MembershipConfig } from "@/lib/membership";

/**
 * Precio y promo de la membresía se controlan desde Remote Config (consola de Firebase).
 * Las mismas claves las lee la landing. Ver docs/specs/11-membresia.md.
 */
export async function loadMembershipConfig(): Promise<MembershipConfig> {
  if (typeof window === "undefined") return MEMBERSHIP_DEFAULTS;
  const rc = getRemoteConfig(app);
  rc.settings.minimumFetchIntervalMillis = process.env.NODE_ENV === "production" ? 3_600_000 : 60_000;
  rc.defaultConfig = {
    membership_price_ars: MEMBERSHIP_DEFAULTS.priceArs,
    membership_promo_percent: MEMBERSHIP_DEFAULTS.promoPercent,
    membership_promo_until: "",
  };
  try {
    await fetchAndActivate(rc);
  } catch {
    // Sin conexión: se usan los valores por defecto.
  }
  return {
    priceArs: getValue(rc, "membership_price_ars").asNumber(),
    promoPercent: getValue(rc, "membership_promo_percent").asNumber(),
    promoUntil: getValue(rc, "membership_promo_until").asString() || null,
  };
}
