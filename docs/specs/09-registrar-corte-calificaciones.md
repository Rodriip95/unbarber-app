# 09 · Registrar corte y calificaciones

Historias: **APP-13** (como barbero, registro un corte y el cliente lo confirma) y **APP-14** (cliente y barbero nos calificamos). Sprint S6.

## Objetivo

Que lo que pasa por WhatsApp quede registrado en la app, porque sin servicio registrado no hay calificaciones, ni Mis Barberos / Mis Clientes, ni forma de medir conversión.

## Registrar corte (APP-13)

Un corte se registra de tres maneras:

| Origen | Cómo | Confirmación del cliente |
|---|---|---|
| Turno 2.a o manual con cliente con cuenta | Automático al pasar a `completed` | No hace falta |
| Contacto por AHORA (1.a o 1.b) o A coordinar | El barbero toca **Registrar corte** en la Bandeja (tarjeta "Te escribió…" o alerta en la que tocó Me interesa) | Sí |
| Cliente que no vino por la app | Agenda → Registrar corte → buscar cliente por teléfono o en Mis clientes | Sí, si tiene cuenta |

Flujo con confirmación:

1. El barbero elige cliente y servicio y toca **Vino y se cortó**. Callable `registerCut` crea `cuts/{id}` con `status: 'pending_client'`.
2. El cliente recibe push "¿Te cortaste con {barbero}?" → pantalla `/confirmar-corte/{cutId}` con **Sí** / **No**.
3. **Sí** → `confirmed`: se agregan mutuamente a Mis Barberos y Mis Clientes, el teléfono de ambos pasa a "verificado por uso" y se habilita calificar.
4. **No** → `denied`: no se habilita nada. Tres negaciones al mismo barbero en 30 días se marcan para revisión.
5. Sin respuesta en 72 h → `expired`. El barbero puede calificar igual, pero la calificación no cuenta para el promedio del cliente hasta que el cliente confirme algún corte.

Reglas: un barbero solo puede registrar un corte a un cliente que tuvo contacto con él por la app (contacto, alerta, turno) en los últimos 7 días o que está en sus Mis clientes. Máximo un corte por par cliente-barbero por día.

## Calificaciones (APP-14)

Se habilitan con un corte `confirmed` (o un turno `completed`). Push "Calificá tu servicio" a las 2 h. Ventana: **7 días**.

### El cliente califica al barbero (`/calificar/{cutId}`, azul)

- **Ambiente** (1 a 5 estrellas): lugar, higiene, comodidad. Para barberos a domicilio se llama **Cuidado e higiene**.
- **Servicio** (1 a 5 estrellas): profesionalismo y calidad.
- **Barber**: etiquetas sin estrellas, una o más de 🙂 amable, 😄 divertido, 💬 buena charla, ⏱️ puntual, 🎯 detallista, asesora bien, rápido, tranquilo.
- Opcional: comentario (máx. 300) y foto del corte terminado, con casilla "El barbero puede usarla en su portfolio".

### El barbero califica al cliente (`/calificar/{cutId}`, rojo)

1 a 5 estrellas; según la nota se ofrecen ítems:

| Estrellas | Ítems |
|---|---|
| 5 | Puntual, respetuoso, buena onda, recomendable |
| 4 | Pequeña demora, buena experiencia en general |
| 3 | Impuntual, cambió el horario a último momento |
| 2 | Muy impuntual, trato poco respetuoso |
| 1 | No se presentó, falta de respeto, no pagó |

Comentario opcional, privado (solo lo ve el equipo).

### Reglas para que sea justo

- **A ciegas**: ninguno ve lo que puso el otro hasta que ambos califican o pasan los 7 días (`scheduledDaily` revela).
- El cliente ve su promedio y cantidad, nunca quién le puso cada nota.
- Un barbero con menos de 5 calificaciones muestra **Nuevo** en vez de promedio.
- 1 estrella con "no pagó" o "falta de respeto" va a revisión del equipo (panel de admin).
- Cada reseña pública tiene **Reportar**; las ofensivas se ocultan desde el panel.
- El barbero puede responder una vez a cada reseña, sin edición posterior.
- No se puede editar una calificación una vez enviada.

### Agregados

`onRatingWrite` recalcula, solo con calificaciones reveladas:
- Barbero: promedio de Ambiente y de Servicio por separado, cantidad, 3 etiquetas más elegidas con su conteo ("Amable · 42").
- Cliente: promedio de estrellas, cantidad, ítems positivos más frecuentes; contadores de `no_show` y cancelaciones tardías.

## Pantalla de corte completado

Sticker "Corte hecho" (estilo V2) al confirmar el corte o al terminar de calificar. Los stickers animados quedan para después del lanzamiento (APP-18).

## Criterios de aceptación

- [ ] Un barbero no puede registrar un corte a un cliente sin contacto previo.
- [ ] El cliente que confirma queda en Mis clientes del barbero y el barbero en Mis barberos del cliente.
- [ ] Ninguno ve la calificación del otro antes de calificar o de que pasen 7 días (prueba de reglas).
- [ ] No se puede calificar sin corte confirmado ni después de 7 días.
- [ ] El perfil muestra "Nuevo" hasta la quinta calificación y después los promedios separados.
- [ ] Una reseña reportada aparece en el panel y se puede ocultar.

## Eventos

`cut_registered {origin}`, `cut_confirmed {hoursToConfirm}`, `cut_denied`, `rating_submitted {direction, stars}`, `rating_revealed`, `rating_reported`.

La métrica "clics a WhatsApp que terminan en corte registrado" (meta 40 %) sale de cruzar `contacts` con `cuts`.
