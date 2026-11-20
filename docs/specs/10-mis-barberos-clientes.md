# 10 · Mis Barberos y Mis Clientes

Historia: **APP-15**. Sprint S6. Prioridad P1.

## Objetivo

Que cada lado guarde su red para volver a pedir rápido (cliente) y para agendar y avisar a su gente (barbero).

## Cómo se suma alguien

| Lista | Automático | Manual |
|---|---|---|
| Mis Barberos (cliente) | Al confirmar un corte o completar un turno | "Agregar a Mis barberos" desde un perfil |
| Mis Clientes (barbero) | Al confirmar un corte o completar un turno | Cargar un cliente por nombre y teléfono (tenga cuenta o no) |

Se puede quitar a alguien de la lista sin que el otro se entere.

## Mis barberos (`/mis-barberos`, cliente)

- Tarjetas con foto, nombre, último corte ("Hace 3 semanas"), etiqueta **DISPONIBLE AHORA** en vivo si lo está.
- Acciones por barbero: **Sacar turno**, **WhatsApp**, **Repetir último servicio**.
- Orden: disponibles ahora primero, después por último corte.
- Estado vacío: "Todavía no tenés barberos. Cuando te cortes con alguien por Unbarber, aparece acá."
- En el inicio del cliente se muestran los primeros 3 como accesos rápidos.

## Mis clientes (`/mis-clientes`, barbero)

- Lista con buscador por nombre o teléfono: foto o inicial, nombre, cantidad de cortes, último corte, reputación del cliente.
- Detalle: historial de cortes y turnos con ese barbero, reputación, notas privadas del barbero (máx. 300, solo él las ve), WhatsApp, **Agendar** (abre la carga manual de turno con el cliente elegido).
- Clientes sin cuenta: se muestran con la etiqueta "Sin app" y botón para invitarlos por WhatsApp.

## Datos

- `users/{uid}/myBarbers/{barberId}`: `{addedAt, source, lastCutAt?, lastServiceId?}`.
- `barbers/{uid}/myClients/{clientKey}`: `{clientId?, manualName?, manualPhone?, addedAt, source, cutsCount, lastCutAt?, note?}`. `clientKey` = `clientId` si tiene cuenta, o hash del teléfono si no.
- Si un cliente sin cuenta se registra después con ese teléfono, `onboarding` vincula sus entradas (`clientId` se completa).

## Fuera del MVP

Avisar a Mis clientes cuando el barbero se pone disponible un domingo (idea anotada para fase 2).

## Criterios de aceptación

- [ ] Confirmar un corte suma a los dos en sus listas sin duplicados.
- [ ] Un cliente sin cuenta cargado a mano se vincula solo cuando se registra con el mismo teléfono.
- [ ] Las notas privadas del barbero no son legibles por nadie más (prueba de reglas).
- [ ] La etiqueta "Disponible ahora" en Mis barberos se actualiza en vivo.

## Eventos

`my_barbers_viewed {count}`, `my_barber_added {source}`, `my_clients_viewed {count}`, `repeat_booking_clicked`.
