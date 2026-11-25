"use client";

/**
 * Estado del modo demo: sesión simulada, rol, turnos, bandeja y navegación.
 * Vive en memoria y se guarda en localStorage (si el navegador lo permite) para que
 * el recorrido sobreviva a un refresco. Nada sale del navegador: no hay Firebase acá.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from "react";
import {
  BARBERS,
  CLIENTS,
  INITIAL_APPOINTMENTS,
  INITIAL_INBOX,
  SELF_BARBER_ID,
  selfBarber,
  type Appointment,
  type ApptStatus,
  type Barber,
  type InboxItem,
  type Role,
} from "./data";

export type Screen =
  | { id: "login" }
  | { id: "terms" }
  | { id: "role" }
  | { id: "c-home" }
  | { id: "c-search" }
  | { id: "c-turnos" }
  | { id: "c-perfil" }
  | { id: "ahora" }
  | { id: "alerta" }
  | { id: "barber"; barberId: string }
  | { id: "book"; barberId: string; serviceId?: string }
  | { id: "book-done"; apptId: string }
  | { id: "rate"; apptId: string }
  | { id: "b-inbox" }
  | { id: "b-agenda" }
  | { id: "b-clients" }
  | { id: "b-perfil" }
  | { id: "b-client"; clientId: string }
  | { id: "b-new-appt"; clientId?: string }
  | { id: "b-membership" }
  | { id: "b-rate-client"; clientId: string; apptId?: string };

export type WaSheet = { to: string; text: string } | null;

type State = {
  account: { name: string; email: string; initials: string } | null;
  termsAccepted: boolean;
  role: Role | null;
  stack: Screen[];
  appointments: Appointment[];
  inbox: InboxItem[];
  myBarbers: string[];
  availableNow: { on: boolean; until: string | null };
  membership: "trial" | "active";
  alert: { status: "none" | "sent" | "answered"; barberId?: string };
  toast: string | null;
  wa: WaSheet;
  seq: number;
};

const START: Screen = { id: "login" };

export const initialState: State = {
  account: null,
  termsAccepted: false,
  role: null,
  stack: [START],
  appointments: INITIAL_APPOINTMENTS,
  inbox: INITIAL_INBOX,
  myBarbers: ["martin", "tano"],
  availableNow: { on: false, until: null },
  membership: "trial",
  alert: { status: "none" },
  toast: null,
  wa: null,
  seq: 1,
};

type Action =
  | { t: "login"; account: NonNullable<State["account"]> }
  | { t: "logout" }
  | { t: "acceptTerms" }
  | { t: "setRole"; role: Role }
  | { t: "go"; screen: Screen }
  | { t: "tab"; screen: Screen }
  | { t: "back" }
  | { t: "toast"; text: string | null }
  | { t: "wa"; sheet: WaSheet }
  | { t: "requestAppt"; appt: Omit<Appointment, "id" | "status">; then: "done" | "agenda" }
  | { t: "setStatus"; apptId: string; status: ApptStatus; toast?: string }
  | { t: "rated"; apptId: string }
  | { t: "dismiss"; inboxId: string; toast?: string }
  | { t: "toggleFav"; barberId: string }
  | { t: "available"; on: boolean; until: string | null }
  | { t: "activateMembership" }
  | { t: "sendAlert" }
  | { t: "alertAnswered" }
  | { t: "resetAlert" }
  | { t: "reset" }
  | { t: "hydrate"; state: State };

function homeFor(role: Role): Screen {
  return role === "barber" ? { id: "b-inbox" } : { id: "c-home" };
}

function reducer(s: State, a: Action): State {
  switch (a.t) {
    case "login":
      return { ...s, account: a.account, stack: [s.termsAccepted ? (s.role ? homeFor(s.role) : { id: "role" }) : { id: "terms" }] };
    case "logout":
      return { ...s, account: null, stack: [START], toast: "Cerraste sesión" };
    case "acceptTerms":
      return { ...s, termsAccepted: true, stack: [{ id: "role" }] };
    case "setRole":
      return { ...s, role: a.role, stack: [homeFor(a.role)] };
    case "go":
      return { ...s, stack: [...s.stack, a.screen] };
    case "tab":
      return { ...s, stack: [a.screen] };
    case "back":
      return s.stack.length > 1 ? { ...s, stack: s.stack.slice(0, -1) } : s;
    case "toast":
      return { ...s, toast: a.text };
    case "wa":
      return { ...s, wa: a.sheet };
    case "requestAppt": {
      const id = `n${s.seq}`;
      const status: ApptStatus = a.appt.origin === "manual" ? "confirmed" : "requested";
      const appointments = [...s.appointments, { ...a.appt, id, status }];
      const next: Screen = a.then === "done" ? { id: "book-done", apptId: id } : { id: "b-agenda" };
      const stack = a.then === "done" ? [...s.stack.filter((x) => x.id !== "book"), next] : [next];
      return { ...s, appointments, seq: s.seq + 1, stack, toast: a.then === "agenda" ? "Turno cargado en tu agenda" : null };
    }
    case "setStatus":
      return {
        ...s,
        appointments: s.appointments.map((x) => (x.id === a.apptId ? { ...x, status: a.status } : x)),
        inbox: s.inbox.filter((i) => i.apptId !== a.apptId),
        toast: a.toast ?? s.toast,
      };
    case "rated":
      return { ...s, appointments: s.appointments.map((x) => (x.id === a.apptId ? { ...x, rated: true } : x)) };
    case "dismiss":
      return { ...s, inbox: s.inbox.filter((i) => i.id !== a.inboxId), toast: a.toast ?? s.toast };
    case "toggleFav": {
      const has = s.myBarbers.includes(a.barberId);
      return {
        ...s,
        myBarbers: has ? s.myBarbers.filter((x) => x !== a.barberId) : [...s.myBarbers, a.barberId],
        toast: has ? "Lo sacaste de Mis barberos" : "Agregado a Mis barberos",
      };
    }
    case "available":
      return {
        ...s,
        availableNow: { on: a.on, until: a.until },
        toast: a.on ? "Estás visible para clientes cerca" : "Ya no aparecés en la lista de ahora",
      };
    case "activateMembership":
      return { ...s, membership: "active", toast: "Membresía activa" };
    case "sendAlert":
      return { ...s, alert: { status: "sent" } };
    case "alertAnswered":
      return { ...s, alert: { status: "answered", barberId: "kevin" } };
    case "resetAlert":
      return { ...s, alert: { status: "none" } };
    case "reset":
      return { ...initialState, toast: "Demo reiniciada" };
    case "hydrate":
      return a.state;
  }
}

const KEY = "unbarber.demo.v1";

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw) as State;
    return { ...initialState, ...parsed, toast: null, wa: null };
  } catch {
    return initialState;
  }
}

type Ctx = {
  s: State;
  dispatch: (a: Action) => void;
  go: (screen: Screen) => void;
  tab: (screen: Screen) => void;
  back: () => void;
  toast: (text: string) => void;
  openWa: (to: string, text: string) => void;
  barber: (id: string) => Barber;
  me: Barber;
  client: (id: string) => (typeof CLIENTS)[number];
  screen: Screen;
};

const DemoContext = createContext<Ctx | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [s, dispatch] = useReducer(reducer, initialState);
  const hydrated = useRef(false);

  // Se restaura después del primer render para no romper la hidratación del HTML estático.
  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true;
      const saved = load();
      if (saved !== initialState) dispatch({ t: "hydrate", state: saved });
      return;
    }
    try {
      localStorage.setItem(KEY, JSON.stringify({ ...s, toast: null, wa: null }));
    } catch {}
  }, [s]);

  useEffect(() => {
    if (!s.toast) return;
    const id = setTimeout(() => dispatch({ t: "toast", text: null }), 2600);
    return () => clearTimeout(id);
  }, [s.toast]);

  const go = useCallback((screen: Screen) => {
    dispatch({ t: "go", screen });
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }, []);
  const tab = useCallback((screen: Screen) => {
    dispatch({ t: "tab", screen });
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }, []);
  const back = useCallback(() => dispatch({ t: "back" }), []);
  const toast = useCallback((text: string) => dispatch({ t: "toast", text }), []);
  const openWa = useCallback((to: string, text: string) => dispatch({ t: "wa", sheet: { to, text } }), []);

  const value = useMemo<Ctx>(() => {
    const me = selfBarber(s.account?.name ?? "Vos");
    return {
      s,
      dispatch,
      go,
      tab,
      back,
      toast,
      openWa,
      me,
      barber: (id) => (id === SELF_BARBER_ID ? me : (BARBERS.find((b) => b.id === id) ?? BARBERS[0])),
      client: (id) => CLIENTS.find((c) => c.id === id) ?? CLIENTS[0],
      screen: s.stack.at(-1) ?? START,
    };
  }, [s, go, tab, back, toast, openWa]);

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo(): Ctx {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo fuera de DemoProvider");
  return ctx;
}
