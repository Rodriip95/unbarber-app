# 06 · AHORA: alerta a toda la zona (1.b)

Historia: **APP-08** (como cliente, envío una alerta a todos los barberos de mi zona). Sprint S4. Depende de push (spec 07).

## Objetivo

Que cuando no hay nadie "Disponible ahora" (o el cliente no se decide), un solo toque avise a todos los barberos del radio, incluidos los inactivos, y que al menos uno responda en 15 minutos en el 70 % de los casos.

## Flujo del cliente

1. En `/ahora` toca **💈 Avisar a barberos de mi zona**.
2. Hoja inferior: servicio (✂️ Corte, 🧔 Corte y barba, Barba, Otro), ventana (**Próxima hora** / **Hoy**) y casilla **"Compartir mi WhatsApp con el barbero que tome la alerta"** (marcada por defecto, explicada en una línea). Sin esa casilla, el barbero interesado aparece en la lista y es el cliente quien escribe.
3. Confirma. Callable `createZoneAlert`.
4. Pantalla de alerta (`/ahora/alerta/{id}`): "Avisamos a {n} barberos a menos de {radio} km." Lista en vivo de los que tocaron **Me interesa**, con botón de WhatsApp para cada uno. Botones **Ya conseguí** y **Cancelar alerta**.
5. Push al cliente por cada barbero interesado: "{nombre} puede atenderte. Escribile."
6. La alerta se cierra sola a los 60 minutos o cuando el cliente toca "Ya conseguí".

## Flujo del barbero

1. Push: "💈 Un cliente a 1,5 km busca corte ahora. ¿Podés?" con deeplink a `/solicitud/{alertId}?t=alert`.
2. Tarjeta en la Bandeja (cabecera roja): servicio, ventana, distancia redondeada, barrio, reputación del cliente, tiempo restante. Botones **Paso** / **Me interesa**.
3. **Me interesa** → callable `respondZoneAlert`: guarda la respuesta, avisa al cliente y, si el cliente dio consentimiento, devuelve su WhatsApp. Se abre WhatsApp con "Hola {cliente}, vi tu alerta en Unbarber. Puedo atenderte {hoy/ahora}. Estoy en {barrio}."
4. **Paso** → la tarjeta se archiva; no vuelve a avisarse esa alerta.
5. Si la alerta se cierra, la tarjeta pasa a "Cerrada" y el botón se deshabilita.

## Lógica de `createZoneAlert`

1. Validaciones: cliente con onboarding completo; menos de **3 alertas por día**; ninguna otra alerta abierta.
2. Centro de la alerta: ubicación del cliente redondeada a geohash de 6 caracteres (~600 m) y barrio.
3. Destinatarios: barberos con `visible == true` y `alertsWhenInactive == true` o `availableNow.on == true`, cuya ubicación base esté dentro del radio del cliente o que cubran la ubicación del cliente con su `coverageKm`.
4. Límites para el barbero: los **inactivos** reciben como máximo **5 alertas por día**; nadie recibe en su horario de silencio (por defecto 23:00 a 8:00), salvo que tenga "Disponible ahora" prendido. Los activos no tienen tope.
5. Si no hay ningún destinatario: no se crea la alerta y el cliente ve "No hay barberos registrados en tu zona todavía. Probá ampliar el radio." con botón para pasar a 10 km.
6. Envía push en lotes (FCM `sendEach`), crea `recipients/{barberId}`, guarda `notifiedCount`.
7. Programa vencimiento: `scheduledEvery5m` pasa a `expired` las vencidas y avisa al cliente si nadie respondió ("Nadie pudo esta vez. Probá sacar turno para más tarde.").

## Privacidad

- El barbero ve distancia redondeada a 0,5 km y barrio, nunca la ubicación exacta.
- El teléfono del cliente solo se entrega al barbero que tocó "Me interesa" y solo si el cliente dio consentimiento. Queda registrado quién lo recibió.
- Un barbero bloqueado o reportado por ese cliente no recibe sus alertas.

## Criterios de aceptación

- [ ] Una alerta llega como push en menos de 10 segundos a los barberos del radio, en Android y en iPhone con la app instalada.
- [ ] Un barbero inactivo deja de recibir alertas después de la quinta del día.
- [ ] La cuarta alerta del día de un cliente se rechaza con un mensaje claro.
- [ ] El teléfono del cliente no aparece en ningún documento legible por barberos que no tocaron "Me interesa" (prueba de reglas).
- [ ] La alerta vence a los 60 minutos y la tarjeta del barbero se actualiza sola.
- [ ] El barbero puede apagar las alertas de zona desde Perfil y deja de recibirlas.

## Eventos

`zone_alert_created {recipients, radiusKm, window}`, `zone_alert_no_recipients`, `zone_alert_response {response, secondsToRespond}`, `zone_alert_closed {reason, interestedCount}`, `zone_alerts_disabled`.

Métricas clave que salen de acá: alertas con al menos un interesado en 15 minutos (meta 70 %) y barberos que apagan las alertas (meta menos de 15 %).
