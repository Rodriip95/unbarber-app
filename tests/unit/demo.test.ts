import { describe, expect, it } from "vitest";
import { dayLabel, fromMinutes, slots, toMinutes } from "@/lib/demo/time";

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
