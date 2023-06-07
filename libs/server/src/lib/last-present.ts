import { WebAuthnUserDocument }                                                    from "@firebase-web-authn/types";
import { App }                                                                     from "firebase-admin/app";
import { DocumentReference, DocumentSnapshot, Firestore, getFirestore, Timestamp } from "firebase-admin/firestore";


/**
 * @param uid - The user's uid.
 * @param app - An optional {@link App} to use with Firestore.
 *
 * @returns A {@link Promise} which resolves with either a {@link Timestamp} for when the user was last present or null if no passkey was found.
 */
export const lastPresent: (uid: string, app?: App) => Promise<Timestamp | null> = (uid: string, app?: App): Promise<Timestamp | null> => ((firestore: Firestore): Promise<Timestamp | null> => (firestore.collection("webAuthnUsers").doc(uid) as DocumentReference<WebAuthnUserDocument>).get().then((documentSnapshot: DocumentSnapshot<WebAuthnUserDocument>): Timestamp | null => documentSnapshot.data()?.lastPresent || null))(app ? getFirestore(app) : getFirestore());
