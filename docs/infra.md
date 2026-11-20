# Infraestructura y ambientes

Decisión de Rodri (20/11/2026): dos proyectos de Firebase, uno por ambiente, atados a una rama de GitHub cada uno. App y landing comparten el proyecto de cada ambiente.

| Ambiente | Proyecto de Firebase | Alias | Rama | Deploy | Para qué |
|---|---|---|---|---|---|
| Desarrollo | `unbarber-desa` | `desa` | `develop` | Automático en cada push | QA, pruebas con datos falsos, beta interna |
| Producción | `unbarber-prd` | `prd` | `main` | Automático en cada push, **con aprobación manual** | Barberos y clientes reales |
| Local | Emuladores (`demo-unbarber`) | — | cualquiera | — | Desarrollo diario |

Cada proyecto tiene lo mismo: Auth (Google), Firestore, Storage, Functions, FCM, Remote Config, Analytics y Hosting con dos sitios (app y landing).

## Flujo de trabajo

```
feat/APP-xx-algo ──PR──► develop ──(deploy automático)──► unbarber-desa
                           │
                           └──PR "release"──► main ──(aprobación)──► unbarber-prd
```

1. Cada cambio sale de una rama `feat/APP-xx-descripcion` (o `fix/…`) creada desde `develop`.
2. PR hacia `develop`: corre **CI** (lint, typecheck, tests, build de Functions y de la app) y **Preview**, que publica la app en un canal de vista previa de `unbarber-desa` y comenta la URL en el PR.
3. Merge a `develop`: **Deploy** publica en `unbarber-desa` (hosting de la app, reglas e índices de Firestore, reglas de Storage, Functions).
4. Para salir a producción: PR de `develop` a `main`. Al mergear, **Deploy** espera la aprobación de Rodri en el ambiente `prd` de GitHub y publica en `unbarber-prd`.
5. Un arreglo urgente en producción: rama `hotfix/…` desde `main`, PR a `main`, y después merge de `main` a `develop` para no perderlo.

## Workflows de GitHub Actions

| Archivo | Cuándo corre | Qué hace |
|---|---|---|
| `.github/workflows/ci.yml` | PR a `develop` o `main` | Lint, typecheck, tests, build. Es el check obligatorio `check` |
| `.github/workflows/preview.yml` | PR a `develop` | Canal de vista previa en `unbarber-desa` (vence a los 7 días) |
| `.github/workflows/deploy.yml` | Push a `develop` o `main` | Vuelve a correr CI y despliega al proyecto del ambiente |

La config web de Firebase (apiKey, appId, etc.) **no está en el repo**: el deploy la lee del proyecto con `firebase apps:sdkconfig` y la escribe en `.env.production.local` durante el build (`scripts/write-env.mjs`). Si el proyecto tiene más de una app web (la de la app y la de la landing), se carga en cada ambiente de GitHub la variable `FIREBASE_WEB_APP_ID` con el ID de la app web de la app; la landing hace lo mismo con la suya.

### Remote Config no se despliega solo

El precio y la promo de la membresía se cambian desde la consola de Firebase. Si el deploy automático subiera `remoteconfig.template.json`, pisaría esos cambios. Por eso Remote Config se sube a mano y solo la primera vez (o cuando se agrega una clave nueva):

```bash
npm run rc:deploy:desa
npm run rc:deploy:prd
```

## Configuración de GitHub

**Ambientes** (Settings → Environments):

| Ambiente | Secreto | Variables (opcionales) | Reglas |
|---|---|---|---|
| `desa` | `FIREBASE_SERVICE_ACCOUNT` (JSON de la cuenta de servicio de `unbarber-desa`) | `FIREBASE_VAPID_KEY`, `SENTRY_DSN` | Solo ramas `develop` y PRs |
| `prd` | `FIREBASE_SERVICE_ACCOUNT` (JSON de la cuenta de servicio de `unbarber-prd`) | `FIREBASE_VAPID_KEY`, `SENTRY_DSN` | Solo rama `main`; revisor obligatorio: Rodriip95 |

**Protección de ramas** (Settings → Branches o Rules), para `main` y `develop`:

- Requerir PR para mergear (0 aprobaciones, porque hay un solo desarrollador).
- Requerir que pase el check `check` y que la rama esté al día.
- Bloquear force push y borrado.

## Cuenta de servicio para el deploy

Una por proyecto, con los roles mínimos para desplegar:

| Rol | Para |
|---|---|
| Firebase Hosting Admin | Hosting y canales de vista previa |
| Firebase Rules Admin | Reglas de Firestore y Storage |
| Cloud Datastore Index Admin | Índices de Firestore |
| Cloud Functions Admin | Functions |
| Service Account User | Que Functions corra con su cuenta |
| Artifact Registry Administrator | Imágenes de Functions (2.ª generación) |
| Cloud Scheduler Admin | Functions programadas |
| Firebase Remote Config Admin | `rc:deploy` |
| Firebase Viewer | Leer la config web (`apps:sdkconfig`) |
| API Keys Viewer | Leer la apiKey de la app web |

## Requisitos de cada proyecto

- Plan **Blaze** con alerta de presupuesto de US$5 (Functions y Storage lo exigen; con poco uso el costo es $0).
- Firestore creado en `southamerica-east1`, modo producción.
- Storage activado.
- Auth con proveedor Google; dominios autorizados: el de Hosting y el dominio propio.
- Una app **Web** registrada (de ahí sale la config).
- Sitios de Hosting: el sitio por defecto (`unbarber-desa` / `unbarber-prd`) es la app; la landing usa un sitio adicional (lo define el repo de la landing).
- En `prd`: App Check activado y dominio propio (`app.<dominio>`).

## Local

```bash
npm run emulators          # todo local, sin tocar desa ni prd
npm run env:desa           # o: apuntar el dev local a unbarber-desa (escribe .env.local)
```

Nunca se apunta el desarrollo local a `prd`.
