import { FunctionRequest, FunctionResponse, WebAuthnUserDocument }                                                                                                                            from "@firebase-web-authn/types";
import { generateAuthenticationOptions, generateRegistrationOptions, VerifiedAuthenticationResponse, VerifiedRegistrationResponse, verifyAuthenticationResponse, verifyRegistrationResponse } from "@simplewebauthn/server";
import { PublicKeyCredentialCreationOptionsJSON, PublicKeyCredentialRequestOptionsJSON }                                                                                                      from "@simplewebauthn/typescript-types";
import { FirebaseError }                                                                                                                                                                      from "firebase-admin";
import { App }                                                                                                                                                                                from "firebase-admin/app";
import { Auth, getAuth }                                                                                                                                                                      from "firebase-admin/auth";
import { DocumentReference, DocumentSnapshot, FieldValue, Firestore, getFirestore, Timestamp }                                                                                                from "firebase-admin/firestore";
import { HttpsFunction, runWith }                                                                                                                                                             from "firebase-functions";
import { FirebaseWebAuthnConfig }                                                                                                                                                             from "./FirebaseWebAuthnConfig";


/**
 * @param firebaseWebAuthnConfig - Configuration for your WebAuthn Cloud Function.
 * @param app - An optional {@link App} to use with Firebase Auth and Firestore.
 * @returns An {@link HttpsFunction} which will need to be exported from your Firebase Functions package index.
 */
