import { describe, expect, it } from "vitest";
import { dayLabel, fromMinutes, slots, toMinutes } from "@/lib/demo/time";
import { initialState, reducer } from "@/lib/demo/store";

describe("modo demo · horarios", () => {
  it("convierte horas y minutos", () => {
    expect(toMinutes("10:30")).toBe(630);
    expect(fromMinutes(630)).toBe("10:30");
  });
  it("marca ocupados los horarios tomados", () => {
    const grid = slots(1, ["11:00"]);
    expect(grid.find((s) => s.time === "11:00")?.free).toBe(false);
    expect(grid.find((s) => s.time === "11:30")?.free).toBe(true);
  });
  it("hoy pide 1 h de anticipación", () => {
    const noon = new Date();
    noon.setHours(12, 0, 0, 0);
    const grid = slots(0, [], noon);
    expect(grid.find((s) => s.time === "12:30")?.free).toBe(false);
    expect(grid.find((s) => s.time === "13:00")?.free).toBe(true);
  });
  it("nombra hoy y mañana", () => {
    expect(dayLabel(0)).toBe("Hoy");
    expect(dayLabel(1)).toBe("Mañana");
  });
});

describe("modo demo · aviso de zona", () => {
  const base = { ...initialState, role: "client" as const, stack: [{ id: "ahora" as const }, { id: "alerta" as const }] };

  it("al mandar el aviso vuelve a la home", () => {
    const s = reducer(base, { t: "sendAlert", service: "Corte", when: "Lo antes posible" });
    expect(s.alert).toMatchObject({ status: "sent", service: "Corte" });
    expect(s.stack).toEqual([{ id: "c-home" }]);
  });

  it("confirmar crea un turno de hoy con el barbero que aceptó", () => {
    let s = reducer(base, { t: "sendAlert", service: "Barba", when: "Lo antes posible" });
    s = reducer(s, { t: "alertAnswered" });
    expect(s.alert.status).toBe("answered");
    const now = new Date();
    now.setHours(14, 7, 0, 0);
    s = reducer(s, { t: "confirmAlert", now });
    const appt = s.appointments.at(-1)!;
    expect(s.alert.status).toBe("none");
    // Kevin no hace barba sola: cae en su primer servicio. 14:07 + 20 min → 14:30.
    expect(appt).toMatchObject({ barberId: "kevin", clientId: "me", day: 0, time: "14:30", status: "confirmed", origin: "ahora", serviceId: "corte" });
  });

  it("no acepta un aviso cancelado", () => {
    const s = reducer(base, { t: "alertAnswered" });
    expect(s.alert.status).toBe("none");
  });
});
