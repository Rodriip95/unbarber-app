"use client";

import { PolePill } from "@/components/brand/Logo";
import { DemoProvider, useDemo, type Screen } from "@/lib/demo/store";
import { AlertaScreen, AhoraScreen, ClientHome, ClientSearch, ClientTurnos, ProfileScreen, RateScreen } from "./client";
import { BarberProfile, BookDone, BookScreen } from "./booking";
import { BarberAgenda, BarberClient, BarberClients, BarberInbox, MembershipScreen, NewAppointment, RateClient } from "./barber";
import { LoginScreen, RoleScreen, TermsScreen } from "./auth";
import { BottomNav, WaSheet } from "./shared";
import { Toast } from "./ui";

const TABS = new Set(["c-home", "c-search", "c-turnos", "c-perfil", "b-inbox", "b-agenda", "b-clients", "b-perfil"]);

function render(screen: Screen) {
  switch (screen.id) {
    case "login":
      return <LoginScreen />;
    case "terms":
      return <TermsScreen />;
    case "role":
      return <RoleScreen />;
    case "c-home":
      return <ClientHome />;
    case "c-search":
      return <ClientSearch />;
    case "c-turnos":
      return <ClientTurnos />;
    case "c-perfil":
    case "b-perfil":
      return <ProfileScreen />;
    case "ahora":
      return <AhoraScreen />;
    case "alerta":
      return <AlertaScreen />;
    case "barber":
      return <BarberProfile barberId={screen.barberId} />;
    case "book":
      return <BookScreen barberId={screen.barberId} serviceId={screen.serviceId} />;
    case "book-done":
      return <BookDone apptId={screen.apptId} />;
    case "rate":
      return <RateScreen apptId={screen.apptId} />;
    case "b-inbox":
      return <BarberInbox />;
    case "b-agenda":
      return <BarberAgenda />;
    case "b-clients":
      return <BarberClients />;
    case "b-client":
      return <BarberClient clientId={screen.clientId} />;
    case "b-new-appt":
      return <NewAppointment clientId={screen.clientId} />;
    case "b-membership":
      return <MembershipScreen />;
    case "b-rate-client":
      return <RateClient clientId={screen.clientId} />;
  }
}

/** Panel lateral solo en pantallas anchas: explica la demo y deja saltar de modo. */
function DesktopAside() {
  const { s, dispatch } = useDemo();
  return (
    <aside className="fixed left-0 top-0 hidden h-dvh w-[360px] flex-col justify-center gap-6 px-10 xl:flex">
      <PolePill className="h-14 w-auto self-start" />
      <div>
        <p className="eyebrow">Prototipo navegable</p>
        <h1 className="mt-2 text-[40px] leading-[1.02]">
          Unbarber, <span className="accent">en demo</span>
        </h1>
      </div>
      <p className="text-[15px] leading-relaxed text-muted">
        Todo está simulado: el login con Google, los barberos, los turnos y WhatsApp. Lo que hagas queda guardado en este navegador.
      </p>
      <div className="flex flex-col gap-2">
        {s.account && (
          <button
            type="button"
            onClick={() => dispatch({ t: "setRole", role: s.role === "barber" ? "client" : "barber" })}
            className="rounded-full bg-mode px-5 py-3 text-sm font-semibold text-white shadow-press"
          >
            Pasar a modo {s.role === "barber" ? "cliente" : "barbero"}
          </button>
        )}
        <button type="button" onClick={() => dispatch({ t: "reset" })} className="rounded-full border-[1.5px] border-pine px-5 py-3 text-sm font-semibold">
          Reiniciar desde el login
        </button>
      </div>
    </aside>
  );
}

function Shell() {
  const { s, screen } = useDemo();
  const showNav = TABS.has(screen.id);
  return (
    <div data-mode={s.role ?? "client"} className="flex min-h-dvh justify-center bg-sage-soft">
      <DesktopAside />
      <div className="relative min-h-dvh w-full max-w-[440px] bg-cream shadow-[0_0_0_1px_var(--line),0_30px_80px_-40px_rgb(24_45_38/0.5)]">
        {render(screen)}
        {showNav && <BottomNav />}
        <WaSheet />
        <Toast text={s.toast} />
      </div>
    </div>
  );
}

export function DemoApp() {
  return (
    <DemoProvider>
      <Shell />
    </DemoProvider>
  );
}
