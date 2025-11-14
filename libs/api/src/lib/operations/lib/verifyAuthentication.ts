/*
 * Copyright © 2025 Gavin Sawyer. All rights reserved.
 */

import { type FunctionResponse, type WebAuthnUserDocument }                     from "@firebase-web-authn/types";
import { type VerifiedAuthenticationResponse, verifyAuthenticationResponse }    from "@simplewebauthn/server";
import { type AuthenticationResponseJSON }                                      from "@simplewebauthn/types";
import { type FirebaseError }                                                   from "firebase-admin";
import { type DocumentReference, type DocumentSnapshot, FieldValue, Timestamp } from "firebase-admin/firestore";


interface VerifyAuthenticationOptions {
  authenticationOptions: {
    expectedOrigin: string
    expectedRPID: string
    requireUserVerification: boolean
    response: AuthenticationResponseJSON
  };
  authenticatorAttachment?: AuthenticatorAttachment;
  authenticatorAttachment2FA?: AuthenticatorAttachment;
  createCustomToken: (uid: string) => Promise<string>;
  userID: string;
  userVerificationRequirement?: UserVerificationRequirement;
  webAuthnUserDocumentReference: DocumentReference<WebAuthnUserDocument>;
  webAuthnUserDocumentReferenceTarget: DocumentReference<WebAuthnUserDocument>;
}

