# 11 · Membresía de barberos

Historias: **APP-16** (como admin, activo la membresía de un barbero; la prueba vence sola) y **APP-17** (avisos de fin de prueba). Sprint S6.

## Modelo (decisión de Rodri)

| Etapa | Qué tiene el barbero | Qué paga |
|---|---|---|
| Registro | Cuenta y perfil cargado | Nada |
| Prueba | Todo activo: búsquedas, solicitudes, alertas, agenda | Nada, durante [días de prueba] |
| Miembro | Lo mismo, sin límite de tiempo | Membresía de acceso, un solo pago |
| Sin membresía al terminar la prueba | Conserva cuenta, perfil, agenda y Mis clientes; deja de aparecer en búsquedas y alertas y no recibe turnos nuevos | Nada |

**Membresía fundador**: los primeros [50] barberos de la zona piloto pagan un precio reducido.

**Precio (decisión de Rodri, 20/11/2026)**: **$20.000**, pago único por Mercado Pago a la cuenta de Rodri, con una **promo de descuento configurable desde Firebase Remote Config**, hoy al **100 %** (sin cargo).

| Clave de Remote Config | Tipo | Valor inicial | Uso |
|---|---|---|---|
| `membership_price_ars` | number | 20000 | Precio de lista |
| `membership_promo_percent` | number | 100 | Descuento, 0 a 100 |
| `membership_promo_until` | string ISO | vacío | Fin de la promo; vacío = sin fecha |

**La promo se congela al registrarse** (decisión de Rodri, 20/11/2026): el barbero que se registra mientras la promo está vigente la conserva aunque después se apague en Remote Config. `completeOnboarding` guarda en `barbers/{uid}.membership` el `priceArs`, el `promoPercent` vigente y `promoLockedAt`; el cobro usa esos valores, no los actuales.

Precio a pagar = `priceArs × (1 − promoPercent/100)` con los valores congelados del barbero (`lib/membership.ts` para mostrar, `functions/src/lib/membershipConfig.ts` en el servidor). La landing lee las mismas claves para su FAQ. Las Functions leen Remote Config del servidor (`firebase-admin/remote-config`) para no confiar en el valor que manda el navegador.

Siguen pendientes los días de prueba y los cupos fundador; viven en `config/public` (`trialDays`, `founderSlotsLeft`). Con la promo al 100 %, la membresía fundador pierde sentido mientras dure la promo.

## Transparencia (obligatoria por Ley 24.240 y Lealtad Comercial)

La membresía se informa **antes** de que el barbero dependa de la app:

- En el primer paso del perfil: "Registro y prueba sin cargo. Después, membresía de acceso de pago único." con enlace a los detalles y el precio vigente.
- En `/mi-perfil/membresia`: estado, días restantes, precio, qué pasa si no paga, cómo pagar, botón de arrepentimiento.
- En los Términos (cláusula de membresía, prueba y arrepentimiento de 10 días).
- Nunca "100 % gratis" ni "gratis para siempre" en ningún texto de la app. Sin emojis en textos de precio o pago.

## Cobro en el MVP (costo cero)

**Con promo del 100 %**: la pantalla muestra el precio de lista tachado y "Sin cargo por promoción" y el botón **Activar membresía sin cargo**. La callable `activateFreeMembership` lee la promo congelada del barbero, confirma que el precio efectivo es 0 y activa la membresía al instante (`membership.state = 'member'`, `paidArs: 0`, `promoPercent: 100`). Sin Mercado Pago y sin intervención del equipo.

**Con precio mayor a 0**:

1. El barbero toca **Pagar membresía** → se abre un **link de pago de Mercado Pago** (uno para precio normal y otro para fundador, configurados en `config/public`). El link lleva en la referencia el `uid` del barbero o se le pide que ponga su email.
2. El equipo ve el pago en Mercado Pago y, en el panel de admin, toca **Activar membresía** (callable `adminSetMembership`). Queda `membership.state = 'member'`, `memberSince`, `founder`, y se descuenta un cupo fundador si corresponde.
3. Push y email "Tu membresía está activa."
4. **Botón de arrepentimiento**: visible durante 10 días desde la activación; genera un pedido en `refundRequests` que el equipo procesa a mano. Al aceptarlo, la membresía vuelve a `expired`.

La integración con Checkout de Mercado Pago (activación automática por webhook) queda para después del piloto (NEG-08).

## Vencimiento de la prueba (APP-16)

- Al aprobar al barbero: `trialStartedAt = ahora`, `trialEndsAt = ahora + trialDays`.
- `scheduledDaily` (9:00 ART): pruebas vencidas → `membership.state = 'expired'` → `recomputeVisibility` pone `visible = false` y apaga "Disponible ahora".
- Turnos ya confirmados se mantienen; no entran turnos nuevos.
- El barbero sin membresía ve en la Bandeja un aviso fijo con **Pagar membresía**.

## Avisos de fin de prueba (APP-17)

| Cuándo | Canal | Texto |
|---|---|---|
| 7 días antes | Push, email y tarjeta en Bandeja | "Tu prueba sin cargo termina el {fecha}. Para seguir apareciendo, la membresía de acceso cuesta {precio}, un solo pago." |
| 1 día antes | Push y email | "Mañana termina tu prueba. Si no activás la membresía, dejás de aparecer en búsquedas y alertas. Tu perfil y tus clientes quedan guardados." |
| El día que vence | Push | "Terminó tu prueba. Activá la membresía cuando quieras para volver a aparecer." |

## Criterios de aceptación

- [ ] El precio y la promo se leen de Remote Config; cambiarlos desde la consola no requiere desplegar.
- [ ] Con promo 100 % el barbero activa la membresía solo, sin pagar; la callable lo rechaza si la promo congelada del barbero no es 100 %.
- [ ] Un barbero registrado con promo 100 % sigue sin cargo aunque después la promo se baje a 0 en Remote Config; uno registrado después paga el precio vigente.
- [ ] Un barbero con la prueba vencida desaparece de la lista AHORA, de la búsqueda de turnos y de las alertas en la corrida diaria siguiente.
- [ ] Un barbero vencido conserva perfil, agenda y Mis clientes, y vuelve a aparecer al activar la membresía.
- [ ] Los avisos de 7 y 1 día salen una sola vez cada uno.
- [ ] Ningún texto de la app dice "gratis para siempre" ni muestra precios con emojis.
- [ ] Solo un admin puede cambiar `membership` (prueba de reglas).

## Eventos

`membership_info_viewed`, `membership_pay_clicked {founder}`, `membership_activated` (servidor), `trial_expired` (servidor), `refund_requested`.

## Pendientes de Rodri

Días de prueba (o cantidad de clientes), cupos y precio fundador, link de Mercado Pago para cuando la promo baje, titular legal para facturar, y si la promo tiene fecha de fin.
