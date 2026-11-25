/**
 * Entrada del prototipo autónomo (un solo HTML, sin Next.js) para compartir la demo
 * como página. La arma `npm run demo:build` en dist-demo/. No la usa la app.
 */
import { createRoot } from "react-dom/client";
import { DemoApp } from "./DemoApp";

createRoot(document.getElementById("root")!).render(<DemoApp />);
