# 12 · Analítica, calidad y definición de listo

## Definición de listo

Una historia está lista cuando:

1. Funciona en **Android (Chrome)** y en **iPhone (Safari, instalada en pantalla de inicio)**.
2. Pasó QA del sprint con los criterios de aceptación de su spec.
3. Respeta el sistema de diseño V2 (spec 01).
4. Mide su evento en analítica.
5. Tiene pruebas de reglas para todo dato nuevo en Firestore o Storage.
6. Está desplegada en un canal de vista previa de Hosting y revisada por el líder de producto.

## Analítica

- Firebase Analytics (GA4) con un wrapper `track(evento, props)` en `lib/analytics`. Nada de datos personales en las propiedades (ni teléfono, ni nombre, ni ubicación exacta; ids sí).
- Eventos del servidor (push enviados, vencimientos, membresías) se registran en `metrics/daily/{fecha}` con contadores, para no depender de exportar GA4 a BigQuery.
- Cada spec lista sus eventos. Propiedad común: `mode` (client o barber).

### Métricas clave del piloto

| Métrica | Cálculo | Meta inicial |
|---|---|---|
| Barberos verificados en la zona piloto | `barbers` con `approved` y `visible` | 30 antes de abrir a clientes |
| Alertas 1.b con al menos un interesado en 15 min | `zone_alert_response` vs `zone_alert_created` | 70 % o más |
| Clics a WhatsApp que terminan en corte registrado | `cuts` confirmados / `contacts` | 40 % o más |
| Solicitudes 2.a aceptadas | `confirmed` / (`confirmed` + `rejected` + `expired`) | 80 % o más |
| Clientes que repiten en 60 días | Clientes con 2+ cortes en 60 días | 40 % o más |
| Barberos que apagan las alertas | `alertsWhenInactive == false` / barberos | Menos de 15 % |
| Conversión de prueba a miembro | `member` / pruebas vencidas | A definir |

Un tablero simple en `/admin/metricas` muestra estas cifras leyendo `metrics/daily`.

## Errores

Sentry (plan gratis) en el frontend y en Functions, con `release` por despliegue. Se filtran datos personales antes de enviar.

## Pruebas

| Tipo | Herramienta | Qué cubre |
|---|---|---|
| Unitarias | Vitest | Geohash y distancias, armado de links de WhatsApp, `.ics`, normalización de teléfonos, máquina de estados de turnos, cálculo de reputación |
| Reglas | `@firebase/rules-unit-testing` + emulador | Cada colección: quién lee y quién escribe, privacidad del teléfono y ubicación, calificaciones a ciegas |
| Functions | Vitest + emuladores | Alertas (límites, destinatarios), reservas concurrentes, vencimientos, registrar corte |
| Punta a punta | Playwright (Chromium y WebKit, viewport móvil) | Onboarding, AHORA, alerta, pedir y aceptar turno, registrar corte y calificar |
| Manual | QA en dispositivos reales | Push, instalación PWA, WhatsApp, .ics, cámara y galería |

Dispositivos mínimos de QA: un Android de gama media (Android 11+) y un iPhone con iOS 16.4+.

## Datos semilla

`seed/` carga en el emulador: 1 admin, 40 barberos repartidos en la zona piloto (con y sin "Disponible ahora", distintas modalidades, algunos "Nuevo"), 20 clientes, turnos en todos los estados y calificaciones. Mientras no se defina la zona piloto, se usa CABA.
