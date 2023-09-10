import { FunctionResponse, WebAuthnUserDocument }                                          from "@firebase-web-authn/types";
import { VerifiedAuthenticationResponse, verifyAuthenticationResponse }                    from "@simplewebauthn/server";
import { AuthenticationResponseJSON }                                                      from "@simplewebauthn/typescript-types";
import { FirebaseError }                                                                   from "firebase-admin";
import { CollectionReference, DocumentReference, DocumentSnapshot, FieldValue, Timestamp } from "firebase-admin/firestore";


export const verifyAuthentication: (options: { authenticationResponse: AuthenticationResponseJSON, createCustomToken: () => Promise<string>, hostname: string, userID: string, webAuthnUserCollectionReference: CollectionReference<WebAuthnUserDocument>, webAuthnUserDocumentReference: DocumentReference<WebAuthnUserDocument> }) => Promise<FunctionResponse> = (options: { authenticationResponse: AuthenticationResponseJSON, createCustomToken: () => Promise<string>, hostname: string, userID: string, webAuthnUserCollectionReference: CollectionReference<WebAuthnUserDocument>, webAuthnUserDocumentReference: DocumentReference<WebAuthnUserDocument> }): Promise<FunctionResponse> => options.authenticationResponse.response.userHandle !== options.userID ? options.webAuthnUserCollectionReference.doc(options.authenticationResponse.response.userHandle || "").get().then<FunctionResponse>(
  (userDocumentSnapshot: DocumentSnapshot<WebAuthnUserDocument>): Promise<FunctionResponse> => ((userDocument: WebAuthnUserDocument | undefined): Promise<FunctionResponse> => userDocument ? userDocument.credential ? options.webAuthnUserDocumentReference.get().then<FunctionResponse>(
    (priorUserDocumentSnapshot: DocumentSnapshot<WebAuthnUserDocument>): Promise<FunctionResponse> => ((priorUserDocument: WebAuthnUserDocument | undefined): Promise<FunctionResponse> => priorUserDocument && priorUserDocument.challenge ? verifyAuthenticationResponse(
      {
        authenticator:           {
          counter:             userDocument.credential?.counter || 0,
          credentialID:        userDocument.credential?.id || new Uint8Array(0),
          credentialPublicKey: userDocument.credential?.publicKey || new Uint8Array(0),
        },
        expectedChallenge:       priorUserDocument.challenge,
        expectedOrigin:          "https://" + options.hostname,
        expectedRPID:            options.hostname,
        requireUserVerification: true,
        response:                options.authenticationResponse,
      },
    ).then<FunctionResponse, FunctionResponse>(
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
        (): Promise<FunctionResponse> => priorUserDocument.credential ? options.webAuthnUserDocumentReference.update(
          {
            challenge: FieldValue.delete(),
          },
        ).then<FunctionResponse, FunctionResponse>(
          (): Promise<FunctionResponse> => options.createCustomToken().then<FunctionResponse, FunctionResponse>(
            (customToken: string): FunctionResponse => ({
              customToken: customToken,
              operation:   "verify authentication",
              success:     true,
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
        ) : options.webAuthnUserDocumentReference.delete().then<FunctionResponse, FunctionResponse>(
          (): Promise<FunctionResponse> => options.createCustomToken().then<FunctionResponse, FunctionResponse>(
            (customToken: string): FunctionResponse => ({
              customToken: customToken,
              operation:   "verify authentication",
              success:     true,
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
      ) : options.webAuthnUserDocumentReference.delete().then<FunctionResponse, FunctionResponse>(
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
    ))(priorUserDocumentSnapshot.data()),
  ) : options.webAuthnUserDocumentReference.delete().then<FunctionResponse, FunctionResponse>(
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
  ) : options.webAuthnUserDocumentReference.delete().then<FunctionResponse, FunctionResponse>(
    (): FunctionResponse => ({
      code:      "missing-user-doc",
      message:   "No user document was found in Firestore.",
      operation: "verify authentication",
      success:   false,
    }),
    (firebaseError: FirebaseError): FunctionResponse => ({
      code:      firebaseError.code,
      message:   firebaseError.message,
      operation: "verify authentication",
      success:   false,
    }),
  ))(userDocumentSnapshot.data()),
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
