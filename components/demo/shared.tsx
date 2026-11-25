"use client";

import { CalendarDays, House, Inbox, Search, User, Users } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { MODALITY_LABEL, type Appointment, type Barber } from "@/lib/demo/data";
import { useDemo, type Screen } from "@/lib/demo/store";
import { km } from "@/lib/demo/time";
import { Avatar, Btn, Card, LiveDot, Photo, RatingInline, Sheet, Tag, WaIcon } from "./ui";
import { formatArs } from "@/lib/demo/time";

const CLIENT_TABS = [
  { id: "c-home", label: "Inicio", icon: House },
  { id: "c-search", label: "Buscar", icon: Search },
  { id: "c-turnos", label: "Mis turnos", icon: CalendarDays },
  { id: "c-perfil", label: "Perfil", icon: User },
] as const;

const BARBER_TABS = [
  { id: "b-inbox", label: "Bandeja", icon: Inbox },
  { id: "b-agenda", label: "Agenda", icon: CalendarDays },
  { id: "b-clients", label: "Clientes", icon: Users },
  { id: "b-perfil", label: "Perfil", icon: User },
] as const;

export function BottomNav() {
  const { s, screen, tab } = useDemo();
  const tabs = s.role === "barber" ? BARBER_TABS : CLIENT_TABS;
  const pending = s.inbox.length;
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-[440px] border-t border-line bg-paper/95 backdrop-blur"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      aria-label="Secciones"
    >
      {tabs.map(({ id, label, icon: Icon }) => {
        const active = screen.id === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => tab({ id } as Screen)}
            aria-current={active ? "page" : undefined}
            className={`relative flex flex-1 flex-col items-center gap-1 pb-2 pt-2.5 text-[11px] font-semibold ${active ? "text-mode" : "text-muted"}`}
          >
            <Icon className="size-[22px]" strokeWidth={active ? 2.4 : 1.8} />
            {label}
            {id === "b-inbox" && pending > 0 && (
              <span className="absolute right-[calc(50%-22px)] top-1.5 grid min-w-[18px] place-items-center rounded-full bg-terra px-1 text-[10px] text-white">
                {pending}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

export function HomeHeader() {
  const { s, tab } = useDemo();
  return (
    <header className="flex items-center justify-between px-4 pb-1 pt-4">
      <Logo className="h-7 w-auto text-pine" />
      <button
        type="button"
        onClick={() => tab({ id: s.role === "barber" ? "b-perfil" : "c-perfil" })}
        className="grid size-10 place-items-center rounded-full bg-slate text-sm font-semibold text-white"
        aria-label="Tu perfil"
      >
        {s.account?.initials}
      </button>
    </header>
  );
}

/** Tarjeta de barbero para listas (Ahora, Buscar, Inicio). */
export function BarberCard({ b, origin = "ahora" }: { b: Barber; origin?: "ahora" | "buscar" }) {
  const { go, openWa, s } = useDemo();
  const barrio = s.account ? "Villa Crespo" : "";
  return (
    <Card className="overflow-hidden">
      <button type="button" onClick={() => go({ id: "barber", barberId: b.id })} className="flex w-full gap-3 p-4 text-left">
        <Avatar name={b.name} tone={b.tone} size={56} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate font-serif text-xl leading-tight">{b.name}</p>
            <span className="shrink-0 text-sm font-semibold tabular-nums">{km(b.distanceKm)}</span>
          </div>
          <p className="truncate text-sm text-muted">
            {b.shop} · {b.barrio}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <RatingInline b={b} />
            <span className="text-sm text-muted">desde {formatArs(Math.min(...b.services.map((x) => x.price)))}</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {b.availableNow ? (
              <Tag tone="ok">
                <LiveDot /> Libre hasta {b.until}
              </Tag>
            ) : (
              <Tag>Con turno</Tag>
            )}
            <Tag>{MODALITY_LABEL[b.modality]}</Tag>
          </div>
        </div>
      </button>
      {origin === "ahora" && b.availableNow && (
        <div className="grid grid-cols-2 gap-2 border-t border-line px-4 py-3">
          <Btn variant="outline" size="sm" onClick={() => go({ id: "barber", barberId: b.id })}>
            Ver perfil
          </Btn>
          <Btn
            variant="pine"
            size="sm"
            onClick={() =>
              openWa(b.name, `Hola ${b.name.split(" ")[0]}, te encontré en Unbarber. ¿Podés atenderme ahora? Estoy en ${barrio}.`)
            }
          >
            <WaIcon className="size-4" /> WhatsApp
          </Btn>
        </div>
      )}
    </Card>
  );
}

/** Tarjeta vertical para carruseles */
export function BarberTile({ b }: { b: Barber }) {
  const { go } = useDemo();
  return (
    <button type="button" onClick={() => go({ id: "barber", barberId: b.id })} className="flex w-[168px] shrink-0 flex-col gap-2 text-left">
      <div className="relative">
        <Photo className="aspect-[4/5] w-full rounded-2xl" variant={b.kind === "centro" ? "pine" : "moss"} label={b.kind === "centro" ? "Céntrica" : "De barrio"} />
        <span className="absolute -bottom-4 left-3">
          <Avatar name={b.name} tone={b.tone} size={40} ring />
        </span>
        {b.availableNow && (
          <span className="absolute right-2 top-2">
            <Tag tone="peach">Libre ahora</Tag>
          </span>
        )}
      </div>
      <div className="mt-3 px-0.5">
        <p className="truncate font-serif text-lg leading-tight">{b.name}</p>
        <p className="truncate text-xs text-muted">
          {b.barrio} · {km(b.distanceKm)}
        </p>
      </div>
    </button>
  );
}

export const STATUS: Record<Appointment["status"], { label: string; tone: "slate" | "ok" | "muted" | "terra" | "pine" }> = {
  requested: { label: "Solicitado", tone: "slate" },
  confirmed: { label: "Confirmado", tone: "ok" },
  rejected: { label: "Rechazado", tone: "terra" },
  expired: { label: "Vencido", tone: "muted" },
  cancelled: { label: "Cancelado", tone: "muted" },
  completed: { label: "Completado", tone: "pine" },
  no_show: { label: "No vino", tone: "terra" },
};

/** Hoja de WhatsApp simulada: muestra el mensaje precargado (spec 05 y 08). */
export function WaSheet() {
  const { s, dispatch } = useDemo();
  const close = () => dispatch({ t: "wa", sheet: null });
  return (
    <Sheet open={!!s.wa} onClose={close} title={s.wa ? `Escribirle a ${s.wa.to.split(" ")[0]}` : ""}>
      {s.wa && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted">Se abre WhatsApp con este mensaje listo para mandar:</p>
          <div className="rounded-2xl rounded-tr-sm bg-[#dcf4d4] px-4 py-3 text-[15px] leading-snug text-[#173d22]">{s.wa.text}</div>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(s.wa.text)}`}
            target="_blank"
            rel="noreferrer"
            onClick={close}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-pine px-5 font-semibold text-paper shadow-press"
          >
            <WaIcon /> Abrir WhatsApp
          </a>
          <p className="text-center text-xs text-muted">Demo: los teléfonos son de ejemplo, WhatsApp abre sin destinatario.</p>
        </div>
      )}
    </Sheet>
  );
}
