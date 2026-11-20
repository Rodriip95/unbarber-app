# 08 · SACAR TURNO (2.a y 2.b), agenda y Mis turnos

Historias: **APP-10** (pido turno en el calendario de un barbero), **APP-11** (como barbero, agrego a mano un turno coordinado por WhatsApp), **APP-12** (agrego mi turno al calendario del teléfono). Sprint S5.

## Objetivo

Que el cliente reserve otro día en tres toques (servicio, día, horario) y que el barbero tenga en su agenda todo lo que atiende, venga de la app o de WhatsApp.

## 2.a · Turno con calendario (`/barbero/{id}/turno`)

1. El cliente entra desde **SACAR TURNO** en el inicio (elige barbero en la búsqueda o en Mis barberos) o desde el perfil del barbero.
2. Elige **servicio** (define la duración).
3. Elige **día** en una tira de 14 días; los días cerrados en gris.
4. Ve los **horarios libres** en grilla de 15 minutos donde entra la duración del servicio, según `schedule` menos turnos `requested` y `confirmed` y excepciones. Lo ocupado en gris tachado.
5. Nota opcional (140 caracteres) y **Pedir turno**.
6. Callable `requestAppointment` en transacción: vuelve a comprobar que el hueco esté libre, crea el turno `requested`, código corto, `expiresAt`, y avisa al barbero.
7. Confirmación: "Pedido enviado. {barbero} tiene hasta {hora} para responder." con botón opcional **Avisarle por WhatsApp** que abre WhatsApp con "Hola {nombre}, te pedí turno por Unbarber para el {día} a las {hora}. Aceptalo acá: {dominio}/s/{codigo}".

Si el barbero no tiene horario cargado (`acceptsBookings == false`), en lugar de la grilla se ofrece solo **A coordinar** (2.b).

### Reglas

- Anticipación mínima: 1 hora. Máxima: 14 días.
- Un cliente puede tener como máximo 2 turnos `requested` a la vez y 1 por barbero.
- Un hueco pedido queda bloqueado mientras esté `requested`.
- El barbero puede rechazar con motivo opcional ("No llego", "Ese horario no", "Otro").

## 2.b · A coordinar

1. En el perfil del barbero o en Sacar turno, el cliente toca **A coordinar**.
2. Se abre WhatsApp: "Hola {nombre}, te encontré en Unbarber. Quiero sacar turno para {servicio}. ¿Qué día tenés?". Se registra un contacto con `origin: 'coordinar'`.
3. El barbero acuerda por WhatsApp y carga el turno a mano (APP-11).

## Carga manual del barbero (APP-11)

Desde **Agenda → + Turno**:

1. Cliente: buscar en Mis clientes, o por teléfono (si tiene cuenta con ese número, se vincula), o **cliente nuevo sin cuenta** (nombre y teléfono).
2. Servicio, día y hora (puede elegir fuera del horario semanal; se avisa si se superpone).
3. Callable `createManualAppointment` crea el turno directamente `confirmed`, `origin: 'manual'`.
4. Si el cliente tiene cuenta, recibe push "Turno confirmado. {día} {hora} con {barbero}." y lo ve en Mis turnos. Si no tiene cuenta, el barbero puede mandarle por WhatsApp un recordatorio con enlace de invitación a la app.

## Máquina de estados

| Estado | Cuándo | Siguiente |
|---|---|---|
| `requested` | El cliente pide (2.a) | `confirmed`, `rejected`, `expired` (sin respuesta en 12 h o 1 h antes del turno, lo primero), `cancelled` (el cliente se arrepiente) |
| `confirmed` | El barbero acepta, o carga manual | `completed`, `cancelled`, `no_show` |
| `completed` | Pasó la hora de fin y nadie reportó problema, o se registró el corte | Habilita calificaciones (spec 09) |
| `cancelled` | Cualquiera cancela | Si faltaban menos de 2 h, `lateCancel = true` y cuenta para reputación |
| `no_show` | El barbero lo marca hasta 30 min después de la hora de inicio | Cuenta para la reputación del cliente |
| `rejected`, `expired` | — | Final. El cliente ve "Tu solicitud venció sin respuesta. Probá con otro barbero." |

Al pasar a `completed`, se crea un corte confirmado de los dos lados (spec 09), porque el turno nació dentro de la app.

## Agenda del barbero (`/agenda`)

- Vista de día con línea de hora actual y vista de semana compacta.
- Cada turno con color según origen: azul (app), rojo (AHORA, registrado desde un contacto), blanco con borde (cargado a mano). Huecos libres marcados.
- Tocar un turno: datos del cliente, WhatsApp, cancelar, marcar "No vino", "Registrar corte".
- Bloquear un rango (almuerzo, trámite) crea una excepción.
- Editar horario semanal desde acá.

## Mis turnos del cliente (`/mis-turnos`)

- Próximos y pasados. Estado con etiqueta: SOLICITADO, CONFIRMADO, RECHAZADO, VENCIDO, CANCELADO, COMPLETADO.
- Alertas de zona activas arriba, si las hay.
- Acciones: cancelar, WhatsApp al barbero, **Agregar a mi calendario**, **Repetir** (abre Sacar turno con el mismo barbero y servicio).

## Agregar a mi calendario (APP-12)

- **Google Calendar**: enlace `https://calendar.google.com/calendar/render?action=TEMPLATE&text=…&dates=…&details=…&location=…`.
- **Archivo .ics**: generado en el navegador (`lib/calendar`), descargado como `turno-unbarber.ics`, con `VEVENT`, `DTSTART`/`DTEND` en UTC, `SUMMARY` "Corte con {barbero}", `LOCATION` (dirección o barrio), `DESCRIPTION` con enlace al turno y `VALARM` 1 hora antes. En iPhone abre el calendario nativo.
- Si el turno se cancela, la app no puede borrar el evento del calendario del teléfono; el push de cancelación lo aclara: "Borralo de tu calendario."

## Criterios de aceptación

- [ ] Dos clientes que piden el mismo hueco a la vez: uno lo consigue y el otro ve "Ese horario se acaba de ocupar".
- [ ] Una solicitud sin respuesta vence a las 12 h o 1 h antes del turno, lo que ocurra primero, y avisa al cliente.
- [ ] Un turno cargado a mano para un cliente con cuenta aparece en su Mis turnos como confirmado.
- [ ] El .ics abre y se guarda bien en iPhone (Calendario) y Android (Google Calendar).
- [ ] Los horarios respetan la zona horaria de Argentina (`America/Argentina/Buenos_Aires`) aunque el teléfono esté en otra.
- [ ] Cancelar con menos de 2 h marca `lateCancel`.

## Eventos

`booking_started {barberId}`, `booking_requested`, `booking_responded {accepted, minutesToRespond}`, `booking_expired`, `booking_cancelled {by, late}`, `manual_appointment_created {clientHasAccount}`, `calendar_added {type: ics|google}`, `coordinar_clicked`.
