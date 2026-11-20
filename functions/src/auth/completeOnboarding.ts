import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { promoActive, readMembershipConfig } from "../lib/membershipConfig.js";

type Input = {
  role: "client" | "barber";
  phone: string; // E.164 ya normalizado en el cliente; se revalida acá
  termsVersion: string;
  adult: boolean;
  utm?: Record<string, string>;
};

const AR_MOBILE = /^\+549\d{10}$/;

/**
 * Valida y guarda rol, WhatsApp, Términos y mayoría de edad (spec 02, T-020).
 * Crea clientPublic o barbers/{uid} en estado draft.
 */
export const completeOnboarding = onCall<Input>({ enforceAppCheck: false }, async (req) => {
  const uid = req.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Tenés que entrar con Google.");
  const { role, phone, termsVersion, adult, utm } = req.data ?? ({} as Input);

  if (role !== "client" && role !== "barber") throw new HttpsError("invalid-argument", "Rol inválido.");
  if (!AR_MOBILE.test(phone ?? "")) throw new HttpsError("invalid-argument", "Revisá el número de WhatsApp.");
  if (adult !== true) throw new HttpsError("failed-precondition", "Tenés que ser mayor de 18 años.");

  const db = getFirestore();
  const config = (await db.doc("config/public").get()).data() ?? {};
  if (config.termsVersion && termsVersion !== config.termsVersion) {
    throw new HttpsError("failed-precondition", "Aceptá la versión vigente de los Términos.");
  }

  const userRef = db.doc(`users/${uid}`);
  const user = (await userRef.get()).data() ?? {};
  const now = FieldValue.serverTimestamp();

  const batch = db.batch();
  batch.set(
    userRef,
    {
      roles: FieldValue.arrayUnion(role),
      activeMode: role,
      phone,
      terms: { version: termsVersion, acceptedAt: now },
      adultDeclaredAt: now,
      ...(utm ? { attribution: utm } : {}),
    },
    { merge: true },
  );
  if (role === "client") {
    batch.set(
      db.doc(`clientPublic/${uid}`),
      { displayName: user.displayName ?? "", photoURL: user.photoURL ?? null, rating: { avg: null, count: 0 } },
      { merge: true },
    );
  } else {
    // Decisión de Rodri: la promo vale para quien se registra mientras está vigente y la
    // conserva aunque después se apague en Remote Config. Se congela al registrarse.
    const cfg = await readMembershipConfig();
    const lockedPromo = promoActive(cfg) ? cfg.promoPercent : 0;
    const existing = (await db.doc(`barbers/${uid}`).get()).data();
    const alreadyLocked = existing?.membership?.promoLockedAt != null;
    batch.set(
      db.doc(`barbers/${uid}`),
      {
        name: user.displayName ?? "",
        phone,
        verification: { status: "draft" },
        ...(alreadyLocked
          ? {}
          : { membership: { state: "none", priceArs: cfg.priceArs, promoPercent: lockedPromo, promoLockedAt: now } }),
        visible: false,
        alertsWhenInactive: true,
        availableNow: { on: false },
        createdAt: now,
      },
      { merge: true },
    );
  }
  await batch.commit();
  return { ok: true };
});
