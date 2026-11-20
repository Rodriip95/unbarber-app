# 00 · Arquitectura

Base técnica de la app: estructura del repositorio, modelo de datos, reglas de seguridad, Cloud Functions y entornos. Todo lo demás se apoya en esto.

## Principios

1. **Costo cero**: solo servicios con plan gratuito. Blaze se activa para Functions y Storage, con alerta de presupuesto de US$5 y sin servicios que cobren por uso alto (nada de SMS, Maps de Google ni WhatsApp Business en el MVP).
2. **El cliente lee directo de Firestore, el servidor escribe lo sensible**: todo lo que cambia el estado de otra persona (aceptar un turno, mandar una alerta, confirmar un corte, calificar, activar membresía) pasa por una Cloud Function callable o por un trigger, nunca por una escritura directa del navegador.
3. **Privacidad por defecto**: el teléfono y la ubicación exacta del cliente no están en documentos públicos. Se exponen solo a quien corresponde y en el momento en que corresponde.
4. **Exportación estática**: Next.js con `output: 'export'`, servido por Firebase Hosting. Nada de servidor de Next.js (evita costos y simplifica).

## Estructura del repositorio

```
unbarber-app/
├─ app/                        # Next.js App Router (todas las páginas son client components)
│  ├─ (auth)/entrar/           # Login con Google
│  ├─ (onboarding)/bienvenida/ # Rol, WhatsApp, push, Términos, edad
│  ├─ (cliente)/               # Inicio, ahora, barbero/[id], turno, mis-turnos, mis-barberos, perfil
│  ├─ (barbero)/               # bandeja, agenda, mis-clientes, mi-perfil, editar/*
│  ├─ admin/                   # Panel de administración (solo custom claim admin)
│  ├─ s/                       # Resolución de códigos cortos de deeplinks (/s/{codigo})
│  ├─ solicitud/               # Detalle de solicitud (/solicitud/{id})
│  └─ legal/                   # Términos y Política de privacidad (versionados)
├─ components/                 # UI V2 "Poste" (Button, Card, Tag, Toggle, BottomNav, ModeSwitch…)
├─ lib/
│  ├─ firebase/                # init, auth, firestore, messaging, storage, appCheck
│  ├─ geo/                     # geohash, distancia, redondeo para privacidad
│  ├─ whatsapp/                # armado de links wa.me y mensajes precargados
│  ├─ calendar/                # generación de .ics y link de Google Calendar
│  ├─ analytics/               # wrapper de eventos (ver spec 12)
│  └─ types/                   # tipos compartidos con functions/ (paquete común)
├─ functions/                  # Cloud Functions (TypeScript, Node 22, región southamerica-east1)
│  └─ src/{auth,alerts,appointments,cuts,ratings,membership,notifications,admin,storage,scheduled}/
├─ public/                     # manifest.webmanifest, íconos, firebase-messaging-sw.js
├─ firestore.rules
├─ firestore.indexes.json
├─ storage.rules
├─ firebase.json               # hosting, rewrites, emuladores
├─ seed/                       # datos de prueba para emuladores
├─ tests/{unit,rules,e2e}/
└─ docs/specs/
```

Región de Functions y Firestore: `southamerica-east1` (São Paulo), la más cercana a Argentina. Confirmar que la región tiene cuota gratuita de Firestore al crear el proyecto; si no, usar `us-east1` para la base y aceptar la latencia.

### Rutas dinámicas con exportación estática

Next.js exportado no genera páginas por id. Las rutas con id (`/barbero/{id}`, `/solicitud/{id}`, `/s/{codigo}`) se resuelven así:

- `firebase.json` reescribe `/barbero/**` → `/barbero/index.html`, `/solicitud/**` → `/solicitud/index.html`, `/s/**` → `/s/index.html`.
- La página lee el id de `window.location.pathname` y carga los datos en el cliente.

### PWA