export const getFirebaseWebAuthnApi: (firebaseWebAuthnConfig: FirebaseWebAuthnConfig, app?: App) => HttpsFunction = (firebaseWebAuthnConfig: FirebaseWebAuthnConfig, app?: App): HttpsFunction => runWith({
  enforceAppCheck: true,
  ingressSettings: "ALLOW_ALL",
})
  .https
  .onCall(
    async (functionRequest: FunctionRequest, callableContext): Promise<FunctionResponse> => callableContext.auth ? (async (auth: Auth, firestore: Firestore): Promise<FunctionResponse> => functionRequest.operation === "clear challenge" ? (firestore.collection("users").doc(callableContext.auth?.uid || "") as DocumentReference<WebAuthnUserDocument>).get().then<FunctionResponse, FunctionResponse>(
      (userDocumentSnapshot: DocumentSnapshot<WebAuthnUserDocument>): Promise<FunctionResponse> => (async (userDocument: WebAuthnUserDocument | undefined): Promise<FunctionResponse> => userDocument ? userDocument.challenge ? userDocument.credential ? (firestore.collection("users").doc(callableContext.auth?.uid || "") as DocumentReference<WebAuthnUserDocument>).update(
        {
          challenge: FieldValue.delete(),
        },
      ).then<FunctionResponse, FunctionResponse>(
        (): FunctionResponse => ({
          operation: functionRequest.operation,
          success:   true,
        }),
        (firebaseError: FirebaseError): FunctionResponse => ({
          code:      firebaseError.code,
          message:   firebaseError.message,
          operation: functionRequest.operation,
          success:   false,
        }),
      ) : firestore.collection("users").doc(callableContext.auth?.uid || "").delete().then<FunctionResponse, FunctionResponse>(
        (): FunctionResponse => ({
          operation: functionRequest.operation,
          success:   true,
        }),
        (firebaseError: FirebaseError): FunctionResponse => ({
          code:      firebaseError.code,
          message:   firebaseError.message,
          operation: functionRequest.operation,
          success:   false,
        }),
      ) : {
        code:      "no-op",
        message:   "No operation is needed.",
        operation: functionRequest.operation,
        success:   false,
      } : {
        code:      "missing-user-doc",
        message:   "No user document was found in Firestore.",
        operation: functionRequest.operation,
        success:   false,
      })(userDocumentSnapshot.data()),
      (firebaseError: FirebaseError): FunctionResponse => (
        {
          code:      firebaseError.code,
          message:   firebaseError.message,
          operation: functionRequest.operation,
          success:   false,
        }
      ),
    ) : functionRequest.operation == "clear user doc" ? firestore.collection("users").doc(callableContext.auth?.uid || "").get().then<FunctionResponse, FunctionResponse>(
      (userDocumentSnapshot: DocumentSnapshot<WebAuthnUserDocument>): Promise<FunctionResponse> => (async (userDocument: WebAuthnUserDocument | undefined): Promise<FunctionResponse> => userDocument ? firestore.collection("users").doc(callableContext.auth?.uid || "").delete().then<FunctionResponse, FunctionResponse>(
        (): FunctionResponse => ({
          operation: functionRequest.operation,
          success:   true,
        }),
        (firebaseError: FirebaseError): FunctionResponse => ({
          code:      firebaseError.code,
          message:   firebaseError.message,
          operation: functionRequest.operation,
          success:   false,
        }),
      ) : {
        code:      "no-op",
        message:   "No operation is needed.",
        operation: functionRequest.operation,
        success:   false,
      })(userDocumentSnapshot.data()),
      (firebaseError: FirebaseError): FunctionResponse => ({
        code:      firebaseError.code,
        message:   firebaseError.message,
        operation: functionRequest.operation,
        success:   false,
      }),
    ) : functionRequest.operation === "create authentication challenge" ? generateAuthenticationOptions(
      {
        rpID:             callableContext.rawRequest.hostname,
        userVerification: firebaseWebAuthnConfig.userVerificationRequirement,
      },
    ).then<FunctionResponse>(
      (publicKeyCredentialRequestOptionsJSON: PublicKeyCredentialRequestOptionsJSON): Promise<FunctionResponse> => (firestore.collection("users").doc(callableContext.auth?.uid || "") as DocumentReference<WebAuthnUserDocument>).set(
        {
          challenge: publicKeyCredentialRequestOptionsJSON.challenge,
        },
        {
          merge: true,
        },
      ).then<FunctionResponse, FunctionResponse>(
        (): FunctionResponse => ({
          requestOptions: publicKeyCredentialRequestOptionsJSON,
          operation:      functionRequest.operation,
          success:        true,
        }),
        (firebaseError: FirebaseError): FunctionResponse => ({
          code:      firebaseError.code,
          message:   firebaseError.message,
          operation: functionRequest.operation,
          success:   false,
        }),
      ),
    ) : functionRequest.operation === "create reauthentication challenge" ? (firestore.collection("users").doc(callableContext.auth?.uid || "") as DocumentReference<WebAuthnUserDocument>).get().then<FunctionResponse, FunctionResponse>(
      (userDocumentSnapshot: DocumentSnapshot<WebAuthnUserDocument>): Promise<FunctionResponse> => (async (userDocument: WebAuthnUserDocument | undefined): Promise<FunctionResponse> => userDocument ? userDocument.credential ? generateAuthenticationOptions(
        {
          allowCredentials: [
            {
              id:   userDocument.credential.id,
              type: "public-key",
            },
          ],
          rpID:             callableContext.rawRequest.hostname,
          userVerification: firebaseWebAuthnConfig.userVerificationRequirement,
        },
      ).then<FunctionResponse>(
        (publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptionsJSON): Promise<FunctionResponse> => (firestore.collection("users").doc(callableContext.auth?.uid || "") as DocumentReference<WebAuthnUserDocument>).set(
          {
            challenge: publicKeyCredentialRequestOptions.challenge,
          },
          {
            merge: true,
          },
        ).then<FunctionResponse, FunctionResponse>(
          (): FunctionResponse => ({
            requestOptions: publicKeyCredentialRequestOptions,
            operation:      functionRequest.operation,
            success:        true,
          }),
          (firebaseError: FirebaseError): FunctionResponse => ({
            code:      firebaseError.code,
            message:   firebaseError.message,
            operation: functionRequest.operation,
            success:   false,
          }),
        ),
      ) : {
        code:      "user-doc-missing-passkey-fields",
        message:   "User doc is missing passkey fields from prior operation.",
        operation: functionRequest.operation,
        success:   false,
      } : {
        code:      "missing-user-doc",
        message:   "No user document was found in Firestore.",
        operation: functionRequest.operation,
        success:   false,
      })(userDocumentSnapshot.data()),
      (firebaseError: FirebaseError): FunctionResponse => ({
        code:      firebaseError.code,
        message:   firebaseError.message,
        operation: functionRequest.operation,
        success:   false,
      }),
    ) : functionRequest.operation === "create registration challenge" ? (firestore.collection("users").doc(callableContext.auth?.uid || "") as DocumentReference<WebAuthnUserDocument>).get().then<FunctionResponse, FunctionResponse>(
      (userDocumentSnapshot: DocumentSnapshot<WebAuthnUserDocument>): Promise<FunctionResponse> => (async (userDocument: WebAuthnUserDocument | undefined): Promise<FunctionResponse> => !userDocument?.credential ? generateRegistrationOptions(
        {
          authenticatorSelection: {
            authenticatorAttachment: firebaseWebAuthnConfig.authenticatorAttachment,
            residentKey:             "required",
            userVerification:        firebaseWebAuthnConfig.userVerificationRequirement,
          },
          rpID:                   callableContext.rawRequest.hostname,
          rpName:                 firebaseWebAuthnConfig.relyingPartyName,
          userID:                 callableContext.auth?.uid || "",
          userName:               functionRequest.name,
        },
      ).then<FunctionResponse>(
        (publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptionsJSON): Promise<FunctionResponse> => (firestore.collection("users").doc(callableContext.auth?.uid || "") as DocumentReference<WebAuthnUserDocument>).set(
          {
            challenge: publicKeyCredentialCreationOptions.challenge,
          },
        ).then<FunctionResponse, FunctionResponse>(
          (): FunctionResponse => ({
            creationOptions: publicKeyCredentialCreationOptions,
            operation:       functionRequest.operation,
            success:         true,
          }),
          (firebaseError: FirebaseError): FunctionResponse => ({
            code:      firebaseError.code,
            message:   firebaseError.message,
            operation: functionRequest.operation,
            success:   false,
          }),
        ),
      ) : {
        code:      "no-op",
        message:   "No operation is needed.",
        operation: functionRequest.operation,
        success:   false,
      })(userDocumentSnapshot.data()),
      (firebaseError: FirebaseError): FunctionResponse => ({
        code:      firebaseError.code,
        message:   firebaseError.message,
        operation: functionRequest.operation,
        success:   false,
      }),
    ) : functionRequest.operation === "verify authentication" ? functionRequest.authenticationResponse.response.userHandle !== callableContext.auth?.uid ? (firestore.collection("users").doc(functionRequest.authenticationResponse.response.userHandle || "") as DocumentReference<WebAuthnUserDocument>).get().then<FunctionResponse>(
      (userDocumentSnapshot: DocumentSnapshot<WebAuthnUserDocument>): Promise<FunctionResponse> => ((userDocument: WebAuthnUserDocument | undefined): Promise<FunctionResponse> => userDocument ? userDocument.credential ? (firestore.collection("users").doc(callableContext.auth?.uid || "") as DocumentReference<WebAuthnUserDocument>).get().then<FunctionResponse>(
        (priorUserDocumentSnapshot: DocumentSnapshot<WebAuthnUserDocument>): Promise<FunctionResponse> => ((priorUserDocument: WebAuthnUserDocument | undefined): Promise<FunctionResponse> => priorUserDocument && priorUserDocument.challenge ? verifyAuthenticationResponse(
          {
            authenticator:           {
              counter:             userDocument.credential?.counter || 0,
              credentialID:        userDocument.credential?.id || new Uint8Array(0),
              credentialPublicKey: userDocument.credential?.publicKey || new Uint8Array(0),
            },
            expectedChallenge:       priorUserDocument.challenge,
            expectedOrigin:          "https://" + callableContext.rawRequest.hostname,
            expectedRPID:            callableContext.rawRequest.hostname,
            requireUserVerification: true,
            response:                functionRequest.authenticationResponse,
          },
        ).then<FunctionResponse, FunctionResponse>(
          (verifiedAuthenticationResponse: VerifiedAuthenticationResponse): Promise<FunctionResponse> => verifiedAuthenticationResponse.verified ? (firestore.collection("users").doc(functionRequest.authenticationResponse.response.userHandle || "") as DocumentReference<WebAuthnUserDocument>).update(
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
            (): Promise<FunctionResponse> => priorUserDocument.credential ? (firestore.collection("users").doc(callableContext.auth?.uid || "") as DocumentReference<WebAuthnUserDocument>).update(
              {
                challenge: FieldValue.delete(),
              },
            ).then<FunctionResponse, FunctionResponse>(
              (): Promise<FunctionResponse> => auth.createCustomToken(functionRequest.authenticationResponse.response.userHandle || "").then<FunctionResponse, FunctionResponse>(
                (customToken: string): FunctionResponse => ({
                  customToken: customToken,
                  operation:   functionRequest.operation,
                  success:     true,
                }),
                (firebaseError: FirebaseError): FunctionResponse => ({
                  code:      firebaseError.code,
                  message:   firebaseError.message,
                  operation: functionRequest.operation,
                  success:   false,
                }),
              ),
              (firebaseError: FirebaseError): FunctionResponse => ({
                code:      firebaseError.code,
                message:   firebaseError.message,
                operation: functionRequest.operation,
                success:   false,
              }),
            ) : firestore.collection("users").doc(callableContext.auth?.uid || "").delete().then<FunctionResponse, FunctionResponse>(
              (): Promise<FunctionResponse> => auth.createCustomToken(functionRequest.authenticationResponse.response.userHandle || "").then<FunctionResponse, FunctionResponse>(
                (customToken: string): FunctionResponse => ({
                  customToken: customToken,
                  operation:   functionRequest.operation,
                  success:     true,
                }),
                (firebaseError: FirebaseError): FunctionResponse => ({
                  code:      firebaseError.code,
                  message:   firebaseError.message,
                  operation: functionRequest.operation,
                  success:   false,
                }),
              ),
              (firebaseError: FirebaseError): FunctionResponse => ({
                code:      firebaseError.code,
                message:   firebaseError.message,
                operation: functionRequest.operation,
                success:   false,
              }),
            ),
            (firebaseError: FirebaseError): FunctionResponse => ({
              code:      firebaseError.code,
              message:   firebaseError.message,
              operation: functionRequest.operation,
              success:   false,
            }),
          ) : firestore.collection("users").doc(callableContext.auth?.uid || "").delete().then<FunctionResponse, FunctionResponse>(
            (): FunctionResponse => ({
              code:      "not-verified",
              message:   "User not verified.",
              operation: functionRequest.operation,
              success:   false,
            }),
            (firebaseError: FirebaseError): FunctionResponse => ({
              code:      firebaseError.code,
              message:   firebaseError.message,
              operation: functionRequest.operation,
              success:   false,
            }),
          ),
        ) : firestore.collection("users").doc(callableContext.auth?.uid || "").delete().then<FunctionResponse, FunctionResponse>(
          (): FunctionResponse => ({
            code:      "user-doc-missing-challenge-field",
            message:   "User doc is missing challenge field from prior operation.",
            operation: functionRequest.operation,
            success:   false,
          }),
          (firebaseError: FirebaseError): FunctionResponse => ({
            code:      firebaseError.code,
            message:   firebaseError.message,
            operation: functionRequest.operation,
            success:   false,
          }),
        ))(priorUserDocumentSnapshot.data()),
      ) : firestore.collection("users").doc(callableContext.auth?.uid || "").delete().then<FunctionResponse, FunctionResponse>(
        (): FunctionResponse => ({
          code:      "user-doc-missing-passkey-fields",
          message:   "User doc is missing passkey fields from prior operation.",
          operation: functionRequest.operation,
          success:   false,
        }),
        (firebaseError: FirebaseError): FunctionResponse => ({
          code:      firebaseError.code,
          message:   firebaseError.message,
          operation: functionRequest.operation,
          success:   false,
        }),
      ) : firestore.collection("users").doc(callableContext.auth?.uid || "").delete().then<FunctionResponse, FunctionResponse>(
        (): FunctionResponse => ({
          code:      "missing-user-doc",
          message:   "No user document was found in Firestore.",
          operation: functionRequest.operation,
          success:   false,
        }),
        (firebaseError: FirebaseError): FunctionResponse => ({
          code:      firebaseError.code,
          message:   firebaseError.message,
          operation: functionRequest.operation,
          success:   false,
        }),
      ))(userDocumentSnapshot.data()),
    ) : (firestore.collection("users").doc(callableContext.auth?.uid || "") as DocumentReference<WebAuthnUserDocument>).update(
      {
        challenge: FieldValue.delete(),
      },
    ).then<FunctionResponse, FunctionResponse>(
      (): FunctionResponse => ({
        code:      "no-op",
        message:   "No operation is needed.",
        operation: functionRequest.operation,
        success:   false,
      }),
      (firebaseError: FirebaseError): FunctionResponse => ({
        code:      firebaseError.code,
        message:   firebaseError.message,
        operation: functionRequest.operation,
        success:   false,
      }),
    ) : functionRequest.operation === "verify reauthentication" ? (firestore.collection("users").doc(callableContext.auth?.uid || "") as DocumentReference<WebAuthnUserDocument>).get().then<FunctionResponse>(
      (userDocumentSnapshot: DocumentSnapshot<WebAuthnUserDocument>): Promise<FunctionResponse> => (async (userDocument: WebAuthnUserDocument | undefined): Promise<FunctionResponse> => userDocument ? userDocument.credential ? (async (): Promise<FunctionResponse> => userDocument.challenge ? verifyAuthenticationResponse(
        {
          authenticator:           {
            counter:             userDocument.credential?.counter || 0,
            credentialID:        userDocument.credential?.id || new Uint8Array(0),
            credentialPublicKey: userDocument.credential?.publicKey || new Uint8Array(0),
          },
          expectedChallenge:       userDocument.challenge,
          expectedOrigin:          "https://" + callableContext.rawRequest.hostname,
          expectedRPID:            callableContext.rawRequest.hostname,
          requireUserVerification: true,
          response:                functionRequest.authenticationResponse,
        },
      ).then<FunctionResponse>(
        (verifiedAuthenticationResponse: VerifiedAuthenticationResponse): Promise<FunctionResponse> => verifiedAuthenticationResponse.verified ? (firestore.collection("users").doc(callableContext.auth?.uid || "") as DocumentReference<WebAuthnUserDocument>).update(
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
          (): Promise<FunctionResponse> => auth.createCustomToken(callableContext.auth?.uid || "").then<FunctionResponse, FunctionResponse>(
            (customToken: string): FunctionResponse => ({
              customToken: customToken,
              operation:   functionRequest.operation,
              success:     true,
            }),
            (firebaseError: FirebaseError): FunctionResponse => ({
              code:      firebaseError.code,
              message:   firebaseError.message,
              operation: functionRequest.operation,
              success:   false,
            }),
          ),
          (firebaseError: FirebaseError): FunctionResponse => ({
            code:      firebaseError.code,
            message:   firebaseError.message,
            operation: functionRequest.operation,
            success:   false,
          }),
        ) : (firestore.collection("users").doc(callableContext.auth?.uid || "") as DocumentReference<WebAuthnUserDocument>).update(
          {
            challenge: FieldValue.delete(),
          },
        ).then<FunctionResponse, FunctionResponse>(
          (): FunctionResponse => ({
            code:      "not-verified",
            message:   "User not verified.",
            operation: functionRequest.operation,
            success:   false,
          }),
          (firebaseError: FirebaseError): FunctionResponse => ({
            code:      firebaseError.code,
            message:   firebaseError.message,
            operation: functionRequest.operation,
            success:   false,
          }),
        ),
      ) : {
        code:      "user-doc-missing-challenge-field",
        message:   "User doc is missing challenge field from prior operation.",
        operation: functionRequest.operation,
        success:   false,
      })() : firestore.collection("users").doc(callableContext.auth?.uid || "").delete().then<FunctionResponse, FunctionResponse>(
        (): FunctionResponse => ({
          code:      "user-doc-missing-passkey-fields",
          message:   "User doc is missing passkey fields from prior operation.",
          operation: functionRequest.operation,
          success:   false,
        }),
        (firebaseError: FirebaseError): FunctionResponse => ({
          code:      firebaseError.code,
          message:   firebaseError.message,
          operation: functionRequest.operation,
          success:   false,
        }),
      ) : {
        code:      "missing-user-doc",
        message:   "No user document was found in Firestore.",
        operation: functionRequest.operation,
        success:   false,
      })(userDocumentSnapshot.data()),
    ) : functionRequest.operation === "verify registration" ? (firestore.collection("users").doc(callableContext.auth?.uid || "") as DocumentReference<WebAuthnUserDocument>).get().then<FunctionResponse, FunctionResponse>(
      (userDocumentSnapshot: DocumentSnapshot<WebAuthnUserDocument>): Promise<FunctionResponse> => (async (userDocument: WebAuthnUserDocument | undefined): Promise<FunctionResponse> => userDocument ? userDocument.challenge ? !userDocument.credential ? verifyRegistrationResponse(
        {
          expectedChallenge:       userDocument["challenge"],
          expectedOrigin:          "https://" + callableContext.rawRequest.hostname,
          expectedRPID:            callableContext.rawRequest.hostname,
          requireUserVerification: true,
          response:                functionRequest.registrationResponse,
        },
      ).then<FunctionResponse>(
        (verifiedRegistrationResponse: VerifiedRegistrationResponse): Promise<FunctionResponse> => verifiedRegistrationResponse.verified && verifiedRegistrationResponse.registrationInfo ? (firestore.collection("users").doc(callableContext.auth?.uid || "") as DocumentReference<WebAuthnUserDocument | undefined>).update(
          {
            challenge:    FieldValue.delete(),
            credential:   {
              backupEligible:   verifiedRegistrationResponse.registrationInfo.credentialDeviceType === "multiDevice",
              backupSuccessful: verifiedRegistrationResponse.registrationInfo.credentialBackedUp,
              counter:          verifiedRegistrationResponse.registrationInfo.counter,
              id:               verifiedRegistrationResponse.registrationInfo.credentialID,
              publicKey:        verifiedRegistrationResponse.registrationInfo.credentialPublicKey,
            },
            lastPresent:  Timestamp.fromDate(new Date()),
            lastVerified: verifiedRegistrationResponse.registrationInfo.userVerified ? Timestamp.fromDate(new Date()) : userDocument["lastVerified"] || FieldValue.delete(),
          },
        ).then<FunctionResponse, FunctionResponse>(
          (): Promise<FunctionResponse> => auth.createCustomToken(callableContext.auth?.uid || "").then<FunctionResponse, FunctionResponse>(
            (customToken: string): FunctionResponse => ({
              customToken: customToken,
              operation:   functionRequest.operation,
              success:     true,
            }),
            (firebaseError: FirebaseError): FunctionResponse => ({
              code:      firebaseError.code,
              message:   firebaseError.message,
              operation: functionRequest.operation,
              success:   false,
            }),
          ),
          (firebaseError: FirebaseError): FunctionResponse => ({
            code:      firebaseError.code,
            message:   firebaseError.message,
            operation: functionRequest.operation,
            success:   false,
          }),
        ) : firestore.collection("users").doc(callableContext.auth?.uid || "").delete().then<FunctionResponse, FunctionResponse>(
          (): FunctionResponse => ({
            code:      "not-verified",
            message:   "User not verified.",
            operation: functionRequest.operation,
            success:   false,
          }),
          (firebaseError: FirebaseError): FunctionResponse => ({
            code:      firebaseError.code,
            message:   firebaseError.message,
            operation: functionRequest.operation,
            success:   false,
          }),
        ),
      ) : (firestore.collection("users").doc(callableContext.auth?.uid || "") as DocumentReference<WebAuthnUserDocument>).update(
        {
          challenge: FieldValue.delete(),
        },
      ).then<FunctionResponse, FunctionResponse>(
        (): FunctionResponse => ({
          code:      "no-op",
          message:   "No operation is needed.",
          operation: functionRequest.operation,
          success:   false,
        }),
        (firebaseError: FirebaseError): FunctionResponse => ({
          code:      firebaseError.code,
          message:   firebaseError.message,
          operation: functionRequest.operation,
          success:   false,
        }),
      ) : firestore.collection("users").doc(callableContext.auth?.uid || "").delete().then<FunctionResponse, FunctionResponse>(
        (): FunctionResponse => ({
          code:      "user-doc-missing-challenge-field",
          message:   "User doc is missing challenge field from prior operation.",
          operation: functionRequest.operation,
          success:   false,
        }),
        (firebaseError: FirebaseError): FunctionResponse => ({
          code:      firebaseError.code,
          message:   firebaseError.message,
          operation: functionRequest.operation,
          success:   false,
        }),
      ) : {
        code:      "missing-user-doc",
        message:   "No user document was found in Firestore.",
        operation: functionRequest.operation,
        success:   false,
      })(userDocumentSnapshot.data()),
      (firebaseError: FirebaseError): FunctionResponse => ({
        code:      firebaseError.code,
        message:   firebaseError.message,
        operation: functionRequest.operation,
        success:   false,
      }),
    ) : ((): never => {
      throw new Error("Invalid function request type.");
    })())(
      app ? getAuth(app) : getAuth(),
      app ? getFirestore(
        app,
        "ext-firebase-web-authn",
      ) : getFirestore("ext-firebase-web-authn"),
    ) : {
      code:      "missing-auth",
      message:   "No user is signed in.",
      operation: functionRequest.operation,
      success:   false,
    },
  );
