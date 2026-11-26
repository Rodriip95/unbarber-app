"use client";

import { BadgeCheck, CalendarPlus, Check, ChevronLeft, Clock, Heart, MapPin, Store } from "lucide-react";
import { useState } from "react";
import { MODALITY_LABEL, SELF_BARBER_ID } from "@/lib/demo/data";
import { useDemo } from "@/lib/demo/store";
import { dayLabel, dayShort, formatArs, googleCalendarUrl, isClosed, km, slots, toMinutes, fromMinutes } from "@/lib/demo/time";
import { Avatar, Btn, Card, LiveDot, Photo, RatingInline, Section, Tag, TopBar, WaIcon } from "./ui";

/* ───────── Perfil público del barbero ───────── */

export function BarberProfile({ barberId }: { barberId: string }) {
  const { s, back, go, openWa, dispatch, barber } = useDemo();
  const b = barber(barberId);
  const self = barberId === SELF_BARBER_ID;
  const fav = s.myBarbers.includes(b.id);
  const first = b.name.split(" ")[0];
  const available = self ? s.availableNow.on : b.availableNow;

  return (
    <main className="flex flex-col gap-6 pb-32">
      <div className="relative">
        <Photo className="aspect-[16/11] w-full" variant={b.kind === "centro" ? "pine" : "moss"} label={`Foto de ${b.shop}`} />
        <div className="absolute inset-x-0 top-0 flex justify-between p-3">
          <button type="button" onClick={back} aria-label="Volver" className="grid size-10 place-items-center rounded-full bg-paper/95 text-pine shadow-card">
            <ChevronLeft className="size-6" />
          </button>
          {!self && (
            <button
              type="button"
              aria-pressed={fav}
              aria-label={fav ? "Sacar de Mis barberos" : "Guardar en Mis barberos"}
              onClick={() => dispatch({ t: "toggleFav", barberId: b.id })}
              className="grid size-10 place-items-center rounded-full bg-paper/95 shadow-card"
            >
              <Heart className={`size-5 ${fav ? "fill-terra text-terra" : "text-pine"}`} />
            </button>
          )}
        </div>
        <span className="absolute -bottom-8 left-4">
          <Avatar name={b.name} tone={b.tone} size={80} ring />
        </span>
      </div>

      <div className="flex flex-col gap-2 px-4 pt-6">
        {self && <Tag tone="terra">Así te ven los clientes</Tag>}
        <h1 className="flex items-center gap-2 text-[36px] leading-[1.02]">
          {b.name}
          {b.verified && <BadgeCheck className="size-6 shrink-0 text-slate" aria-label="Identidad verificada" />}
        </h1>
        <p className="text-muted">
          <span className="font-serif text-lg italic text-terra">{b.shop}</span> · {b.barrio}
          {!self && ` · ${km(b.distanceKm)}`}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {available ? (
            <Tag tone="ok">
              <LiveDot /> Libre ahora{b.until && !self ? ` hasta ${b.until}` : ""}
            </Tag>
          ) : (
            <Tag>No está libre ahora</Tag>
          )}
          <Tag>{MODALITY_LABEL[b.modality]}</Tag>
          <RatingInline b={b} />
        </div>
        <p className="mt-1 text-[15px] leading-relaxed text-pine/85">{b.bio}</p>
      </div>

      {b.rating.count >= 5 && (
        <Section title="Lo que dicen">
          <Card className="grid gap-3 p-4">
            {(["ambiente", "servicio", "barbero"] as const).map((k) => (
              <div key={k} className="grid grid-cols-[84px_1fr_32px] items-center gap-3 text-sm">
                <span className="capitalize text-muted">{k}</span>
                <span className="h-2 overflow-hidden rounded-full bg-sage-soft">
                  <span className="block h-full rounded-full bg-terra" style={{ width: `${(b.rating[k] / 5) * 100}%` }} />
                </span>
                <b className="text-right tabular-nums">{b.rating[k].toLocaleString("es-AR")}</b>
              </div>
            ))}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {b.tags.map((t) => (
                <Tag key={t} tone="peach">
                  {t}
                </Tag>
              ))}
            </div>
          </Card>
        </Section>
      )}

      <Section title="Servicios">
        <Card className="divide-y divide-line">
          {b.services.map((x) => (
            <div key={x.id} className="flex items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{x.name}</p>
                <p className="text-sm text-muted">{x.minutes} min</p>
              </div>
              <span className="font-serif text-xl tabular-nums">{formatArs(x.price)}</span>
              {!self && (
                <Btn size="sm" variant="outline" onClick={() => go({ id: "book", barberId: b.id, serviceId: x.id })}>
                  Reservar
                </Btn>
              )}
            </div>
          ))}
        </Card>
      </Section>

      <Section title="Trabajos">
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Photo key={i} className="aspect-square rounded-xl" variant={i % 2 ? "sage" : "moss"} />
          ))}
        </div>
      </Section>

      <Section title="Dónde y cuándo">
        <Card className="divide-y divide-line">
          <p className="flex items-center gap-3 px-4 py-3 text-sm">
            <Clock className="size-4 text-muted" /> {b.hours}
          </p>
          <p className="flex items-center gap-3 px-4 py-3 text-sm">
            <MapPin className="size-4 text-muted" /> {b.address}
          </p>
          <p className="flex items-center gap-3 px-4 py-3 text-sm">
            <Store className="size-4 text-muted" /> {b.years} años cortando
          </p>
        </Card>
      </Section>

      {!self && (
        <div
          className="fixed inset-x-0 bottom-0 z-30 mx-auto grid md:max-w-[440px] grid-cols-2 gap-3 border-t border-line bg-paper/95 px-4 pt-3 backdrop-blur"
          style={{ paddingBottom: "max(14px, env(safe-area-inset-bottom, 0px))" }}
        >
          <Btn
            variant="outline"
            className="whitespace-nowrap px-3"
            onClick={() =>
              openWa(
                b.name,
                available
                  ? `Hola ${first}, te encontré en Unbarber. ¿Podés atenderme ahora? Estoy en Villa Crespo.`
                  : `Hola ${first}, te encontré en Unbarber. Quiero sacar turno para ${b.services[0].name.toLowerCase()}. ¿Qué día tenés?`,
              )
            }
          >
            <WaIcon className="size-5" /> {available ? "¿Podés ahora?" : "A coordinar"}
          </Btn>
          <Btn variant="mode" className="whitespace-nowrap px-3" onClick={() => go({ id: "book", barberId: b.id })}>
            <CalendarPlus className="size-5" /> Sacar turno
          </Btn>
        </div>
      )}
    </main>
  );
}

