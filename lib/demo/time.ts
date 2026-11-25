/** Fechas y horarios del modo demo, siempre relativos a hoy. */

const DAYS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

export function dateFor(offset: number, now = new Date()): Date {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return d;
}

export function dayShort(offset: number): { dow: string; num: number; month: string } {
  const d = dateFor(offset);
  return { dow: DAYS[d.getDay()], num: d.getDate(), month: MONTHS[d.getMonth()] };
}

export function dayLabel(offset: number): string {
  if (offset === 0) return "Hoy";
  if (offset === 1) return "Mañana";
  if (offset === -1) return "Ayer";
  const { dow, num, month } = dayShort(offset);
  return `${dow} ${num} ${month}`;
}

/** El domingo cierran todos salvo los que van a domicilio. */
export function isClosed(offset: number, modality: string): boolean {
  return dateFor(offset).getDay() === 0 && modality !== "domicilio";
}

export function toMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function fromMinutes(n: number): string {
  return `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
}

/**
 * Horarios de 10 a 20 h cada 30 minutos (el producto real usa grilla de 15).
 * Hoy, solo con 1 h de anticipación mínima.
 */
export function slots(offset: number, taken: string[], now = new Date()): { time: string; free: boolean }[] {
  const out: { time: string; free: boolean }[] = [];
  const minNow = offset === 0 ? now.getHours() * 60 + now.getMinutes() + 60 : 0;
  for (let m = 10 * 60; m <= 19 * 60 + 30; m += 30) {
    const time = fromMinutes(m);
    out.push({ time, free: m >= minNow && !taken.includes(time) });
  }
  return out;
}

export function formatArs(value: number): string {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(value);
}

export function km(value: number): string {
  return `${value.toLocaleString("es-AR", { maximumFractionDigits: 1 })} km`;
}

/** Link de Google Calendar para "Agregar a mi calendario" (spec 08). */
export function googleCalendarUrl(title: string, offset: number, time: string, minutes: number, location: string): string {
  const start = dateFor(offset);
  const [h, m] = time.split(":").map(Number);
  start.setHours(h, m, 0, 0);
  const end = new Date(start.getTime() + minutes * 60000);
  const f = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const p = new URLSearchParams({ action: "TEMPLATE", text: title, dates: `${f(start)}/${f(end)}`, location });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}
