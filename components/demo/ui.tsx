"use client";

import { ChevronLeft, Star, X } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { Barber } from "@/lib/demo/data";

/* ───────── Botones: pastilla con sombra inferior dura ───────── */

type BtnVariant = "pine" | "mode" | "paper" | "outline" | "outline-light" | "ghost" | "terra";

const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-[transform,box-shadow] duration-100 disabled:opacity-45 disabled:pointer-events-none select-none";
const btnSize = { md: "min-h-12 px-5 text-[15px]", sm: "min-h-9 px-4 text-sm", lg: "min-h-14 px-6 text-base" };
const btnVariants: Record<BtnVariant, string> = {
  pine: "bg-pine text-paper shadow-press active:translate-y-[3px] active:shadow-none",
  mode: "bg-mode text-white shadow-press active:translate-y-[3px] active:shadow-none",
  terra: "bg-terra text-white shadow-press active:translate-y-[3px] active:shadow-none",
  paper: "bg-paper text-pine shadow-press active:translate-y-[3px] active:shadow-none",
  outline: "border-[1.5px] border-pine text-pine bg-transparent active:bg-pine/5",
  "outline-light": "border-[1.5px] border-paper/70 text-paper bg-transparent active:bg-paper/10",
  ghost: "text-pine underline underline-offset-4 decoration-1",
};

export function Btn({
  variant = "pine",
  size = "md",
  block = false,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; size?: keyof typeof btnSize; block?: boolean }) {
  return (
    <button
      type="button"
      className={`${btnBase} ${btnSize[size]} ${btnVariants[variant]} ${block ? "w-full" : ""} ${className}`}
      {...props}
    />
  );
}

/* ───────── Estructura de pantalla ───────── */

export function TopBar({ title, onBack, right, dark = false }: { title?: ReactNode; onBack?: () => void; right?: ReactNode; dark?: boolean }) {
  return (
    <header
      className={`sticky top-0 z-20 flex h-14 items-center gap-2 px-2 ${dark ? "bg-pine text-paper on-dark" : "bg-cream/95 text-pine backdrop-blur"}`}
    >
      {onBack ? (
        <button type="button" onClick={onBack} aria-label="Volver" className="grid size-10 place-items-center rounded-full active:bg-black/5">
          <ChevronLeft className="size-6" />
        </button>
      ) : (
        <span className="w-2" />
      )}
      <div className="min-w-0 flex-1 truncate font-serif text-xl">{title}</div>
      {right}
    </header>
  );
}

export function Section({ title, action, children, className = "" }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`flex flex-col gap-3 px-4 ${className}`}>
      {(title || action) && (
        <div className="flex items-baseline justify-between gap-3">
          {title && <h2 className="font-serif text-2xl leading-tight">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Card({ children, className = "", onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  const cls = `rounded-2xl border border-line bg-paper ${className}`;
  return onClick ? (
    <button type="button" onClick={onClick} className={`${cls} block w-full text-left active:scale-[0.99] transition-transform`}>
      {children}
    </button>
  ) : (
    <div className={cls}>{children}</div>
  );
}

export function Chip({ children, active = false, onClick }: { children: ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
        active ? "border-pine bg-pine text-paper" : "border-line bg-paper text-pine"
      }`}
    >
      {children}
    </button>
  );
}

type TagTone = "pine" | "terra" | "slate" | "ok" | "muted" | "peach";
const tagTones: Record<TagTone, string> = {
  pine: "bg-pine text-paper",
  terra: "bg-terra text-white",
  slate: "bg-slate text-white",
  ok: "bg-ok/12 text-ok",
  muted: "bg-sage-soft text-muted",
  peach: "bg-peach text-pine",
};
export function Tag({ children, tone = "muted" }: { children: ReactNode; tone?: TagTone }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.08em] ${tagTones[tone]}`}>
      {children}
    </span>
  );
}

export function LiveDot() {
  return (
    <span className="relative inline-flex size-2">
      <span className="absolute inset-0 animate-ping rounded-full bg-ok/60 motion-reduce:hidden" />
      <span className="relative inline-flex size-2 rounded-full bg-ok" />
    </span>
  );
}

/* ───────── Personas y fotos ───────── */

const toneBg = { pine: "bg-pine text-peach", terra: "bg-terra text-paper", slate: "bg-slate text-paper", moss: "bg-moss text-paper" };

export function initials(name: string) {
  return name
    .replace(/«.*»/, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("");
}

export function Avatar({ name, tone = "pine", size = 48, ring = false }: { name: string; tone?: Barber["tone"]; size?: number; ring?: boolean }) {
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full font-serif italic ${toneBg[tone]} ${ring ? "ring-[3px] ring-paper" : ""}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}

/**
 * Lugar para fotos reales de barberías. Mientras no estén (pedido de Rodri, 25/11/2026),
 * un skeleton gris con brillo suave, igual que en la landing.
 * `variant` queda por compatibilidad y no cambia el color.
 */
export function Photo({
  label,
  className = "",
  src,
}: {
  label?: string;
  className?: string;
  variant?: "moss" | "sage" | "pine";
  src?: string;
}) {
  // eslint-disable-next-line @next/next/no-img-element -- export estático, sin optimizador
  if (src) return <img src={src} alt={label ?? ""} className={`object-cover ${className}`} />;
  const radius = className.includes("rounded") ? "" : "rounded-2xl";
  return <div aria-hidden className={`animate-pulse bg-[#c7cdc3] motion-reduce:animate-none ${radius} ${className}`} />;
}

export function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} de 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} style={{ width: size, height: size }} className={i <= Math.round(value) ? "fill-terra text-terra" : "text-line"} />
      ))}
    </span>
  );
}

export function RatingInline({ b }: { b: Barber }) {
  if (b.rating.count < 5)
    return (
      <span className="text-sm text-muted">
        <Tag tone="peach">Nuevo</Tag>
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-sm">
      <Star className="size-3.5 fill-terra text-terra" />
      <b className="font-semibold">{b.rating.avg.toLocaleString("es-AR")}</b>
      <span className="text-muted">({b.rating.count})</span>
    </span>
  );
}

/* ───────── Hojas y avisos ───────── */

export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title?: ReactNode; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal>
      <button type="button" aria-label="Cerrar" className="absolute inset-0 bg-pine/55" onClick={onClose} />
      <div
        className="sheet-in relative w-full max-w-[440px] rounded-t-3xl bg-cream px-5 pt-3 text-pine shadow-card"
        style={{ paddingBottom: "max(20px, env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line" />
        <div className="mb-4 flex items-start justify-between gap-3">
          {title && <h3 className="font-serif text-2xl leading-tight">{title}</h3>}
          <button type="button" onClick={onClose} aria-label="Cerrar" className="grid size-9 shrink-0 place-items-center rounded-full bg-sage-soft">
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Toast({ text }: { text: string | null }) {
  if (!text) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex justify-center px-4">
      <div className="sheet-in rounded-full bg-pine px-5 py-3 text-sm font-medium text-paper shadow-card" role="status">
        {text}
      </div>
    </div>
  );
}

export function Divider() {
  return <hr className="border-line" />;
}

/** Ícono de WhatsApp simple (no está en lucide) */
export function WaIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s1 2.6 1.1 2.7c.1.2 1.9 2.9 4.6 4 1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.2-.2-.4-.3Z" />
    </svg>
  );
}
