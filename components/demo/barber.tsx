"use client";

import { Ban, Bell, CalendarDays, Clock, Plus, Power, Scissors, Search, Sparkles, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { CLIENTS, SELF_BARBER_ID, type Appointment, type InboxItem } from "@/lib/demo/data";
import { useDemo } from "@/lib/demo/store";
import { dayLabel, dayShort, formatArs, fromMinutes, slots, toMinutes } from "@/lib/demo/time";
import { effectivePriceArs, isPromoActive, MEMBERSHIP_DEFAULTS } from "@/lib/membership";
import { HomeHeader, STATUS } from "./shared";
import { Avatar, Btn, Card, Chip, LiveDot, Section, Sheet, Stars, Tag, TopBar, WaIcon } from "./ui";

const DURATIONS = [
  { label: "1 hora", h: 1 },
  { label: "2 horas", h: 2 },
  { label: "4 horas", h: 4 },
  { label: "Hasta que lo apague", h: 12 },
];

function untilFromNow(h: number) {
  const d = new Date(Date.now() + h * 3600000);
  return h >= 12 ? null : `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/* ───────── Interruptor "Estoy libre ahora" ───────── */

function AvailabilityCard() {
  const { s, dispatch } = useDemo();
  const [open, setOpen] = useState(false);
  const on = s.availableNow.on;
  return (
    <>
      {on ? (
        <div className="on-dark flex flex-col gap-3 rounded-3xl bg-terra p-5 text-white shadow-card">
          <span className="flex items-center gap-2 text-sm text-white/85">
            <LiveDot /> Te ven los clientes a 3 km
          </span>
          <p className="font-serif text-[34px] leading-none">
            Estás <span className="italic text-pine">libre</span>
            {s.availableNow.until ? ` hasta las ${s.availableNow.until}` : ""}
          </p>
          <Btn variant="paper" size="sm" className="self-start" onClick={() => dispatch({ t: "available", on: false, until: null })}>
            <Power className="size-4" /> Apagar
          </Btn>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-4 rounded-3xl border border-line bg-paper p-5 text-left active:scale-[0.99]"
        >
          <span className="flex-1">
            <span className="block font-serif text-[30px] leading-none">
              ¿Tenés el sillón <span className="accent">libre?</span>
            </span>
            <span className="mt-1.5 block text-[15px] text-muted">Prendé “Estoy libre ahora” y aparecé para los vecinos que buscan corte.</span>
          </span>
          <span className="relative h-8 w-14 shrink-0 rounded-full bg-sage" aria-hidden>
            <span className="absolute left-1 top-1 size-6 rounded-full bg-paper shadow" />
          </span>
        </button>
      )}
      <Sheet open={open} onClose={() => setOpen(false)} title="¿Por cuánto tiempo?">
        <div className="grid grid-cols-2 gap-2">
          {DURATIONS.map((d) => (
            <Btn
              key={d.label}
              variant={d.h === 2 ? "terra" : "outline"}
              onClick={() => {
                setOpen(false);
                dispatch({ t: "available", on: true, until: untilFromNow(d.h) });
              }}
            >
              {d.label}
            </Btn>
          ))}
        </div>
        <p className="mt-4 text-sm text-muted">Usamos la dirección de tu local. Si atendés en tu casa, mostramos solo el barrio.</p>
      </Sheet>
    </>
  );
}

/* ───────── Bandeja ───────── */

const HEAD: Record<InboxItem["type"], { label: string; cls: string; icon: React.ComponentType<{ className?: string }> }> = {
  alert: { label: "Alerta de zona", cls: "bg-terra text-white", icon: Bell },
  booking: { label: "Pedido de turno", cls: "bg-slate text-white", icon: CalendarDays },
  cut: { label: "Corte por confirmar", cls: "bg-sage-soft text-pine", icon: Scissors },
  wrote: { label: "Te escribió desde Unbarber", cls: "bg-sage-soft text-pine", icon: WaIconLucideShim },
  trial: { label: "Prueba sin cargo", cls: "bg-peach text-pine", icon: Sparkles },
};

function WaIconLucideShim({ className }: { className?: string }) {
  return <WaIcon className={className} />;
}

function ago(min: number) {
  if (min < 60) return `hace ${min} min`;
  if (min < 60 * 24) return `hace ${Math.round(min / 60)} h`;
  return `hace ${Math.round(min / 1440)} d`;
}

function InboxCard({ item }: { item: InboxItem }) {
  const { s, dispatch, client, go, openWa, me } = useDemo();
  const c = item.clientId ? client(item.clientId) : null;
  const appt = item.apptId ? s.appointments.find((a) => a.id === item.apptId) : undefined;
  const svc = appt ? me.services.find((x) => x.id === appt.serviceId) : undefined;
  const h = HEAD[item.type];
  const Icon = h.icon;

  let body: React.ReactNode = null;
  let actions: React.ReactNode = null;

  switch (item.type) {
    case "alert":
      body = (
        <>
          <p className="font-semibold">{c?.name.split(" ")[0]} busca corte ahora</p>
          <p className="text-sm text-muted">{item.detail}</p>
        </>
      );
      actions = (
        <>
          <Btn size="sm" variant="outline" onClick={() => dispatch({ t: "dismiss", inboxId: item.id })}>
            Paso
          </Btn>
          <Btn
            size="sm"
            variant="terra"
            onClick={() => {
              dispatch({ t: "dismiss", inboxId: item.id, toast: "Le avisamos que te interesa" });
              openWa(c!.name, `Hola ${c!.name.split(" ")[0]}, vi tu alerta en Unbarber. Puedo atenderte en 20 minutos. Estoy en Villa Crespo.`);
            }}
          >
            Me interesa
          </Btn>
        </>
      );
      break;
    case "booking":
      body = (
        <>
          <p className="font-semibold">
            {c?.name} · {svc?.name}
          </p>
          <p className="text-sm text-muted">
            {appt && `${dayLabel(appt.day)} a las ${appt.time}`} · vence en 11 h
          </p>
          {appt?.note && <p className="mt-2 rounded-xl bg-sage-soft px-3 py-2 text-sm">“{appt.note}”</p>}
        </>
      );
      actions = (
        <>
          <Btn size="sm" variant="outline" onClick={() => appt && dispatch({ t: "setStatus", apptId: appt.id, status: "rejected", toast: "Pedido rechazado" })}>
            Rechazar
          </Btn>
          <Btn
            size="sm"
            variant="pine"
            onClick={() => appt && dispatch({ t: "setStatus", apptId: appt.id, status: "confirmed", toast: "Turno aceptado y sumado a tu agenda" })}
          >
            Aceptar
          </Btn>
        </>
      );
      break;
    case "cut":
      body = (
        <>
          <p className="font-semibold">¿Atendiste a {c?.name.split(" ")[0]}?</p>
          <p className="text-sm text-muted">{appt && `Turno de ${dayLabel(appt.day).toLowerCase()} a las ${appt.time}`}</p>
        </>
      );
      actions = (
        <>
          <Btn size="sm" variant="outline" onClick={() => appt && dispatch({ t: "setStatus", apptId: appt.id, status: "no_show", toast: "Marcado como que no vino" })}>
            No vino
          </Btn>
          <Btn
            size="sm"
            variant="pine"
            onClick={() => {
              if (appt) dispatch({ t: "setStatus", apptId: appt.id, status: "completed" });
              go({ id: "b-rate-client", clientId: c!.id, apptId: appt?.id });
            }}
          >
            Registrar corte
          </Btn>
        </>
      );
      break;
    case "wrote":
      body = (
        <>
          <p className="font-semibold">{c?.name} te escribió por WhatsApp</p>
          <p className="text-sm text-muted">Si lo atendiste, registralo para que sume a tu reputación.</p>
        </>
      );
      actions = (
        <Btn
          size="sm"
          variant="pine"
          onClick={() => {
            dispatch({ t: "dismiss", inboxId: item.id });
            go({ id: "b-rate-client", clientId: c!.id });
          }}
        >
          Registrar corte
        </Btn>
      );
      break;
    case "trial":
      body = (
        <>
          <p className="font-semibold">{s.membership === "active" ? "Tu membresía está activa" : "Te quedan 14 días de prueba"}</p>
          <p className="text-sm text-muted">Mirá cómo sigue tu acceso a Unbarber.</p>
        </>
      );
      actions = (
        <Btn size="sm" variant="outline" onClick={() => go({ id: "b-membership" })}>
          Ver membresía
        </Btn>
      );
      break;
  }

  return (
    <Card className="overflow-hidden">
      <div className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] ${h.cls}`}>
        <Icon className="size-4" /> {h.label}
        <span className="ml-auto font-medium normal-case tracking-normal opacity-80">{ago(item.minutesAgo)}</span>
      </div>
      <div className="flex gap-3 p-4">
        {c && <Avatar name={c.name} tone="slate" size={40} />}
        <div className="min-w-0 flex-1">{body}</div>
      </div>
      <div className="flex justify-end gap-2 border-t border-line px-4 py-3">{actions}</div>
    </Card>
  );
}

