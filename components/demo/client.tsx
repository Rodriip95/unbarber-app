"use client";

import { ArrowRight, Bell, CalendarPlus, Check, Clock, LogOut, MapPin, Phone, Repeat, RotateCcw, Scissors, SlidersHorizontal, Store } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { BARBERS, MODALITY_LABEL, type Barber, type Modality } from "@/lib/demo/data";
import { useDemo } from "@/lib/demo/store";
import { dayLabel, formatArs, googleCalendarUrl, km } from "@/lib/demo/time";
import { BarberCard, BarberTile, STATUS } from "./shared";
import { Avatar, Btn, Card, Chip, LiveDot, Section, Sheet, Tag, TopBar, WaIcon } from "./ui";

const MY_ZONE = "Villa Crespo";

/* ───────── Inicio del cliente ───────── */

export function ClientHome() {
  const { s, go, tab, barber, openWa } = useDemo();
  const first = s.account?.name.split(" ")[0];
  const free = BARBERS.filter((b) => b.availableNow);
  const upcoming = s.appointments
    .filter((a) => a.clientId === "me" && a.day >= 0 && (a.status === "confirmed" || a.status === "requested"))
    .sort((a, b) => a.day - b.day || a.time.localeCompare(b.time));
  const next = upcoming[0];
  const more = upcoming.length - 1;
  const nearby = [...BARBERS].sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 5);

  return (
    <main className="flex flex-col gap-7 pb-12">
      <div className="px-4 pt-2">
        <h1 className="text-[40px] leading-[1.02]">
          ¿Te cortás hoy, <span className="accent">{first}?</span>
        </h1>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-muted">
          <MapPin className="size-4" /> {MY_ZONE}, CABA
        </p>
      </div>

      {s.alert.status !== "none" && (
        <div className="px-4">
          <ZoneAlertCard />
        </div>
      )}

      <section aria-labelledby="home-corte" className="px-4">
        <div className="on-dark relative flex flex-col gap-3 overflow-hidden rounded-3xl bg-pine p-6 text-paper shadow-card">
          <span className="flex items-center gap-2 text-sm text-paper/80">
            <LiveDot /> {free.length} barberos libres cerca
          </span>
          <h2 id="home-corte" className="max-w-[230px] font-serif text-[36px] leading-[1.02]">
            ¿Ahora o con <span className="accent">turno?</span>
          </h2>
          <p className="max-w-[240px] text-[15px] text-paper/75">
            Escribile a quien tiene el sillón libre, o reservá día y horario.
          </p>
          <div className="relative z-10 mt-2 flex flex-col gap-2.5">
            <Btn variant="paper" block onClick={() => go({ id: "ahora" })}>
              <Scissors className="size-4" /> Cortarme ahora
            </Btn>
            <Btn variant="outline-light" block onClick={() => tab({ id: "c-search" })}>
              <CalendarPlus className="size-4" /> Sacar turno
            </Btn>
          </div>
          <span
            aria-hidden
            className="pole-loader absolute -right-5 top-5 h-32 w-11 rotate-[18deg] rounded-full opacity-90 ring-4 ring-pine-2"
          />
        </div>
      </section>

      {next && (
        <Section
          title={
            <>
              Tu próximo <span className="accent">turno</span>
            </>
          }
          action={
            more > 0 && (
              <button type="button" onClick={() => tab({ id: "c-turnos" })} className="text-sm font-semibold underline underline-offset-4">
                Ver {more === 1 ? "1 más" : `${more} más`}
              </button>
            )
          }
        >
          <Card onClick={() => tab({ id: "c-turnos" })} className="flex items-center gap-4 p-4">
            <div className="grid w-14 shrink-0 place-items-center rounded-xl bg-slate-soft py-2 text-slate">
              <span className="text-[11px] font-bold uppercase">{dayLabel(next.day).split(" ")[0]}</span>
              <span className="font-serif text-2xl leading-none">{next.time}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{barber(next.barberId).name}</p>
              <p className="truncate text-sm text-muted">{barber(next.barberId).shop}</p>
            </div>
            <Tag tone={STATUS[next.status].tone}>{STATUS[next.status].label}</Tag>
          </Card>
        </Section>
      )}

      <Section
        title={
          <>
            Cerca <span className="accent">tuyo</span>
          </>
        }
        action={
          <button type="button" onClick={() => tab({ id: "c-search" })} className="text-sm font-semibold underline underline-offset-4">
            Ver todos
          </button>
        }
      >
        <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto overscroll-x-contain px-4 pb-2">
          {nearby.map((b) => (
            <div key={b.id} className="snap-start">
              <BarberTile b={b} />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Mis barberos">
        {s.myBarbers.length === 0 ? (
          <p className="text-sm text-muted">Tocá el corazón en un perfil para guardarlo acá.</p>
        ) : (
          <Card className="divide-y divide-line">
            {s.myBarbers.map((id) => {
              const b = barber(id);
              return (
                <div key={id} className="flex items-center gap-3 p-3">
                  <button type="button" onClick={() => go({ id: "barber", barberId: id })} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                    <Avatar name={b.name} tone={b.tone} size={44} />
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{b.name}</span>
                      <span className="block truncate text-sm text-muted">
                        {b.availableNow ? `Libre hasta ${b.until}` : b.hours}
                      </span>
                    </span>
                  </button>
                  <button
                    type="button"
                    aria-label={`WhatsApp a ${b.name}`}
                    onClick={() => openWa(b.name, `Hola ${b.name.split(" ")[0]}, ¿tenés lugar para un corte?`)}
                    className="grid size-10 place-items-center rounded-full bg-sage-soft text-pine"
                  >
                    <WaIcon className="size-5" />
                  </button>
                </div>
              );
            })}
          </Card>
        )}
      </Section>
    </main>
  );
}

/* ───────── Buscar barberos cercanos ───────── */

const FILTERS = [
  { id: "all", label: "Todos" },
  { id: "now", label: "Libres ahora" },
  { id: "barrio", label: "De barrio" },
  { id: "centro", label: "Céntricas" },
  { id: "domicilio", label: "A domicilio" },
] as const;

/** Mapa ilustrado (sin servicio externo): calles en diagonal como el damero porteño. */
function MiniMap({ ids }: { ids: string[] }) {
  const { go } = useDemo();
  const spots = [
    [52, 46],
    [70, 26],
    [36, 64],
    [26, 30],
    [80, 70],
    [60, 82],
  ];
  return (
    <div className="relative h-44 overflow-hidden rounded-3xl bg-sage-soft">
      <svg className="absolute inset-0 size-full" aria-hidden>
        <defs>
          <pattern id="damero" width="38" height="38" patternUnits="userSpaceOnUse" patternTransform="rotate(-12)">
            <path d="M0 0H38M0 0V38" stroke="#c7cec4" strokeWidth="5" fill="none" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#damero)" />
        <path d="M-10 120 C 120 90, 220 140, 460 60" stroke="#fdf8ee" strokeWidth="12" fill="none" />
      </svg>
      <span className="absolute left-[44%] top-[48%] grid size-5 place-items-center rounded-full bg-slate ring-4 ring-slate/25" aria-label="Vos" />
      {ids.slice(0, 6).map((id, i) => {
        const b = BARBERS.find((x) => x.id === id)!;
        return (
          <button
            key={id}
            type="button"
            onClick={() => go({ id: "barber", barberId: id })}
            className={`absolute -translate-x-1/2 -translate-y-full rounded-full px-2 py-1 text-[11px] font-bold shadow-card ${
              b.availableNow ? "bg-pine text-paper" : "bg-paper text-pine"
            }`}
            style={{ left: `${spots[i][0]}%`, top: `${spots[i][1]}%` }}
          >
            {km(b.distanceKm)}
          </button>
        );
      })}
      <span className="absolute bottom-2 right-3 text-[10px] font-semibold uppercase tracking-widest text-muted">{MY_ZONE}</span>
    </div>
  );
}

export function ClientSearch() {
  const [f, setF] = useState<(typeof FILTERS)[number]["id"]>("all");
  const list = useMemo(
    () =>
      BARBERS.filter((b) =>
        f === "all"
          ? true
          : f === "now"
            ? b.availableNow
            : f === "domicilio"
              ? b.modality === "domicilio"
              : b.kind === f,
      ).sort((a, b) => a.distanceKm - b.distanceKm),
    [f],
  );
  return (
    <main className="flex flex-col gap-4 pb-12">
      <div className="px-4 pt-2">
        <p className="eyebrow">Sacar turno</p>
        <h1 className="mt-1 text-[36px] leading-[1.05]">
          Barberos <span className="accent">cerca tuyo</span>
        </h1>
      </div>
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4">
        {FILTERS.map((x) => (
          <Chip key={x.id} active={f === x.id} onClick={() => setF(x.id)}>
            {x.label}
          </Chip>
        ))}
      </div>
      <div className="px-4">
        <MiniMap ids={list.map((b) => b.id)} />
      </div>
      <div className="flex flex-col gap-3 px-4">
        <p className="text-sm text-muted">
          {list.length} {list.length === 1 ? "barbero" : "barberos"} en 3 km
        </p>
        {list.map((b) => (
          <BarberCard key={b.id} b={b} origin="buscar" />
        ))}
      </div>
    </main>
  );
}

/* ───────── AHORA: búsqueda y lista ───────── */

type AhoraFilters = {
  radius: number;
  modality: Modality | "all";
  maxPrice: number | null;
  minRating: number;
  sort: "recomendados" | "cerca" | "rating" | "precio";
};

const DEFAULT_FILTERS: AhoraFilters = { radius: 3, modality: "all", maxPrice: null, minRating: 0, sort: "recomendados" };

const SORT_LABEL: Record<AhoraFilters["sort"], string> = {
  recomendados: "Recomendados",
  cerca: "Más cerca",
  rating: "Mejor calificados",
  precio: "Más baratos",
};

const cutPrice = (b: Barber) => Math.min(...b.services.map((x) => x.price));

function applyAhoraFilters(f: AhoraFilters): Barber[] {
  const score = (b: Barber) => b.distanceKm * 0.6 - b.rating.avg * 0.4;
  const order: Record<AhoraFilters["sort"], (a: Barber, b: Barber) => number> = {
    recomendados: (a, b) => score(a) - score(b),
    cerca: (a, b) => a.distanceKm - b.distanceKm,
    rating: (a, b) => b.rating.avg - a.rating.avg,
    precio: (a, b) => cutPrice(a) - cutPrice(b),
  };
  return BARBERS.filter(
    (b) =>
      b.availableNow &&
      b.distanceKm <= f.radius &&
      (f.modality === "all" || b.modality === f.modality) &&
      (f.maxPrice === null || cutPrice(b) <= f.maxPrice) &&
      b.rating.avg >= f.minRating,
  ).sort(order[f.sort]);
}

/** Cuántos filtros difieren de los de fábrica (la distancia siempre se muestra aparte). */
function activeFilterCount(f: AhoraFilters) {
  return (
    Number(f.modality !== DEFAULT_FILTERS.modality) +
    Number(f.maxPrice !== DEFAULT_FILTERS.maxPrice) +
    Number(f.minRating !== DEFAULT_FILTERS.minRating) +
    Number(f.sort !== DEFAULT_FILTERS.sort)
  );
}

export function AhoraScreen() {
  const { back, go } = useDemo();
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AhoraFilters>(DEFAULT_FILTERS);
  const [sheetOpen, setSheetOpen] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setLoading(false), 2200);
    return () => clearTimeout(id);
  }, []);
  const list = applyAhoraFilters(filters);
  const extra = activeFilterCount(filters);

  if (loading)
    return (
      <main className="on-dark flex min-h-dvh flex-col items-center justify-center gap-8 bg-pine px-8 text-center text-paper">
        <span className="pole-loader block h-36 w-14 rounded-full ring-[6px] ring-paper" aria-hidden />
        <div>
          <h1 className="text-[34px] leading-tight">
            Buscando barberos <span className="accent">libres</span>
          </h1>
          <p className="mt-2 text-paper/70">cerca de {MY_ZONE}…</p>
        </div>
      </main>
    );

  const summary = [
    `Hasta ${filters.radius} km`,
    filters.modality !== "all" && MODALITY_LABEL[filters.modality],
    filters.maxPrice !== null && `Hasta ${formatArs(filters.maxPrice)}`,
    filters.minRating > 0 && `${filters.minRating.toLocaleString("es-AR")}+ estrellas`,
    filters.sort !== "recomendados" && SORT_LABEL[filters.sort],
  ].filter(Boolean);

  return (
    <main className="flex flex-col gap-4 pb-10">
      <TopBar onBack={back} title="Libres ahora" />
      <div className="px-4">
        <h1 className="text-[34px] leading-[1.05]">
          {list.length === 1 ? "1 barbero puede" : `${list.length} barberos pueden`} <span className="accent">atenderte ya</span>
        </h1>
      </div>
      <div className="flex items-center gap-3 px-4">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border-[1.5px] border-pine bg-paper px-4 text-sm font-semibold text-pine active:bg-pine/5"
        >
          <SlidersHorizontal className="size-4" /> Filtros
          {extra > 0 && <span className="grid min-w-5 place-items-center rounded-full bg-mode px-1.5 text-[11px] text-white">{extra}</span>}
        </button>
        <p className="min-w-0 truncate text-sm text-muted">{summary.join(" · ")}</p>
      </div>
      <div className="flex flex-col gap-3 px-4">
        {list.length === 0 && (
          <Card className="flex flex-col items-start gap-3 p-5">
            <p className="font-semibold">Nadie libre con estos filtros.</p>
            <p className="text-sm text-muted">Probá ampliar la distancia o avisale a los barberos de tu zona.</p>
            <Btn variant="outline" size="sm" onClick={() => setFilters(DEFAULT_FILTERS)}>
              Limpiar filtros
            </Btn>
          </Card>
        )}
        {list.map((b) => (
          <BarberCard key={b.id} b={b} />
        ))}
      </div>
      <div className="px-4 pt-2">
        <div className="on-dark flex flex-col gap-3 rounded-3xl bg-terra p-6 text-white">
          <Bell className="size-6" />
          <p className="font-serif text-[28px] leading-tight">¿No te sirve ninguno?</p>
          <p className="text-[15px] text-white/85">Avisamos a todos los barberos de tu zona, aunque no estén en la lista. El primero que pueda te escribe.</p>
          <Btn variant="paper" className="self-start" onClick={() => go({ id: "alerta" })}>
            Avisar a barberos de mi zona
          </Btn>
        </div>
      </div>
      {sheetOpen && <AhoraFiltersSheet open value={filters} onClose={() => setSheetOpen(false)} onApply={setFilters} />}
    </main>
  );
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-2.5">
      <legend className="mb-2.5 text-sm font-semibold">{title}</legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

