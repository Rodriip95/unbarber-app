"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { captureAttribution } from "@/lib/attribution";

/**
 * Entrada desde la landing: /registro?rol=barbero&utm_source=…
 * Guarda rol y UTM (se copian al usuario en el onboarding) y manda a entrar con Google.
 */
export default function Registro() {
  const router = useRouter();
  useEffect(() => {
    captureAttribution(new URLSearchParams(window.location.search));
    router.replace("/entrar/");
  }, [router]);
  return null;
}
