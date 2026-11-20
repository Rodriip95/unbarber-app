"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PoleStripe } from "@/components/ui/PoleStripe";
import { copy } from "@/lib/copy/es-AR";
import { useAuth } from "@/lib/firebase/useAuth";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/entrar/");
  }, [loading, user, router]);

  if (loading || !user) return null;
  const firstName = user.displayName?.split(" ")[0];

  return (
    <main className="flex flex-1 flex-col">
      <header className="flex items-center justify-between px-4 py-3">
        <span className="font-display text-xl uppercase">Unbarber</span>
      </header>
      <PoleStripe />
      <section className="flex flex-col gap-4 p-4">
        <h1 className="font-display text-2xl uppercase leading-tight">{copy.home.greeting(firstName)}</h1>
        <Link href="/ahora/" className="block border-2 border-ink bg-red p-5 text-white shadow-hard">
          <span className="block font-display text-2xl uppercase">{copy.home.ahora}</span>
          <span className="block">{copy.home.ahoraSub}</span>
        </Link>
        <Link href="/turno/" className="block border-2 border-ink bg-blue p-5 text-white shadow-hard">
          <span className="block font-display text-2xl uppercase">{copy.home.turno}</span>
          <span className="block">{copy.home.turnoSub}</span>
        </Link>
      </section>
    </main>
  );
}