/** Hoja inferior con todos los filtros de "cortarme ahora". Se edita un borrador y se aplica al confirmar. */
function AhoraFiltersSheet({
  open,
  value,
  onClose,
  onApply,
}: {
  open: boolean;
  value: AhoraFilters;
  onClose: () => void;
  onApply: (f: AhoraFilters) => void;
}) {
  // Se monta solo al abrirse, así el borrador arranca con los filtros aplicados.
  const [draft, setDraft] = useState(value);
  const set = <K extends keyof AhoraFilters>(k: K, v: AhoraFilters[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const count = applyAhoraFilters(draft).length;

  return (
    <Sheet open={open} onClose={onClose} title="Filtros">
      <div className="flex flex-col gap-6 pb-2">
        <FilterGroup title="Distancia">
          {[1, 3, 5, 10].map((r) => (
            <Chip key={r} active={draft.radius === r} onClick={() => set("radius", r)}>
              Hasta {r} km
            </Chip>
          ))}
        </FilterGroup>
        <FilterGroup title="Dónde te atiende">
          <Chip active={draft.modality === "all"} onClick={() => set("modality", "all")}>
            Todos
          </Chip>
          {(Object.keys(MODALITY_LABEL) as Modality[]).map((m) => (
            <Chip key={m} active={draft.modality === m} onClick={() => set("modality", m)}>
              {MODALITY_LABEL[m]}
            </Chip>
          ))}
        </FilterGroup>
        <FilterGroup title="Precio del corte">
          {[null, 8000, 10000, 12000].map((p) => (
            <Chip key={p ?? "all"} active={draft.maxPrice === p} onClick={() => set("maxPrice", p)}>
              {p === null ? "Cualquiera" : `Hasta ${formatArs(p)}`}
            </Chip>
          ))}
        </FilterGroup>
        <FilterGroup title="Calificación">
          {[0, 4.5, 4.8].map((r) => (
            <Chip key={r} active={draft.minRating === r} onClick={() => set("minRating", r)}>
              {r === 0 ? "Cualquiera" : `${r.toLocaleString("es-AR")} o más`}
            </Chip>
          ))}
        </FilterGroup>
        <FilterGroup title="Ordenar por">
          {(Object.keys(SORT_LABEL) as AhoraFilters["sort"][]).map((k) => (
            <Chip key={k} active={draft.sort === k} onClick={() => set("sort", k)}>
              {SORT_LABEL[k]}
            </Chip>
          ))}
        </FilterGroup>
        <div className="sticky bottom-0 -mx-5 flex items-center gap-3 border-t border-line bg-cream px-5 pt-3">
          <Btn variant="ghost" onClick={() => setDraft(DEFAULT_FILTERS)}>
            Limpiar
          </Btn>
          <Btn
            variant="mode"
            className="flex-1"
            onClick={() => {
              onApply(draft);
              onClose();
            }}
          >
            {count === 0 ? "Sin resultados" : count === 1 ? "Ver 1 barbero" : `Ver ${count} barberos`}
          </Btn>
        </div>
      </div>
    </Sheet>
  );
}

/* ───────── Alerta de zona (1.b) ───────── */

export function AlertaScreen() {
  const { s, dispatch, back } = useDemo();
  const [when, setWhen] = useState("Lo antes posible");
  const [service, setService] = useState("Corte");

  // Si ya hay un aviso en curso, se muestra su estado en lugar del formulario.
  if (s.alert.status !== "none")
    return (
      <main className="flex min-h-dvh flex-col gap-6 pb-10">
        <TopBar onBack={back} title="Tu aviso" />
        <div className="px-4">
          <ZoneAlertCard />
        </div>
      </main>
    );

  return (
    <main className="flex min-h-dvh flex-col gap-6 pb-10">
      <TopBar onBack={back} title="Avisar a mi zona" />
      <div className="px-4">
        <h1 className="text-[34px] leading-[1.05]">
          Busco corte <span className="accent">ahora</span> en {MY_ZONE}
        </h1>
        <p className="mt-2 text-muted">Le llega un aviso a los barberos a 3 km. Nadie ve tu teléfono hasta que elegís a quién responder.</p>
      </div>
      <Section title="¿Qué te hacés?">
        <div className="flex flex-wrap gap-2">
          {["Corte", "Barba", "Corte y barba"].map((x) => (
            <Chip key={x} active={service === x} onClick={() => setService(x)}>
              {x}
            </Chip>
          ))}
        </div>
      </Section>
      <Section title="¿Cuándo?">
        <div className="flex flex-wrap gap-2">
          {["Lo antes posible", "En la próxima hora", "Esta tarde"].map((x) => (
            <Chip key={x} active={when === x} onClick={() => setWhen(x)}>
              {x}
            </Chip>
          ))}
        </div>
      </Section>
      <div className="mt-auto px-4">
        <Btn
          block
          size="lg"
          variant="terra"
          onClick={() => {
            dispatch({ t: "sendAlert", service, when });
            window.scrollTo({ top: 0 });
          }}
        >
          <Bell className="size-5" /> Mandar aviso
        </Btn>
      </div>
    </main>
  );
}

/** Estado del aviso de zona: esperando a un barbero, o un barbero lo aceptó y falta confirmar. */
export function ZoneAlertCard() {
  const { s, dispatch, barber, go, openWa } = useDemo();
  const a = s.alert;
  if (a.status === "none") return null;
  const detail = [a.service, a.when?.toLowerCase()].filter(Boolean).join(" · ");

  if (a.status === "sent")
    return (
      <div role="status" className="flex flex-col gap-4 rounded-3xl border border-terra/40 bg-terra-soft p-5">
        <div className="flex items-start gap-4">
          <span className="pole-loader mt-1 block h-14 w-6 shrink-0 rounded-full ring-[3px] ring-paper" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="eyebrow text-terra">Aviso enviado</p>
            <p className="mt-1 font-serif text-[26px] leading-[1.05]">
              Un barbero te va a contactar <span className="accent">pronto</span>
            </p>
            <p className="mt-1.5 text-sm text-muted">
              Avisamos a 12 barberos de {MY_ZONE}
              {detail && ` · ${detail}`}.
            </p>
          </div>
        </div>
        <Btn variant="ghost" className="self-start" onClick={() => dispatch({ t: "resetAlert" })}>
          Cancelar aviso
        </Btn>
      </div>
    );

  const b = barber(a.barberId ?? "kevin");
  const first = b.name.split(" ")[0];
  return (
    <div role="status" className="on-dark flex flex-col gap-4 rounded-3xl bg-terra p-5 text-white shadow-card">
      <p className="flex items-center gap-2 text-sm font-semibold text-white/90">
        <Check className="size-4" /> {first} aceptó tu pedido
      </p>
      <button type="button" onClick={() => go({ id: "barber", barberId: b.id })} className="flex items-center gap-3 rounded-2xl bg-white/12 p-3 text-left">
        <Avatar name={b.name} tone={b.tone} size={52} />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-serif text-xl leading-tight">{b.name}</span>
          <span className="block truncate text-sm text-white/80">
            {b.barrio} · {km(b.distanceKm)} · {MODALITY_LABEL[b.modality].toLowerCase()}
          </span>
        </span>
        <ArrowRight className="size-4 shrink-0" />
      </button>
      <p className="flex items-center gap-2 font-serif text-[26px] leading-tight">
        <Clock className="size-5 shrink-0" /> Te atiende en {a.eta ?? 20} minutos
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        <Btn
          variant="outline-light"
          onClick={() => openWa(b.name, `Hola ${first}, vi que aceptaste mi aviso en Unbarber. ¿Me pasás la dirección?`)}
        >
          <WaIcon className="size-4" /> Escribirle
        </Btn>
        <Btn variant="paper" onClick={() => dispatch({ t: "confirmAlert" })}>
          <Check className="size-4" /> Confirmar
        </Btn>
      </div>
      <Btn variant="ghost" className="self-center text-white" onClick={() => dispatch({ t: "resetAlert" })}>
        No me sirve, cancelar
      </Btn>
    </div>
  );
}

/* ───────── Mis turnos ───────── */

export function ClientTurnos() {
  const { s, barber, dispatch, go, tab, openWa } = useDemo();
  const [tabId, setTab] = useState<"next" | "past">("next");
  const mine = s.appointments.filter((a) => a.clientId === "me");
  const list = mine
    .filter((a) => (tabId === "next" ? a.day >= 0 && ["requested", "confirmed"].includes(a.status) : !(a.day >= 0 && ["requested", "confirmed"].includes(a.status))))
    .sort((a, b) => (tabId === "next" ? a.day - b.day : b.day - a.day));

  return (
    <main className="flex flex-col gap-4 pb-12">
      <div className="px-4 pt-2">
        <h1 className="text-[36px] leading-[1.05]">
          Mis <span className="accent">turnos</span>
        </h1>
      </div>
      {s.alert.status !== "none" && (
        <div className="px-4">
          <Card onClick={() => tab({ id: "c-home" })} className="flex items-center gap-3 border-terra/40 bg-terra-soft p-4">
            <Bell className="size-5 text-terra" />
            <span className="flex-1 text-sm font-semibold">
              {s.alert.status === "sent" ? "Aviso de zona activo: esperando barberos" : "Un barbero aceptó tu aviso: confirmalo"}
            </span>
            <ArrowRight className="size-4" />
          </Card>
        </div>
      )}
      <div className="flex gap-2 px-4">
        <Chip active={tabId === "next"} onClick={() => setTab("next")}>
          Próximos
        </Chip>
        <Chip active={tabId === "past"} onClick={() => setTab("past")}>
          Pasados
        </Chip>
      </div>
      <div className="flex flex-col gap-3 px-4">
        {list.length === 0 && <p className="py-8 text-center text-muted">No tenés turnos {tabId === "next" ? "próximos" : "pasados"}.</p>}
        {list.map((a) => {
          const b = barber(a.barberId);
          const svc = b.services.find((x) => x.id === a.serviceId) ?? b.services[0];
          const st = STATUS[a.status];
          return (
            <Card key={a.id} className="flex flex-col gap-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-serif text-2xl leading-tight">
                    {dayLabel(a.day)} · {a.time}
                  </p>
                  <p className="text-sm text-muted">
                    {svc.name} con {b.name}
                  </p>
                </div>
                <Tag tone={st.tone}>{st.label}</Tag>
              </div>
              {a.status === "requested" && <p className="rounded-xl bg-slate-soft px-3 py-2 text-sm text-slate">Esperando que {b.name.split(" ")[0]} lo acepte.</p>}
              <div className="flex flex-wrap gap-2">
                {tabId === "next" ? (
                  <>
                    <Btn size="sm" variant="outline" onClick={() => openWa(b.name, `Hola ${b.name.split(" ")[0]}, te escribo por el turno del ${dayLabel(a.day).toLowerCase()} a las ${a.time}.`)}>
                      <WaIcon className="size-4" /> WhatsApp
                    </Btn>
                    <a
                      className="inline-flex min-h-9 items-center gap-2 rounded-full border-[1.5px] border-pine px-4 text-sm font-semibold"
                      href={googleCalendarUrl(`Corte con ${b.name}`, a.day, a.time, svc.minutes, b.address)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <CalendarPlus className="size-4" /> Calendario
                    </a>
                    <Btn size="sm" variant="ghost" onClick={() => dispatch({ t: "setStatus", apptId: a.id, status: "cancelled", toast: "Turno cancelado" })}>
                      Cancelar
                    </Btn>
                  </>
                ) : (
                  <>
                    {a.status === "completed" && !a.rated && (
                      <Btn size="sm" variant="mode" onClick={() => go({ id: "rate", apptId: a.id })}>
                        Calificar
                      </Btn>
                    )}
                    {a.rated && <span className="text-sm text-muted">Ya calificaste</span>}
                    <Btn size="sm" variant="outline" onClick={() => go({ id: "book", barberId: b.id, serviceId: svc.id })}>
                      <Repeat className="size-4" /> Repetir
                    </Btn>
                  </>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </main>
  );
}

/* ───────── Calificar al barbero (spec 09) ───────── */

const RATE_TAGS = ["Amable", "Divertido", "Puntual", "Prolijo", "Buena música", "Buen precio", "Escucha lo que pedís"];

export function RateScreen({ apptId }: { apptId: string }) {
  const { s, barber, back, dispatch } = useDemo();
  const a = s.appointments.find((x) => x.id === apptId)!;
  const b = barber(a.barberId);
  const [vals, setVals] = useState<Record<string, number>>({ Ambiente: 0, Servicio: 0, Barbero: 0 });
  const [tags, setTags] = useState<string[]>([]);
  const ready = Object.values(vals).every((v) => v > 0);
  return (
    <main className="flex min-h-dvh flex-col gap-6 pb-10">
      <TopBar onBack={back} title="Calificar" />
      <div className="flex items-center gap-4 px-4">
        <Avatar name={b.name} tone={b.tone} size={60} />
        <h1 className="text-[30px] leading-[1.05]">
          ¿Cómo te fue con <span className="accent">{b.name.split(" ")[0]}?</span>
        </h1>
      </div>
      <Section>
        <Card className="divide-y divide-line">
          {Object.keys(vals).map((k) => (
            <div key={k} className="flex items-center justify-between gap-3 px-4 py-3">
              <span className="font-semibold">{k}</span>
              <span className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" aria-label={`${k} ${n}`} onClick={() => setVals({ ...vals, [k]: n })} className="p-0.5">
                    <svg viewBox="0 0 24 24" className={`size-7 ${n <= vals[k] ? "fill-terra text-terra" : "fill-none text-line"}`} stroke="currentColor" strokeWidth="1.5">
                      <path d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" />
                    </svg>
                  </button>
                ))}
              </span>
            </div>
          ))}
        </Card>
      </Section>
      <Section title="¿Qué destacás?">
        <div className="flex flex-wrap gap-2">
          {RATE_TAGS.map((t) => (
            <Chip key={t} active={tags.includes(t)} onClick={() => setTags(tags.includes(t) ? tags.filter((x) => x !== t) : [...tags, t])}>
              {t}
            </Chip>
          ))}
        </div>
      </Section>
      <div className="mt-auto px-4">
        <Btn
          block
          size="lg"
          disabled={!ready}
          onClick={() => {
            dispatch({ t: "rated", apptId });
            dispatch({ t: "toast", text: "Gracias. Tu calificación ayuda a otros vecinos." });
            back();
          }}
        >
          Enviar calificación
        </Btn>
      </div>
    </main>
  );
}

/* ───────── Perfil (los dos modos) ───────── */

export function ProfileScreen() {
  const { s, dispatch, go, tab } = useDemo();
  const barberMode = s.role === "barber";
  const rows = [
    { icon: MapPin, label: "Zona", value: `${MY_ZONE}, CABA` },
    { icon: Phone, label: "WhatsApp", value: "+54 9 11 •••• 4821" },
    { icon: Bell, label: "Avisos", value: "Activados" },
  ];
  return (
    <main className={`flex flex-col gap-6 ${barberMode ? "pb-28" : "pb-12"}`}>
      <div className="on-dark flex flex-col items-start gap-3 bg-pine px-5 pb-7 pt-8 text-paper">
        <span className="grid size-16 place-items-center rounded-full bg-slate font-serif text-2xl italic text-white">{s.account?.initials}</span>
        <h1 className="text-[34px] leading-none">{s.account?.name}</h1>
        <p className="text-sm text-paper/70">{s.account?.email}</p>
        <Tag tone={barberMode ? "terra" : "slate"}>{barberMode ? "Modo barbero" : "Modo cliente"}</Tag>
      </div>
      {barberMode && (
        <Section title="Tu barbería">
          <Card onClick={() => go({ id: "barber", barberId: "self" })} className="flex items-center gap-3 p-4">
            <Store className="size-5 text-terra" />
            <span className="flex-1 font-semibold">Ver mi perfil público</span>
            <ArrowRight className="size-4" />
          </Card>
          <Card onClick={() => go({ id: "b-membership" })} className="flex items-center gap-3 p-4">
            <Scissors className="size-5 text-terra" />
            <span className="flex-1">
              <span className="block font-semibold">Membresía</span>
              <span className="block text-sm text-muted">{s.membership === "active" ? "Activa" : "Prueba sin cargo"}</span>
            </span>
            <ArrowRight className="size-4" />
          </Card>
        </Section>
      )}
      <Section title="Tus datos">
        <Card className="divide-y divide-line">
          {rows.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 px-4 py-3">
              <Icon className="size-5 text-muted" />
              <span className="flex-1 text-sm text-muted">{label}</span>
              <span className="text-sm font-semibold">{value}</span>
            </div>
          ))}
        </Card>
      </Section>
      <Section title="Demo">
        <Btn
          variant="mode"
          block
          onClick={() => {
            const role = barberMode ? "client" : "barber";
            dispatch({ t: "setRole", role });
            tab({ id: role === "barber" ? "b-inbox" : "c-home" });
          }}
        >
          Cambiar a modo {barberMode ? "cliente" : "barbero"}
        </Btn>
        <Btn variant="outline" block onClick={() => dispatch({ t: "reset" })}>
          <RotateCcw className="size-4" /> Reiniciar demo desde el login
        </Btn>
        <Btn variant="ghost" onClick={() => dispatch({ t: "logout" })}>
          <LogOut className="size-4" /> Cerrar sesión
        </Btn>
      </Section>
      <p className="px-4 text-center text-xs text-muted">Términos · Privacidad · Botón de arrepentimiento</p>
    </main>
  );
}