- `manifest.webmanifest` con nombre, íconos (192, 512, maskable), `display: standalone`, `theme_color: #FFFFFF`, `start_url: /?source=pwa`.
- Service worker propio mínimo: cachea el shell de la app y maneja push (`firebase-messaging-sw.js`). Sin modo offline completo en el MVP: si no hay conexión se muestra un aviso.
- En iPhone el push solo funciona con la app instalada en la pantalla de inicio (iOS 16.4+). El onboarding del barbero lo guía (ver spec 02).

## Modelo de datos (Firestore)

Convenciones: ids de usuario = `uid` de Firebase Auth. Fechas en `Timestamp`. Teléfonos en formato E.164 (`+549…`). Dinero en pesos enteros (`ARS`, sin decimales).

### `users/{uid}` (privado: solo el dueño y las Functions)

| Campo | Tipo | Notas |
|---|---|---|
| `displayName`, `photoURL`, `email` | string | De Google; el nombre es editable |
| `roles` | `('client'\|'barber')[]` | Se puede tener los dos |
| `activeMode` | `'client'\|'barber'` | Último modo usado |
| `phone` | string | WhatsApp, E.164 |
| `phoneVerified` | bool | `false` en el MVP; pasa a `true` con el primer servicio registrado (indicador, no verificación real) |
| `terms` | `{version, acceptedAt}` | Versión aceptada de Términos y Privacidad |
| `adultDeclaredAt` | Timestamp | Declaración de 18+ |
| `clientArea` | `{label, geohash5}` | Barrio o zona del cliente, aproximada |
| `notifPrefs` | `{zoneAlerts: bool, quietHours: {from, to}}` | |
| `createdAt`, `deletedAt?` | Timestamp | |

Subcolección `users/{uid}/devices/{tokenHash}`: `{token, platform, createdAt, lastSeenAt}` para FCM.

### `clientPublic/{uid}` (lo que un barbero puede ver del cliente)

`{displayName, photoURL, areaLabel, rating: {avg, count, topTags}}`. Lo escribe solo una Function. El teléfono **no** está acá.

### `barbers/{uid}` (público para usuarios logueados)

| Campo | Tipo | Notas |
|---|---|---|
| `name`, `bio`, `photoURL` | string | |
| `phone` | string | WhatsApp; público porque el cliente siempre ve el botón de WhatsApp |
| `modalities` | `('local'\|'barberia'\|'domicilio'\|'casa')[]` | |
| `base` | — | **No va acá.** La ubicación real vive en `barbers/{uid}/private/location` (`{geohash, lat, lng}`); una Function calcula `publicLocation` |
| `publicLocation` | `{geohash, lat, lng, approx: bool, label}` | Para `casa`: centro desplazado al azar hasta 300 m, fijo por barbero |
| `address` | string? | Solo si atiende en local o barbería |
| `coverageKm` | number | Para domicilio; por defecto 3 |
| `services` | `{id, name, priceArs, durationMin, emoji?}[]` | Al menos 1 |
| `paymentMethods` | `('efectivo'\|'transferencia'\|'mercadopago'\|'debito'\|'credito')[]` | |
| `socials` | `{instagram?, tiktok?}` | |
| `portfolio` | `{path, w, h}[]` | Mínimo 3 para enviar a verificación |
| `schedule` | `{weekly: {0..6: {from, to}[]}, exceptions: {date, closed\|ranges}[], slotMinutes: 15}` | Calendario activo para 2.a |
| `acceptsBookings` | bool | `true` si tiene horario semanal cargado |
| `availableNow` | `{on: bool, since, until, geohash, lat, lng}` | Para la lista AHORA |
| `alertsWhenInactive` | bool | Por defecto `true` |
| `verification` | `{status: 'draft'\|'pending'\|'approved'\|'rejected'\|'suspended', reason?, reviewedBy?, reviewedAt?}` | |
| `membership` | `{state: 'trial'\|'member'\|'expired', trialStartedAt, trialEndsAt, memberSince?, founder: bool}` | Escribe solo admin o Functions |
| `visible` | bool | Calculado por Function: `approved && membership.state in (trial, member)` |
| `rating` | `{ambiente: {avg,count}, servicio: {avg,count}, topTags: {tag,count}[], count}` | Calculado |
| `createdAt`, `updatedAt` | Timestamp | |

