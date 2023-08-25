import { WebAuthnUserCredential, WebAuthnUserDocument }                 from "@firebase-web-authn/types";
import { App }                                                          from "firebase-admin/app";
import { DocumentReference, DocumentSnapshot, Firestore, getFirestore } from "firebase-admin/firestore";


/**
 * @param uid - The user's uid.
 * @param app - An optional {@link App} to use with Firestore.
 *
 * @returns A {@link Promise} which resolves with either a WebAuthnUserCredential object or null if no passkey was found.
 */
export const credential: (uid: string, app?: App) => Promise<WebAuthnUserCredential | null> = (uid: string, app?: App): Promise<WebAuthnUserCredential | null> => ((firestore: Firestore): Promise<WebAuthnUserCredential | null> => (firestore.collection("users").doc(uid) as DocumentReference<WebAuthnUserDocument>).get().then(
  (documentSnapshot: DocumentSnapshot<WebAuthnUserDocument>): WebAuthnUserCredential | null => documentSnapshot.data()?.credential || null,
))(app ? getFirestore(app) : getFirestore());
