import { WebAuthnUserDocument }                                         from "@firebase-web-authn/types";
import { App }                                                          from "firebase-admin/app";
import { DocumentReference, DocumentSnapshot, Firestore, getFirestore } from "firebase-admin/firestore";


/**
 * @param uid - The user's uid.
 * @param app - An optional {@link App} to use with Firestore.
 *
 * @returns A {@link Promise} which resolves with either a boolean for whether the user's passkey is eligible to be backed up or null if no passkey was found.
 */
export const backupEligible: (uid: string, app?: App) => Promise<boolean | null> = (uid: string, app?: App): Promise<boolean | null> => ((firestore: Firestore): Promise<boolean | null> => (firestore.collection("users").doc(uid) as DocumentReference<WebAuthnUserDocument>).get().then(
  (documentSnapshot: DocumentSnapshot<WebAuthnUserDocument>): boolean | null => documentSnapshot.data()?.credential?.backupEligible || null,
))(app ? getFirestore(app) : getFirestore());