Documentos privados (solo el dueño y admin): `barbers/{uid}/private/verification` `{dniFrontPath, dniBackPath, notes}` y `barbers/{uid}/private/location` `{geohash, lat, lng}` con la ubicación real.

### `appointments/{id}` (turnos 2.a, 2.b y cortes de AHORA cargados en agenda)

| Campo | Tipo | Notas |
|---|---|---|
| `barberId`, `clientId?` | string | `clientId` vacío si el barbero cargó un cliente sin cuenta |
| `manualClient?` | `{name, phone}` | Cliente cargado a mano sin cuenta |
| `service` | `{id, name, priceArs, durationMin}` | Copia al momento de pedir |
| `start`, `end` | Timestamp | |
| `origin` | `'app'\|'manual'\|'ahora'` | 2.a, 2.b/manual, o cargado desde AHORA |
| `status` | `'requested'\|'confirmed'\|'rejected'\|'expired'\|'completed'\|'cancelled'\|'no_show'` | Ver máquina de estados en spec 08 |
| `expiresAt` | Timestamp | Para `requested`: lo que ocurra primero entre +12 h y 1 h antes del turno |
| `shortCode` | string | Para el deeplink de WhatsApp |
| `cancelledBy?`, `cancelledAt?`, `lateCancel?` | | `lateCancel` si faltaban menos de 2 h |
| `cutId?` | string | Corte registrado asociado |
| `clientNote?` | string | Máx. 140 caracteres |
| `createdAt`, `updatedAt` | Timestamp | |

Lectura: el barbero y el cliente del turno. Escritura: solo Functions.

### `zoneAlerts/{id}` (alertas 1.b)

| Campo | Tipo | Notas |
|---|---|---|
| `clientId` | string | |
| `approx` | `{geohash6, lat, lng, areaLabel}` | Centro redondeado (~600 m); nunca la ubicación exacta |
| `radiusKm` | number | El radio de búsqueda del cliente |
| `serviceLabel` | string | Corte, corte y barba, barba… |
| `window` | `'next_hour'\|'today'` | |
| `status` | `'open'\|'fulfilled'\|'expired'\|'cancelled'` | |
| `expiresAt` | Timestamp | +60 min |
| `notifiedCount` | number | |
| `consentShareContact` | bool | El cliente acepta que el barbero que toque "Me interesa" vea su WhatsApp |
| `createdAt` | Timestamp | |

Subcolección `zoneAlerts/{id}/responses/{barberId}`: `{status: 'interested'\|'passed', at}`. La crea el barbero vía Function.
Subcolección `zoneAlerts/{id}/recipients/{barberId}`: `{notifiedAt, distanceKmRounded}`. Para la bandeja del barbero y para métricas.

### `cuts/{id}` (Registrar corte)

`{barberId, clientId, appointmentId?, origin: 'ahora'|'turno'|'manual', serviceLabel, date, barberConfirmedAt, clientConfirmedAt?, status: 'pending_client'|'confirmed'|'denied'|'expired', ratingDeadline, createdAt}`.

### `ratings/{cutId}_{direction}`

`direction`: `'c2b'` (cliente a barbero) o `'b2c'`.
`c2b`: `{ambiente: 1-5, servicio: 1-5, tags: string[], comment?, photoPath?, photoForPortfolio: bool}`.
`b2c`: `{stars: 1-5, items: string[], comment?}`.
Comunes: `{cutId, fromUid, toUid, createdAt, revealed: bool, flagged: bool, reply?: {text, at}}`.
Lectura: el autor siempre; el destinatario y el público solo si `revealed == true` (y para `b2c`, el cliente ve solo su promedio, no las notas individuales).

