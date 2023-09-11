import { WebAuthnUserCredential, WebAuthnUserDocument }                 from "@firebase-web-authn/types";
import { App }                                                          from "firebase-admin/app";
import { DocumentReference, DocumentSnapshot, Firestore, getFirestore } from "firebase-admin/firestore";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { credentials }                                                  from "../";


// noinspection JSUnusedGlobalSymbols
/**
 * @async
 *
 * @deprecated Please use {@link credentials} instead for an object of "primary" and "backup" credentials with either being null if not found.
 *
 * @param uid - The user's uid.
 * @param app - An optional {@link App} to use with Firestore.
 *
 * @returns
 *  A {@link WebAuthnUserCredential} or null if no passkey was found.
 */
export const credential: (uid: string, app?: App) => Promise<WebAuthnUserCredential | null> = (uid: string, app?: App): Promise<WebAuthnUserCredential | null> => ((firestore: Firestore): Promise<WebAuthnUserCredential | null> => (firestore.collection("users").doc(uid) as DocumentReference<WebAuthnUserDocument>).get().then<WebAuthnUserCredential | null>(
  (documentSnapshot: DocumentSnapshot<WebAuthnUserDocument>): WebAuthnUserCredential | null => documentSnapshot.data()?.credential || null,
))(app ? getFirestore(
  app,
  "ext-firebase-web-authn",
) : getFirestore("ext-firebase-web-authn"));
