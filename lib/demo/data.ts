/**
 * Datos de ejemplo del modo demo. Todo es ficticio: nombres, teléfonos y barberías.
 * Barrios reales de CABA para que el recorrido se sienta local (mezcla de barrio y centro).
 */

export type Role = "client" | "barber";
export type Modality = "local" | "casa" | "domicilio";

export type Service = { id: string; name: string; minutes: number; price: number };

export type Barber = {
  id: string;
  name: string;
  shop: string;
  barrio: string;
  /** "barrio" = barbería de barrio; "centro" = zona céntrica */
  kind: "barrio" | "centro";
  distanceKm: number;
  modality: Modality;
  availableNow: boolean;
  /** Hasta qué hora está libre, si availableNow */
  until?: string;
  rating: { avg: number; count: number; ambiente: number; servicio: number; barbero: number };
  tags: string[];
  services: Service[];
  hours: string;
  bio: string;
  verified: boolean;
  years: number;
  /** Color del avatar mientras no haya fotos */
  tone: "pine" | "terra" | "slate" | "moss";
  address: string;
};

export type Client = {
  id: string;
  name: string;
  barrio: string;
  visits: number;
  lastVisit: string;
  stars: number;
  note?: string;
  favService: string;
};

export type ApptStatus = "requested" | "confirmed" | "rejected" | "expired" | "cancelled" | "completed" | "no_show";
export type Appointment = {
  id: string;
  barberId: string;
  clientId: string;
  serviceId: string;
  /** Desfase en días desde hoy (0 = hoy). Se resuelve a fecha real al mostrar. */
  day: number;
  time: string;
  status: ApptStatus;
  origin: "app" | "manual" | "ahora";
  note?: string;
  rated?: boolean;
};

export type InboxType = "alert" | "booking" | "cut" | "wrote" | "trial";
export type InboxItem = { id: string; type: InboxType; clientId?: string; apptId?: string; minutesAgo: number; detail?: string };

const CORTE = (price: number): Service => ({ id: "corte", name: "Corte", minutes: 30, price });
const BARBA = (price: number): Service => ({ id: "barba", name: "Barba", minutes: 20, price });
const COMBO = (price: number): Service => ({ id: "combo", name: "Corte y barba", minutes: 45, price });

export const BARBERS: Barber[] = [
  {
    id: "martin",
    name: "Martín Gauna",
    shop: "Barbería El Faro",
    barrio: "Villa Crespo",
    kind: "barrio",
    distanceKm: 0.6,
    modality: "local",
    availableNow: true,
    until: "19:30",
    rating: { avg: 4.8, count: 64, ambiente: 4.7, servicio: 4.9, barbero: 4.8 },
    tags: ["Amable", "Puntual", "Buen fade"],
    services: [CORTE(9000), BARBA(5000), COMBO(12500)],
    hours: "Mar a sáb · 10 a 20 h",
    bio: "Barbería de barrio sobre Corrientes. Mate, fútbol y degradés prolijos desde 2015.",
    verified: true,
    years: 10,
    tone: "pine",
    address: "Av. Corrientes 5100, Villa Crespo",
  },
  {
    id: "tano",
    name: "Lucas «Tano» Ferraro",
    shop: "Tano Barber Club",
    barrio: "Palermo Soho",
    kind: "centro",
    distanceKm: 1.2,
    modality: "local",
    availableNow: true,
    until: "21:00",
    rating: { avg: 4.9, count: 128, ambiente: 5, servicio: 4.9, barbero: 4.8 },
    tags: ["Divertido", "Diseños", "Buena música"],
    services: [CORTE(12000), BARBA(6500), COMBO(16000)],
    hours: "Lun a sáb · 11 a 21 h",
    bio: "Club de barberos en Palermo. Cortes clásicos y diseños a navaja.",
    verified: true,
    years: 7,
    tone: "terra",
    address: "Gurruchaga 1600, Palermo",
  },
  {
    id: "kevin",
    name: "Kevin Ojeda",
    shop: "Kevin en su casa",
    barrio: "Almagro",
    kind: "barrio",
    distanceKm: 0.9,
    modality: "casa",
    availableNow: true,
    until: "18:00",
    rating: { avg: 4.6, count: 22, ambiente: 4.4, servicio: 4.7, barbero: 4.7 },
    tags: ["Tranquilo", "Buen precio"],
    services: [CORTE(7000), COMBO(10000)],
    hours: "Lun a vie · 14 a 20 h",
    bio: "Atiendo en mi casa cerca de Medrano. Te paso la dirección por WhatsApp.",
    verified: true,
    years: 3,
    tone: "slate",
    address: "Cerca de Medrano y Rivadavia, Almagro",
  },
  {
    id: "brian",
    name: "Brian Sosa",
    shop: "Brian a domicilio",
    barrio: "Boedo",
    kind: "barrio",
    distanceKm: 1.7,
    modality: "domicilio",
    availableNow: true,
    until: "20:00",
    rating: { avg: 4.7, count: 31, ambiente: 4.5, servicio: 4.8, barbero: 4.7 },
    tags: ["Va a tu casa", "Puntual"],
    services: [CORTE(10000), COMBO(14000)],
    hours: "Todos los días · 9 a 20 h",
    bio: "Voy a tu casa o a tu oficina en Boedo, Almagro y Caballito.",
    verified: true,
    years: 5,
    tone: "moss",
    address: "Boedo, Almagro y Caballito",
  },
  {
    id: "diego",
    name: "Diego Ríos",
    shop: "Corte Fino",
    barrio: "Microcentro",
    kind: "centro",
    distanceKm: 2.8,
    modality: "local",
    availableNow: false,
    rating: { avg: 4.8, count: 89, ambiente: 4.9, servicio: 4.8, barbero: 4.7 },
    tags: ["Clásico", "Navaja", "Ejecutivo"],
    services: [CORTE(14000), BARBA(8000), COMBO(19000)],
    hours: "Lun a vie · 8 a 19 h",
    bio: "Barbería clásica en una galería de Florida. Ideal antes o después de la oficina.",
    verified: true,
    years: 15,
    tone: "pine",
    address: "Galería sobre Florida 500, Microcentro",
  },
  {
    id: "facu",
    name: "Facundo Leiva",
    shop: "La Esquina Barbería",
    barrio: "San Telmo",
    kind: "barrio",
    distanceKm: 2.2,
    modality: "local",
    availableNow: false,
    rating: { avg: 0, count: 2, ambiente: 0, servicio: 0, barbero: 0 },
    tags: ["Nuevo"],
    services: [CORTE(11000), BARBA(6000), COMBO(15000)],
    hours: "Mié a dom · 12 a 20 h",
    bio: "Abrimos en septiembre en una esquina de San Telmo. Sillón de época y café.",
    verified: true,
    years: 4,
    tone: "terra",
    address: "Defensa y Carlos Calvo, San Telmo",
  },
];

