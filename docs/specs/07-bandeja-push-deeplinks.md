# 07 · Bandeja, push y deeplinks

Historia: **APP-09** (como barbero, recibo push y gestiono solicitudes en mi bandeja). Sprint S4. La infraestructura de push (tokens, service worker) se arma en S1 y la Bandeja crece en S5 y S6 con turnos y cortes.

## Objetivo

Que todo se opere dentro de la app: cada aviso llega como push, cada push abre la pantalla exacta y cada solicitud se resuelve con un toque. WhatsApp queda para conversar.

## Bandeja del barbero (`/bandeja`)

Encabezado "BANDEJA · {n}" con el interruptor **Estoy libre ahora** arriba (spec 05). Debajo, tarjetas ordenadas por urgencia:

| Tipo | Cabecera | Botones | Sprint |
|---|---|---|---|
| 💈 Alerta de zona (1.b) | Roja | Paso / Me interesa | S4 |
| 📅 Pedido de turno (2.a) | Azul | Rechazar / Aceptar | S5 |
| ✂️ Corte por confirmar | Blanca | Registrar corte / No vino | S6 |
| 💬 Te escribió desde Unbarber (1.a, 24 h) | Blanca | Registrar corte | S6 |
| ⏳ Aviso de prueba sin cargo | Blanca | Ver membresía | S6 |

- Tiempo real con `onSnapshot` sobre las colecciones de origen (alertas abiertas donde es destinatario, turnos `requested`, cortes pendientes).
- Pestañas "Pendientes" e "Historial" (últimos 30 días).
- Estado vacío: sticker y "No tenés nada pendiente. Prendé 'Estoy libre ahora' para aparecer en la lista."
- Contador en el ícono de la app instalada con la Badging API donde exista.

## Push (Firebase Cloud Messaging)

- **Registro**: tras el permiso, `getToken` con la VAPID key; se guarda en `users/{uid}/devices/{hash}`. Se refresca al abrir la app y se borra si FCM devuelve `registration-token-not-registered`.
- **Service worker** `firebase-messaging-sw.js`: muestra la notificación en segundo plano y al tocarla abre o enfoca la app en `data.link`.
- **En primer plano**: no se muestra notificación del sistema; se muestra un `Toast` y se actualiza la Bandeja.
- **Formato**: `{title, body, data: {link, type, id}}`. El título lleva emoji solo en alertas de zona (💈).
- **Horario de silencio**: las Functions no envían entre las 23:00 y las 8:00 (hora del usuario) salvo turnos del día y alertas a barberos con "Disponible ahora" prendido.

| Evento | Destinatario | Canal | Link |
|---|---|---|---|
| Alerta "Corte ahora" en tu zona | Barberos del radio | Push | `/solicitud/{alertId}?t=alert` |
| Un barbero respondió tu alerta | Cliente | Push | `/ahora/alerta/{id}` |
| Nueva solicitud de turno | Barbero | Push y email | `/solicitud/{appointmentId}` |
| Turno confirmado, rechazado, vencido o cancelado | El otro | Push y email | `/mis-turnos` o `/agenda` |
| Recordatorio 24 h y 1 h antes | Ambos | Push | Turno |
| ¿Te cortaste con {barbero}? | Cliente | Push | `/confirmar-corte/{cutId}` |
| Calificá tu servicio (2 h después) | Ambos | Push | `/calificar/{cutId}` |
| Perfil aprobado o rechazado | Barbero | Push y email | `/mi-perfil` |
| Fin de prueba (7 días y 1 día antes) | Barbero | Push y email | `/mi-perfil/membresia` |

**Email**: extensión "Trigger Email from Firestore" con un SMTP de plan gratuito (por ejemplo Brevo, 300 por día). Si se complica, el email queda para después del piloto y el MVP sale solo con push; no bloquea.

## Deeplinks

Dos tipos de enlace, los dos sobre el dominio de la app:

1. **Rutas directas** (`/solicitud/{id}`, `/mis-turnos`, `/calificar/{cutId}`) para push.
2. **Códigos cortos** (`/s/{codigo}`) para los mensajes de WhatsApp, más cortos y legibles: "Aceptá mi turno acá: unbarber.app/s/K7Q2M".

Resolución de `/s/{codigo}`:

1. Si no hay sesión → `/entrar` y vuelve.
2. Lee `shortLinks/{codigo}`. Si `recipientUid != uid` → "Este enlace es para otra persona." Si venció → "Este enlace ya no está activo."
3. Redirige a la pantalla del objeto (`/solicitud/{id}`).

- Códigos de 5 caracteres sin ambiguos (sin 0/O, 1/I/L), generados en la Function con reintento si chocan.
- Vencen con el objeto (turno vencido o pasado, alerta cerrada) y como máximo a los 30 días.
- En Android, si la PWA está instalada, Chrome abre el enlace dentro de la app (`scope` del manifest). En iPhone abre Safari; la sesión de Safari y la de la app instalada son distintas, así que la pantalla ofrece "Abrir en la app" con instrucciones. Se acepta esta limitación en el MVP.

## Pantalla de solicitud (`/solicitud/{id}`)

Una sola pantalla que muestra el objeto según su tipo (alerta o turno), con los datos del cliente que el barbero puede ver (`clientPublic`: nombre, foto, barrio, reputación) y los botones de acción. Si ya fue resuelta, muestra el estado final.

## Criterios de aceptación

- [ ] Un push tocado con la app cerrada abre la pantalla exacta en Android y en iPhone instalada.
- [ ] Un código corto abierto por otra cuenta no muestra datos ni permite aceptar.
- [ ] Un token inválido se borra solo al primer error de envío.
- [ ] La Bandeja se actualiza sin recargar cuando llega una alerta o un pedido.
- [ ] No llegan push en horario de silencio salvo las excepciones.

## Eventos

`push_sent {type}` (servidor), `push_opened {type}`, `inbox_viewed {pending}`, `shortlink_opened {type, valid}`.
