/*
 * Copyright © 2025 Gavin Sawyer. All rights reserved.
 */

import { type FunctionRequest, type FunctionResponse, type WebAuthnUserDocument }                                                                                                                         from "@firebase-web-authn/types";
import { type App }                                                                                                                                                                                       from "firebase-admin/app";
import { type Auth, getAuth }                                                                                                                                                                             from "firebase-admin/auth";
import { type DocumentReference, type Firestore, getFirestore }                                                                                                                                           from "firebase-admin/firestore";
import { type CallableFunction, type CallableRequest, onCall }                                                                                                                                            from "firebase-functions/v2/https";
import { type FirebaseWebAuthnConfig }                                                                                                                                                                    from "./interfaces";
import { clearChallenge, clearCredential, createAuthenticationChallenge, createReauthenticationChallenge, createRegistrationChallenge, verifyAuthentication, verifyReauthentication, verifyRegistration } from "./operations";


/**
 * @param firebaseWebAuthnConfig - Configuration for your WebAuthn Cloud Function.
 * @param app - An optional {@link App} to use with Firebase Auth and Firestore.
 *
 * @returns
 *  A {@link CallableFunction} which will need to be exported from your Firebase Functions package index.
 */
function getFirebaseWebAuthnApi(
  firebaseWebAuthnConfig: FirebaseWebAuthnConfig,
  app?: App,
): CallableFunction<FunctionRequest, Promise<FunctionResponse>> {
  return onCall<FunctionRequest, Promise<FunctionResponse>>(
    {
      enforceAppCheck: true,
      ingressSettings: "ALLOW_ALL",
    },
    async (callableRequest: CallableRequest<FunctionRequest>): Promise<FunctionResponse> => {
      if (callableRequest.auth) {
        const auth: Auth                                                                   = app ? getAuth(app) : getAuth();
        const firestore: Firestore                                                         = app ? getFirestore(
          app,
          "ext-firebase-web-authn",
        ) : getFirestore("ext-firebase-web-authn");
        const userID: string                                                               = callableRequest.auth.uid;
        const webAuthnUserDocumentReference: DocumentReference<WebAuthnUserDocument>       = firestore.collection("users").doc(callableRequest.auth.uid) as DocumentReference<WebAuthnUserDocument>;
        const webAuthnUserDocumentReferenceTarget: DocumentReference<WebAuthnUserDocument> = firestore.collection("users").doc(callableRequest.data.operation === "verify authentication" && callableRequest.data.authenticationResponse.response.userHandle || callableRequest.auth.uid) as DocumentReference<WebAuthnUserDocument>;

        switch (callableRequest.data.operation) {
          case "clear challenge":
            return clearChallenge(
              {
                firestore: firestore,
                userId:    callableRequest.auth.uid,
              },
            );
          case "clear credential":
            return clearCredential(
              {
                clearingCredential: callableRequest.data.clearingCredential,
                webAuthnUserDocumentReference,
              },
            );
          case "create authentication challenge":
            return createAuthenticationChallenge(
              {
                authenticatingCredential: callableRequest.data.authenticatingCredential,
                authenticationOptions:    {
                  attestationType:       "indirect",
                  rpID:                  firebaseWebAuthnConfig.relyingPartyID || callableRequest.rawRequest.headers.origin?.split("://")[1].split(":")[0] || "",
                  supportedAlgorithmIDs: [
                    - 7,
                    - 8,
                    - 257,
                  ],
                },
                webAuthnUserDocumentReference,
              },
            );
          case "create reauthentication challenge":
            return createReauthenticationChallenge(
              {
                authenticationOptions:            {
                  attestationType:       "indirect",
                  rpID:                  firebaseWebAuthnConfig.relyingPartyID || callableRequest.rawRequest.headers.origin?.split("://")[1].split(":")[0] || "",
                  supportedAlgorithmIDs: [
                    - 7,
                    - 8,
                    - 257,
                  ],
                },
                reauthenticatingCredentialFactor: callableRequest.data.reauthenticatingCredential,
                webAuthnUserDocumentReference,
              },
            );
          case "create registration challenge":
            return createRegistrationChallenge(
              {
                registeringCredentialFactor: callableRequest.data.registeringCredential,
                registrationOptions:         {
                  attestationType:        "indirect",
                  authenticatorSelection: callableRequest.data.registeringCredential === "second" && firebaseWebAuthnConfig.authenticatorAttachment2FA ? {
                    authenticatorAttachment: firebaseWebAuthnConfig.authenticatorAttachment2FA,
                    residentKey:             "preferred",
                    userVerification:        firebaseWebAuthnConfig.authenticatorAttachment2FA === "platform" && firebaseWebAuthnConfig.userVerificationRequirement !== "discouraged" ? firebaseWebAuthnConfig.userVerificationRequirement : "preferred",
                  } : firebaseWebAuthnConfig.authenticatorAttachment ? {
                    authenticatorAttachment: firebaseWebAuthnConfig.authenticatorAttachment,
                    residentKey:             "preferred",
                    userVerification:        firebaseWebAuthnConfig.authenticatorAttachment === "platform" && firebaseWebAuthnConfig.userVerificationRequirement !== "discouraged" ? firebaseWebAuthnConfig.userVerificationRequirement : "preferred",
                  } : {
                    residentKey:      "preferred",
                    userVerification: "preferred",
                  },
                  rpID:                   firebaseWebAuthnConfig.relyingPartyID || callableRequest.rawRequest.headers.origin?.split("://")[1].split(":")[0] || "",
                  rpName:                 firebaseWebAuthnConfig.relyingPartyName,
                  supportedAlgorithmIDs:  [
                    - 7,
                    - 8,
                    - 257,
                  ],
                  userID:                 userID,
                  userName:               callableRequest.data.name,
                },
                webAuthnUserDocumentReference,
              },
            );
          case "verify authentication":
            return verifyAuthentication(
              {
                authenticationOptions:       {
                  expectedOrigin:          callableRequest.rawRequest.headers.origin || "",
                  expectedRPID:            firebaseWebAuthnConfig.relyingPartyID || callableRequest.rawRequest.headers.origin?.split("://")[1].split(":")[0] || "",
                  requireUserVerification: (firebaseWebAuthnConfig.authenticatorAttachment2FA || firebaseWebAuthnConfig.authenticatorAttachment) === "platform" && firebaseWebAuthnConfig.userVerificationRequirement !== "discouraged",
                  response:                callableRequest.data.authenticationResponse,
                },
                authenticatorAttachment:     firebaseWebAuthnConfig.authenticatorAttachment,
                authenticatorAttachment2FA:  firebaseWebAuthnConfig.authenticatorAttachment2FA,
                createCustomToken:           (uid: string) => auth.createCustomToken(uid),
                userID:                      userID,
                userVerificationRequirement: firebaseWebAuthnConfig.userVerificationRequirement,
                webAuthnUserDocumentReference,
                webAuthnUserDocumentReferenceTarget,
              },
            );
          case "verify reauthentication":
            return verifyReauthentication(
              {
                authenticationOptions:       {
                  expectedOrigin:          callableRequest.rawRequest.headers.origin || "",
                  expectedRPID:            firebaseWebAuthnConfig.relyingPartyID || callableRequest.rawRequest.headers.origin?.split("://")[1].split(":")[0] || "",
                  requireUserVerification: (firebaseWebAuthnConfig.authenticatorAttachment2FA || firebaseWebAuthnConfig.authenticatorAttachment) === "platform" && firebaseWebAuthnConfig.userVerificationRequirement !== "discouraged",
                  response:                callableRequest.data.authenticationResponse,
                },
                authenticatorAttachment:     firebaseWebAuthnConfig.authenticatorAttachment,
                authenticatorAttachment2FA:  firebaseWebAuthnConfig.authenticatorAttachment2FA,
                createCustomToken:           () => auth.createCustomToken(userID),
                userID:                      userID,
                userVerificationRequirement: firebaseWebAuthnConfig.userVerificationRequirement,
                webAuthnUserDocumentReference,
              },
            );
          case "verify registration":
            return verifyRegistration(
              {
                authenticatorAttachment:     firebaseWebAuthnConfig.authenticatorAttachment,
                authenticatorAttachment2FA:  firebaseWebAuthnConfig.authenticatorAttachment2FA,
                createCustomToken:           () => auth.createCustomToken(userID),
                registrationOptions:         {
                  expectedOrigin: callableRequest.rawRequest.headers.origin || "",
                  expectedRPID:   firebaseWebAuthnConfig.relyingPartyID || callableRequest.rawRequest.headers.origin?.split("://")[1].split(":")[0] || "",
                  response:       callableRequest.data.registrationResponse,
                },
                userVerificationRequirement: firebaseWebAuthnConfig.userVerificationRequirement,
                webAuthnUserDocumentReference,
              },
            );
        }
      } else
        return {
          code:      "missing-auth",
          message:   "No user is signed in.",
          operation: callableRequest.data.operation,
          success:   false,
        };
    },
  );
}

export {
  getFirebaseWebAuthnApi,
};
