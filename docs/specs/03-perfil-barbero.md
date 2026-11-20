# 03 · Perfil del barbero

Historia: **APP-03** (como barbero, armo mi perfil con servicios, precios, horarios y fotos). Sprint S2. Es lo primero que necesita la campaña de enero.

## Objetivo

Que un barbero arme un perfil que venda (fotos, servicios, precios, modalidad) y lo envíe a verificación en 10 minutos desde el teléfono.

## Asistente de perfil (`/mi-perfil/editar`)

Pasos con barra de progreso; se guarda en cada paso (borrador), así puede seguir otro día.

| Paso | Campos | Obligatorio |
|---|---|---|
| 1. Presentación | Nombre profesional, foto de perfil, bio (máx. 280) | Sí |
| 2. Dónde atendés | Modalidad (local, barbería, a domicilio, en mi casa; una o más). Dirección con sugerencias (local/barbería) o punto base y radio de cobertura (domicilio/casa) | Sí |
| 3. Servicios | Nombre, precio en pesos, duración (15 a 180 min, de a 15). Plantillas rápidas: ✂️ Corte, 🧔 Corte y barba, Barba, Diseño, Color | Al menos 1 |
| 4. Horarios | Horario semanal por día (uno o más rangos), excepciones (feriados, vacaciones). "Abro domingos" se destaca | Para recibir turnos 2.a |
| 5. Fotos de trabajos | Portfolio: subir de la galería o cámara, reordenar, borrar | Mínimo 3 |
| 6. Cobro y redes | Medios de pago aceptados; Instagram y TikTok opcionales | Medios de pago sí |
| 7. Verificación | Foto del DNI de frente y dorso (privadas, solo las ve el equipo) | Sí |
| 8. Revisar y enviar | Vista previa tal como la ve el cliente; botón "Enviar a verificación" | — |

## Ubicación y privacidad

- **Local o barbería**: dirección exacta, geocodificada al guardar. Se muestra la dirección en el perfil.
- **En mi casa**: se guarda la ubicación real en `barbers/{uid}/private/location` y se publica una aproximada (`publicLocation`, desplazada hasta 300 m y fija). El perfil muestra el barrio y "La dirección te la pasa por WhatsApp".
- **A domicilio**: punto base y radio de cobertura (1 a 20 km).
- Geocodificación con costo cero: Nominatim (OpenStreetMap) con límite de 1 pedido por segundo y caché, o el usuario marca el punto en el mapa de Leaflet. Si la dirección no se encuentra, se pide marcar en el mapa.

## Fotos

- Subida a Storage en `barbers/{uid}/portfolio/{id}.jpg`; compresión en el navegador antes de subir (máx. 1600 px, calidad 0,8).
- `onImageUpload` genera versiones de 1080 y 320 px y borra datos EXIF (incluida la ubicación).
- Máximo 12 fotos de portfolio en el MVP.

## Estados del perfil

| Estado | Qué ve el barbero | ¿Aparece para clientes? |
|---|---|---|
| `draft` | Asistente incompleto | No |
| `pending` | "Estamos revisando tu perfil. Te avisamos en menos de 48 h." | No |
| `approved` + prueba o miembro | Perfil activo | Sí |
| `rejected` | Motivo y botón para corregir y reenviar | No |
| `suspended` | Motivo y contacto | No |
| `approved` + `expired` | Aviso de membresía vencida | No (ver spec 11) |

Cambios en un perfil ya aprobado se publican al instante, salvo cambio de DNI, que vuelve a `pending`.

## Vista del perfil para el cliente (`/barbero/{id}`)

Cabecera con foto, nombre, insignia "Verificado", barrio y distancia, etiqueta "DISPONIBLE AHORA" si corresponde. Reputación (Ambiente, Servicio, 3 etiquetas principales; "Nuevo" con menos de 5 calificaciones). Portfolio en grilla. Servicios con precio y duración. Medios de pago. Redes. Botones fijos abajo: **WhatsApp** y **Sacar turno** (o **A coordinar** si no tiene horario cargado). Botón "Agregar a Mis barberos" y "Reportar".

## Criterios de aceptación

- [ ] Un barbero completa el asistente desde un Android de gama media en menos de 10 minutos con fotos de la galería.
- [ ] No se puede enviar a verificación con menos de 3 fotos, sin servicios, sin medios de pago o sin DNI.
- [ ] Un barbero "en mi casa" nunca expone su ubicación real en `barbers/{uid}` público (prueba de reglas y de datos).
- [ ] Las fotos subidas no conservan EXIF.
- [ ] La vista previa coincide con lo que ve un cliente.

## Eventos

`barber_profile_step_completed {step}`, `barber_photo_uploaded`, `barber_submitted_for_review`, `barber_profile_viewed {barberId, source}`.