/* ───────── Sacar turno (2.a) ───────── */

export function BookScreen({ barberId, serviceId }: { barberId: string; serviceId?: string }) {
  const { s, back, barber, dispatch, openWa } = useDemo();
  const b = barber(barberId);
  const [svc, setSvc] = useState(serviceId ?? b.services[0].id);
  const firstOpen = [0, 1, 2].find((d) => !isClosed(d, b.modality)) ?? 0;
  const [day, setDay] = useState(firstOpen);
  const [time, setTime] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const service = b.services.find((x) => x.id === svc)!;
  const taken = s.appointments
    .filter((a) => a.barberId === b.id && a.day === day && ["requested", "confirmed"].includes(a.status))
    .map((a) => a.time);
  // Huecos ocupados de ejemplo para que la grilla no se vea vacía
  const demoTaken = ["11:00", "11:30", "15:00", "17:30"].filter((_, i) => (i + day) % 2 === 0);
  const grid = slots(day, [...taken, ...demoTaken]);
  const closed = isClosed(day, b.modality);

  return (
    <main className="flex flex-col gap-6 pb-36">
      <TopBar onBack={back} title="Sacar turno" />
      <div className="flex items-center gap-3 px-4">
        <Avatar name={b.name} tone={b.tone} size={52} />
        <div>
          <h1 className="text-[28px] leading-none">{b.name}</h1>
          <p className="text-sm text-muted">
            {b.shop} · {b.barrio}
          </p>
        </div>
      </div>

      <Section title={<StepTitle n={1}>Servicio</StepTitle>}>
        <div className="grid gap-2">
          {b.services.map((x) => (
            <button
              key={x.id}
              type="button"
              aria-pressed={svc === x.id}
              onClick={() => {
                setSvc(x.id);
                setTime(null);
              }}
              className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left ${
                svc === x.id ? "border-mode bg-mode-soft" : "border-line bg-paper"
              }`}
            >
              <span>
                <span className="block font-semibold">{x.name}</span>
                <span className="block text-sm text-muted">{x.minutes} min</span>
              </span>
              <span className="font-serif text-xl tabular-nums">{formatArs(x.price)}</span>
            </button>
          ))}
        </div>
      </Section>

      <Section title={<StepTitle n={2}>Día</StepTitle>}>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          {Array.from({ length: 14 }, (_, d) => {
            const { dow, num } = dayShort(d);
            const off = isClosed(d, b.modality);
            const active = d === day;
            return (
              <button
                key={d}
                type="button"
                disabled={off}
                onClick={() => {
                  setDay(d);
                  setTime(null);
                }}
                className={`flex w-14 shrink-0 flex-col items-center gap-0.5 rounded-2xl border py-2.5 ${
                  active ? "border-mode bg-mode text-white" : off ? "border-transparent bg-sage-soft text-muted/60 line-through" : "border-line bg-paper"
                }`}
              >
                <span className="text-[11px] font-bold uppercase">{d === 0 ? "hoy" : dow}</span>
                <span className="font-serif text-2xl leading-none">{num}</span>
              </button>
            );
          })}
        </div>
      </Section>

      <Section title={<StepTitle n={3}>Horario</StepTitle>}>
        {closed ? (
          <p className="text-muted">Ese día está cerrado.</p>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {grid.map(({ time: t, free }) => (
              <button
                key={t}
                type="button"
                disabled={!free}
                onClick={() => setTime(t)}
                className={`rounded-xl border py-2.5 text-sm font-semibold tabular-nums ${
                  time === t ? "border-mode bg-mode text-white" : free ? "border-line bg-paper" : "border-transparent bg-sage-soft text-muted/50 line-through"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}
        <label className="mt-2 flex flex-col gap-1.5 text-sm">
          <span className="font-semibold">Nota para {b.name.split(" ")[0]} (opcional)</span>
          <textarea
            id="nota-turno"
            maxLength={140}
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ej.: degradé bajo, vengo con mi hijo"
            className="rounded-xl border border-line bg-paper px-3 py-2 text-[15px] outline-none focus:border-mode"
          />
        </label>
        <button
          type="button"
          className="self-start text-sm font-semibold underline underline-offset-4"
          onClick={() =>
            openWa(b.name, `Hola ${b.name.split(" ")[0]}, te encontré en Unbarber. Quiero sacar turno para ${service.name.toLowerCase()}. ¿Qué día tenés?`)
          }
        >
          ¿Preferís coordinar por WhatsApp?
        </button>
      </Section>

      <div
        className="fixed inset-x-0 bottom-0 z-30 mx-auto flex md:max-w-[440px] flex-col gap-2 border-t border-line bg-paper/95 px-4 pt-3 backdrop-blur"
        style={{ paddingBottom: "max(14px, env(safe-area-inset-bottom, 0px))" }}
      >
        <p className="text-sm text-muted">
          {time ? (
            <>
              <b className="text-pine">
                {dayLabel(day)} {time} a {fromMinutes(toMinutes(time) + service.minutes)}
              </b>{" "}
              · {service.name} · {formatArs(service.price)}
            </>
          ) : (
            "Elegí un horario libre"
          )}
        </p>
        <Btn
          variant="mode"
          size="lg"
          block
          disabled={!time}
          onClick={() =>
            time &&
            dispatch({
              t: "requestAppt",
              appt: { barberId: b.id, clientId: "me", serviceId: svc, day, time, origin: "app", note: note || undefined },
              then: "done",
            })
          }
        >
          Pedir turno
        </Btn>
      </div>
    </main>
  );
}

function StepTitle({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-2">
      <span className="grid size-7 place-items-center rounded-full bg-mode font-sans text-sm font-bold text-white">{n}</span>
      {children}
    </span>
  );
}

/* ───────── Pedido enviado ───────── */

export function BookDone({ apptId }: { apptId: string }) {
  const { s, barber, tab, openWa, dispatch } = useDemo();
  const a = s.appointments.find((x) => x.id === apptId)!;
  const b = barber(a.barberId);
  const svc = b.services.find((x) => x.id === a.serviceId)!;
  const first = b.name.split(" ")[0];
  const code = `${apptId.toUpperCase()}K7`;
  const confirmed = a.status === "confirmed";

  return (
    <main className="on-dark flex min-h-dvh flex-col gap-6 bg-pine px-5 pb-10 pt-12 text-paper">
      <span className="grid size-14 place-items-center rounded-full bg-peach text-pine">
        <Check className="size-7" strokeWidth={2.5} />
      </span>
      <div>
        <h1 className="text-[40px] leading-[1.02]">
          {confirmed ? (
            <>
              Turno <span className="accent">confirmado</span>
            </>
          ) : (
            <>
              Pedido <span className="accent">enviado</span>
            </>
          )}
        </h1>
        <p className="mt-3 text-paper/75">
          {confirmed ? `${first} aceptó tu turno. Te esperamos.` : `${first} tiene hasta las 21:00 para responder. Te avisamos apenas lo acepte.`}
        </p>
      </div>
      <div className="rounded-2xl bg-pine-2 p-4">
        <p className="font-serif text-2xl">
          {dayLabel(a.day)} · {a.time}
        </p>
        <p className="text-sm text-paper/70">
          {svc.name} con {b.name} · {formatArs(svc.price)}
        </p>
        <p className="mt-1 text-sm text-paper/70">{b.address}</p>
      </div>
      <div className="mt-auto flex flex-col gap-3">
        {!confirmed && (
          <Btn
            variant="paper"
            size="lg"
            onClick={() => openWa(b.name, `Hola ${first}, te pedí turno por Unbarber para el ${dayLabel(a.day).toLowerCase()} a las ${a.time}. Aceptalo acá: unbarber.app/s/${code}`)}
          >
            <WaIcon /> Avisarle por WhatsApp
          </Btn>
        )}
        <a
          href={googleCalendarUrl(`Corte con ${b.name}`, a.day, a.time, svc.minutes, b.address)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-[1.5px] border-paper/70 px-5 font-semibold"
        >
          <CalendarPlus className="size-5" /> Agregar a mi calendario
        </a>
        <Btn variant="ghost" className="text-paper" onClick={() => tab({ id: "c-turnos" })}>
          Ver mis turnos
        </Btn>
        {!confirmed && (
          <button
            type="button"
            onClick={() => dispatch({ t: "setStatus", apptId, status: "confirmed", toast: `${first} aceptó tu turno` })}
            className="mt-2 rounded-xl border border-dashed border-paper/30 px-4 py-2 text-xs text-paper/60"
          >
            Demo: simular que {first} lo acepta
          </button>
        )}
      </div>
    </main>
  );
}

