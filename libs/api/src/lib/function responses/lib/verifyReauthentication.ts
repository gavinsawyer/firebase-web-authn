import { FunctionResponse, WebAuthnUserDocument }                       from "@firebase-web-authn/types";
import { VerifiedAuthenticationResponse, verifyAuthenticationResponse } from "@simplewebauthn/server";
import { AuthenticationResponseJSON }                                   from "@simplewebauthn/typescript-types";
import { FirebaseError }                                                from "firebase-admin";
import { DocumentReference, DocumentSnapshot, FieldValue, Timestamp }   from "firebase-admin/firestore";


export const verifyReauthentication: (options: { authenticationResponse: AuthenticationResponseJSON, authenticatorAttachment?: AuthenticatorAttachment, backupAuthenticatorAttachment?: AuthenticatorAttachment, createCustomToken: () => Promise<string>, hostname: string, userVerificationRequirement?: UserVerificationRequirement, webAuthnUserDocumentReference: DocumentReference<WebAuthnUserDocument> }) => Promise<FunctionResponse> = (options: { authenticationResponse: AuthenticationResponseJSON, authenticatorAttachment?: AuthenticatorAttachment, backupAuthenticatorAttachment?: AuthenticatorAttachment, createCustomToken: () => Promise<string>, hostname: string, userVerificationRequirement?: UserVerificationRequirement, webAuthnUserDocumentReference: DocumentReference<WebAuthnUserDocument> }): Promise<FunctionResponse> => options.webAuthnUserDocumentReference.get().then<FunctionResponse>(
  (userDocumentSnapshot: DocumentSnapshot<WebAuthnUserDocument>): Promise<FunctionResponse> => (async (userDocument: WebAuthnUserDocument | undefined): Promise<FunctionResponse> => userDocument ? userDocument.challenge && userDocument.challenge.process === "reauthentication" ? userDocument[userDocument.challenge?.processingCredentialType === "backup" ? "backupCredential" : "credential"] ? verifyAuthenticationResponse(
    {
      authenticator:           {
        counter:             userDocument[userDocument.challenge.processingCredentialType === "backup" ? "backupCredential" : "credential"]?.counter || 0,
        credentialID:        userDocument[userDocument.challenge.processingCredentialType === "backup" ? "backupCredential" : "credential"]?.id || new Uint8Array(0),
        credentialPublicKey: userDocument[userDocument.challenge.processingCredentialType === "backup" ? "backupCredential" : "credential"]?.publicKey || new Uint8Array(0),
      },
      expectedChallenge:       userDocument.challenge.value,
      expectedOrigin:          "https://" + options.hostname,
      expectedRPID:            options.hostname,
      requireUserVerification: (userDocument.challenge.processingCredentialType === "backup" ? options.backupAuthenticatorAttachment === "platform" : options.authenticatorAttachment === "platform") && options.userVerificationRequirement === "required",
      response:                options.authenticationResponse,
    },
  ).then<FunctionResponse>(
    (verifiedAuthenticationResponse: VerifiedAuthenticationResponse): Promise<FunctionResponse> => verifiedAuthenticationResponse.verified ? options.webAuthnUserDocumentReference.update(
      {
        challenge:                                                                                           FieldValue.delete(),
        [userDocument.challenge?.processingCredentialType === "backup" ? "backupCredential" : "credential"]: {
          ...userDocument[userDocument.challenge?.processingCredentialType === "backup" ? "backupCredential" : "credential"],
          backupEligible:   verifiedAuthenticationResponse.authenticationInfo.credentialDeviceType === "multiDevice",
          backupSuccessful: verifiedAuthenticationResponse.authenticationInfo.credentialBackedUp,
        },
        lastCredentialUsed:                                                                                  userDocument.challenge?.processingCredentialType || "primary",
        lastPresent:                                                                                         Timestamp.fromDate(new Date()),
        lastVerified:                                                                                        verifiedAuthenticationResponse.authenticationInfo.userVerified ? Timestamp.fromDate(new Date()) : userDocument["lastVerified"] || FieldValue.delete(),
      },
    ).then<FunctionResponse, FunctionResponse>(
      (): Promise<FunctionResponse> => options.createCustomToken().then<FunctionResponse, FunctionResponse>(
        (customToken: string): FunctionResponse => ({
          reauthenticatedCredentialType: userDocument.challenge?.processingCredentialType || "primary",
          customToken:                   customToken,
          operation:                     "verify reauthentication",
          success:                       true,
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
    ) : userDocument.challenge?.processingCredentialType === undefined && userDocument.backupCredential ? verifyAuthenticationResponse(
      {
        authenticator:           {
          counter:             userDocument.backupCredential.counter,
          credentialID:        userDocument.backupCredential.id,
          credentialPublicKey: userDocument.backupCredential.publicKey,
        },
        expectedChallenge:       userDocument.challenge?.value || "",
        expectedOrigin:          "https://" + options.hostname,
        expectedRPID:            options.hostname,
        requireUserVerification: options.backupAuthenticatorAttachment === "platform" && options.userVerificationRequirement === "required",
        response:                options.authenticationResponse,
      },
    ).then<FunctionResponse>(
      (backupVerifiedAuthenticationResponse: VerifiedAuthenticationResponse): Promise<FunctionResponse> => backupVerifiedAuthenticationResponse.verified ? options.webAuthnUserDocumentReference.update(
        {
          challenge:          FieldValue.delete(),
          backupCredential:   {
            ...userDocument.backupCredential,
            backupEligible:   backupVerifiedAuthenticationResponse.authenticationInfo.credentialDeviceType === "multiDevice",
            backupSuccessful: backupVerifiedAuthenticationResponse.authenticationInfo.credentialBackedUp,
          },
          lastCredentialUsed: "backup",
          lastPresent:        Timestamp.fromDate(new Date()),
          lastVerified:       backupVerifiedAuthenticationResponse.authenticationInfo.userVerified ? Timestamp.fromDate(new Date()) : userDocument["lastVerified"] || FieldValue.delete(),
        },
      ).then<FunctionResponse, FunctionResponse>(
        (): Promise<FunctionResponse> => options.createCustomToken().then<FunctionResponse, FunctionResponse>(
          (customToken: string): FunctionResponse => ({
            reauthenticatedCredentialType: "backup",
            customToken:                   customToken,
            operation:                     "verify reauthentication",
            success:                       true,
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
