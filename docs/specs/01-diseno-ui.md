# 01 · Diseño e interfaz (V2 "Poste")

Cómo se lleva el sistema de diseño V2 "Poste" al código. Referencia visual: [canvas de diseño, página V2 · Poste](https://claude.ai/artifact/UJRTduMd8tdekdXRPW1jTW). V1 "Oficio" no se usa para construir.

## Regla madre

Rojo es barbero y urgencia, azul es cliente y turnos, todo lo demás es blanco y negro. Cada persona sabe en qué modo está con solo mirar la pantalla.

## Tokens (Tailwind CSS 4)

Tailwind 4 se configura en CSS (`app/globals.css`, bloque `@theme`), no en `tailwind.config.ts`. Los valores son estos:

```ts
// equivalente conceptual de app/globals.css
theme: {
  borderRadius: { none: '0', DEFAULT: '0' },          // sin radio en ningún elemento
  colors: {
    white: '#FFFFFF',
    ink: '#111111',          // texto, bordes y sombras
    red: { DEFAULT: '#E0262B', soft: '#FDE7E7' },    // modo barbero, AHORA, alertas
    blue: { DEFAULT: '#1F49C7', soft: '#E6ECFB' },   // modo cliente, turnos, confirmaciones
    gray: { DEFAULT: '#F2F2F2', text: '#555555' },   // cerrado/ocupado, texto secundario
    transparent: 'transparent',
  },
  borderWidth: { DEFAULT: '2px', 0: '0' },
  boxShadow: { hard: '4px 4px 0 0 #111111', none: 'none' },
  fontFamily: {
    display: ['"Archivo Black"', 'sans-serif'],   // títulos, en mayúsculas
    sans: ['"Space Grotesk"', 'sans-serif'],      // 400, 500, 700
  },
}
```

- El color del modo se expone como variable CSS (`--mode: var(--blue)` o `--mode: var(--red)`) en el `<body data-mode="client|barber">`, para que los componentes usen `bg-mode` y `text-mode` sin conocer el modo.
- Fuentes con `next/font/google` (gratis, sin pedidos externos en producción).
- Contraste: texto blanco sobre rojo 4,7:1 y sobre azul 7,4:1. Nunca texto rojo sobre rosa claro en tamaños chicos.

## Componentes base

| Componente | Reglas |
|---|---|
| `Button` | Borde 2 px tinta, sin radio. Alto mínimo 44 px. `primary`: 56 px, Archivo Black, color del modo, sombra dura. Estado presionado: se desplaza 4 px y pierde la sombra. `secondary`: blanco con borde. `ghost`: solo texto subrayado |
| `Card` | Borde 2 px, cabecera de color opcional, pie con dos botones pegados divididos por línea negra (Paso / Me interesa, Rechazar / Aceptar). Sombra dura solo si está destacada o elegida |
| `Tag` | Space Grotesk 700, mayúsculas, espaciado amplio, recuadro con borde. Puede llevar un emoji al inicio |
| `Toggle` | "Disponible ahora": interruptor grande, rojo cuando está prendido |
| `ModeSwitch` | Arriba a la derecha; el modo activo pintado de su color. Solo aparece si el usuario tiene los dos roles; si no, ofrece "Sumar modo barbero" en Perfil |
| `BottomNav` | Cliente: Inicio, Mis turnos, Mis barberos, Perfil. Barbero: Bandeja, Agenda, Mis clientes, Mi perfil. Pestaña activa con el color del modo |
| `PoleStripe` | Franja diagonal roja, blanca y azul bajo el encabezado. Nunca como fondo de pantalla |
| `DayPicker`, `SlotGrid` | Días cerrados y horarios ocupados en gris `#F2F2F2` con texto tachado o atenuado; elegido con sombra dura y color del modo |
| `RatingStars`, `TagPicker` | Para calificar; etiquetas con emoji (🙂 amable, 😄 divertido, 🎯 detallista, ⏱️ puntual, 💬 buena charla) |
| `EmptyState` | Sticker (tijera o peine) con una frase sobria |
| `Sheet` | Hoja inferior para confirmaciones (enviar alerta, cancelar turno) |
| `Toast` | Mensajes cortos, sin signos de exclamación |
| Íconos | De línea, 2 px, sin relleno (Lucide con `strokeWidth={2}`) |

Cada componente tiene su historia en una página `/dev/ui` (solo en desarrollo) para revisar el sistema sin depender de Storybook.

## Pantallas del MVP

| Modo | Pantalla | Ruta | Spec |
|---|---|---|---|
| Ambos | Entrar con Google | `/entrar` | 02 |
| Ambos | Bienvenida (rol, WhatsApp, push, Términos, edad) | `/bienvenida` | 02 |
| Cliente | Inicio (CORTARME AHORA / SACAR TURNO / Mis barberos) | `/` | 05, 08 |
| Cliente | Libres ahora + avisar a la zona | `/ahora` | 05, 06 |
| Cliente | Alerta enviada (respuestas en vivo) | `/ahora/alerta/{id}` | 06 |
| Cliente | Perfil del barbero | `/barbero/{id}` | 03, 05 |
| Cliente | Sacar turno | `/barbero/{id}/turno` | 08 |
| Cliente | Mis turnos | `/mis-turnos` | 08 |
| Cliente | Mis barberos | `/mis-barberos` | 10 |
| Cliente | Calificar barbero | `/calificar/{cutId}` | 09 |
| Barbero | Bandeja | `/bandeja` | 07 |
| Barbero | Agenda | `/agenda` | 08 |
| Barbero | Mis clientes | `/mis-clientes` | 10 |
| Barbero | Mi perfil y edición | `/mi-perfil`, `/mi-perfil/editar/*` | 03 |
| Barbero | Registrar corte y calificar cliente | `/registrar-corte`, `/calificar/{cutId}` | 09 |
| Ambos | Perfil y ajustes | `/perfil` | 02 |
| Admin | Panel | `/admin/*` | 04 |

## Tono de voz

- Frases cortas, voseo, sin signos de exclamación ni mayúsculas para gritar.
- Preguntas directas y palabras de todos los días: "¿Te cortás hoy, Martín?", "Paso", "Me interesa", "Vino y se cortó".
- Ejemplos: "Turno confirmado. Sábado 14:30 con Matías." · "Hay 4 barberos disponibles a menos de 2 km." · "Tu solicitud venció sin respuesta. Probá con otro barbero."
- Emojis solo en etiquetas y opciones (💈 alerta de zona, 📅 pedido de turno, ✂️ corte, 🧔 corte y barba). **Nunca** en textos legales, precios ni avisos de pago, y nunca reemplazando una palabra.

Todos los textos viven en `lib/copy/es-AR.ts` para revisarlos juntos.

## Accesibilidad y uso

- Diseñado primero para 360 × 640 px; probado hasta 430 px de ancho. En escritorio, columna central de 480 px.
- Áreas táctiles de 44 px mínimo; foco visible con contorno de 2 px en el color del modo.
- Toda imagen con texto alternativo; los emojis decorativos con `aria-hidden`.
- Respeta `prefers-reduced-motion` (la animación de "Buscando barberos…" se reemplaza por texto).

## Criterios de aceptación

- [ ] No hay ningún `border-radius` distinto de 0 en la app (prueba automática que revisa el CSS compilado).
- [ ] Cambiar de modo cambia el color de acento, la barra inferior y el inicio sin recargar.
- [ ] Las 7 pantallas del canvas V2 se ven iguales en código (revisión visual lado a lado).
- [ ] Todos los textos pasan por `lib/copy` y no tienen signos de exclamación.
