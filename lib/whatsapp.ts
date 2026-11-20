export type WhatsAppOrigin = "ahora" | "coordinar" | "mis_barberos" | "alerta" | "turno";

/** Link wa.me con mensaje precargado. `phoneE164` en formato +549… */
export function waLink(phoneE164: string, text: string): string {
  const number = phoneE164.replace(/\D/g, "");
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export function waMessage(
  origin: WhatsAppOrigin,
  p: { barberName?: string; clientName?: string; area?: string; service?: string; when?: string; link?: string },
): string {
  switch (origin) {
    case "ahora":
      return `Hola ${p.barberName}, te encontré en Unbarber. ¿Podés atenderme ahora? Estoy en ${p.area}.`;
    case "coordinar":
      return `Hola ${p.barberName}, te encontré en Unbarber. Quiero sacar turno para ${p.service}. ¿Qué día tenés?`;
    case "mis_barberos":
      return `Hola ${p.barberName}, ¿tenés lugar para un corte?`;
    case "alerta":
      return `Hola ${p.clientName}, vi tu alerta en Unbarber. Puedo atenderte ${p.when}. Estoy en ${p.area}.`;
    case "turno":
      return `Hola ${p.barberName}, te pedí turno por Unbarber para ${p.when}. Aceptalo acá: ${p.link}`;
  }
}