### Relaciones

- `users/{uid}/myBarbers/{barberId}`: `{addedAt, source: 'cut'|'manual', lastCutAt?}`
- `barbers/{uid}/myClients/{clientKey}`: `{clientId?, manualName?, manualPhone?, addedAt, source, cutsCount, lastCutAt?}`

### Otros

- `shortLinks/{code}`: `{type: 'appointment'|'alert'|'cut', targetId, recipientUid, createdAt, expiresAt}`. Lectura solo por el `recipientUid`.
- `contacts/{id}`: `{clientId, barberId, origin: 'ahora'|'alerta'|'coordinar'|'mis_barberos', at}`. Cada toque en WhatsApp; habilita "Registrar corte" y mide conversión.
- `reports/{id}`: `{type: 'rating'|'barber'|'client', targetId, reporterUid, reason, status, createdAt}`.
- `refundRequests/{id}`: pedidos de arrepentimiento de la membresía (spec 11).
- `adminLog/{id}`: registro de cada acción de admin (spec 04).
- `metrics/daily/{fecha}`: contadores de eventos del servidor (spec 12).
- `config/public`: `{termsVersion, privacyVersion, trialDays, founderSlotsLeft, pilotArea, defaultRadiusKm: 3}`. Lectura pública, escritura solo admin. El precio y la promo de la membresía **no** van acá: están en Remote Config.
- `rateLimits/{uid}`: contadores diarios (alertas enviadas, alertas recibidas siendo inactivo). Solo Functions.

### Índices previstos

- `barbers`: `visible ==, availableNow.on ==, availableNow.geohash` rango (lista AHORA).
- `barbers`: `visible ==, publicLocation.geohash` rango (SACAR TURNO y alertas).
- `appointments`: `barberId ==, start` rango (agenda); `clientId ==, start desc` (Mis turnos); `status ==, expiresAt` (vencimientos).
- `cuts`: `clientId ==, status ==`; `barberId ==, status ==`.

## Búsqueda por radio

`geofire-common`: `geohashQueryBounds(center, radiusM)` devuelve hasta 9 rangos; se hace una consulta por rango y se filtran falsos positivos calculando distancia real en el cliente. Radios: 3 km por defecto, ampliable a 5, 10 y 20.

Para la alerta 1.b el barbero entra si su ubicación base cae dentro del radio del cliente **o** si el cliente cae dentro de su `coverageKm` (barberos a domicilio). La Function consulta con el mayor de los dos radios (máx. 20 km) y filtra.

## Cloud Functions

| Function | Tipo | Qué hace |
|---|---|---|
| `onUserCreate` | Auth trigger | Crea `users/{uid}` base |
| `completeOnboarding` | Callable | Valida y guarda rol, teléfono, Términos, edad; crea `clientPublic` o `barbers` en `draft` |
| `submitBarberForReview` | Callable | Valida perfil completo y pasa a `pending` |
| `adminReviewBarber` | Callable (admin) | Aprueba o rechaza; al aprobar inicia la prueba |
| `adminSetMembership` | Callable (admin) | Activa membresía (pago confirmado), marca fundador |
| `setAdminClaim` | Script local | Asigna custom claim `admin` (no expuesta) |
| `recomputeVisibility` | Firestore trigger en `barbers` | Recalcula `visible` |
| `setAvailableNow` | Callable | Prende o apaga "Disponible ahora" con ubicación y duración |
| `createZoneAlert` | Callable | Valida límites, crea alerta, busca barberos y manda push |
| `respondZoneAlert` | Callable | "Me interesa" o "Paso"; devuelve el WhatsApp del cliente si dio consentimiento |
| `closeZoneAlert` | Callable | "Ya conseguí" |
| `requestAppointment` | Callable | Valida hueco libre (transacción), crea `requested`, código corto, push |
| `respondAppointment` | Callable | Aceptar o rechazar |
| `createManualAppointment` | Callable | Turno cargado por el barbero (2.b) |
| `cancelAppointment`, `markNoShow` | Callable | |
| `registerCut` | Callable | Crea corte pendiente y avisa al cliente |
| `confirmCut` | Callable | El cliente confirma o niega |
| `submitRating` | Callable | Guarda calificación; si ambas están, revela |
| `replyToRating`, `reportContent` | Callable | |
| `onRatingWrite` | Firestore trigger | Recalcula agregados de reputación |
| `onCutConfirmed` | Firestore trigger | Agrega a Mis Barberos / Mis Clientes, marca turno `completed` |
| `onImageUpload` | Storage trigger | Redimensiona a 1080 y 320 px, borra EXIF |
| `scheduledEvery5m` | Programada | Vence solicitudes y alertas, apaga "Disponible ahora" vencidos, pasa turnos a `completed` |
| `scheduledHourly` | Programada | Recordatorios 24 h y 1 h, "¿Te cortaste con…?", "Calificá tu servicio" |
| `scheduledDaily` | Programada (9:00 ART) | Revela calificaciones a los 7 días, vence pruebas, avisos de fin de prueba |
| `deleteAccount` | Callable | Borra datos personales y anonimiza calificaciones |