function greeting(h = new Date().getHours()) {
  return h >= 6 && h < 13 ? "Buen día" : h >= 13 && h < 20 ? "Buenas tardes" : "Buenas noches";
}

export function BarberInbox() {
  const { s } = useDemo();
  const first = s.account?.name.split(" ")[0];
  const [tabId, setTab] = useState<"pending" | "history">("pending");
  return (
    <main className="flex flex-col gap-6 pb-28">
      <HomeHeader />
      <div className="px-4">
        <h1 className="text-[40px] leading-[1.02]">
          {greeting()}, <span className="accent">{first}</span>
        </h1>
      </div>
      <div className="px-4">
        <AvailabilityCard />
      </div>
      <Section
        title={
          <>
            Bandeja <span className="font-sans text-base text-muted">· {s.inbox.length}</span>
          </>
        }
      >
        <div className="flex gap-2">
          <Chip active={tabId === "pending"} onClick={() => setTab("pending")}>
            Pendientes
          </Chip>
          <Chip active={tabId === "history"} onClick={() => setTab("history")}>
            Historial
          </Chip>
        </div>
        {tabId === "pending" ? (
          s.inbox.length === 0 ? (
            <Card className="flex flex-col items-center gap-2 p-8 text-center">
              <Sparkles className="size-6 text-terra" />
              <p className="font-serif text-2xl">Todo al día</p>
              <p className="text-sm text-muted">No tenés nada pendiente. Prendé “Estoy libre ahora” para aparecer en la lista.</p>
            </Card>
          ) : (
            s.inbox.map((i) => <InboxCard key={i.id} item={i} />)
          )
        ) : (
          <Card className="divide-y divide-line text-sm">
            {["Aceptaste el turno de Franco · sáb 10:30", "Registraste el corte de Santiago · 4,9", "Pasaste una alerta en Chacarita"].map((t) => (
              <p key={t} className="px-4 py-3 text-muted">
                {t}
              </p>
            ))}
          </Card>
        )}
      </Section>
    </main>
  );
}

