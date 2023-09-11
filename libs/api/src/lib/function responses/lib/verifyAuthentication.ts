import { FunctionResponse, WebAuthnUserDocument }                                          from "@firebase-web-authn/types";
import { VerifiedAuthenticationResponse, verifyAuthenticationResponse }                    from "@simplewebauthn/server";
import { AuthenticationResponseJSON }                                                      from "@simplewebauthn/typescript-types";
import { FirebaseError }                                                                   from "firebase-admin";
import { CollectionReference, DocumentReference, DocumentSnapshot, FieldValue, Timestamp } from "firebase-admin/firestore";


export const verifyAuthentication: (options: { authenticationResponse: AuthenticationResponseJSON, createCustomToken: (uid: string) => Promise<string>, hostname: string, userID: string, userVerificationRequirement?: UserVerificationRequirement, webAuthnUserCollectionReference: CollectionReference<WebAuthnUserDocument>, webAuthnUserDocumentReference: DocumentReference<WebAuthnUserDocument> }) => Promise<FunctionResponse> = (options: { authenticationResponse: AuthenticationResponseJSON, createCustomToken: (uid: string) => Promise<string>, hostname: string, userID: string, userVerificationRequirement?: UserVerificationRequirement, webAuthnUserCollectionReference: CollectionReference<WebAuthnUserDocument>, webAuthnUserDocumentReference: DocumentReference<WebAuthnUserDocument> }): Promise<FunctionResponse> => options.authenticationResponse.response.userHandle !== options.userID ? options.webAuthnUserCollectionReference.doc(options.authenticationResponse.response.userHandle || "").get().then<FunctionResponse, FunctionResponse>(
  (targetUserDocumentSnapshot: DocumentSnapshot<WebAuthnUserDocument>): Promise<FunctionResponse> => (async (targetUserDocument: WebAuthnUserDocument | undefined): Promise<FunctionResponse> => targetUserDocument ? options.webAuthnUserDocumentReference.get().then<FunctionResponse, FunctionResponse>(
    (userDocumentSnapshot: DocumentSnapshot<WebAuthnUserDocument>): Promise<FunctionResponse> => (async (userDocument: WebAuthnUserDocument | undefined): Promise<FunctionResponse> => userDocument ? userDocument.challenge && userDocument.challenge.process === "authentication" ? targetUserDocument[userDocument.challenge?.processingCredentialType === "backup" ? "backupCredential" : "credential"] ? verifyAuthenticationResponse(
      {
        authenticator:           {
          counter:             targetUserDocument[userDocument.challenge?.processingCredentialType === "backup" ? "backupCredential" : "credential"]?.counter || 0,
          credentialID:        targetUserDocument[userDocument.challenge?.processingCredentialType === "backup" ? "backupCredential" : "credential"]?.id || new Uint8Array(0),
          credentialPublicKey: targetUserDocument[userDocument.challenge?.processingCredentialType === "backup" ? "backupCredential" : "credential"]?.publicKey || new Uint8Array(0),
        },
        expectedChallenge:       userDocument.challenge.value,
        expectedOrigin:          "https://" + options.hostname,
        expectedRPID:            options.hostname,
        requireUserVerification: options.userVerificationRequirement === "required" || options.userVerificationRequirement === "preferred",
        response:                options.authenticationResponse,
      },
    ).then<FunctionResponse>(
      (primaryVerifiedAuthenticationResponse: VerifiedAuthenticationResponse): Promise<FunctionResponse> => primaryVerifiedAuthenticationResponse.verified ? options.webAuthnUserCollectionReference.doc(options.authenticationResponse.response.userHandle || "").update(
        {
          [userDocument.challenge?.processingCredentialType === "backup" ? "backupCredential" : "credential"]: {
            ...targetUserDocument[userDocument.challenge?.processingCredentialType === "backup" ? "backupCredential" : "credential"],
            backupEligible:   primaryVerifiedAuthenticationResponse.authenticationInfo.credentialDeviceType === "multiDevice",
            backupSuccessful: primaryVerifiedAuthenticationResponse.authenticationInfo.credentialBackedUp,
          },
          lastCredentialUsed:                                                                                  userDocument.challenge?.processingCredentialType,
          lastPresent:                                                                                         Timestamp.fromDate(new Date()),
          lastVerified:                                                                                        primaryVerifiedAuthenticationResponse.authenticationInfo.userVerified ? Timestamp.fromDate(new Date()) : targetUserDocument["lastVerified"] || FieldValue.delete(),
        },
      ).then<FunctionResponse, FunctionResponse>(
        (): Promise<FunctionResponse> => (userDocument.lastPresent ? options.webAuthnUserDocumentReference.update(
          {
            challenge: FieldValue.delete(),
          },
        ) : options.webAuthnUserDocumentReference.delete()).then<FunctionResponse, FunctionResponse>(
          (): Promise<FunctionResponse> => options.createCustomToken(options.authenticationResponse.response.userHandle || "").then<FunctionResponse, FunctionResponse>(
            (customToken: string): FunctionResponse => ({
              authenticatedCredentialType: "primary",
              customToken:                 customToken,
              operation:                   "verify authentication",
              success:                     true,
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
        (firebaseError: FirebaseError): FunctionResponse => ({
          code:      firebaseError.code,
          message:   firebaseError.message,
          operation: "verify authentication",
          success:   false,
        }),
      ) : (userDocument.lastPresent ? options.webAuthnUserDocumentReference.update(
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
    ) : userDocument.lastPresent ? {
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
  })(targetUserDocumentSnapshot.data()),
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
