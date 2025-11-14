/*
 * Copyright © 2025 Gavin Sawyer. All rights reserved.
 */

import { type FunctionResponse, type WebAuthnUserCredentialFactor, type WebAuthnUserDocument } from "@firebase-web-authn/types";
import { generateAuthenticationOptions }                                                       from "@simplewebauthn/server";
import { type PublicKeyCredentialRequestOptionsJSON }                                          from "@simplewebauthn/types";
import { type FirebaseError }                                                                  from "firebase-admin";
import { type DocumentReference, type DocumentSnapshot, FieldValue }                           from "firebase-admin/firestore";


interface CreateReauthenticationChallengeOptions {
  authenticationOptions: {
    attestationType: AttestationConveyancePreference
    rpID: string
    supportedAlgorithmIDs: COSEAlgorithmIdentifier[]
  };
  reauthenticatingCredentialFactor?: WebAuthnUserCredentialFactor;
  webAuthnUserDocumentReference: DocumentReference<WebAuthnUserDocument>;
}

export const createReauthenticationChallenge: (options: CreateReauthenticationChallengeOptions) => Promise<FunctionResponse> = (options: CreateReauthenticationChallengeOptions): Promise<FunctionResponse> => options.webAuthnUserDocumentReference.get().then<FunctionResponse, FunctionResponse>(
  (userDocumentSnapshot: DocumentSnapshot<WebAuthnUserDocument>): Promise<FunctionResponse> => (async (userDocument: WebAuthnUserDocument | undefined): Promise<FunctionResponse> => userDocument ? (options.reauthenticatingCredentialFactor === "second" ? userDocument.credentials?.second : userDocument.credentials?.first) ? generateAuthenticationOptions(
    {
      ...options.authenticationOptions,
      allowCredentials: options.reauthenticatingCredentialFactor ? [
        {
          id:   userDocument.credentials?.[options.reauthenticatingCredentialFactor]?.id || new Uint8Array(),
          type: "public-key",
        },
      ] : userDocument.credentials?.second ? [
        {
          id:   userDocument.credentials.first.id || new Uint8Array(),
          type: "public-key",
        },
        {
          id:   userDocument.credentials.second.id,
          type: "public-key",
        },
      ] : [
        {
          id:   userDocument.credentials?.first.id || new Uint8Array(),
          type: "public-key",
        },
      ],
    },
  ).then<FunctionResponse>(
    (publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptionsJSON): Promise<FunctionResponse> => options.webAuthnUserDocumentReference.set(
      {
        challenge: {
          process:              "reauthentication",
          processingCredential: options.reauthenticatingCredentialFactor || FieldValue.delete(),
          value:                publicKeyCredentialRequestOptions.challenge,
        },
      },
      {
        merge: true,
      },
    ).then<FunctionResponse, FunctionResponse>(
      (): FunctionResponse => ({
        operation:                  "create reauthentication challenge",
        reauthenticatingCredential: options.reauthenticatingCredentialFactor,
        requestOptions:             publicKeyCredentialRequestOptions,
        success:                    true,
      }),
      (firebaseError: FirebaseError): FunctionResponse => ({
        code:      firebaseError.code,
        message:   firebaseError.message,
        operation: "create reauthentication challenge",
        success:   false,
      }),
    ),
  ) : {
    code:      "user-doc-missing-passkey-fields",
    message:   "User doc is missing passkey fields from prior operation.",
    operation: "create reauthentication challenge",
    success:   false,
  } : {
    code:      "missing-user-doc",
    message:   "No user document was found in Firestore.",
    operation: "create reauthentication challenge",
    success:   false,
  })(userDocumentSnapshot.data()),
  (firebaseError: FirebaseError): FunctionResponse => ({
    code:      firebaseError.code,
    message:   firebaseError.message,
    operation: "create reauthentication challenge",
    success:   false,
  }),
);
