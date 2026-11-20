/** Todos los textos de la app. Voseo, frases cortas, sin signos de exclamación. */
export const copy = {
  home: {
    greeting: (name?: string) => (name ? `¿Te cortás hoy, ${name}?` : "¿Te cortás hoy?"),
    ahora: "Cortarme ahora",
    ahoraSub: "Barberos libres cerca tuyo",
    turno: "Sacar turno",
    turnoSub: "Elegí día y horario",
  },
  login: {
    title: "Entrá a Unbarber",
    google: "Entrar con Google",
    legal: "Al continuar vas a aceptar los Términos y la Política de privacidad.",
  },
  membership: {
    onboardingNotice: "Registro y prueba sin cargo. Después, membresía de acceso de pago único.",
    promoFree: "Activar membresía sin cargo",
    pay: "Pagar membresía",
  },
} as const;
