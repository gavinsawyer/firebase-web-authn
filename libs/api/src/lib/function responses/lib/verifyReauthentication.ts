import { FunctionResponse, WebAuthnUserDocument }                       from "@firebase-web-authn/types";
import { VerifiedAuthenticationResponse, verifyAuthenticationResponse } from "@simplewebauthn/server";
import { AuthenticationResponseJSON }                                   from "@simplewebauthn/typescript-types";
import { FirebaseError }                                                from "firebase-admin";
import { DocumentReference, DocumentSnapshot, FieldValue, Timestamp }   from "firebase-admin/firestore";


interface VerifyReauthenticationOptions {
  authenticationOptions: {
    expectedOrigin: string,
    expectedRPID: string,
    requireUserVerification: boolean,
    response: AuthenticationResponseJSON,
  },
  authenticatorAttachment?: AuthenticatorAttachment,
  authenticatorAttachment2FA?: AuthenticatorAttachment,
  createCustomToken: () => Promise<string>,
  userID: string,
  userVerificationRequirement?: UserVerificationRequirement,
  webAuthnUserDocumentReference: DocumentReference<WebAuthnUserDocument>,
}

export const verifyReauthentication: (options: VerifyReauthenticationOptions) => Promise<FunctionResponse> = (options: VerifyReauthenticationOptions): Promise<FunctionResponse> => options.webAuthnUserDocumentReference.get().then<FunctionResponse>(
  (userDocumentSnapshot: DocumentSnapshot<WebAuthnUserDocument>): Promise<FunctionResponse> => (async (userDocument: WebAuthnUserDocument | undefined): Promise<FunctionResponse> => userDocument ? userDocument.challenge && userDocument.challenge.process === "reauthentication" ? userDocument.credentials?.[userDocument.challenge?.processingCredential || "first"] ? verifyAuthenticationResponse(
    {
      ...options.authenticationOptions,
      authenticator:           {
        counter:             userDocument?.credentials[userDocument.challenge.processingCredential || "first"]?.counter || 0,
        credentialID:        userDocument?.credentials[userDocument.challenge.processingCredential || "first"]?.id || new Uint8Array(0),
        credentialPublicKey: userDocument?.credentials[userDocument.challenge.processingCredential || "first"]?.publicKey || new Uint8Array(0),
      },
      expectedChallenge:       userDocument.challenge.value,
      requireUserVerification: (userDocument.challenge.processingCredential === "second" && options.authenticatorAttachment2FA || options.authenticatorAttachment) === "platform" && options.userVerificationRequirement === "required",
    },
  ).then<FunctionResponse>(
    (verifiedAuthenticationResponse: VerifiedAuthenticationResponse): Promise<FunctionResponse> => verifiedAuthenticationResponse.verified ? options.createCustomToken().then<FunctionResponse, FunctionResponse>(
      (customToken: string): Promise<FunctionResponse> => options.webAuthnUserDocumentReference.update(
        {
          challenge:                                                                                                FieldValue.delete(),
          [userDocument.challenge?.processingCredential === "second" ? "credentials.second" : "credentials.first"]: {
            ...userDocument.credentials?.[userDocument.challenge?.processingCredential || "first"],
            authenticatorAttachment: verifiedAuthenticationResponse.authenticationInfo.credentialDeviceType === "multiDevice" ? "platform" : "cross-platform",
            backedUp:                verifiedAuthenticationResponse.authenticationInfo.credentialBackedUp,
          },
          lastCredentialUsed:                                                                                       userDocument.challenge?.processingCredential || "first",
          lastPresent:                                                                                              Timestamp.fromDate(new Date()),
          lastVerified:                                                                                             verifiedAuthenticationResponse.authenticationInfo.userVerified ? Timestamp.fromDate(new Date()) : userDocument.lastVerified || FieldValue.delete(),
          lastWebAuthnProcess:                                                                                      "reauthentication",
        },
      ).then<FunctionResponse, FunctionResponse>(
        (): FunctionResponse => ({
          reauthenticatedCredential: userDocument.challenge?.processingCredential || "first",
          customToken:               customToken,
          operation:                 "verify reauthentication",
          success:                   true,
        }),
        (firebaseError: FirebaseError): FunctionResponse => ({
          code:      firebaseError.code,
          message:   firebaseError.message,
          operation: "verify reauthentication",
          success:   false,
        }),
      ),
      (firebaseError: FirebaseError): FunctionResponse => ({
        code:      firebaseError.code,
        message:   firebaseError.message,
        operation: "verify reauthentication",
        success:   false,
      }),
    ) : userDocument.challenge?.processingCredential === undefined && userDocument.credentials?.second ? verifyAuthenticationResponse(
      {
        ...options.authenticationOptions,
        authenticator:     {
          counter:             userDocument.credentials.second.counter,
          credentialID:        userDocument.credentials.second.id,
          credentialPublicKey: userDocument.credentials.second.publicKey,
        },
        expectedChallenge: userDocument.challenge?.value || "",
      },
    ).then<FunctionResponse>(
      (backupVerifiedAuthenticationResponse: VerifiedAuthenticationResponse): Promise<FunctionResponse> => backupVerifiedAuthenticationResponse.verified ? options.createCustomToken().then<FunctionResponse, FunctionResponse>(
        (customToken: string): Promise<FunctionResponse> => options.webAuthnUserDocumentReference.update(
          {
            challenge:            FieldValue.delete(),
            "credentials.second": {
              ...userDocument.credentials?.second,
              authenticatorAttachment: backupVerifiedAuthenticationResponse.authenticationInfo.credentialDeviceType === "multiDevice" ? "platform" : "cross-platform",
              backedUp:                backupVerifiedAuthenticationResponse.authenticationInfo.credentialBackedUp,
            },
            lastCredentialUsed:   "second",
            lastPresent:          Timestamp.fromDate(new Date()),
            lastVerified:         backupVerifiedAuthenticationResponse.authenticationInfo.userVerified ? Timestamp.fromDate(new Date()) : userDocument.lastVerified || FieldValue.delete(),
            lastWebAuthnProcess:  "reauthentication",
          },
        ).then<FunctionResponse, FunctionResponse>(
          (): FunctionResponse => ({
            reauthenticatedCredential: "second",
            customToken:               customToken,
            operation:                 "verify reauthentication",
            success:                   true,
          }),
          (firebaseError: FirebaseError): FunctionResponse => ({
            code:      firebaseError.code,
            message:   firebaseError.message,
            operation: "verify reauthentication",
            success:   false,
          }),
        ),
        (firebaseError: FirebaseError): FunctionResponse => ({
          code:      firebaseError.code,
          message:   firebaseError.message,
          operation: "verify reauthentication",
          success:   false,
        }),
      ) : options.webAuthnUserDocumentReference.update(
        {
          challenge: FieldValue.delete(),
        },
      ).then<FunctionResponse, FunctionResponse>(
        (): FunctionResponse => ({
          code:      "not-verified",
          message:   "User not verified. 2",
          operation: "verify reauthentication",
          success:   false,
        }),
        (firebaseError: FirebaseError): FunctionResponse => ({
          code:      firebaseError.code,
          message:   firebaseError.message,
          operation: "verify reauthentication",
          success:   false,
        }),
      ),
    ) : options.webAuthnUserDocumentReference.update(
      {
        challenge: FieldValue.delete(),
      },
    ).then<FunctionResponse, FunctionResponse>(
      (): FunctionResponse => ({
        code:      "not-verified",
        message:   "User not verified.",
        operation: "verify reauthentication",
        success:   false,
      }),
      (firebaseError: FirebaseError): FunctionResponse => ({
        code:      firebaseError.code,
        message:   firebaseError.message,
        operation: "verify reauthentication",
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
      operation: "verify reauthentication",
      success:   false,
    }),
    (firebaseError: FirebaseError): FunctionResponse => ({
      code:      firebaseError.code,
      message:   firebaseError.message,
      operation: "verify reauthentication",
      success:   false,
    }),
  ) : {
    code:      "user-doc-missing-challenge-field",
    message:   "User doc is missing challenge field from prior operation.",
    operation: "verify reauthentication",
    success:   false,
  } : {
    code:      "missing-user-doc",
    message:   "No user document was found in Firestore.",
    operation: "verify reauthentication",
    success:   false,
  })(userDocumentSnapshot.data()),
);
