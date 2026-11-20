import type { ReactNode } from "react";

export function Tag({ children, tone = "ink" }: { children: ReactNode; tone?: "ink" | "mode" }) {
  const color = tone === "mode" ? "bg-mode text-white" : "bg-white text-ink";
  return (
    <span className={`inline-block border-2 border-ink px-2 py-0.5 text-xs font-bold uppercase tracking-widest ${color}`}>
      {children}
    </span>
  );
}
