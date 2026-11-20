# 02 · Cuenta y onboarding

Historias: **APP-01** (entro con Google y elijo si soy cliente o barbero) y **APP-02** (acepto Términos y cargo mi WhatsApp). Sprint S1.

## Objetivo

Que cualquier persona entre con Google, elija su rol, cargue su WhatsApp, acepte los Términos y llegue al inicio de su modo en menos de un minuto, sin SMS.

## Flujo

1. **Entrar con Google** (`/entrar`): `signInWithPopup` en escritorio y `signInWithRedirect` en la PWA instalada y en iPhone (los popups fallan dentro de la app instalada). Si llegó desde un deeplink, se guarda la ruta de destino en `sessionStorage` y se vuelve ahí al terminar.
2. **Elegir rol**: "Soy cliente" (azul) / "Soy barbero" (rojo). Se puede sumar el otro rol después desde Perfil.
3. **WhatsApp**: campo con `+54` fijo y el resto del número. Se normaliza a E.164 móvil argentino (`+549` + código de área sin 0 + número sin 15). Botón **Probar** que abre `https://wa.me/{numero}` para que la persona vea que es su número.
4. **Notificaciones**: explicación corta y pedido de permiso. Se registra el token de FCM en `users/{uid}/devices`.
   - Cliente: opcional ("Te avisamos cuando un barbero responda").
   - Barbero: obligatorio para continuar. Si el navegador es Safari en iPhone y la app no está instalada, se muestra la guía "Agregar a pantalla de inicio" con capturas, y el paso queda pendiente hasta que entre desde la app instalada.
5. **Términos y Política de privacidad**: casilla sin marcar por defecto, con enlaces a `/legal/terminos` y `/legal/privacidad`. Se guarda versión, fecha y hora.
6. **Mayoría de edad**: casilla "Tengo 18 años o más".
7. **Completar perfil**:
   - Cliente: nombre (precargado de Google) y barrio o zona (texto con sugerencias, se guarda aproximado). Va al inicio.
   - Barbero: pasa al asistente de perfil (spec 03). En el primer paso ve el aviso de membresía: "Registro y prueba sin cargo. Después, membresía de acceso de pago único." con enlace a los detalles.

Los pasos 5 y 6 se envían juntos a la callable `completeOnboarding`, que valida todo en el servidor. Hasta que no esté completo, cualquier ruta redirige a `/bienvenida` en el paso que falta.

## Reglas

- Un mismo `uid` puede tener los dos roles; `activeMode` define qué ve. El `ModeSwitch` solo aparece con los dos roles.
- El teléfono no se verifica con código. El perfil muestra "Teléfono sin verificar" hasta el primer servicio registrado (spec 09).
- En el MVP no se impide que dos cuentas usen el mismo teléfono; se registra para detectar abuso (consulta en el panel de admin).
- Si `config/public.termsVersion` cambia, en el próximo ingreso se muestra la pantalla de aceptación de la nueva versión antes de seguir.
- App Check (reCAPTCHA Enterprise o v3 en web) activo desde el día uno en Functions y Firestore.

## Perfil y ajustes (`/perfil`)

- Editar nombre, foto, WhatsApp y zona.
- Notificaciones: prender o apagar alertas de zona (barbero), horario de silencio.
- Sumar el otro rol.
- Ver Términos y Privacidad aceptados.
- Cerrar sesión.
- **Borrar cuenta**: confirmación en dos pasos; la callable `deleteAccount` borra datos personales, fotos y tokens, cancela turnos futuros con aviso a la otra parte, y deja las calificaciones dadas como "Usuario eliminado". Lo exige la Ley 25.326.

## Criterios de aceptación

- [ ] Entrar con Google funciona en Chrome Android, Safari iPhone (instalada y no instalada) y Chrome escritorio.
- [ ] Un número como `11 15 2345-6789` se guarda como `+5491123456789`.
- [ ] No se puede llegar al inicio sin Términos y mayoría de edad aceptados; queda guardada la versión.
- [ ] Un barbero en iPhone sin la app instalada ve la guía de instalación y no puede terminar sin permiso de push.
- [ ] Entrar desde un deeplink sin sesión lleva a Google y vuelve a la pantalla del deeplink.
- [ ] Cambiar la versión de Términos en `config/public` obliga a aceptar en el próximo ingreso.
- [ ] Borrar cuenta elimina `users/{uid}`, `clientPublic` o `barbers`, fotos y tokens, y deja las calificaciones anónimas.

## Eventos de analítica

`login`, `onboarding_role_selected {role}`, `onboarding_phone_tested`, `push_permission {granted}`, `pwa_install_prompt_shown`, `terms_accepted {version}`, `onboarding_completed {role}`.

## Preguntas abiertas

- ¿Se pide fecha de nacimiento o alcanza con la declaración de 18+? Hoy: declaración.
- Texto final de Términos (pendiente de revisión legal).