/* ───────── Agenda ───────── */

const ORIGIN_STYLE: Record<Appointment["origin"], string> = {
  app: "bg-slate text-white",
  ahora: "bg-terra text-white",
  manual: "bg-paper text-pine border-[1.5px] border-pine",
};

export function BarberAgenda() {
  const { s, go, client, me, dispatch, openWa } = useDemo();
  const [day, setDay] = useState(0);
  const [sel, setSel] = useState<Appointment | null>(null);
  const items = s.appointments
    .filter((a) => a.barberId === SELF_BARBER_ID && a.day === day && !["rejected", "cancelled", "expired"].includes(a.status))
    .sort((a, b) => toMinutes(a.time) - toMinutes(b.time));
  const START = 10 * 60;
  const END = 20 * 60;
  const PX = 1.3; // px por minuto
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  return (
    <main className="flex flex-col gap-4 pb-28">
      <div className="flex items-end justify-between px-4 pt-6">
        <h1 className="text-[36px] leading-[1.05]">
          Tu <span className="accent">agenda</span>
        </h1>
        <Btn size="sm" variant="mode" onClick={() => go({ id: "b-new-appt" })}>
          <Plus className="size-4" /> Turno
        </Btn>
      </div>
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-1">
        {Array.from({ length: 10 }, (_, i) => i - 1).map((d) => {
          const { dow, num } = dayShort(d);
          const count = s.appointments.filter((a) => a.barberId === SELF_BARBER_ID && a.day === d && ["confirmed", "requested"].includes(a.status)).length;
          return (
            <button
              key={d}
              type="button"
              onClick={() => setDay(d)}
              className={`flex w-14 shrink-0 flex-col items-center gap-0.5 rounded-2xl border py-2 ${d === day ? "border-mode bg-mode text-white" : "border-line bg-paper"}`}
            >
              <span className="text-[11px] font-bold uppercase">{d === 0 ? "hoy" : dow}</span>
              <span className="font-serif text-2xl leading-none">{num}</span>
              <span className={`mt-0.5 h-1.5 w-1.5 rounded-full ${count ? (d === day ? "bg-white" : "bg-mode") : "bg-transparent"}`} />
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-3 px-4 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded bg-slate" /> App
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded bg-terra" /> Ahora
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded border-[1.5px] border-pine" /> Cargado a mano
        </span>
        <button type="button" className="ml-auto font-semibold text-pine underline underline-offset-4" onClick={() => dispatch({ t: "toast", text: "Horario bloqueado (demo)" })}>
          <Ban className="mr-1 inline size-3.5" />
          Bloquear horario
        </button>
      </div>
      <div className="px-4">
        <div className="relative rounded-2xl border border-line bg-paper" style={{ height: (END - START) * PX + 16 }}>
          {Array.from({ length: (END - START) / 60 + 1 }, (_, i) => (
            <div key={i} className="absolute inset-x-0 flex items-center gap-2 px-3" style={{ top: i * 60 * PX + 8 }}>
              <span className="w-10 -translate-y-1/2 text-[11px] tabular-nums text-muted">{fromMinutes(START + i * 60)}</span>
              <span className="h-px flex-1 -translate-y-1/2 bg-line" />
            </div>
          ))}
          {day === 0 && nowMin > START && nowMin < END && (
            <div className="absolute inset-x-0 z-10 flex items-center" style={{ top: (nowMin - START) * PX + 8 }}>
              <span className="ml-12 size-2 -translate-y-1/2 rounded-full bg-terra" />
              <span className="h-[2px] flex-1 -translate-y-1/2 bg-terra" />
            </div>
          )}
          {items.map((a) => {
            const c = client(a.clientId);
            const svc = me.services.find((x) => x.id === a.serviceId)!;
            const top = (toMinutes(a.time) - START) * PX + 8;
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => setSel(a)}
                className={`absolute left-14 right-3 overflow-hidden rounded-xl px-3 py-1.5 text-left text-sm ${ORIGIN_STYLE[a.origin]} ${
                  a.status === "requested" ? "border-2 border-dashed border-slate bg-slate-soft! text-slate!" : ""
                } ${a.status === "completed" || a.status === "no_show" ? "opacity-60" : ""}`}
                style={{ top, height: Math.max(svc.minutes * PX, 34) }}
              >
                <span className="font-semibold">{c.name}</span>
                <span className="opacity-80">
                  {" "}
                  · {svc.name} · {a.time}
                </span>
                {a.status === "requested" && <span className="ml-1 text-xs font-bold uppercase">por aceptar</span>}
              </button>
            );
          })}
        </div>
        {items.length === 0 && <p className="pt-3 text-center text-sm text-muted">Sin turnos este día. Los huecos libres los ven los clientes.</p>}
      </div>

      <Sheet open={!!sel} onClose={() => setSel(null)} title={sel ? client(sel.clientId).name : ""}>
        {sel && (
          <div className="flex flex-col gap-3">
            <p className="text-muted">
              {dayLabel(sel.day)} · {sel.time} · {me.services.find((x) => x.id === sel.serviceId)?.name}
            </p>
            <Tag tone={STATUS[sel.status].tone}>{STATUS[sel.status].label}</Tag>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Btn variant="outline" onClick={() => openWa(client(sel.clientId).name, `Hola ${client(sel.clientId).name.split(" ")[0]}, te espero el ${dayLabel(sel.day).toLowerCase()} a las ${sel.time}.`)}>
                <WaIcon className="size-4" /> WhatsApp
              </Btn>
              <Btn
                variant="pine"
                onClick={() => {
                  dispatch({ t: "setStatus", apptId: sel.id, status: "completed" });
                  setSel(null);
                  go({ id: "b-rate-client", clientId: sel.clientId, apptId: sel.id });
                }}
              >
                Registrar corte
              </Btn>
              <Btn
                variant="outline"
                onClick={() => {
                  dispatch({ t: "setStatus", apptId: sel.id, status: "no_show", toast: "Marcado como que no vino" });
                  setSel(null);
                }}
              >
                No vino
              </Btn>
              <Btn
                variant="ghost"
                onClick={() => {
                  dispatch({ t: "setStatus", apptId: sel.id, status: "cancelled", toast: "Turno cancelado" });
                  setSel(null);
                }}
              >
                Cancelar turno
              </Btn>
            </div>
          </div>
        )}
      </Sheet>
    </main>
  );
}

/* ───────── Mis clientes ───────── */

export function BarberClients() {
  const { go } = useDemo();
  const [q, setQ] = useState("");
  const list = CLIENTS.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <main className="flex flex-col gap-4 pb-28">
      <div className="px-4 pt-6">
        <h1 className="text-[36px] leading-[1.05]">
          Mis <span className="accent">clientes</span>
        </h1>
        <p className="mt-1 text-sm text-muted">Quién vino, cuándo volvió y qué corte eligió.</p>
      </div>
      <div className="px-4">
        <label className="flex items-center gap-2 rounded-full border border-line bg-paper px-4 py-2.5">
          <Search className="size-4 text-muted" />
          <input id="buscar-cliente" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre" className="flex-1 bg-transparent outline-none" />
        </label>
      </div>
      <div className="px-4">
        <Card className="divide-y divide-line">
          {list.map((c) => (
            <button key={c.id} type="button" onClick={() => go({ id: "b-client", clientId: c.id })} className="flex w-full items-center gap-3 px-4 py-3 text-left">
              <Avatar name={c.name} tone="slate" size={44} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{c.name}</span>
                <span className="block truncate text-sm text-muted">
                  {c.visits} {c.visits === 1 ? "corte" : "cortes"} · último {c.lastVisit}
                </span>
              </span>
              <Stars value={c.stars} size={12} />
            </button>
          ))}
        </Card>
      </div>
    </main>
  );
}

export function BarberClient({ clientId }: { clientId: string }) {
  const { s, back, client, go, openWa, me } = useDemo();
  const c = client(clientId);
  const history = s.appointments.filter((a) => a.barberId === SELF_BARBER_ID && a.clientId === clientId).sort((a, b) => b.day - a.day);
  return (
    <main className="flex flex-col gap-6 pb-10">
      <TopBar onBack={back} />
      <div className="flex items-center gap-4 px-4">
        <Avatar name={c.name} tone="slate" size={68} />
        <div>
          <h1 className="text-[32px] leading-none">{c.name}</h1>
          <p className="mt-1 text-sm text-muted">{c.barrio}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 px-4">
        {[
          [String(c.visits), "cortes"],
          [c.lastVisit.replace("hace ", ""), "desde el último"],
          [String(c.stars), "tu calificación"],
        ].map(([v, l]) => (
          <Card key={l} className="p-3 text-center">
            <p className="font-serif text-2xl leading-none">{v}</p>
            <p className="mt-1 text-[11px] text-muted">{l}</p>
          </Card>
        ))}
      </div>
      <Section title="Notas">
        <Card className="p-4 text-[15px]">{c.note ?? <span className="text-muted">Sin notas. Ej.: cómo le gusta el corte.</span>}</Card>
        <p className="text-sm text-muted">Le gusta: {c.favService}</p>
      </Section>
      <div className="grid grid-cols-2 gap-2 px-4">
        <Btn variant="outline" onClick={() => openWa(c.name, `Hola ${c.name.split(" ")[0]}, ¿cómo va? Hace un tiempo que no venís. Esta semana tengo lugar.`)}>
          <WaIcon className="size-4" /> WhatsApp
        </Btn>
        <Btn variant="mode" onClick={() => go({ id: "b-new-appt", clientId: c.id })}>
          <Plus className="size-4" /> Cargar turno
        </Btn>
      </div>
      {history.length > 0 && (
        <Section title="Historial">
          <Card className="divide-y divide-line">
            {history.map((a) => (
              <div key={a.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <span>
                  {dayLabel(a.day)} · {a.time} · {me.services.find((x) => x.id === a.serviceId)?.name}
                </span>
                <Tag tone={STATUS[a.status].tone}>{STATUS[a.status].label}</Tag>
              </div>
            ))}
          </Card>
        </Section>
      )}
    </main>
  );
}

/* ───────── Cargar turno a mano (APP-11) ───────── */

export function NewAppointment({ clientId }: { clientId?: string }) {
  const { back, dispatch, me } = useDemo();
  const [cid, setCid] = useState<string | "new">(clientId ?? CLIENTS[0].id);
  const [newName, setNewName] = useState("");
  const [svc, setSvc] = useState(me.services[0].id);
  const [day, setDay] = useState(0);
  const [time, setTime] = useState<string | null>(null);
  const grid = useMemo(() => slots(day, []), [day]);
  const ok = !!time && (cid !== "new" || newName.trim().length > 1);
  return (
    <main className="flex flex-col gap-6 pb-32">
      <TopBar onBack={back} title="Cargar turno" />
      <p className="-mt-2 px-4 text-sm text-muted">Para turnos que coordinaste por WhatsApp. Queda confirmado directo.</p>
      <Section title="Cliente">
        <div className="flex flex-wrap gap-2">
          {CLIENTS.map((c) => (
            <Chip key={c.id} active={cid === c.id} onClick={() => setCid(c.id)}>
              {c.name.split(" ")[0]}
            </Chip>
          ))}
          <Chip active={cid === "new"} onClick={() => setCid("new")}>
            <UserPlus className="mr-1 inline size-4" /> Nuevo
          </Chip>
        </div>
        {cid === "new" && (
          <div className="grid gap-2">
            <input id="nuevo-nombre" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nombre" className="rounded-xl border border-line bg-paper px-3 py-2.5 outline-none focus:border-mode" />
            <input id="nuevo-telefono" inputMode="tel" placeholder="WhatsApp (opcional)" className="rounded-xl border border-line bg-paper px-3 py-2.5 outline-none focus:border-mode" />
          </div>
        )}
      </Section>
      <Section title="Servicio">
        <div className="flex flex-wrap gap-2">
          {me.services.map((x) => (
            <Chip key={x.id} active={svc === x.id} onClick={() => setSvc(x.id)}>
              {x.name} · {x.minutes} min
            </Chip>
          ))}
        </div>
      </Section>
      <Section title="Día y hora">
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          {Array.from({ length: 10 }, (_, d) => {
            const { dow, num } = dayShort(d);
            return (
              <button
                key={d}
                type="button"
                onClick={() => {
                  setDay(d);
                  setTime(null);
                }}
                className={`flex w-14 shrink-0 flex-col items-center rounded-2xl border py-2 ${d === day ? "border-mode bg-mode text-white" : "border-line bg-paper"}`}
              >
                <span className="text-[11px] font-bold uppercase">{d === 0 ? "hoy" : dow}</span>
                <span className="font-serif text-2xl leading-none">{num}</span>
              </button>
            );
          })}
        </div>
        <div className="grid grid-cols-4 gap-2">
          {grid.map(({ time: t }) => (
            <button
              key={t}
              type="button"
              onClick={() => setTime(t)}
              className={`rounded-xl border py-2.5 text-sm font-semibold tabular-nums ${time === t ? "border-mode bg-mode text-white" : "border-line bg-paper"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </Section>
      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[440px] border-t border-line bg-paper/95 px-4 pt-3 backdrop-blur" style={{ paddingBottom: "max(14px, env(safe-area-inset-bottom, 0px))" }}>
        <Btn
          block
          size="lg"
          variant="mode"
          disabled={!ok}
          onClick={() =>
            time &&
            dispatch({
              t: "requestAppt",
              appt: { barberId: SELF_BARBER_ID, clientId: cid === "new" ? "julian" : cid, serviceId: svc, day, time, origin: "manual" },
              then: "agenda",
            })
          }
        >
          <Clock className="size-5" /> Guardar turno
        </Btn>
      </div>
    </main>
  );
}

/* ───────── Membresía (spec 11) ───────── */

export function MembershipScreen() {
  const { s, back, dispatch } = useDemo();
  const cfg = MEMBERSHIP_DEFAULTS;
  const promo = isPromoActive(cfg);
  const price = effectivePriceArs(cfg);
  const active = s.membership === "active";
  return (
    <main className="flex min-h-dvh flex-col gap-6 pb-10">
      <TopBar onBack={back} title="Membresía" />
      <div className="px-4">
        <p className="eyebrow">Acceso para barberos</p>
        <h1 className="mt-1 text-[36px] leading-[1.05]">
          Una sola vez, <span className="accent">para siempre</span>
        </h1>
        <p className="mt-2 text-muted">El registro y la prueba son sin cargo. Después, la membresía de acceso se paga una única vez. Los clientes no pagan nada.</p>
      </div>
      <div className="px-4">
        <div className="on-dark flex flex-col gap-4 rounded-3xl bg-pine p-6 text-paper">
          <div className="flex items-center justify-between">
            <span className="text-sm text-paper/70">Membresía de acceso · pago único</span>
            {promo && <Tag tone="peach">Lanzamiento</Tag>}
          </div>
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-[48px] leading-none">{formatArs(price)}</span>
            {promo && price < cfg.priceArs && <span className="text-lg text-paper/50 line-through">{formatArs(cfg.priceArs)}</span>}
          </div>
          {promo && <p className="text-sm text-paper/75">Promo de lanzamiento: {cfg.promoPercent} % de descuento para quienes se registran ahora. Te queda congelada.</p>}
          <ul className="flex flex-col gap-1.5 text-sm text-paper/85">
            <li>· Aparecer en “Libres ahora” y en las búsquedas</li>
            <li>· Recibir pedidos de turno y alertas de zona</li>
            <li>· Agenda, Mis clientes y calificaciones</li>
          </ul>
          {active ? (
            <Tag tone="ok">Membresía activa</Tag>
          ) : (
            <Btn variant="paper" size="lg" onClick={() => dispatch({ t: "activateMembership" })}>
              {price === 0 ? "Activar membresía sin cargo" : "Pagar con Mercado Pago"}
            </Btn>
          )}
        </div>
      </div>
      <p className="px-4 text-xs text-muted">
        El pago se hace por Mercado Pago. Tenés 10 días para arrepentirte desde el botón de arrepentimiento.
      </p>
    </main>
  );
}

/* ───────── Calificar al cliente ───────── */

const LEVEL_ITEMS: Record<number, string[]> = {
  1: ["No vino", "Maltrato", "No pagó"],
  2: ["Llegó muy tarde", "Canceló encima"],
  3: ["Llegó un poco tarde", "Cambió el pedido"],
  4: ["Puntual", "Buena onda"],
  5: ["Puntual", "Respetuoso", "Pagó sin vueltas", "Lo quiero de vuelta"],
};

export function RateClient({ clientId }: { clientId: string }) {
  const { client, dispatch, tab } = useDemo();
  const c = client(clientId);
  const [stars, setStars] = useState(0);
  const [items, setItems] = useState<string[]>([]);
  return (
    <main className="flex min-h-dvh flex-col gap-6 pb-10">
      <TopBar title="Registrar corte" />
      <div className="flex items-center gap-4 px-4">
        <Avatar name={c.name} tone="slate" size={60} />
        <h1 className="text-[30px] leading-[1.05]">
          ¿Qué tal <span className="accent">{c.name.split(" ")[0]}</span> como cliente?
        </h1>
      </div>
      <div className="flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${n} estrellas`}
            onClick={() => {
              setStars(n);
              setItems([]);
            }}
          >
            <svg viewBox="0 0 24 24" className={`size-11 ${n <= stars ? "fill-terra text-terra" : "fill-none text-line"}`} stroke="currentColor" strokeWidth="1.5">
              <path d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" />
            </svg>
          </button>
        ))}
      </div>
      {stars > 0 && (
        <Section title="¿Por qué?">
          <div className="flex flex-wrap gap-2">
            {LEVEL_ITEMS[stars].map((t) => (
              <Chip key={t} active={items.includes(t)} onClick={() => setItems(items.includes(t) ? items.filter((x) => x !== t) : [...items, t])}>
                {t}
              </Chip>
            ))}
          </div>
        </Section>
      )}
      <p className="px-4 text-sm text-muted">Solo lo ven otros barberos, nunca el cliente. {c.name.split(" ")[0]} también te va a calificar.</p>
      <div className="mt-auto px-4">
        <Btn
          block
          size="lg"
          disabled={!stars}
          onClick={() => {
            dispatch({ t: "toast", text: "Corte registrado. Suma a tu reputación." });
            tab({ id: "b-inbox" });
          }}
        >
          Guardar
        </Btn>
      </div>
    </main>
  );
}