export const CLIENTS: Client[] = [
  { id: "joaquin", name: "Joaquín Pérez", barrio: "Villa Crespo", visits: 9, lastVisit: "hace 3 semanas", stars: 5, favService: "Corte", note: "Degradé bajo, tijera arriba." },
  { id: "santi", name: "Santiago Molina", barrio: "Chacarita", visits: 4, lastVisit: "hace 5 semanas", stars: 5, favService: "Corte y barba" },
  { id: "mateo", name: "Mateo Castro", barrio: "Almagro", visits: 2, lastVisit: "hace 2 meses", stars: 4, favService: "Corte" },
  { id: "franco", name: "Franco Díaz", barrio: "Palermo", visits: 6, lastVisit: "hace 10 días", stars: 5, favService: "Barba", note: "Prefiere sábados a la mañana." },
  { id: "julian", name: "Julián Romero", barrio: "Caballito", visits: 1, lastVisit: "hace 4 meses", stars: 3, favService: "Corte" },
];

/** Cuentas que muestra el selector de Google simulado */
export const DEMO_ACCOUNTS = [
  { name: "Tomás Acosta", email: "tomas.acosta@demo.unbarber", initials: "TA" },
  { name: "Valentina Ruiz", email: "vale.ruiz@demo.unbarber", initials: "VR" },
];

/** El barbero que sos cuando entrás en modo barbero */
export const SELF_BARBER_ID = "self";
export function selfBarber(name: string): Barber {
  return {
    ...BARBERS[0],
    id: SELF_BARBER_ID,
    name,
    shop: `Barbería de ${name.split(" ")[0]}`,
    tags: ["Amable", "Puntual"],
    rating: { avg: 4.9, count: 12, ambiente: 4.8, servicio: 4.9, barbero: 5 },
  };
}

export const INITIAL_APPOINTMENTS: Appointment[] = [
  // Del cliente demo
  { id: "a1", barberId: "tano", clientId: "me", serviceId: "corte", day: 3, time: "18:00", status: "confirmed", origin: "app" },
  { id: "a2", barberId: "martin", clientId: "me", serviceId: "combo", day: -12, time: "11:30", status: "completed", origin: "app" },
  // Del barbero demo
  { id: "b1", barberId: SELF_BARBER_ID, clientId: "joaquin", serviceId: "corte", day: 0, time: "11:00", status: "confirmed", origin: "app" },
  { id: "b2", barberId: SELF_BARBER_ID, clientId: "franco", serviceId: "barba", day: 0, time: "13:30", status: "confirmed", origin: "manual" },
  { id: "b3", barberId: SELF_BARBER_ID, clientId: "santi", serviceId: "combo", day: 0, time: "17:00", status: "confirmed", origin: "ahora" },
  { id: "b4", barberId: SELF_BARBER_ID, clientId: "mateo", serviceId: "corte", day: 1, time: "16:30", status: "requested", origin: "app", note: "Si se puede, un poco antes." },
  { id: "b5", barberId: SELF_BARBER_ID, clientId: "julian", serviceId: "corte", day: 2, time: "12:00", status: "confirmed", origin: "app" },
  { id: "b6", barberId: SELF_BARBER_ID, clientId: "joaquin", serviceId: "corte", day: -1, time: "10:30", status: "confirmed", origin: "app" },
];

export const INITIAL_INBOX: InboxItem[] = [
  { id: "i1", type: "alert", clientId: "mateo", minutesAgo: 4, detail: "Busca corte ahora en Almagro, a 0,9 km" },
  { id: "i2", type: "booking", clientId: "mateo", apptId: "b4", minutesAgo: 25 },
  { id: "i3", type: "cut", clientId: "joaquin", apptId: "b6", minutesAgo: 60 * 20 },
  { id: "i4", type: "wrote", clientId: "franco", minutesAgo: 90 },
  { id: "i5", type: "trial", minutesAgo: 60 * 24 },
];

export const MODALITY_LABEL: Record<Modality, string> = {
  local: "En su local",
  casa: "En su casa",
  domicilio: "Va a domicilio",
};
