import { FunctionResponse, WebAuthnUserDocument }                       from "@firebase-web-authn/types";
import { VerifiedAuthenticationResponse, verifyAuthenticationResponse } from "@simplewebauthn/server";
import { AuthenticationResponseJSON }                                   from "@simplewebauthn/typescript-types";
import { FirebaseError }                                                from "firebase-admin";
import { DocumentReference, DocumentSnapshot, FieldValue, Timestamp }   from "firebase-admin/firestore";


export const verifyReauthentication: (options: { authenticationResponse: AuthenticationResponseJSON, createCustomToken: () => Promise<string>, hostname: string, userVerificationRequirement?: UserVerificationRequirement, webAuthnUserDocumentReference: DocumentReference<WebAuthnUserDocument> }) => Promise<FunctionResponse> = (options: { authenticationResponse: AuthenticationResponseJSON, createCustomToken: () => Promise<string>, hostname: string, userVerificationRequirement?: UserVerificationRequirement, webAuthnUserDocumentReference: DocumentReference<WebAuthnUserDocument> }): Promise<FunctionResponse> => options.webAuthnUserDocumentReference.get().then<FunctionResponse>(
  (userDocumentSnapshot: DocumentSnapshot<WebAuthnUserDocument>): Promise<FunctionResponse> => (async (userDocument: WebAuthnUserDocument | undefined): Promise<FunctionResponse> => userDocument ? userDocument.challenge && userDocument.challenge.process === "reauthentication" ? userDocument[userDocument.challenge?.processingCredentialType === "backup" ? "backupCredential" : "credential"] ? verifyAuthenticationResponse(
    {
      authenticator:           {
        counter:             userDocument[userDocument.challenge?.processingCredentialType === "backup" ? "backupCredential" : "credential"]?.counter || 0,
        credentialID:        userDocument[userDocument.challenge?.processingCredentialType === "backup" ? "backupCredential" : "credential"]?.id || new Uint8Array(0),
        credentialPublicKey: userDocument[userDocument.challenge?.processingCredentialType === "backup" ? "backupCredential" : "credential"]?.publicKey || new Uint8Array(0),
      },
      expectedChallenge:       userDocument.challenge.value,
      expectedOrigin:          "https://" + options.hostname,
      expectedRPID:            options.hostname,
      requireUserVerification: options.userVerificationRequirement === "required" || options.userVerificationRequirement === "preferred",
      response:                options.authenticationResponse,
    },
  ).then<FunctionResponse>(
    (primaryVerifiedAuthenticationResponse: VerifiedAuthenticationResponse): Promise<FunctionResponse> => primaryVerifiedAuthenticationResponse.verified ? options.webAuthnUserDocumentReference.update(
      {
        challenge:          FieldValue.delete(),
        [userDocument.challenge?.processingCredentialType === "backup" ? "backupCredential" : "credential"]:         {
          ...userDocument[userDocument.challenge?.processingCredentialType === "backup" ? "backupCredential" : "credential"],
          backupEligible:   primaryVerifiedAuthenticationResponse.authenticationInfo.credentialDeviceType === "multiDevice",
          backupSuccessful: primaryVerifiedAuthenticationResponse.authenticationInfo.credentialBackedUp,
        },
        lastCredentialUsed: userDocument.challenge?.processingCredentialType,
        lastPresent:        Timestamp.fromDate(new Date()),
        lastVerified:       primaryVerifiedAuthenticationResponse.authenticationInfo.userVerified ? Timestamp.fromDate(new Date()) : userDocument["lastVerified"] || FieldValue.delete(),
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
