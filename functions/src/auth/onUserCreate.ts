import { getFirestore, FieldValue } from "firebase-admin/firestore";
import * as functionsV1 from "firebase-functions/v1";

/** Crea el documento base del usuario al entrar con Google por primera vez. */
export const onUserCreate = functionsV1
  .region("southamerica-east1")
  .auth.user()
  .onCreate(async (user) => {
    await getFirestore().doc(`users/${user.uid}`).set(
      {
        displayName: user.displayName ?? "",
        photoURL: user.photoURL ?? null,
        email: user.email ?? null,
        roles: [],
        activeMode: "client",
        phone: null,
        phoneVerified: false,
        createdAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  });
