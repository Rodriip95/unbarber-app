# 01 · Diseño e interfaz (V3 "Esquina")

V3 "Esquina" (25/11/2026) reemplaza a V2 "Poste". Sale de las referencias que pasó Rodri: la pantalla de login (foto de barbería, banda crema con el logo, verde pino con el título) y la landing principal (verde pino, crema, títulos serif con itálica en terracota o durazno). V1 "Oficio" y V2 "Poste" quedan solo como antecedente.

## Regla madre

Verde pino y crema son la casa. Los dos colores del poste marcan el modo: **terracota = barbero y urgencia (AHORA, alertas)**, **azul pizarra = cliente y turnos**. La itálica de DM Serif Text es el gesto de la marca: una o dos palabras por título, nunca un párrafo ("¿Te cortás hoy, *Tomás?*", "Cortarme *ahora*").

## Tokens (`app/globals.css`)

| Token | Valor | Uso |
|---|---|---|
| `pine` | `#182D26` | Fondo de pantallas fuertes, texto principal, botón primario |
| `pine-2` | `#233B32` | Tarjetas sobre fondo pino |
| `moss` / `sage` / `sage-soft` | `#5A6E62` / `#C7CEC4` / `#E4E8E1` | Fotos pendientes, chips apagados, ocupado |
| `cream` / `paper` | `#F6F3EE` / `#FDF8EE` | Fondo de la app / tarjetas y banda del logo |
| `terra` / `terra-soft` | `#C4523A` / `#F6E2DB` | Modo barbero, AHORA, alertas, itálicas sobre claro |
| `peach` | `#F2B48C` | Itálicas sobre pino, etiquetas destacadas |
| `slate` / `slate-soft` | `#425E78` / `#E1E7EE` | Modo cliente, turnos, solicitados |
| `line` / `muted` | `#DDD7CC` / `#5F6B65` | Bordes finos, texto secundario |

- El color del modo se expone como `--mode` en el contenedor con `data-mode="client|barber"`; los componentes usan `bg-mode`, `text-mode`, `border-mode`.
- `.on-dark` en un contenedor pino cambia la itálica (`.accent`) y los antetítulos (`.eyebrow`) a durazno.

## Tipografía

- **DM Serif Text** (regular e itálica; Google Fonts no tiene semibold ni bold de esta familia) para títulos y números grandes: precios, horarios, fechas.
- **DM Sans** (400, 500, 600, 700) para texto, botones y etiquetas. Es la misma familia DM, así que el regular/semibold/bold del sistema sale de acá.
- Las dos se cargan con `next/font/google`, sin costo.

## Forma

- Botones en pastilla (`rounded-full`) con sombra inferior dura (`shadow-press`, 4 px) que se aplasta al tocar, como "Empezar con Google".
- Tarjetas con radio 16 a 24 px, borde fino `line` y fondo `paper`. La tarjeta protagonista de cada pantalla va en pino.
- Fotos: lugares reservados en `moss`/`sage` con rayado suave mientras no haya fotos reales (componente `Photo`, acepta `src`).
- El poste en movimiento (`.pole-loader`) es el cargador ("Buscando barberos libres…").

## Navegación

| Modo | Estilo | Secciones |
|---|---|---|
| Cliente | Drawer lateral (botón de menú en la barra superior) | Inicio · Buscar · Mis turnos · Perfil |
| Barbero | Pestañas inferiores | Bandeja · Agenda · Clientes · Perfil |

En modo cliente la barra superior fija lleva el menú a la izquierda, el logo al centro (vuelve a Inicio) y las iniciales a la derecha (abre Perfil). El drawer muestra la cuenta arriba y las secciones; se cierra tocando afuera, con Escape o al elegir una sección.

Flujo de entrada: login con Google → Términos (resumen + 18+) → "¿Qué estás buscando?" (nuevo barbero o nuevos clientes, con beneficios) → inicio del modo elegido. El modo se cambia desde Perfil.

## Prototipo (modo demo)

Hoy la app corre entera en modo demo (`components/demo/`, estado en `lib/demo/`): login, datos, turnos, alertas y WhatsApp simulados para recorrer todos los accesos. `npm run demo:build` genera `dist-demo/index.html`, una página única para compartir. Cuando se conecte Firebase, cada pantalla pasa a su ruta real y lee datos de Firestore; los componentes visuales se reutilizan.

## Texto

Voseo, frases cortas, sin signos de exclamación salvo en mensajes de WhatsApp entre personas. Sin emojis en precios, pagos ni textos legales.
