/*
 * Copyright © 2025 Gavin Sawyer. All rights reserved.
 */

import { type WebAuthnUserDocument }                                                   from "@firebase-web-authn/types";
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
 *  The {@link WebAuthnUserDocument} associated with the user.
 */
export const webAuthnUserDocument: (
  uid: string,
  app?: App,
) => Promise<WebAuthnUserDocument | null> = (
  uid: string,
  app?: App,
): Promise<WebAuthnUserDocument | null> => ((firestore: Firestore): Promise<WebAuthnUserDocument | null> => (firestore.collection("users").doc(uid) as DocumentReference<WebAuthnUserDocument>).get().then<WebAuthnUserDocument | null>(
  (documentSnapshot: DocumentSnapshot<WebAuthnUserDocument>): WebAuthnUserDocument | null => ((userDocument?: WebAuthnUserDocument): WebAuthnUserDocument | null => userDocument ? ({
    ...userDocument,
    challenge: undefined,
  }) : null)(documentSnapshot.data()),
))(app ? getFirestore(
  app,
  "ext-firebase-web-authn",
) : getFirestore("ext-firebase-web-authn"));
