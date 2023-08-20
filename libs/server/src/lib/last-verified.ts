import { WebAuthnUserDocument }                                                    from "@firebase-web-authn/types";
import { App }                                                                     from "firebase-admin/app";
import { DocumentReference, DocumentSnapshot, Firestore, getFirestore, Timestamp } from "firebase-admin/firestore";


/**
 * @param uid - The user's uid.
 * @param app - An optional {@link App} to use with Firestore.
 *
 * @returns A {@link Timestamp} for when the user was last verified or null if no passkey was found.
 */
export const lastVerified: (uid: string, app?: App) => Promise<Timestamp | null> = (uid: string, app?: App): Promise<Timestamp | null> => ((firestore: Firestore): Promise<Timestamp | null> => (firestore.collection("users").doc(uid) as DocumentReference<WebAuthnUserDocument>).get().then(
  (documentSnapshot: DocumentSnapshot<WebAuthnUserDocument>): Timestamp | null => documentSnapshot.data()?.lastVerified || null,
))(app ? getFirestore(
  app,
  "firebase-web-authn",
) : getFirestore("firebase-web-authn"));