export const verifyAuthentication: (options: VerifyAuthenticationOptions) => Promise<FunctionResponse> = (options: VerifyAuthenticationOptions): Promise<FunctionResponse> => options.authenticationOptions.response.response.userHandle !== options.userID ? options.webAuthnUserDocumentReferenceTarget.get().then<FunctionResponse, FunctionResponse>(
  (userDocumentSnapshotTarget: DocumentSnapshot<WebAuthnUserDocument>): Promise<FunctionResponse> => (async (userDocumentTarget: WebAuthnUserDocument | undefined): Promise<FunctionResponse> => userDocumentTarget ? options.webAuthnUserDocumentReference.get().then<FunctionResponse, FunctionResponse>(
    (userDocumentSnapshot: DocumentSnapshot<WebAuthnUserDocument>): Promise<FunctionResponse> => (async (userDocument: WebAuthnUserDocument | undefined): Promise<FunctionResponse> => userDocument ? userDocument.challenge && userDocument.challenge.process === "authentication" ? userDocumentTarget.credentials?.[userDocument.challenge?.processingCredential || "first"] ? verifyAuthenticationResponse(
      {
        ...options.authenticationOptions,
        authenticator:           {
          counter:             userDocumentTarget.credentials[userDocument.challenge.processingCredential || "first"]?.counter || 0,
          credentialID:        userDocumentTarget.credentials[userDocument.challenge.processingCredential || "first"]?.id || new Uint8Array(),
          credentialPublicKey: userDocumentTarget.credentials[userDocument.challenge.processingCredential || "first"]?.publicKey || new Uint8Array(),
        },
        expectedChallenge:       userDocument.challenge.value,
        requireUserVerification: (userDocument.challenge.processingCredential === "second" && options.authenticatorAttachment2FA || options.authenticatorAttachment) === "platform" && options.userVerificationRequirement !== "discouraged",
      },
    ).then<FunctionResponse>(
      (verifiedAuthenticationResponse: VerifiedAuthenticationResponse): Promise<FunctionResponse> => (userDocument.lastPresent ? options.webAuthnUserDocumentReference.update(
        {
          challenge: FieldValue.delete(),
        },
      ) : options.webAuthnUserDocumentReference.delete()).then<FunctionResponse, FunctionResponse>(
        (): Promise<FunctionResponse> => verifiedAuthenticationResponse.verified ? options.createCustomToken(options.authenticationOptions.response.response.userHandle || "").then<FunctionResponse, FunctionResponse>(
          (customToken: string): Promise<FunctionResponse> => options.webAuthnUserDocumentReferenceTarget.update(
            {
              challenge:                                                                                                FieldValue.delete(),
              [userDocument.challenge?.processingCredential === "second" ? "credentials.second" : "credentials.first"]: {
                ...userDocumentTarget.credentials?.[userDocument.challenge?.processingCredential || "first"],
                authenticatorAttachment: verifiedAuthenticationResponse.authenticationInfo.credentialDeviceType === "multiDevice" ? "platform" : "cross-platform",
                backedUp:                verifiedAuthenticationResponse.authenticationInfo.credentialBackedUp,
              },
              lastCredentialUsed:                                                                                       "first",
              lastPresent:                                                                                              Timestamp.fromDate(new Date()),
              lastVerified:                                                                                             verifiedAuthenticationResponse.authenticationInfo.userVerified ? Timestamp.fromDate(new Date()) : userDocumentTarget.lastVerified || FieldValue.delete(),
              lastWebAuthnProcess:                                                                                      "authentication",
            },
          ).then<FunctionResponse, FunctionResponse>(
            (): FunctionResponse => ({
              authenticatedCredential: userDocument.challenge?.processingCredential || "first",
              customToken:             customToken,
              operation:               "verify authentication",
              success:                 true,
            }),
            (firebaseError: FirebaseError): FunctionResponse => ({
              code:      firebaseError.code,
              message:   firebaseError.message,
              operation: "verify authentication",
              success:   false,
            }),
          ),
          (firebaseError: FirebaseError): FunctionResponse => ({
            code:      firebaseError.code,
            message:   firebaseError.message,
            operation: "verify authentication",
            success:   false,
          }),
        ) : userDocument.challenge?.processingCredential === undefined && userDocumentTarget.credentials?.second ? verifyAuthenticationResponse(
          {
            ...options.authenticationOptions,
            authenticator:     {
              counter:             userDocumentTarget.credentials.second.counter,
              credentialID:        userDocumentTarget.credentials.second.id,
              credentialPublicKey: userDocumentTarget.credentials.second.publicKey,
            },
            expectedChallenge: userDocument.challenge?.value || "",
          },
        ).then<FunctionResponse>(
          (backupVerifiedAuthenticationResponse: VerifiedAuthenticationResponse): Promise<FunctionResponse> => backupVerifiedAuthenticationResponse.verified ? options.createCustomToken(options.authenticationOptions.response.response.userHandle || "").then<FunctionResponse, FunctionResponse>(
            (customToken: string): Promise<FunctionResponse> => options.webAuthnUserDocumentReferenceTarget.update(
              {
                challenge:            FieldValue.delete(),
                "credentials.second": {
                  ...userDocumentTarget.credentials?.second,
                  authenticatorAttachment: backupVerifiedAuthenticationResponse.authenticationInfo.credentialDeviceType === "multiDevice" ? "platform" : "cross-platform",
                  backedUp:                backupVerifiedAuthenticationResponse.authenticationInfo.credentialBackedUp,
                },
                lastCredentialUsed:   "second",
                lastPresent:          Timestamp.fromDate(new Date()),
                lastVerified:         backupVerifiedAuthenticationResponse.authenticationInfo.userVerified ? Timestamp.fromDate(new Date()) : userDocumentTarget.lastVerified || FieldValue.delete(),
                lastWebAuthnProcess:  "authentication",
              },
            ).then<FunctionResponse, FunctionResponse>(
              (): FunctionResponse => ({
                authenticatedCredential: "second",
                customToken:             customToken,
                operation:               "verify authentication",
                success:                 true,
              }),
              (firebaseError: FirebaseError): FunctionResponse => ({
                code:      firebaseError.code,
                message:   firebaseError.message,
                operation: "verify authentication",
                success:   false,
              }),
            ),
            (firebaseError: FirebaseError): FunctionResponse => ({
              code:      firebaseError.code,
              message:   firebaseError.message,
              operation: "verify authentication",
              success:   false,
            }),
          ) : (userDocument.credentials ? options.webAuthnUserDocumentReference.update(
            {
              challenge: FieldValue.delete(),
            },
          ) : options.webAuthnUserDocumentReference.delete()).then<FunctionResponse, FunctionResponse>(
            (): FunctionResponse => ({
              code:      "not-verified",
              message:   "User not verified.",
              operation: "verify authentication",
              success:   false,
            }),
            (firebaseError: FirebaseError): FunctionResponse => ({
              code:      firebaseError.code,
              message:   firebaseError.message,
              operation: "verify authentication",
              success:   false,
            }),
          ),
        ) : (userDocument.credentials ? options.webAuthnUserDocumentReference.update(
          {
            challenge: FieldValue.delete(),
          },
        ) : options.webAuthnUserDocumentReference.delete()).then<FunctionResponse, FunctionResponse>(
          (): FunctionResponse => ({
            code:      "not-verified",
            message:   "User not verified.",
            operation: "verify authentication",
            success:   false,
          }),
          (firebaseError: FirebaseError): FunctionResponse => ({
            code:      firebaseError.code,
            message:   firebaseError.message,
            operation: "verify authentication",
            success:   false,
          }),
        ),
        (firebaseError: FirebaseError): FunctionResponse => ({
          code:      firebaseError.code,
          message:   firebaseError.message,
          operation: "verify authentication",
          success:   false,
        }),
      ),
    ) : options.webAuthnUserDocumentReference.update(
      {
        challenge: FieldValue.delete(),
      },
    ).then<FunctionResponse, FunctionResponse>(
      (): FunctionResponse => ({
        code:      "user-doc-missing-passkey-fields",
        message:   "User doc is missing passkey fields from prior operation.",
        operation: "verify authentication",
        success:   false,
      }),
      (firebaseError: FirebaseError): FunctionResponse => ({
        code:      firebaseError.code,
        message:   firebaseError.message,
        operation: "verify authentication",
        success:   false,
      }),
    ) : userDocument.credentials ? {
      code:      "user-doc-missing-challenge-field",
      message:   "User doc is missing challenge field from prior operation.",
      operation: "verify authentication",
      success:   false,
    } : options.webAuthnUserDocumentReference.delete().then<FunctionResponse, FunctionResponse>(
      (): FunctionResponse => ({
        code:      "user-doc-missing-challenge-field",
        message:   "User doc is missing challenge field from prior operation.",
        operation: "verify authentication",
        success:   false,
      }),
      (firebaseError: FirebaseError): FunctionResponse => ({
        code:      firebaseError.code,
        message:   firebaseError.message,
        operation: "verify authentication",
        success:   false,
      }),
    ) : {
      code:      "missing-user-doc",
      message:   "No user document was found in Firestore.",
      operation: "verify authentication",
      success:   false,
    })(userDocumentSnapshot.data()),
    (firebaseError: FirebaseError): FunctionResponse => ({
      code:      firebaseError.code,
      message:   firebaseError.message,
      operation: "verify authentication",
      success:   false,
    }),
  ) : {
    code:      "missing-user-doc",
    message:   "No user document was found in Firestore.",
    operation: "verify authentication",
    success:   false,
  })(userDocumentSnapshotTarget.data()),
  (firebaseError: FirebaseError): FunctionResponse => ({
    code:      firebaseError.code,
    message:   firebaseError.message,
    operation: "verify authentication",
    success:   false,
  }),
) : options.webAuthnUserDocumentReference.update(
  {
    challenge: FieldValue.delete(),
  },
).then<FunctionResponse, FunctionResponse>(
  (): FunctionResponse => ({
    code:      "no-op",
    message:   "No operation is needed.",
    operation: "verify authentication",
    success:   false,
  }),
  (firebaseError: FirebaseError): FunctionResponse => ({
    code:      firebaseError.code,
    message:   firebaseError.message,
    operation: "verify authentication",
    success:   false,
  }),
);
