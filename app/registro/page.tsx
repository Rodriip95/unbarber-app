"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { captureAttribution } from "@/lib/attribution";

/**
 * Entrada desde la landing: /registro?rol=barbero&utm_source=…
 * Guarda rol y UTM (se copian al usuario en el onboarding) y manda al inicio (demo con login simulado).
 */
export default function Registro() {
  const router = useRouter();
  useEffect(() => {
    captureAttribution(new URLSearchParams(window.location.search));
    router.replace("/");
  }, [router]);
  return null;
}
