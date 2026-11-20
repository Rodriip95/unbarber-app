# 05 · AHORA: lista de disponibles y WhatsApp (1.a)

Historias: **APP-05** (veo barberos disponibles ahora cerca mío), **APP-06** (escribo por WhatsApp con mensaje y deeplink precargados), **APP-07** (como barbero, activo y desactivo "Disponible ahora"). Sprint S3.

## Objetivo

Que un cliente que quiere cortarse ya vea en segundos quién está libre cerca y le escriba por WhatsApp con un toque. Es la promesa central de Unbarber: conseguir barbero en el momento, incluso un domingo.

## Lado barbero: "Disponible ahora"

- Interruptor grande en la parte superior de la **Bandeja** ("Estoy libre ahora").
- Al prenderlo se elige duración: 1 h, 2 h, 4 h o "hasta que lo apague" (máx. 12 h).
- Ubicación:
  - Local o barbería: usa la dirección del perfil.
  - Domicilio o casa: pide la ubicación actual del navegador una vez al prender (no hay rastreo continuo). Si la niega, usa el punto base.
- Callable `setAvailableNow` guarda `availableNow = {on, since, until, geohash, lat, lng}`. Para "en mi casa" se guarda la ubicación aproximada, no la real.
- `scheduledEvery5m` apaga los vencidos y manda push "Se apagó 'Disponible ahora'. ¿Seguís libre?" con deeplink para volver a prenderlo.
- Solo pueden prenderlo barberos con `visible == true`.

## Lado cliente: lista AHORA (`/ahora`)

1. En el inicio, el cliente toca **CORTARME AHORA** (bloque rojo).
2. Se pide ubicación del navegador. Si la niega, se usa su zona guardada o se le pide escribir el barrio.
3. Pantalla "Buscando barberos…" con animación del poste (2 a 3 segundos mínimo, aunque la consulta tarde menos).
4. Consulta: `geohashQueryBounds` con radio 3 km sobre `barbers` con `visible == true` y `availableNow.on == true`; filtro por distancia real y por `availableNow.until > ahora`.
5. Orden: puntaje = distancia (peso 0,6) + reputación (peso 0,4). Los "Nuevo" (menos de 5 calificaciones) usan reputación neutra.
6. Cada tarjeta: foto, nombre, distancia redondeada ("a 1,2 km"), barrio, etiqueta "DISPONIBLE AHORA", reputación resumida, precio del corte más barato, modalidad (📍 local / 🏠 en su casa / 🛵 va a domicilio). Botones: **Ver perfil** y **WhatsApp**.
7. Filtros en chips: radio (3, 5, 10, 20 km), a domicilio, servicio, precio máximo.
8. Si la lista está vacía o tiene pocos resultados, se destaca el bloque **Avisar a barberos de mi zona** (spec 06). Siempre está visible abajo de la lista.
9. La lista se actualiza en vivo (`onSnapshot`) mientras la pantalla esté abierta: si un barbero se apaga, desaparece.

## WhatsApp (APP-06)

Enlace `https://wa.me/{telefonoBarbero}?text={mensaje}` armado en `lib/whatsapp`.

| Origen | Mensaje precargado |
|---|---|
| AHORA (1.a) | "Hola {nombre}, te encontré en Unbarber. ¿Podés atenderme ahora? Estoy en {barrio}." |
| A coordinar (2.b) | "Hola {nombre}, te encontré en Unbarber. Quiero sacar turno para {servicio}. ¿Qué día tenés?" (ver spec 08) |
| Desde Mis barberos | "Hola {nombre}, ¿tenés lugar para un corte?" |

- Al tocar WhatsApp se registra un **contacto** (`contacts/{id}`: `{clientId, barberId, origin, at}`), que sirve para métricas y para sugerir "Registrar corte" al barbero después (spec 09).
- En 1.a el mensaje **no** lleva deeplink: no hay nada que aceptar en la app. El deeplink aparece en 2.a y 2.b.
- El barbero ve en su Bandeja "Te escribió {cliente} desde Unbarber" durante 24 h, con botón "Registrar corte".

## Criterios de aceptación

- [ ] Con 30 barberos de prueba en la zona, la lista aparece en menos de 3 segundos en 4G.
- [ ] Un barbero que apaga "Disponible ahora" desaparece de la lista abierta de un cliente en menos de 5 segundos.
- [ ] Un barbero "en mi casa" muestra barrio y distancia aproximada, nunca su ubicación exacta.
- [ ] El botón de WhatsApp abre la app de WhatsApp con el mensaje correcto en Android y en iPhone.
- [ ] La disponibilidad se apaga sola al vencer y el barbero recibe el aviso.
- [ ] Sin permiso de ubicación, la búsqueda funciona con el barrio escrito.

## Eventos

`ahora_opened`, `ahora_results {count, radiusKm}`, `ahora_empty`, `whatsapp_clicked {origin, barberId}`, `available_now_on {durationH}`, `available_now_off {reason}`.
