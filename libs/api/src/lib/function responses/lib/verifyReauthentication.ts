import { FunctionResponse, WebAuthnUserDocument }                       from "@firebase-web-authn/types";
import { VerifiedAuthenticationResponse, verifyAuthenticationResponse } from "@simplewebauthn/server";
import { AuthenticationResponseJSON }                                   from "@simplewebauthn/typescript-types";
import { FirebaseError }                                                from "firebase-admin";
import { DocumentReference, DocumentSnapshot, FieldValue, Timestamp }   from "firebase-admin/firestore";


export const verifyReauthentication: (options: { authenticationResponse: AuthenticationResponseJSON, createCustomToken: () => Promise<string>, hostname: string, webAuthnUserDocumentReference: DocumentReference<WebAuthnUserDocument> }) => Promise<FunctionResponse> = (options: { authenticationResponse: AuthenticationResponseJSON, createCustomToken: () => Promise<string>, hostname: string, webAuthnUserDocumentReference: DocumentReference<WebAuthnUserDocument> }): Promise<FunctionResponse> => options.webAuthnUserDocumentReference.get().then<FunctionResponse>(
  (userDocumentSnapshot: DocumentSnapshot<WebAuthnUserDocument>): Promise<FunctionResponse> => (async (userDocument: WebAuthnUserDocument | undefined): Promise<FunctionResponse> => userDocument ? userDocument.credential ? (async (): Promise<FunctionResponse> => userDocument.challenge ? verifyAuthenticationResponse(
    {
      authenticator:           {
        counter:             userDocument.credential?.counter || 0,
        credentialID:        userDocument.credential?.id || new Uint8Array(0),
        credentialPublicKey: userDocument.credential?.publicKey || new Uint8Array(0),
      },
      expectedChallenge:       userDocument.challenge,
      expectedOrigin:          "https://" + options.hostname,
      expectedRPID:            options.hostname,
      requireUserVerification: true,
      response:                options.authenticationResponse,
    },
  ).then<FunctionResponse>(
    (verifiedAuthenticationResponse: VerifiedAuthenticationResponse): Promise<FunctionResponse> => verifiedAuthenticationResponse.verified ? options.webAuthnUserDocumentReference.update(
      {
        challenge:    FieldValue.delete(),
        credential:   {
          ...userDocument["credential"],
          backupEligible:   verifiedAuthenticationResponse.authenticationInfo.credentialDeviceType === "multiDevice",
          backupSuccessful: verifiedAuthenticationResponse.authenticationInfo.credentialBackedUp,
        },
        lastPresent:  Timestamp.fromDate(new Date()),
        lastVerified: verifiedAuthenticationResponse.authenticationInfo.userVerified ? Timestamp.fromDate(new Date()) : userDocument["lastVerified"] || FieldValue.delete(),
      },
    ).then<FunctionResponse, FunctionResponse>(
      (): Promise<FunctionResponse> => options.createCustomToken().then<FunctionResponse, FunctionResponse>(
        (customToken: string): FunctionResponse => ({
          customToken: customToken,
          operation:   "verify reauthentication",
          success:     true,
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
  ) : {
    code:      "user-doc-missing-challenge-field",
    message:   "User doc is missing challenge field from prior operation.",
    operation: "verify reauthentication",
    success:   false,
  })() : options.webAuthnUserDocumentReference.delete().then<FunctionResponse, FunctionResponse>(
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
    code:      "missing-user-doc",
    message:   "No user document was found in Firestore.",
    operation: "verify reauthentication",
    success:   false,
  })(userDocumentSnapshot.data()),
);
