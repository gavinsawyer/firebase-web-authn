/*
 * Copyright © 2026 Gavin William Sawyer. All rights reserved.
 */

import { type FunctionResponse, type WebAuthnUserCredentialFactor, type WebAuthnUserDocument } from "@firebase-web-authn/types";
import { generateAuthenticationOptions, type PublicKeyCredentialRequestOptionsJSON }           from "@simplewebauthn/server";
import { type FirebaseError }                                                                  from "firebase-admin";
import { type DocumentReference, FieldValue }                                                  from "firebase-admin/firestore";


interface CreateAuthenticationChallengeOptions {
  authenticatingCredential?: WebAuthnUserCredentialFactor;
  authenticationOptions: {
    attestationType: AttestationConveyancePreference;
    rpID: string;
    supportedAlgorithmIDs: COSEAlgorithmIdentifier[];
  };
  webAuthnUserDocumentReference: DocumentReference<WebAuthnUserDocument>;
}

export const createAuthenticationChallenge: (options: CreateAuthenticationChallengeOptions) => Promise<FunctionResponse> = (options: CreateAuthenticationChallengeOptions): Promise<FunctionResponse> => generateAuthenticationOptions(options.authenticationOptions).then<FunctionResponse>(
  (publicKeyCredentialRequestOptionsJSON: PublicKeyCredentialRequestOptionsJSON): Promise<FunctionResponse> => options.webAuthnUserDocumentReference.set(
    {
      challenge: {
        process:              "authentication",
        processingCredential: options.authenticatingCredential || FieldValue.delete(),
        value:                publicKeyCredentialRequestOptionsJSON.challenge,
      },
    },
    { merge: true },
  ).then<FunctionResponse, FunctionResponse>(
    (): FunctionResponse => ({
      authenticatingCredential: options.authenticatingCredential,
      operation:                "create authentication challenge",
      requestOptions:           publicKeyCredentialRequestOptionsJSON,
      success:                  true,
    }),
    (firebaseError: FirebaseError): FunctionResponse => ({
      code:      firebaseError.code,
      message:   firebaseError.message,
      operation: "create authentication challenge",
      success:   false,
    }),
  ),
);
