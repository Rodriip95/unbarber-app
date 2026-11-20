/** Franja diagonal del poste. Solo como firma bajo el encabezado, nunca como fondo. */
export function PoleStripe() {
  return (
    <div
      aria-hidden
      className="h-2 w-full border-y-2 border-ink"
      style={{
        background:
          "repeating-linear-gradient(-45deg, var(--red) 0 10px, #fff 10px 20px, var(--blue) 20px 30px, #fff 30px 40px)",
      }}
    />
  );
}
