"use client";

import { ArrowRight, CalendarDays, Check, Heart, MapPin, Star, Users, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { DEMO_ACCOUNTS, type Role } from "@/lib/demo/data";
import { useDemo } from "@/lib/demo/store";
import { Btn, Sheet } from "./ui";

const HERO = "demo/hero.jpg";

function GoogleG() {
  return (
    <svg viewBox="0 0 48 48" className="size-5" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.7 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.9 6.1C12.5 13.6 17.8 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.8c4.3-4 6.9-9.9 6.9-17.2z" />
      <path fill="#FBBC05" d="M10.5 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-7.9-6.1C1 16.6 0 20.2 0 24s.9 7.4 2.6 10.7l7.9-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.8c-2.1 1.4-4.8 2.3-8.5 2.3-6.2 0-11.5-4.2-13.4-9.9l-7.9 6.1C6.6 42.6 14.6 48 24 48z" />
    </svg>
  );
}

const ROTATING = ["nuevo cliente", "barbero de confianza"];

export function LoginScreen() {
  const { dispatch } = useDemo();
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((x) => (x + 1) % ROTATING.length), 3200);
    return () => clearInterval(id);
  }, []);

  return (
    <main className="on-dark flex min-h-dvh flex-col bg-pine text-paper">
      <div className="relative aspect-[402/290] w-full overflow-hidden bg-pine-2">
        {/* eslint-disable-next-line @next/next/no-img-element -- export estático, sin optimizador */}
        <img src={HERO} alt="Barbero cortando el pelo en una barbería de Buenos Aires" className="size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-pine/10 to-pine/40" />
      </div>
      <div className="bg-paper px-8 py-10 text-pine">
        <Logo className="mx-auto h-auto w-full max-w-[320px]" />
      </div>
      <div className="flex flex-1 flex-col items-center justify-between gap-8 px-6 pb-10 pt-8 text-center">
        <h1 className="text-[40px] leading-[1.02]">
          <span className="text-[#6f8178]">Tu próximo</span>
          <br />
          <span key={i} className="sheet-in inline-block text-[#6f8178]">
            {ROTATING[i]}
          </span>
          <br />
          <span className="accent">a la vuelta de la esquina</span>
        </h1>
        <div className="flex w-full flex-col items-center gap-4">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex min-h-14 w-full max-w-[260px] items-center gap-3 rounded-2xl bg-[#87958c] px-3 pr-5 font-semibold text-white shadow-[0_6px_0_0_#4c5a52] transition-transform active:translate-y-[4px] active:shadow-none"
          >
            <span className="grid size-9 place-items-center rounded-full bg-white">
              <GoogleG />
            </span>
            Empezar con Google
          </button>
          <p className="max-w-[280px] text-xs text-paper/55">Sin SMS ni contraseñas. Usamos tu cuenta de Google solo para identificarte.</p>
        </div>
      </div>

      <Sheet open={open} onClose={() => setOpen(false)} title="Elegí una cuenta">
        <p className="-mt-2 mb-4 text-sm text-muted">para continuar a Unbarber</p>
        <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-2xl border border-line bg-paper text-pine">
          {DEMO_ACCOUNTS.map((a) => (
            <li key={a.email}>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  dispatch({ t: "login", account: a });
                }}
                className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-sage-soft"
              >
                <span className="grid size-10 place-items-center rounded-full bg-slate font-semibold text-white">{a.initials}</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{a.name}</span>
                  <span className="block truncate text-sm text-muted">{a.email}</span>
                </span>
                <ArrowRight className="size-4 text-muted" />
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-4 rounded-xl bg-sage-soft px-4 py-3 text-xs text-muted">
          Modo demo: el inicio de sesión está simulado y no se conecta con Google.
        </p>
      </Sheet>
    </main>
  );
}

const TERMS = [
  ["Unbarber conecta, no corta", "Somos el punto de encuentro. El servicio y el precio los acuerdan vos y el barbero."],
  ["El pago es entre ustedes", "La app no cobra cortes. Pagás en el momento, como siempre."],
  ["Tus datos, cuidados", "Tu teléfono solo lo ve el barbero o cliente con el que hablás. Nunca mostramos direcciones exactas de casas."],
  ["Calificaciones honestas", "Después de cada corte, los dos se califican. Sin insultos ni datos personales."],
  ["Si sos barbero", "Registro y prueba sin cargo. Después, membresía de acceso de pago único (te avisamos antes)."],
] as const;

export function TermsScreen() {
  const { dispatch, s } = useDemo();
  const [terms, setTerms] = useState(false);
  const [adult, setAdult] = useState(false);
  const [legal, setLegal] = useState(false);
  const first = s.account?.name.split(" ")[0];

  return (
    <main className="flex min-h-dvh flex-col bg-cream">
      <div className="on-dark bg-pine px-6 pb-8 pt-10 text-paper">
        <p className="eyebrow">Hola, {first}</p>
        <h1 className="mt-2 text-[38px] leading-[1.05]">
          Antes de empezar, unas reglas <span className="accent">claras</span>
        </h1>
      </div>
      <ol className="flex flex-col gap-5 px-6 py-7">
        {TERMS.map(([t, d]) => (
          <li key={t} className="grid grid-cols-[28px_1fr] gap-3">
            <Check className="mt-1 size-5 text-terra" />
            <div>
              <p className="font-semibold">{t}</p>
              <p className="text-[15px] leading-snug text-muted">{d}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-auto flex flex-col gap-4 border-t border-line bg-paper px-6 py-6">
        <label className="flex items-start gap-3 text-[15px]">
          <input id="acepto-terminos" type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-0.5 size-5 accent-pine" />
          <span>
            Leí y acepto los{" "}
            <button type="button" className="font-semibold underline underline-offset-2" onClick={() => setLegal(true)}>
              Términos y la Política de privacidad
            </button>
          </span>
        </label>
        <label className="flex items-start gap-3 text-[15px]">
          <input id="mayor-18" type="checkbox" checked={adult} onChange={(e) => setAdult(e.target.checked)} className="mt-0.5 size-5 accent-pine" />
          <span>Tengo 18 años o más</span>
        </label>
        <Btn block size="lg" disabled={!terms || !adult} onClick={() => dispatch({ t: "acceptTerms" })}>
          Aceptar y seguir
        </Btn>
        <Btn variant="ghost" size="sm" onClick={() => dispatch({ t: "logout" })}>
          Ahora no
        </Btn>
      </div>
      <Sheet open={legal} onClose={() => setLegal(false)} title="Términos y privacidad">
        <div className="max-h-[50vh] overflow-y-auto pr-1 text-[15px] leading-relaxed text-muted">
          <p>
            Borrador en revisión legal. La versión final va a cubrir el rol de Unbarber como intermediario, la membresía de barberos, el uso de
            datos personales (Ley 25.326) y el botón de arrepentimiento.
          </p>
          <p className="mt-3">En la demo este texto es de ejemplo.</p>
        </div>
      </Sheet>
    </main>
  );
}

const OPTIONS: {
  role: Role;
  eyebrow: string;
  title: [string, string];
  perks: { icon: typeof Zap; text: string }[];
  foot?: string;
}[] = [
  {
    role: "client",
    eyebrow: "Para clientes",
    title: ["Busco un", "nuevo barbero"],
    perks: [
      { icon: Zap, text: "Cortate hoy: mirá quién está libre cerca" },
      { icon: CalendarDays, text: "Sacá turno en tres toques" },
      { icon: Heart, text: "Guardá a tus barberos de confianza" },
    ],
  },
  {
    role: "barber",
    eyebrow: "Para barberos",
    title: ["Busco", "nuevos clientes"],
    perks: [
      { icon: MapPin, text: "Ponete disponible y aparecé en tu zona" },
      { icon: CalendarDays, text: "Pedidos y turnos en una sola agenda" },
      { icon: Users, text: "Tus clientes y tu reputación, juntos" },
      { icon: Star, text: "Las calificaciones hablan por vos" },
    ],
    foot: "Registro y prueba sin cargo. Después, membresía de acceso de pago único.",
  },
];

export function RoleScreen() {
  const { dispatch } = useDemo();
  return (
    <main className="flex min-h-dvh flex-col gap-5 bg-cream px-4 pb-8 pt-10">
      <div className="px-2">
        <p className="eyebrow">Último paso</p>
        <h1 className="mt-2 text-[38px] leading-[1.05]">
          ¿Qué estás <span className="accent">buscando?</span>
        </h1>
      </div>
      {OPTIONS.map((o) => {
        const dark = o.role === "client";
        return (
          <button
            key={o.role}
            type="button"
            onClick={() => dispatch({ t: "setRole", role: o.role })}
            className={`group flex flex-col gap-4 rounded-3xl p-6 text-left shadow-card transition-transform active:scale-[0.99] ${
              dark ? "on-dark bg-pine text-paper" : "border border-line bg-paper text-pine"
            }`}
          >
            <span className="eyebrow">{o.eyebrow}</span>
            <span className="font-serif text-[34px] leading-[1.02]">
              {o.title[0]} <span className="accent">{o.title[1]}</span>
            </span>
            <ul className="flex flex-col gap-2.5">
              {o.perks.map(({ icon: Icon, text }) => (
                <li key={text} className={`flex items-center gap-3 text-[15px] ${dark ? "text-paper/85" : "text-pine/85"}`}>
                  <Icon className={`size-4 shrink-0 ${dark ? "text-peach" : "text-terra"}`} />
                  {text}
                </li>
              ))}
            </ul>
            {o.foot && <span className="text-xs text-muted">{o.foot}</span>}
            <span
              className={`mt-1 inline-flex min-h-11 items-center gap-2 self-start rounded-full px-5 text-sm font-semibold shadow-press ${
                dark ? "bg-paper text-pine" : "bg-pine text-paper"
              }`}
            >
              {o.role === "client" ? "Buscar barbero" : "Sumar mi barbería"} <ArrowRight className="size-4" />
            </span>
          </button>
        );
      })}
      <p className="px-2 text-center text-sm text-muted">Podés cambiar de modo cuando quieras desde tu perfil.</p>
    </main>
  );
}
