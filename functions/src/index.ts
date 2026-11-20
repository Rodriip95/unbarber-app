import { initializeApp } from "firebase-admin/app";
import { setGlobalOptions } from "firebase-functions/v2";

initializeApp();

// Región más cercana a Argentina. Máximo de instancias bajo para no generar costos.
setGlobalOptions({ region: "southamerica-east1", maxInstances: 5 });

export { onUserCreate } from "./auth/onUserCreate.js";
export { completeOnboarding } from "./auth/completeOnboarding.js";
