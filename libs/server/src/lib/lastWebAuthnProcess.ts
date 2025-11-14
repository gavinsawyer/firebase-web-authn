/*
 * Copyright © 2025 Gavin Sawyer. All rights reserved.
 */

import { type WebAuthnProcess, type WebAuthnUserDocument }                             from "@firebase-web-authn/types";
import { type App }                                                                    from "firebase-admin/app";
import { type DocumentReference, type DocumentSnapshot, type Firestore, getFirestore } from "firebase-admin/firestore";


// noinspection JSUnusedGlobalSymbols
/**
 * @async
 *
 * @param uid - The user's uid.
 * @param app - An optional {@link App} to use with Firestore.
 *
 * @returns
 *  The last {@link WebAuthnProcess} successfully completed by the user.
 */
export const lastWebAuthnProcess: (
  uid: string,
  app?: App,
) => Promise<WebAuthnProcess | null> = (
  uid: string,
  app?: App,
): Promise<WebAuthnProcess | null> => ((firestore: Firestore): Promise<WebAuthnProcess | null> => (firestore.collection("users").doc(uid) as DocumentReference<WebAuthnUserDocument>).get().then<WebAuthnProcess | null>(
  (documentSnapshot: DocumentSnapshot<WebAuthnUserDocument>): WebAuthnProcess | null => documentSnapshot.data()?.lastWebAuthnProcess || null,
))(app ? getFirestore(
  app,
  "ext-firebase-web-authn",
) : getFirestore("ext-firebase-web-authn"));
