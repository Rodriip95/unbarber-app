import { DemoApp } from "@/components/demo/DemoApp";

/**
 * Por ahora la app entera corre en modo demo: login, datos, turnos y WhatsApp simulados,
 * para recorrer todos los accesos con el diseño V3 "Esquina". Ver components/demo/README.md.
 */
export default function Home() {
  return <DemoApp />;
}
