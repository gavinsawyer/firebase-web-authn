/*
 * Copyright © 2025 Gavin Sawyer. All rights reserved.
 */

import { type FunctionResponse, type WebAuthnUserDocument }                     from "@firebase-web-authn/types";
import { type VerifiedRegistrationResponse, verifyRegistrationResponse }        from "@simplewebauthn/server";
import { type RegistrationResponseJSON }                                        from "@simplewebauthn/types";
import { type FirebaseError }                                                   from "firebase-admin";
import { type DocumentReference, type DocumentSnapshot, FieldValue, Timestamp } from "firebase-admin/firestore";


interface VerifyRegistrationOptions {
  authenticatorAttachment?: AuthenticatorAttachment;
  authenticatorAttachment2FA?: AuthenticatorAttachment;
  createCustomToken: () => Promise<string>;
  registrationOptions: {
    expectedOrigin: string
    expectedRPID: string
    response: RegistrationResponseJSON
  };
  userVerificationRequirement?: UserVerificationRequirement;
  webAuthnUserDocumentReference: DocumentReference<WebAuthnUserDocument>;
}

export const verifyRegistration: (options: VerifyRegistrationOptions) => Promise<FunctionResponse> = (options: VerifyRegistrationOptions): Promise<FunctionResponse> => options.webAuthnUserDocumentReference.get().then<FunctionResponse, FunctionResponse>(
  (userDocumentSnapshot: DocumentSnapshot<WebAuthnUserDocument>): Promise<FunctionResponse> => (async (userDocument: WebAuthnUserDocument | undefined): Promise<FunctionResponse> => userDocument ? userDocument.challenge && userDocument.challenge.process === "registration" ? (userDocument.challenge.processingCredential !== "second" || userDocument.credentials?.first) ? verifyRegistrationResponse(
    {
      ...options.registrationOptions,
      expectedChallenge:       userDocument.challenge.value,
      requireUserVerification: (userDocument.challenge.processingCredential === "second" ? options.authenticatorAttachment2FA === "platform" : options.authenticatorAttachment === "platform") && options.userVerificationRequirement === "required",
    },
  ).then<FunctionResponse>(
    (verifiedRegistrationResponse: VerifiedRegistrationResponse): Promise<FunctionResponse> => verifiedRegistrationResponse.verified ? options.createCustomToken().then<FunctionResponse, FunctionResponse>(
      (customToken: string): Promise<FunctionResponse> => options.webAuthnUserDocumentReference.update(
        {
          challenge:                                                                                                FieldValue.delete(),
          [userDocument.challenge?.processingCredential === "second" ? "credentials.second" : "credentials.first"]: {
            authenticatorAttachment: verifiedRegistrationResponse.registrationInfo?.credentialDeviceType === "multiDevice" ? "platform" : "cross-platform",
            backedUp:                verifiedRegistrationResponse.registrationInfo?.credentialBackedUp,
            counter:                 verifiedRegistrationResponse.registrationInfo?.counter,
            id:                      verifiedRegistrationResponse.registrationInfo?.credentialID,
            publicKey:               verifiedRegistrationResponse.registrationInfo?.credentialPublicKey,
          },
          lastCredentialUsed:                                                                                       userDocument.challenge?.processingCredential || "first",
          lastPresent:                                                                                              Timestamp.fromDate(new Date()),
          lastVerified:                                                                                             verifiedRegistrationResponse.registrationInfo?.userVerified ? Timestamp.fromDate(new Date()) : userDocument.lastVerified || FieldValue.delete(),
          lastWebAuthnProcess:                                                                                      "registration",
        },
      ).then<FunctionResponse, FunctionResponse>(
        (): FunctionResponse => ({
          registeredCredential: userDocument.challenge?.processingCredential || "first",
          customToken:          customToken,
          operation:            "verify registration",
          success:              true,
        }),
        (firebaseError: FirebaseError): FunctionResponse => ({
          code:      firebaseError.code,
          message:   firebaseError.message,
          operation: "verify registration",
          success:   false,
        }),
      ),
      (firebaseError: FirebaseError): FunctionResponse => ({
        code:      firebaseError.code,
        message:   firebaseError.message,
        operation: "verify reauthentication",
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
  ) : options.webAuthnUserDocumentReference.delete().then<FunctionResponse, FunctionResponse>(
    (): FunctionResponse => ({
      code:      "user-doc-missing-passkey-fields",
      message:   "User doc is missing passkey fields from prior operation.",
      operation: "verify registration",
      success:   false,
    }),
    (firebaseError: FirebaseError): FunctionResponse => ({
      code:      firebaseError.code,
      message:   firebaseError.message,
      operation: "verify registration",
      success:   false,
    }),
  ) : userDocument.credentials?.first ? {
    code:      "user-doc-missing-challenge-field",
    message:   "User doc is missing challenge field from prior operation.",
    operation: "verify registration",
    success:   false,
  } : options.webAuthnUserDocumentReference.delete().then<FunctionResponse, FunctionResponse>(
    (): FunctionResponse => ({
      code:      "user-doc-missing-challenge-field",
      message:   "User doc is missing challenge field from prior operation.",
      operation: "verify registration",
      success:   false,
    }),
    (firebaseError: FirebaseError): FunctionResponse => ({
      code:      firebaseError.code,
      message:   firebaseError.message,
      operation: "verify registration",
      success:   false,
    }),
  ) : {
    code:      "missing-user-doc",
    message:   "No user document was found in Firestore.",
    operation: "verify registration",
    success:   false,
  })(userDocumentSnapshot.data()),
  (firebaseError: FirebaseError): FunctionResponse => ({
    code:      firebaseError.code,
    message:   firebaseError.message,
    operation: "verify registration",
    success:   false,
  }),
);
