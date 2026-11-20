import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 border-2 border-ink min-h-11 px-4 font-bold transition-transform disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary:
    "min-h-14 bg-mode text-white font-display uppercase shadow-hard active:translate-x-1 active:translate-y-1 active:shadow-none",
  secondary: "bg-white text-ink",
  ghost: "border-0 underline bg-transparent",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
