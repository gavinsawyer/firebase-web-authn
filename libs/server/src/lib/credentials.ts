/*
 * Copyright © 2025 Gavin Sawyer. All rights reserved.
 */

import { type WebAuthnUserCredential, type WebAuthnUserCredentialFactor, type WebAuthnUserDocument } from "@firebase-web-authn/types";
import { type App }                                                                                  from "firebase-admin/app";
import { type DocumentReference, type DocumentSnapshot, type Firestore, getFirestore }               from "firebase-admin/firestore";


// noinspection JSUnusedGlobalSymbols
/**
 * @async
 *
 * @param uid - The user's uid.
 * @param app - An optional {@link App} to use with Firestore.
 *
 * @returns
 *  An object of "first" and "second" {@link WebAuthnUserCredential WebAuthnUserCredentials} with either being null if not found.
 */
export const credentials: (
  uid: string,
  app?: App,
) => Promise<{ [key in WebAuthnUserCredentialFactor]: WebAuthnUserCredential | null }> = (
  uid: string,
  app?: App,
): Promise<{ [key in WebAuthnUserCredentialFactor]: WebAuthnUserCredential | null }> => ((firestore: Firestore): Promise<{ [key in WebAuthnUserCredentialFactor]: WebAuthnUserCredential | null }> => (firestore.collection("users").doc(uid) as DocumentReference<WebAuthnUserDocument>).get().then<{ [key in WebAuthnUserCredentialFactor]: WebAuthnUserCredential | null }>(
  (documentSnapshot: DocumentSnapshot<WebAuthnUserDocument>): { [key in WebAuthnUserCredentialFactor]: WebAuthnUserCredential | null } => ({
    first: documentSnapshot.data()?.credentials?.first || null,
    second: documentSnapshot.data()?.credentials?.second || null,
  }),
))(app ? getFirestore(
  app,
  "ext-firebase-web-authn",
) : getFirestore("ext-firebase-web-authn"));
