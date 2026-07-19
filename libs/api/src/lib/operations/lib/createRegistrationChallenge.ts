/*
 * Copyright © 2026 Gavin William Sawyer. All rights reserved.
 */

import { type FunctionResponse, type WebAuthnUserCredentialFactor, type WebAuthnUserDocument } from "@firebase-web-authn/types";
import { generateRegistrationOptions, type PublicKeyCredentialCreationOptionsJSON }            from "@simplewebauthn/server";
import { isoBase64URL, isoUint8Array }                                                         from "@simplewebauthn/server/helpers";
import { type FirebaseError }                                                                  from "firebase-admin";
import { type DocumentReference, type DocumentSnapshot }                                       from "firebase-admin/firestore";


interface CreateRegistrationChallengeOptions {
  registeringCredentialFactor: WebAuthnUserCredentialFactor;
  registrationOptions: {
    attestationConveyancePreference: AttestationConveyancePreference;
    authenticatorSelection: AuthenticatorSelectionCriteria;
    rpID: string;
    rpName: string;
    supportedAlgorithmIDs: COSEAlgorithmIdentifier[];
    userId: string;
    userName: string;
  };
  webAuthnUserDocumentReference: DocumentReference<WebAuthnUserDocument>;
}

export const createRegistrationChallenge: (options: CreateRegistrationChallengeOptions) => Promise<FunctionResponse> = (options: CreateRegistrationChallengeOptions): Promise<FunctionResponse> => options.webAuthnUserDocumentReference.get().then<FunctionResponse, FunctionResponse>(
  (userDocumentSnapshot: DocumentSnapshot<WebAuthnUserDocument>): Promise<FunctionResponse> => (async (userDocument: WebAuthnUserDocument | undefined): Promise<FunctionResponse> => (options.registeringCredentialFactor === "second" ? !userDocument?.credentials?.second : !userDocument?.credentials?.first) ? (options.registeringCredentialFactor !== "second" || userDocument && userDocument.credentials?.first) ? generateRegistrationOptions(
    {
      ...options.registrationOptions,
      attestationType:    options.registrationOptions.attestationConveyancePreference !== "indirect" ? options.registrationOptions.attestationConveyancePreference : "none",
      excludeCredentials: options.registeringCredentialFactor === "second" ? [ { id: isoBase64URL.fromBuffer(userDocument?.credentials?.first.id || new Uint8Array()) } ] : undefined,
      userID:             isoUint8Array.fromUTF8String(options.registrationOptions.userId),
    },
  ).then<FunctionResponse>(
    (publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptionsJSON): Promise<FunctionResponse> => options.webAuthnUserDocumentReference.set(
      {
        challenge: {
          process:              "registration",
          processingCredential: options.registeringCredentialFactor,
          value:                publicKeyCredentialCreationOptions.challenge,
        },
      },
      { merge: true },
    ).then<FunctionResponse, FunctionResponse>(
      (): FunctionResponse => ({
        creationOptions:       publicKeyCredentialCreationOptions,
        operation:             "create registration challenge",
        registeringCredential: options.registeringCredentialFactor,
        success:               true,
      }),
      (firebaseError: FirebaseError): FunctionResponse => ({
        code:      firebaseError.code,
        message:   firebaseError.message,
        operation: "create registration challenge",
        success:   false,
      }),
    ),
  ) : {
    code:      "missing-primary",
    message:   "No primary passkey was found in Firestore.",
    operation: "create registration challenge",
    success:   false,
  } : {
    code:      "no-op",
    message:   "No operation is needed.",
    operation: "create registration challenge",
    success:   false,
  })(userDocumentSnapshot.data()),
  (firebaseError: FirebaseError): FunctionResponse => ({
    code:      firebaseError.code,
    message:   firebaseError.message,
    operation: "create registration challenge",
    success:   false,
  }),
);
