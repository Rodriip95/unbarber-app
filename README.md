# Unbarber · App

Web app instalable (PWA) que conecta clientes con barberos cercanos en Argentina. Una sola app con dos modos: **modo cliente** (azul pizarra) y **modo barbero** (terracota). Este proyecto es independiente de la landing: tiene su propio repositorio y su propio sitio, pero comparten el mismo proyecto de Firebase (`lina-back`).

> Fuente de verdad del producto: [Unbarber · Blueprint de producto](https://claude.ai/artifact/3Eh5NFbbXimfRb5U681k55) (pestañas Producto, App, Diseño y Decisiones técnicas).
> Diseño vigente: V3 "Esquina" (25/11/2026), ver [01-diseno-ui](docs/specs/01-diseno-ui.md). Prototipo navegable: `npm run dev` o `npm run demo:build`.
> Si algo de este repo contradice al documento maestro, manda el documento maestro y se corrige acá.

## Qué hace la app

| Camino | Variante | Qué pasa | Dónde se coordina |
|---|---|---|---|
| **AHORA** (cortarse hoy) | 1.a Lista | El cliente ve barberos con "Disponible ahora" cerca y les escribe por WhatsApp | WhatsApp |
| | 1.b Alerta a la zona | El cliente avisa a todos los barberos de su radio (activos e inactivos); los interesados lo contactan | WhatsApp |
| **SACAR TURNO** (otro día) | 2.a Calendario | El cliente pide un horario libre del calendario del barbero; el barbero acepta o rechaza en la app | Dentro de la app |
| | 2.b A coordinar | El cliente escribe por WhatsApp; el barbero carga el turno a mano | WhatsApp |

Alrededor del core:

- **Registrar corte**: el barbero registra el servicio y el cliente lo confirma. Es lo que habilita las calificaciones y suma a cada uno a **Mis Barberos** / **Mis Clientes**.
- **Calificaciones de los dos lados**, a ciegas y dentro de los 7 días.
- **Bandeja del barbero** con push (FCM) y deeplinks; los mensajes de WhatsApp también llevan un deeplink a la solicitud.
- **Membresía de barberos**: registro y prueba gratis, después membresía de acceso de pago único. En el MVP el cobro es por link de Mercado Pago y se activa a mano desde el panel de admin.
- **Panel de admin**: aprobar barberos, activar membresías, moderar reseñas y reportes.

## Stack (costo mensual cero)

| Pieza | Herramienta |
|---|---|
| Frontend | Next.js (App Router) + TypeScript + Tailwind CSS, exportación estática, PWA |
| Hosting | Firebase Hosting |
| Login | Firebase Auth, solo Google. **Sin SMS** en el MVP |
| Datos | Cloud Firestore + `geofire-common` (geohash para búsqueda por radio) |
| Servidor | Cloud Functions (plan Blaze con alerta de presupuesto de US$5) |
| Precio y promo | Firebase Remote Config |
| Push | Firebase Cloud Messaging (web push) |
| Fotos | Cloud Storage + redimensionado en Functions |
| Mapa | Geolocalización del navegador; Leaflet + OpenStreetMap solo si hace falta |
| Contacto | Enlaces `wa.me` con mensaje y deeplink precargados |
| Calendario del cliente | Archivo `.ics` y enlace a Google Calendar |
| Seguridad | Reglas de Firestore y Storage, App Check, rol admin con custom claims |
| Métricas y errores | Firebase Analytics, Sentry (plan gratis) |

El detalle técnico está en [docs/specs/00-arquitectura.md](docs/specs/00-arquitectura.md).

## Documentación

| Spec | Tema | Historias |
|---|---|---|
| [00-arquitectura](docs/specs/00-arquitectura.md) | Stack, estructura del repo, modelo de datos, reglas, Functions, entornos | Base |
| [01-diseno-ui](docs/specs/01-diseno-ui.md) | Sistema de diseño V3 "Esquina" en código: tokens, componentes, navegación por modo | Todas |
| [02-cuenta-onboarding](docs/specs/02-cuenta-onboarding.md) | Login con Google, rol, WhatsApp, push, Términos, mayoría de edad, borrar cuenta | APP-01, APP-02 |
| [03-perfil-barbero](docs/specs/03-perfil-barbero.md) | Perfil, servicios, horarios, portfolio, modalidad y ubicación | APP-03 |
| [04-admin-verificacion](docs/specs/04-admin-verificacion.md) | Panel de admin, aprobación de barberos, moderación | APP-04 |
| [05-ahora-lista](docs/specs/05-ahora-lista.md) | Búsqueda por radio, "Disponible ahora", lista y WhatsApp (1.a) | APP-05, APP-06, APP-07 |
| [06-ahora-alerta-zona](docs/specs/06-ahora-alerta-zona.md) | Alerta a toda la zona (1.b) | APP-08 |
| [07-bandeja-push-deeplinks](docs/specs/07-bandeja-push-deeplinks.md) | Bandeja del barbero, notificaciones push, deeplinks y códigos cortos | APP-09 |
| [08-sacar-turno](docs/specs/08-sacar-turno.md) | Turnos 2.a y 2.b, agenda del barbero, Mis turnos, `.ics` | APP-10, APP-11, APP-12 |
| [09-registrar-corte-calificaciones](docs/specs/09-registrar-corte-calificaciones.md) | Registrar corte, confirmación, calificaciones mutuas y reputación | APP-13, APP-14 |
| [10-mis-barberos-clientes](docs/specs/10-mis-barberos-clientes.md) | Mis Barberos y Mis Clientes | APP-15 |
| [11-membresia](docs/specs/11-membresia.md) | Prueba, membresía, visibilidad y avisos de fin de prueba | APP-16, APP-17 |
| [12-analitica-calidad](docs/specs/12-analitica-calidad.md) | Eventos de analítica, QA, definición de listo | Todas |

El plan de trabajo con IDs, prioridades y dependencias está en [TASKS.md](TASKS.md).

## Calendario

Seis sprints de dos semanas para lanzar el piloto el **1 de marzo de 2027**.

| Sprint | Fechas | Objetivo |
|---|---|---|
| S1 | 7 al 20 dic 2026 | Base técnica, login con Google, roles, Términos, teléfono |
| S2 | 21 dic 2026 al 3 ene 2027 | Perfil de barbero completo, portfolio, panel de verificación |
| S3 | 4 al 17 ene 2027 | Búsqueda por radio, lista AHORA, WhatsApp directo (1.a) |
| S4 | 18 al 31 ene 2027 | Alerta a la zona (1.b), push, bandeja del barbero |
| S5 | 1 al 14 feb 2027 | SACAR TURNO (2.a y 2.b), agenda, Mis turnos, `.ics` |
| S6 | 15 al 28 feb 2027 | Registrar corte, calificaciones, Mis Barberos y Mis Clientes, membresía, QA final |

Del 1 al 28 de febrero, los barberos ya registrados usan la app en beta cerrada. La estrategia es **barberos primero**: al cerrar S2 un barbero ya puede registrarse y armar su perfil, para que la campaña de enero tenga adónde mandarlos.

## Cómo levantar el proyecto

```bash
# Requisitos: Node 22+, Firebase CLI (npm i -g firebase-tools), Java 21+ para los emuladores
npm install
npm install --prefix functions
cp .env.example .env.local        # completar con la config web del proyecto lina-back
npm run emulators                 # Auth, Firestore, Functions, Storage y Hosting locales
npm run dev                       # Next.js en http://localhost:3000
```

Sin `.env.local` la app usa el proyecto `demo-unbarber`, que solo funciona contra los emuladores.

| Script | Qué hace |
|---|---|
| `npm run dev` | Next.js en modo desarrollo |
| `npm run build` | Exportación estática a `out/` |
| `npm run lint` / `npm run typecheck` | ESLint y TypeScript |
| `npm test` | Pruebas unitarias (Vitest) |
| `npm run emulators` | Emuladores de Firebase con datos de `seed/` |
| `npm run deploy` | Despliega hosting de la app, reglas, índices, Functions y Remote Config |
| `npm run deploy:hosting` | Despliega solo el sitio de la app |

Versiones: Next.js 16 (App Router, exportación estática), React 19, Tailwind CSS 4, Firebase JS SDK 13, firebase-functions 7, firebase-admin 14, Node 22.

## Un solo proyecto de Firebase

Decisión de Rodri (20/11/2026): todo se maneja desde un mismo panel de Firebase, el proyecto **`lina-back`**, compartido con la landing.

| Pieza | Dónde |
|---|---|
| Sitio de la app | Hosting, sitio `unbarber-app` (target `app`), dominio `app.<dominio>` |
| Sitio de la landing | Hosting, sitio `unbarber-landing` (target `landing`), dominio raíz. Lo despliega el repo de la landing con `firebase deploy --only hosting:landing` |
| Auth, Firestore, Storage, Functions, FCM | Compartidos. **Este repo es dueño** de `firestore.rules`, `firestore.indexes.json`, `storage.rules` y la plantilla de Remote Config. Las colecciones de formularios de la landing (`lista_espera`, `preregistros_barberos`, `arrepentimientos`) tienen sus reglas acá |
| Remote Config | `membership_price_ars` (20000), `membership_promo_percent` (100), `membership_promo_until` (ISO, opcional). Lo leen la app y la landing; se cambia desde la consola sin desplegar |

Desarrollo local con emuladores; para QA antes de producción se usan canales de vista previa de Hosting (`firebase hosting:channel:deploy qa --only app`), que dan una URL temporal sin tocar el sitio publicado.

La landing manda "Registrate gratis" a `app.<dominio>/registro?rol=barbero&utm_source=…`. Esa ruta guarda el rol y los UTM y los copia al usuario al terminar el onboarding.

## Decisiones tomadas (no reabrir sin hablar con Rodri)

- Login solo con Google por Firebase. Sin SMS en el MVP; el teléfono se carga a mano.
- Sin chat propio: WhatsApp para conversar, la app para encontrar, avisar, agendar y calificar.
- Todo se opera dentro de la app con push y deeplinks; los mensajes de WhatsApp llevan deeplink.
- El cliente no tiene calendario en la app: tiene Mis turnos y "Agregar a mi calendario".
- La alerta 1.b llega a todos los barberos del radio, activos e inactivos, salvo los que la apagaron.
- Calificaciones solo con un servicio registrado (Registrar corte o turno completado).
- Membresía única para barberos de **$20.000** por Mercado Pago, con promo configurable desde Remote Config (hoy 100 %, sin cargo). Registro y prueba gratis, informada antes de cobrar.
- Costo mensual cero en el MVP (lo único pago es el dominio).

## Pendientes que bloquean partes del desarrollo

| Pendiente | Quién decide | Bloquea |
|---|---|---|
| Duración de la prueba (días o cantidad de clientes) | Rodri | Lógica de vencimiento (APP-16) |
| Zona piloto | Rodri | Datos semilla, radio por defecto, textos |
| Dominio | Rodri | Deeplinks, push en producción, links de WhatsApp |
| Titular legal y Términos revisados por abogado | Rodri | Versión de Términos que se acepta en el onboarding |
