#!/usr/bin/env node
/**
 * Genera .env.production.local con la config web de Firebase del ambiente.
 * Uso en CI:  npx firebase-tools apps:sdkconfig WEB --project desa --json | node scripts/write-env.mjs
 * Uso local: npm run env:desa  (escribe .env.local apuntando a unbarber-desa)
 * El primer argumento opcional es el archivo de salida (por defecto .env.production.local).
 * Así ningún valor real vive en el repo: se lee del proyecto al momento del build.
 * Variables opcionales del ambiente: FIREBASE_VAPID_KEY, SENTRY_DSN.
 */
import { readFileSync, writeFileSync } from "node:fs";

const raw = readFileSync(0, "utf8");
const json = JSON.parse(raw.slice(raw.indexOf("{")));
const cfg = json.result?.sdkConfig ?? json.result ?? json;
if (!cfg?.projectId || !cfg?.apiKey) {
  console.error("No se pudo leer la config web. ¿El proyecto tiene una app Web registrada?");
  process.exit(1);
}

const lines = {
  NEXT_PUBLIC_FIREBASE_API_KEY: cfg.apiKey,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: cfg.authDomain,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: cfg.projectId,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: cfg.storageBucket,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: cfg.messagingSenderId,
  NEXT_PUBLIC_FIREBASE_APP_ID: cfg.appId,
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: cfg.measurementId ?? "",
  NEXT_PUBLIC_FIREBASE_VAPID_KEY: process.env.FIREBASE_VAPID_KEY ?? "",
  NEXT_PUBLIC_SENTRY_DSN: process.env.SENTRY_DSN ?? "",
  NEXT_PUBLIC_APP_ENV: process.env.APP_ENV ?? "",
  NEXT_PUBLIC_USE_EMULATORS: "false",
};
const out = process.argv[2] ?? ".env.production.local";
writeFileSync(
  out,
  Object.entries(lines).map(([k, v]) => `${k}=${v ?? ""}`).join("\n") + "\n",
);
console.log(`${out} listo para ${cfg.projectId}`);
