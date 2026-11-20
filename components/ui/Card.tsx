import type { ReactNode } from "react";

export function Card({
  header,
  headerTone = "mode",
  footer,
  highlighted = false,
  children,
}: {
  header?: ReactNode;
  headerTone?: "mode" | "red" | "blue" | "white";
  footer?: ReactNode;
  highlighted?: boolean;
  children: ReactNode;
}) {
  const tones = { mode: "bg-mode text-white", red: "bg-red text-white", blue: "bg-blue text-white", white: "bg-white" };
  return (
    <section className={`border-2 border-ink bg-white ${highlighted ? "shadow-hard" : ""}`}>
      {header && <header className={`border-b-2 border-ink px-4 py-2 font-display uppercase ${tones[headerTone]}`}>{header}</header>}
      <div className="p-4">{children}</div>
      {footer && <footer className="grid grid-cols-2 border-t-2 border-ink divide-x-2 divide-ink">{footer}</footer>}
    </section>
  );
}
