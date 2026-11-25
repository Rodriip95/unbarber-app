# Modo demo

Prototipo navegable de la app con el diseño V3 "Esquina". **Nada se conecta a Firebase ni a Google**: el login es un selector de cuentas de ejemplo y todos los datos salen de `lib/demo/data.ts`.

| Archivo | Qué tiene |
|---|---|
| `DemoApp.tsx` | Contenedor, navegación por pantallas, panel lateral en escritorio |
| `auth.tsx` | Login con Google simulado, Términos, "¿Qué estás buscando?" |
| `client.tsx` | Inicio, Buscar, Cortarme ahora, alerta de zona, Mis turnos, calificar, Perfil |
| `booking.tsx` | Perfil público del barbero, Sacar turno, pedido enviado |
| `barber.tsx` | Bandeja con "Estoy libre ahora", Agenda, Mis clientes, cargar turno, membresía, calificar cliente |
| `ui.tsx`, `shared.tsx` | Componentes base del sistema V3 |
| `standalone.tsx` | Entrada para `npm run demo:build` (página única en `dist-demo/`) |

El estado vive en `lib/demo/store.tsx` y se guarda en `localStorage` para sobrevivir un refresco. "Reiniciar demo" en Perfil vuelve al login.

Para cambiar las fotos de ejemplo: `Photo` acepta `src`; dejar las imágenes en `public/demo/` y referenciarlas con ruta relativa (`demo/archivo.jpg`) para que funcionen también en la página única.
