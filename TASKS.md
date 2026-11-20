# Tareas de la app

Plan de trabajo por sprint. Cada tarea tiene un ID (`T-xxx`), la historia del backlog que cubre (`APP-xx`, ver el [documento maestro](https://claude.ai/artifact/3Eh5NFbbXimfRb5U681k55), pestaña App), su spec, prioridad, tamaño estimado y dependencias.

- **Prioridad**: P0 imprescindible para el piloto, P1 importante (sale en el piloto si hay tiempo), P2 después del lanzamiento.
- **Tamaño**: S medio día o menos, M uno o dos días, L tres a cinco días.
- **Estado**: ○ pendiente, ✱ en curso, ✓ hecha, ⛔ bloqueada (se indica por qué).
- Hay un esqueleto de código ya armado (T-010, T-011, T-013, T-015 hechas). Una tarea solo empieza cuando sus dependencias están hechas. Las bloqueadas por una decisión de Rodri se pueden avanzar con valores provisorios guardados en `config/public`.

## S0 · Preparación (23 nov al 6 dic 2026)

| ID | Tarea | Historia | Spec | Prio | Tam | Depende de | Estado |
|---|---|---|---|---|---|---|---|
| T-001 | Repositorio `Rodriip95/unbarber-app` en GitHub, ramas `main` y `develop`, protección de `main` | Base | 00 | P0 | S | — | ✱ (repo creado por Rodri) |
| T-002 | Proyectos `unbarber-desa` y `unbarber-prd` (creados por Rodri): Blaze con alerta de US$5, Firestore en `southamerica-east1`, Storage, Auth con Google, app Web registrada, cuenta de servicio de deploy (ver `docs/infra.md`) | Base | 00 | P0 | M | — | ✱ |
| T-003 | Elegir y comprar dominio; conectar a Firebase Hosting de prod | Base | 00 | P0 | S | T-002 | ⛔ decisión de Rodri |
| T-004 | Habilitar Auth (Google), Firestore, Storage, FCM (VAPID key) y App Check en ambos proyectos | Base | 00 | P0 | S | T-002 | ○ |
| T-005 | Crear proyecto de Sentry (plan gratis) y propiedad de Analytics | Base | 12 | P1 | S | T-002 | ○ |

## S1 · Base técnica, login, roles, Términos y teléfono (7 al 20 dic 2026)

| ID | Tarea | Historia | Spec | Prio | Tam | Depende de | Estado |
|---|---|---|---|---|---|---|---|
| T-010 | Iniciar Next.js (App Router, TS, Tailwind, `output: 'export'`), ESLint, Prettier, Vitest | Base | 00 | P0 | S | T-001 | ✓ |
| T-011 | `firebase.json` con Hosting (target `app`), rewrites, emuladores y Remote Config; `.firebaserc` con alias `desa` y `prd` | Base | 00 | P0 | S | T-010 | ✓ |
| T-012 | `lib/firebase`: init, Auth, Firestore, Storage, Messaging, App Check, conexión a emuladores en local | Base | 00 | P0 | M | T-011, T-004 | ○ |
| T-013 | Proyecto `functions/` (TS, Node 22, región `southamerica-east1`) con `onUserCreate` y `completeOnboarding` iniciales | Base | 00 | P0 | M | T-011 | ✓ |
| T-014 | CI/CD: `ci.yml` (checks), `preview.yml` (canal de vista previa por PR), `deploy.yml` (develop → desa, main → prd con aprobación); ambientes, secretos y protección de ramas en GitHub | Base | 00 | P0 | M | T-010, T-013, T-002 | ✱ (workflows listos; falta configurar GitHub) |
| T-015 | Tokens V2 en Tailwind, fuentes con `next/font`, variable de color por modo | Todas | 01 | P0 | S | T-010 | ✓ |
| T-016 | Componentes base: Button, Card, Tag, Toggle, Sheet, Toast, EmptyState, PoleStripe; página `/dev/ui` | Todas | 01 | P0 | L | T-015 | ○ |
| T-017 | Layout por modo: BottomNav cliente y barbero, ModeSwitch, guardas de ruta (sin sesión, sin onboarding, sin rol) | APP-01 | 01, 02 | P0 | M | T-016, T-012 | ○ |
| T-018 | PWA: manifest, íconos, service worker con caché del shell, aviso sin conexión | Base | 00 | P0 | M | T-010 | ○ |
| T-019 | Pantalla `/entrar` con Google (popup o redirect según entorno) y vuelta al deeplink de origen | APP-01 | 02 | P0 | M | T-012, T-016 | ✱ |
| T-019b | Ruta `/registro?rol=barbero&utm_…` para la landing: guarda rol y UTM y los copia al usuario (necesaria el 11 ene 2027) | APP-01 | 02 | P0 | S | T-019 | ✱ |
| T-020 | `onUserCreate` y callable `completeOnboarding` con validaciones | APP-01, APP-02 | 02 | P0 | M | T-013 | ○ |
| T-021 | Asistente `/bienvenida`: rol, WhatsApp con normalización E.164 y botón Probar | APP-01, APP-02 | 02 | P0 | M | T-019, T-020 | ○ |
| T-022 | Paso de notificaciones: permiso, token FCM en `devices`, guía de instalación en iPhone, obligatorio para barbero | APP-02 | 02, 07 | P0 | M | T-021, T-018 | ○ |
| T-023 | Paso de Términos y Privacidad (versión desde `config/public`) y declaración de 18+; reaceptar si cambia la versión | APP-02 | 02 | P0 | S | T-021 | ○ |
| T-024 | Páginas `/legal/terminos` y `/legal/privacidad` con el borrador vigente, versionadas | APP-02 | 02 | P0 | S | T-010 | ⛔ texto final pendiente de abogado (usar borrador) |
| T-025 | Reglas de Firestore y Storage base (`users`, `config`) con pruebas en emulador | Base | 00 | P0 | M | T-012 | ○ |
| T-026 | `/perfil`: editar datos, notificaciones, sumar rol, cerrar sesión | APP-01 | 02 | P0 | M | T-021 | ○ |
| T-027 | Analítica: wrapper `track` y eventos de onboarding; Sentry en front y Functions | Base | 12 | P1 | S | T-012, T-005 | ○ |
| T-028 | Datos semilla para emuladores (admin, barberos, clientes) | Base | 12 | P1 | M | T-025 | ○ |

## S2 · Perfil de barbero, portfolio y verificación (21 dic 2026 al 3 ene 2027)

| ID | Tarea | Historia | Spec | Prio | Tam | Depende de | Estado |
|---|---|---|---|---|---|---|---|
| T-030 | Modelo `barbers/{uid}` y reglas (el dueño no toca `verification`, `membership`, `visible`, `rating`) con pruebas | APP-03 | 00, 03 | P0 | M | T-025 | ○ |
| T-031 | Asistente de perfil con guardado por paso: presentación, servicios (con plantillas), cobro y redes | APP-03 | 03 | P0 | L | T-030, T-016 | ○ |
| T-032 | Paso "Dónde atendés": modalidades, dirección con Nominatim o punto en mapa Leaflet, radio de cobertura, ubicación aproximada para "en mi casa" | APP-03 | 03 | P0 | L | T-031 | ○ |
| T-033 | Paso de horarios: semanal por día con rangos y excepciones | APP-03 | 03, 08 | P0 | M | T-031 | ○ |
| T-034 | Portfolio: subida con compresión, reordenar, borrar; mínimo 3, máximo 12 | APP-03 | 03 | P0 | M | T-031 | ○ |
| T-035 | Function `onImageUpload`: versiones 1080 y 320 px, borrado de EXIF | APP-03 | 03 | P0 | M | T-013 | ○ |
| T-036 | Paso de DNI (privado) y callable `submitBarberForReview` con validaciones | APP-03, APP-04 | 03, 04 | P0 | M | T-034 | ○ |
| T-037 | Vista pública `/barbero/{id}` y vista previa en el asistente | APP-03 | 03 | P0 | M | T-031 | ○ |
| T-038 | Estados del perfil para el barbero (pendiente, rechazado con motivo, suspendido) | APP-03 | 03 | P0 | S | T-036 | ○ |
| T-039 | Aviso de membresía en el primer paso del perfil (precio y promo desde Remote Config) | APP-16 | 11 | P0 | S | T-031 | ○ |
| T-040 | Script `admin:grant` para custom claim y guarda de `/admin` | APP-04 | 04 | P0 | S | T-013 | ○ |
| T-041 | Panel admin: barberos pendientes, detalle con DNI y fotos, aprobar o rechazar con motivo; `adminLog` | APP-04 | 04 | P0 | L | T-040, T-036 | ○ |
| T-042 | Callable `adminReviewBarber` (al aprobar inicia prueba) y trigger `recomputeVisibility` | APP-04, APP-16 | 04, 11 | P0 | M | T-041 | ○ |
| T-043 | Push al barbero por aprobación o rechazo (función de envío común con limpieza de tokens) | APP-04 | 07 | P0 | M | T-022, T-042 | ○ |
| T-044 | Panel admin: listado y búsqueda de barberos, suspender y reactivar | APP-04 | 04 | P1 | M | T-041 | ○ |
| T-045 | Borrado automático de fotos de DNI 30 días después de aprobado | APP-04 | 04 | P1 | S | T-042 | ○ |

**Hito S2**: un barbero puede registrarse, armar su perfil y quedar aprobado. Listo para la campaña de enero.

## S3 · Búsqueda por radio, lista AHORA y WhatsApp (4 al 17 ene 2027)

| ID | Tarea | Historia | Spec | Prio | Tam | Depende de | Estado |
|---|---|---|---|---|---|---|---|
| T-050 | `lib/geo`: consultas por radio con `geofire-common`, distancia, redondeos de privacidad; pruebas unitarias | APP-05 | 00, 05 | P0 | M | T-012 | ○ |
| T-051 | Índices de Firestore para lista AHORA y búsqueda por ubicación | APP-05 | 00 | P0 | S | T-030 | ○ |
| T-052 | Interruptor "Estoy libre ahora" con duración y ubicación; callable `setAvailableNow` | APP-07 | 05 | P0 | M | T-030, T-050 | ○ |
| T-053 | Apagado automático de "Disponible ahora" vencido con push (`scheduledEvery5m`) | APP-07 | 05 | P0 | S | T-052, T-043 | ○ |
| T-054 | Inicio del cliente: CORTARME AHORA, SACAR TURNO, accesos a Mis barberos | APP-05 | 01 | P0 | M | T-017 | ○ |
| T-055 | Pantalla `/ahora`: ubicación o barrio, "Buscando barberos…", lista en vivo, orden por distancia y reputación | APP-05 | 05 | P0 | L | T-050, T-051, T-054 | ○ |
| T-056 | Filtros de la lista (radio, a domicilio, servicio, precio máximo) | APP-05 | 05 | P1 | M | T-055 | ○ |
| T-057 | `lib/whatsapp`: links `wa.me` y mensajes por origen; colección `contacts` | APP-06 | 05 | P0 | S | T-012 | ○ |
| T-058 | Botón WhatsApp en tarjetas y perfil; registro de contacto | APP-06 | 05 | P0 | S | T-057, T-055, T-037 | ○ |
| T-059 | Búsqueda de barberos para SACAR TURNO (sin filtro de disponible) | APP-10 | 08 | P0 | M | T-055 | ○ |
| T-060 | Agregar a Mis barberos manual desde el perfil y reportar perfil | APP-15 | 10 | P1 | S | T-037 | ○ |
| T-061 | Pruebas punta a punta del flujo AHORA 1.a | APP-05, APP-06 | 12 | P0 | M | T-058 | ○ |

## S4 · Alerta a la zona, push y Bandeja (18 al 31 ene 2027)

| ID | Tarea | Historia | Spec | Prio | Tam | Depende de | Estado |
|---|---|---|---|---|---|---|---|
| T-070 | Service worker de mensajería: notificaciones en segundo plano, apertura en `data.link`, toast en primer plano | APP-09 | 07 | P0 | M | T-022 | ○ |
| T-071 | Horario de silencio y preferencias de alertas en Functions de envío | APP-08, APP-09 | 07 | P0 | S | T-043 | ○ |
| T-072 | Colección `zoneAlerts` con reglas y pruebas (privacidad del teléfono) | APP-08 | 06 | P0 | M | T-025 | ○ |
| T-073 | Callable `createZoneAlert`: límites, destinatarios por radio y cobertura, topes de inactivos, envío por lotes | APP-08 | 06 | P0 | L | T-072, T-050, T-071 | ○ |
| T-074 | Hoja "Avisar a barberos de mi zona" y pantalla de alerta en vivo del cliente | APP-08 | 06 | P0 | M | T-073, T-055 | ○ |
| T-075 | Callables `respondZoneAlert` y `closeZoneAlert`; push al cliente por cada interesado | APP-08 | 06 | P0 | M | T-073 | ○ |
| T-076 | Vencimiento de alertas a los 60 min con aviso al cliente | APP-08 | 06 | P0 | S | T-073, T-053 | ○ |
| T-077 | Bandeja del barbero: estructura, pestañas, tarjeta de alerta de zona (Paso / Me interesa) | APP-09 | 07 | P0 | L | T-075, T-016 | ○ |
| T-078 | `shortLinks` y resolución `/s/{codigo}`; pantalla `/solicitud/{id}` | APP-09 | 07 | P0 | M | T-077 | ○ |
| T-079 | Tarjeta "Te escribió {cliente} desde Unbarber" (contactos de las últimas 24 h) | APP-09 | 07 | P1 | S | T-077, T-058 | ○ |
| T-080 | Apagar alertas de zona desde Perfil | APP-08 | 06 | P0 | S | T-026 | ○ |
| T-081 | Badge en el ícono de la app instalada | APP-09 | 07 | P2 | S | T-077 | ○ |
| T-082 | QA de push en dispositivos reales (Android y iPhone instalada) | APP-09 | 12 | P0 | M | T-077 | ○ |

## S5 · SACAR TURNO, agenda, Mis turnos y .ics (1 al 14 feb 2027)

| ID | Tarea | Historia | Spec | Prio | Tam | Depende de | Estado |
|---|---|---|---|---|---|---|---|
| T-090 | Colección `appointments` con reglas, índices y pruebas; máquina de estados compartida | APP-10 | 08 | P0 | M | T-025 | ○ |
| T-091 | Cálculo de huecos libres (horario, excepciones, turnos, duración, zona horaria AR) con pruebas | APP-10 | 08 | P0 | M | T-090, T-033 | ○ |
| T-092 | Pantalla Sacar turno: servicio, tira de días, grilla de horarios, nota | APP-10 | 08 | P0 | L | T-091, T-059 | ○ |
| T-093 | Callable `requestAppointment` con transacción, límites, código corto y push al barbero | APP-10 | 08 | P0 | M | T-090, T-078 | ○ |
| T-094 | Tarjeta de pedido en la Bandeja y callable `respondAppointment` | APP-10 | 07, 08 | P0 | M | T-093, T-077 | ○ |
| T-095 | "Avisarle por WhatsApp" con deeplink tras pedir turno | APP-10 | 08 | P0 | S | T-093, T-057 | ○ |
| T-096 | Vencimientos (12 h o 1 h antes) y paso a `completed` en `scheduledEvery5m` | APP-10 | 08 | P0 | S | T-093 | ○ |
| T-097 | Flujo "A coordinar" (2.b) desde perfil y Sacar turno | APP-11 | 08 | P0 | S | T-057 | ○ |
| T-098 | Agenda del barbero: vista de día y semana, colores por origen, bloquear rango | APP-11 | 08 | P0 | L | T-090 | ○ |
| T-099 | Carga manual de turno: buscar cliente, cliente sin cuenta, callable `createManualAppointment` | APP-11 | 08 | P0 | M | T-098 | ○ |
| T-100 | Mis turnos del cliente: próximos, pasados, estados, cancelar, repetir | APP-10 | 08 | P0 | M | T-093 | ○ |
| T-101 | Cancelar, cancelación tardía y "No vino" | APP-10 | 08 | P0 | M | T-100, T-098 | ○ |
| T-102 | Recordatorios 24 h y 1 h (`scheduledHourly`) | APP-10 | 07 | P1 | S | T-096 | ○ |
| T-103 | Agregar a mi calendario: `.ics` y enlace de Google Calendar | APP-12 | 08 | P1 | M | T-100 | ○ |
| T-104 | Emails transaccionales (extensión Trigger Email + SMTP gratis) | APP-10 | 07 | P1 | M | T-093 | ○ |
| T-105 | Pruebas punta a punta: pedir, aceptar, vencer, cancelar; reserva concurrente | APP-10 | 12 | P0 | M | T-094 | ○ |

**Inicio de beta cerrada con barberos (1 feb)**: requiere S1 a S4 completos.

## S6 · Registrar corte, calificaciones, Mis Barberos y Mis Clientes, membresía y QA (15 al 28 feb 2027)

| ID | Tarea | Historia | Spec | Prio | Tam | Depende de | Estado |
|---|---|---|---|---|---|---|---|
| T-110 | Colección `cuts`, callables `registerCut` y `confirmCut`, reglas de quién puede registrar | APP-13 | 09 | P0 | M | T-090, T-058 | ○ |
| T-111 | Registrar corte desde Bandeja y Agenda; pantalla de confirmación del cliente | APP-13 | 09 | P0 | M | T-110, T-077 | ○ |
| T-112 | Corte automático al completar un turno de la app | APP-13 | 09 | P0 | S | T-110, T-096 | ○ |
| T-113 | Trigger `onCutConfirmed`: relaciones, teléfono "verificado por uso" | APP-13, APP-15 | 09, 10 | P0 | S | T-110 | ○ |
| T-114 | Colección `ratings`, reglas de calificación a ciegas y pruebas | APP-14 | 09 | P0 | M | T-110 | ○ |
| T-115 | Pantallas de calificar: cliente a barbero (estrellas y etiquetas) y barbero a cliente (estrellas e ítems) | APP-14 | 09 | P0 | L | T-114 | ○ |
| T-116 | `onRatingWrite` (agregados), revelado a los 7 días, "Nuevo" con menos de 5 | APP-14 | 09 | P0 | M | T-114 | ○ |
| T-117 | Reputación en perfil, tarjetas y vista del cliente para el barbero | APP-14 | 09 | P0 | M | T-116 | ○ |
| T-118 | Push "¿Te cortaste…?" y "Calificá tu servicio" | APP-13, APP-14 | 07 | P0 | S | T-111, T-115 | ○ |
| T-119 | Reportar reseña, respuesta del barbero; moderación y revisión de 1★ en el panel | APP-14 | 09, 04 | P1 | M | T-117, T-041 | ○ |
| T-120 | Mis barberos (cliente) con disponible en vivo y repetir | APP-15 | 10 | P1 | M | T-113 | ○ |
| T-121 | Mis clientes (barbero) con buscador, detalle, notas privadas, invitar por WhatsApp | APP-15 | 10 | P1 | M | T-113 | ○ |
| T-122 | Vinculación de clientes sin cuenta al registrarse con el mismo teléfono | APP-15 | 10 | P1 | S | T-121, T-020 | ○ |
| T-123 | Panel admin de membresías y callable `adminSetMembership` (fundador, cupos) | APP-16 | 11 | P0 | M | T-042 | ○ |
| T-124 | Vencimiento diario de pruebas (`scheduledDaily`) y efecto en visibilidad | APP-16 | 11 | P0 | S | T-123 | ⛔ días de prueba pendientes (usar provisorio) |
| T-125 | Pantalla `/mi-perfil/membresia` con precio y promo de Remote Config; con promo 100 % "Activar membresía sin cargo" (callable `activateFreeMembership`); si no, link de Mercado Pago; botón de arrepentimiento | APP-16 | 11 | P0 | M | T-123 | ⛔ link de Mercado Pago pendiente (no bloquea mientras la promo sea 100 %) |
| T-126 | Avisos de fin de prueba (7 días, 1 día, el día) | APP-17 | 11 | P1 | S | T-124 | ○ |
| T-127 | Borrar cuenta (`deleteAccount`) | APP-02 | 02 | P0 | M | T-114 | ○ |
| T-128 | Panel admin: configuración (`config/public`) y teléfonos repetidos | APP-16 | 04 | P1 | M | T-123 | ○ |
| T-129 | Tablero de métricas en `/admin/metricas` y contadores `metrics/daily` | Base | 12 | P1 | M | T-027 | ○ |
| T-130 | Sticker "Corte hecho" estático y estados vacíos con sticker | APP-13 | 01 | P1 | S | T-115 | ○ |
| T-131 | QA final en dispositivos reales, revisión de textos y de diseño, corrección de errores | Todas | 12 | P0 | L | Todas las P0 | ○ |
| T-132 | Despliegue a producción, datos de la zona piloto, verificación de alertas de presupuesto | Base | 00 | P0 | S | T-131, T-003 | ○ |

**Lanzamiento del piloto: 1 de marzo de 2027.**

## Después del lanzamiento

| ID | Tarea | Historia | Prio |
|---|---|---|---|
| T-200 | Stickers animados en turno completado y calificaciones | APP-18 | P2 |
| T-201 | Verificación de teléfono por WhatsApp inverso (API de WhatsApp Business) | APP-19 | P2 |
| T-202 | Checkout de Mercado Pago con activación automática | NEG-08 | P2 |
| T-203 | Avisar a Mis clientes cuando el barbero se pone disponible un domingo | — | P2 |
| T-204 | Sincronizar la agenda del barbero con Google Calendar | — | P2 |
| T-205 | Estadísticas para el barbero | Fase 2 | P2 |

## Camino crítico

T-002 → T-004 → T-012 → T-019 → T-021 → T-022 → T-030 → T-031 → T-036 → T-041 → T-042 (hito S2) → T-050 → T-055 → T-073 → T-077 → T-093 → T-094 → T-110 → T-114 → T-131 → T-132.

Lo que más riesgo tiene: el push en iPhone (T-022, T-070, T-082) y la reserva concurrente (T-093). Conviene probarlos en dispositivos reales apenas estén.
