/** Guarda rol pedido y UTM de la landing hasta que el usuario termine el onboarding. */
const KEY = "unbarber.attribution";
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

export type Attribution = { role?: "client" | "barber"; utm: Partial<Record<(typeof UTM_KEYS)[number], string>> };

export function captureAttribution(params: URLSearchParams): Attribution {
  const rol = params.get("rol");
  const attr: Attribution = {
    role: rol === "barbero" ? "barber" : rol === "cliente" ? "client" : undefined,
    utm: {},
  };
  for (const k of UTM_KEYS) {
    const v = params.get(k);
    if (v) attr.utm[k] = v.slice(0, 100);
  }
  try {
    localStorage.setItem(KEY, JSON.stringify(attr));
  } catch {}
  return attr;
}

export function readAttribution(): Attribution | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Attribution) : null;
  } catch {
    return null;
  }
}
