import { WebAuthnUserCredential, WebAuthnUserCredentialType, WebAuthnUserDocument } from "@firebase-web-authn/types";
import { App }                                                                      from "firebase-admin/app";
import { DocumentReference, DocumentSnapshot, Firestore, getFirestore }             from "firebase-admin/firestore";


// noinspection JSUnusedGlobalSymbols
/**
 * @async
 *
 * @param uid - The user's uid.
 * @param app - An optional {@link App} to use with Firestore.
 *
 * @returns
 *  An object of "primary" and "backup" {@link WebAuthnUserCredential WebAuthnUserCredentials} with either being null if not found.
 */
export const credentials: (uid: string, app?: App) => Promise<{ [key in WebAuthnUserCredentialType]: WebAuthnUserCredential | null }> = (uid: string, app?: App): Promise<{ [key in WebAuthnUserCredentialType]: WebAuthnUserCredential | null }> => ((firestore: Firestore): Promise<{ [key in WebAuthnUserCredentialType]: WebAuthnUserCredential | null }> => (firestore.collection("users").doc(uid) as DocumentReference<WebAuthnUserDocument>).get().then<{ [key in WebAuthnUserCredentialType]: WebAuthnUserCredential | null }>(
  (documentSnapshot: DocumentSnapshot<WebAuthnUserDocument>): { [key in WebAuthnUserCredentialType]: WebAuthnUserCredential | null } => ({
    backup:  documentSnapshot.data()?.backupCredential || null,
    primary: documentSnapshot.data()?.credential || null,
  }),
))(app ? getFirestore(
  app,
  "ext-firebase-web-authn",
) : getFirestore("ext-firebase-web-authn"));
