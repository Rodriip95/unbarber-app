"use client";

import { PoleStripe } from "@/components/ui/PoleStripe";

/** Asistente de onboarding: rol, WhatsApp, push, Términos y 18+. Ver spec 02 (T-021 a T-023). */
export default function Bienvenida() {
  return (
    <main className="flex flex-1 flex-col">
      <PoleStripe />
      <div className="p-6">
        <h1 className="font-display text-2xl uppercase">Bienvenido</h1>
        <p className="mt-2 text-gray-text">En construcción (T-021).</p>
      </div>
    </main>
  );
}
