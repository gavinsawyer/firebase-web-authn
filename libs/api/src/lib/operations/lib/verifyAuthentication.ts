/*
 * Copyright © 2026 Gavin William Sawyer. All rights reserved.
 */

import { type FunctionResponse, type WebAuthnUserDocument }                                                   from "@firebase-web-authn/types";
import { type AuthenticationResponseJSON, type VerifiedAuthenticationResponse, verifyAuthenticationResponse } from "@simplewebauthn/server";
import { isoBase64URL }                                                                                       from "@simplewebauthn/server/helpers";
import { type FirebaseError }                                                                                 from "firebase-admin";
import { type DocumentReference, type DocumentSnapshot, FieldValue, Timestamp }                               from "firebase-admin/firestore";


interface VerifyAuthenticationOptions {
  authenticationOptions: {
    expectedOrigin: string;
    expectedRPID: string;
    requireUserVerification: boolean;
    response: AuthenticationResponseJSON;
  };
  authenticatorAttachment?: AuthenticatorAttachment;
  authenticatorAttachment2FA?: AuthenticatorAttachment;
  createCustomToken: (uid: string) => Promise<string>;
  userId: string;
  userVerificationRequirement?: UserVerificationRequirement;
  webAuthnUserDocumentReference: DocumentReference<WebAuthnUserDocument>;
  webAuthnUserDocumentReferenceTarget: DocumentReference<WebAuthnUserDocument>;
}

export const verifyAuthentication: (options: VerifyAuthenticationOptions) => Promise<FunctionResponse> = (options: VerifyAuthenticationOptions): Promise<FunctionResponse> => ((userHandle: string): Promise<FunctionResponse> => userHandle !== options.userId ? options.webAuthnUserDocumentReferenceTarget.get().then<FunctionResponse, FunctionResponse>(
  (userDocumentSnapshotTarget: DocumentSnapshot<WebAuthnUserDocument>): Promise<FunctionResponse> => (async (userDocumentTarget: WebAuthnUserDocument | undefined): Promise<FunctionResponse> => userDocumentTarget ? options.webAuthnUserDocumentReference.get().then<FunctionResponse, FunctionResponse>(
    (userDocumentSnapshot: DocumentSnapshot<WebAuthnUserDocument>): Promise<FunctionResponse> => (async (userDocument: WebAuthnUserDocument | undefined): Promise<FunctionResponse> => userDocument ? userDocument.challenge && userDocument.challenge.process === "authentication" ? userDocumentTarget.credentials?.[userDocument.challenge?.processingCredential || "first"] ? verifyAuthenticationResponse(
      {
        ...options.authenticationOptions,
        credential:              {
          counter:   userDocumentTarget.credentials[userDocument.challenge.processingCredential || "first"]?.counter || 0,
          id:        isoBase64URL.fromBuffer(userDocumentTarget.credentials[userDocument.challenge.processingCredential || "first"]?.id || new Uint8Array()),
          publicKey: userDocumentTarget.credentials[userDocument.challenge.processingCredential || "first"]?.publicKey || new Uint8Array(),
        },
        expectedChallenge:       userDocument.challenge.value,
        requireUserVerification: (userDocument.challenge.processingCredential === "second" && options.authenticatorAttachment2FA || options.authenticatorAttachment) === "platform" && options.userVerificationRequirement !== "discouraged",
      },
    ).then<FunctionResponse>(
      (verifiedAuthenticationResponse: VerifiedAuthenticationResponse): Promise<FunctionResponse> => (userDocument.lastPresent ? options.webAuthnUserDocumentReference.update({ challenge: FieldValue.delete() }) : options.webAuthnUserDocumentReference.delete()).then<FunctionResponse, FunctionResponse>(
        (): Promise<FunctionResponse> => verifiedAuthenticationResponse.verified ? options.createCustomToken(userHandle).then<FunctionResponse, FunctionResponse>(
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
            credential:        {
              counter:   userDocumentTarget.credentials.second.counter,
              id:        isoBase64URL.fromBuffer(userDocumentTarget.credentials.second.id),
              publicKey: userDocumentTarget.credentials.second.publicKey,
            },
            expectedChallenge: userDocument.challenge?.value || "",
          },
        ).then<FunctionResponse>(
          (backupVerifiedAuthenticationResponse: VerifiedAuthenticationResponse): Promise<FunctionResponse> => backupVerifiedAuthenticationResponse.verified ? options.createCustomToken(userHandle).then<FunctionResponse, FunctionResponse>(
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
          ) : (userDocument.credentials ? options.webAuthnUserDocumentReference.update({ challenge: FieldValue.delete() }) : options.webAuthnUserDocumentReference.delete()).then<FunctionResponse, FunctionResponse>(
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
        ) : (userDocument.credentials ? options.webAuthnUserDocumentReference.update({ challenge: FieldValue.delete() }) : options.webAuthnUserDocumentReference.delete()).then<FunctionResponse, FunctionResponse>(
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
    ) : options.webAuthnUserDocumentReference.update({ challenge: FieldValue.delete() }).then<FunctionResponse, FunctionResponse>(
      (): FunctionResponse => ({
        code:      "user-doc-missing-passkey-fields",
        message:   "User document is missing passkey fields from prior operation.",
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
      message:   "User document is missing challenge field from prior operation.",
      operation: "verify authentication",
      success:   false,
    } : options.webAuthnUserDocumentReference.delete().then<FunctionResponse, FunctionResponse>(
      (): FunctionResponse => ({
        code:      "user-doc-missing-challenge-field",
        message:   "User document is missing challenge field from prior operation.",
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
) : options.webAuthnUserDocumentReference.update({ challenge: FieldValue.delete() }).then<FunctionResponse, FunctionResponse>(
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
))(options.authenticationOptions.response.response.userHandle ? isoBase64URL.toUTF8String(options.authenticationOptions.response.response.userHandle) : options.userId);