Las programadas usan Cloud Scheduler: 3 jobs gratis por cuenta, justo lo que se usa. No agregar más jobs sin revisar el costo.

## Reglas de seguridad (resumen)

- Todo requiere `request.auth != null` salvo `config/public` y `/legal`.
- `users/{uid}`: lee y edita solo el dueño, y solo campos no sensibles (`displayName`, `notifPrefs`, `activeMode`, `clientArea`). `roles`, `terms`, `phoneVerified` los escribe la Function.
- `barbers/{uid}`: lee cualquiera logueado si `visible == true` o si es el dueño o admin. El dueño edita su perfil, pero no `verification`, `membership`, `visible`, `rating`.
- `appointments`, `cuts`, `zoneAlerts`, `ratings`, `shortLinks`: solo lectura para las partes; escritura solo Functions.
- `admin`: custom claim `admin == true` para leer todo y para el panel.
- Storage: `barbers/{uid}/portfolio/*` y `avatar` escribe el dueño (imágenes, máx. 8 MB); `barbers/{uid}/verification/*` solo dueño y admin; `ratings/*` escribe el autor.

Cada regla tiene prueba en `tests/rules/` con el emulador.

## Entornos y despliegue

- **Un solo proyecto de Firebase, `lina-back`, compartido con la landing** (decisión de Rodri, 20/11/2026). Hosting con dos sitios: `unbarber-app` (target `app`, este repo) y `unbarber-landing` (target `landing`, repo de la landing). Este repo es dueño de las reglas, índices y Remote Config.
- Desarrollo con emuladores; QA en canales de vista previa de Hosting (`firebase hosting:channel:deploy qa --only app`).
- Remote Config: `membership_price_ars`, `membership_promo_percent`, `membership_promo_until` (plantilla en `remoteconfig.template.json`).
- Variables públicas en `.env.local` (`NEXT_PUBLIC_FIREBASE_*`, `NEXT_PUBLIC_VAPID_KEY`, `NEXT_PUBLIC_SENTRY_DSN`). Nada secreto en el frontend.
- Ramas: `main` (producción), `develop` (pruebas), ramas de feature `feat/APP-xx-descripcion`.
- CI con GitHub Actions (gratis en repo privado hasta la cuota): lint, typecheck, unit, build; deploy a producción al mergear a `main` con aprobación manual.
- Alerta de presupuesto de US$5 al activar Blaze.

## Fuera de alcance del MVP

Chat propio, pagos dentro de la app, barberías con varios barberos, app nativa, sincronización con Google Calendar del barbero, verificación de teléfono por WhatsApp, recordatorios por WhatsApp Business.
