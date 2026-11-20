# 04 · Panel de admin y verificación

Historia: **APP-04** (como admin, apruebo o rechazo barberos). Sprint S2. La parte de membresías está en spec 11 y la moderación de reseñas se suma en S6.

## Objetivo

Que Rodri (u otra persona del equipo con rol admin) revise y apruebe barberos desde el teléfono en menos de 2 minutos cada uno, y tenga a mano lo que hace falta para operar el piloto.

## Acceso

- Ruta `/admin`, solo con custom claim `admin: true`. El claim se asigna con un script local (`npm run admin:grant -- email@…`) usando una cuenta de servicio; no hay forma de pedirlo desde la app.
- Toda acción de admin queda registrada en `adminLog/{id}`: `{adminUid, action, targetId, before, after, at}`.

## Secciones

| Sección | Qué permite | Sprint |
|---|---|---|
| Barberos pendientes | Lista ordenada por antigüedad. Detalle con perfil, fotos, DNI. Botones **Aprobar** y **Rechazar** (motivo obligatorio de una lista + texto) | S2 |
| Barberos | Buscar por nombre o teléfono; ver estado, membresía, métricas básicas; suspender o reactivar | S2 |
| Membresías | Activar membresía tras confirmar el pago, marcar fundador, extender prueba | S6 |
| Reportes | Reseñas y perfiles reportados; ocultar reseña, advertir, suspender | S6 |
| Calificaciones 1★ con "no pagó" o "falta de respeto" | Revisión manual | S6 |
| Teléfonos repetidos | Cuentas que comparten número (detección de abuso) | S6 |
| Configuración | Versión de Términos, días de prueba, precios, cupos fundador, zona piloto | S6 |

## Reglas de verificación

- Se revisa: que la foto del DNI sea legible y el nombre coincida con el de Google o el profesional; que las fotos sean trabajos reales (no de internet); que los precios sean razonables; que la dirección exista.
- Al **aprobar**: `verification.status = approved`, se inicia la prueba (`membership.state = trial`, `trialEndsAt = ahora + config.trialDays`) y se envía push y email "Tu perfil está activo".
- Al **rechazar**: push con el motivo y el barbero puede corregir y reenviar.
- Las fotos del DNI se borran automáticamente 30 días después de aprobado (minimización de datos).

## Criterios de aceptación

- [ ] Un usuario sin claim admin recibe 404 en `/admin` y las reglas le niegan cualquier lectura de datos de admin.
- [ ] Aprobar un barbero lo hace visible en la búsqueda en menos de 10 segundos.
- [ ] Rechazar exige motivo y el barbero lo ve en su perfil.
- [ ] Cada acción queda en `adminLog`.
- [ ] El panel se usa bien desde un teléfono.

## Eventos

`admin_barber_approved`, `admin_barber_rejected {reason}`, `admin_membership_activated`.
