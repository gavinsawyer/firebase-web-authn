/*
 * Copyright © 2025 Gavin Sawyer. All rights reserved.
 */

import { type WebAuthnUserDocument }                                                                   from "@firebase-web-authn/types";
import { type App }                                                                                    from "firebase-admin/app";
import { type DocumentReference, type DocumentSnapshot, type Firestore, getFirestore, type Timestamp } from "firebase-admin/firestore";


// noinspection JSUnusedGlobalSymbols
/**
 * @async
 *
 * @param uid - The user's uid.
 * @param app - An optional {@link App} to use with Firestore.
 *
 * @returns
 *  A {@link Timestamp} for when the user was last present or null if no passkey was found.
 */
export const lastPresent: (
  uid: string,
  app?: App,
) => Promise<Timestamp | null> = (
  uid: string,
  app?: App,
): Promise<Timestamp | null> => ((firestore: Firestore): Promise<Timestamp | null> => (firestore.collection("users").doc(uid) as DocumentReference<WebAuthnUserDocument>).get().then<Timestamp | null>(
  (documentSnapshot: DocumentSnapshot<WebAuthnUserDocument>): Timestamp | null => documentSnapshot.data()?.lastPresent || null,
))(
  app ? getFirestore(
    app,
    "ext-firebase-web-authn",
  ) : getFirestore("ext-firebase-web-authn"),
);
