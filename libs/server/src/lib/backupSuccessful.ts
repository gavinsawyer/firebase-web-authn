import { WebAuthnUserDocument }                                         from "@firebase-web-authn/types";
import { App }                                                          from "firebase-admin/app";
import { DocumentReference, DocumentSnapshot, Firestore, getFirestore } from "firebase-admin/firestore";


// noinspection JSUnusedGlobalSymbols
/**
 * @param uid - The user's uid.
 * @param app - An optional {@link App} to use with Firestore.
 *
 * @returns A {@link Promise} which resolves with either a boolean for whether the user's passkey is backed up successfully or null if no passkey was found.
 */
export const backupSuccessful: (uid: string, app?: App) => Promise<boolean | null> = (uid: string, app?: App): Promise<boolean | null> => ((firestore: Firestore): Promise<boolean | null> => (firestore.collection("users").doc(uid) as DocumentReference<WebAuthnUserDocument>).get().then(
  (documentSnapshot: DocumentSnapshot<WebAuthnUserDocument>): boolean | null => documentSnapshot.data()?.credential?.backupSuccessful || null,
))(app ? getFirestore(
  app,
  "ext-firebase-web-authn",
) : getFirestore("ext-firebase-web-authn"));
