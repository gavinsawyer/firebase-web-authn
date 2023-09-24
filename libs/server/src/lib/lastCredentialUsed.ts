import { WebAuthnUserCredentialFactor, WebAuthnUserDocument }           from "@firebase-web-authn/types";
import { App }                                                          from "firebase-admin/app";
import { DocumentReference, DocumentSnapshot, Firestore, getFirestore } from "firebase-admin/firestore";


// noinspection JSUnusedGlobalSymbols
/**
 * @async
 *
 * @param uid - The user's uid.
 * @param app - An optional {@link App} to use with Firestore.
 *
 * @returns
 *  The last credential successfully authenticated given as {@link WebAuthnUserCredentialFactor}.
 */
export const lastCredentialUsed: (uid: string, app?: App) => Promise<WebAuthnUserCredentialFactor | null> = (uid: string, app?: App): Promise<WebAuthnUserCredentialFactor | null> => ((firestore: Firestore): Promise<WebAuthnUserCredentialFactor | null> => (firestore.collection("users").doc(uid) as DocumentReference<WebAuthnUserDocument>).get().then<WebAuthnUserCredentialFactor | null>(
  (documentSnapshot: DocumentSnapshot<WebAuthnUserDocument>): WebAuthnUserCredentialFactor | null => documentSnapshot.data()?.lastCredentialUsed || null,
))(app ? getFirestore(
  app,
  "ext-firebase-web-authn",
) : getFirestore("ext-firebase-web-authn"));
