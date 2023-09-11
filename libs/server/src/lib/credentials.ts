import { WebAuthnUserCredential, WebAuthnUserDocument }                 from "@firebase-web-authn/types";
import { App }                                                          from "firebase-admin/app";
import { DocumentReference, DocumentSnapshot, Firestore, getFirestore } from "firebase-admin/firestore";


// noinspection JSUnusedGlobalSymbols
/**
 * @param uid - The user's uid.
 * @param app - An optional {@link App} to use with Firestore.
 *
 * @returns
 *  A {@link WebAuthnUserCredential} or null if no passkey was found.
 */
export const credentials: (uid: string, app?: App) => Promise<{ [key in WebAuthnUserCredential["type"]]: WebAuthnUserCredential | null }> = (uid: string, app?: App): Promise<{ [key in WebAuthnUserCredential["type"]]: WebAuthnUserCredential | null }> => ((firestore: Firestore): Promise<{ [key in WebAuthnUserCredential["type"]]: WebAuthnUserCredential | null }> => (firestore.collection("users").doc(uid) as DocumentReference<WebAuthnUserDocument>).get().then(
  (documentSnapshot: DocumentSnapshot<WebAuthnUserDocument>): { [key in WebAuthnUserCredential["type"]]: WebAuthnUserCredential | null } => ({
    backup:  documentSnapshot.data()?.backupCredential || null,
    primary: documentSnapshot.data()?.credential || null,
  }),
))(app ? getFirestore(
  app,
  "ext-firebase-web-authn",
) : getFirestore("ext-firebase-web-authn"));
