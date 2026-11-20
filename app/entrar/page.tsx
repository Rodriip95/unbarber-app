"use client";

import { GoogleAuthProvider, signInWithPopup, signInWithRedirect } from "firebase/auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { PoleStripe } from "@/components/ui/PoleStripe";
import { copy } from "@/lib/copy/es-AR";
import { auth } from "@/lib/firebase/client";
import { useAuth } from "@/lib/firebase/useAuth";

const RETURN_KEY = "unbarber.returnTo";

/** En la PWA instalada y en iPhone los popups fallan: se usa redirect. */
function prefersRedirect() {
  const standalone = window.matchMedia("(display-mode: standalone)").matches;
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent);
  return standalone || ios;
}

export default function Entrar() {
  const { user } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const to = sessionStorage.getItem(RETURN_KEY) ?? "/bienvenida/";
      sessionStorage.removeItem(RETURN_KEY);
      router.replace(to);
    }
  }, [user, router]);

  async function signIn() {
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      if (prefersRedirect()) await signInWithRedirect(auth, provider);
      else await signInWithPopup(auth, provider);
    } catch {
      setError("No pudimos entrar con Google. Probá de nuevo.");
    }
  }

  return (
    <main className="flex flex-1 flex-col">
      <PoleStripe />
      <div className="flex flex-1 flex-col justify-center gap-6 p-6">
        <h1 className="font-display text-3xl uppercase">{copy.login.title}</h1>
        <Button onClick={signIn}>{copy.login.google}</Button>
        {error && <p className="border-2 border-ink bg-red-soft p-3">{error}</p>}
        <p className="text-sm text-gray-text">{copy.login.legal}</p>
      </div>
    </main>
  );
}
