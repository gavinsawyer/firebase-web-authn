import { FunctionRequest, FunctionResponse, WebAuthnUserDocument }                                                                                                                                        from "@firebase-web-authn/types";
import { App }                                                                                                                                                                                            from "firebase-admin/app";
import { Auth, getAuth }                                                                                                                                                                                  from "firebase-admin/auth";
import { DocumentReference, Firestore, getFirestore }                                                                                                                                                     from "firebase-admin/firestore";
import { CallableFunction, CallableRequest, onCall }                                                                                                                                                      from "firebase-functions/v2/https";
import { clearChallenge, clearCredential, createAuthenticationChallenge, createReauthenticationChallenge, createRegistrationChallenge, verifyAuthentication, verifyReauthentication, verifyRegistration } from "./function responses";
import { FirebaseWebAuthnConfig }                                                                                                                                                                         from "./interfaces";


/**
 * @param firebaseWebAuthnConfig - Configuration for your WebAuthn Cloud Function.
 * @param app - An optional {@link App} to use with Firebase Auth and Firestore.
 *
 * @returns
 *  A {@link CallableFunction} which will need to be exported from your Firebase Functions package index.
 */
export const getFirebaseWebAuthnApi: (firebaseWebAuthnConfig: FirebaseWebAuthnConfig, app?: App) => CallableFunction<FunctionRequest, Promise<FunctionResponse>> = (firebaseWebAuthnConfig: FirebaseWebAuthnConfig, app?: App): CallableFunction<FunctionRequest, Promise<FunctionResponse>> => onCall<FunctionRequest, Promise<FunctionResponse>>(
  {
    enforceAppCheck: true,
    ingressSettings: "ALLOW_ALL",
  },
  async (callableRequest: CallableRequest<FunctionRequest>): Promise<FunctionResponse> => callableRequest.auth ? ((firestore: Firestore): Promise<FunctionResponse> => (async (auth: Auth, userID: string, webAuthnUserDocumentReference: DocumentReference<WebAuthnUserDocument>, webAuthnUserDocumentReferenceTarget: DocumentReference<WebAuthnUserDocument>): Promise<FunctionResponse> => callableRequest.data.operation === "clear challenge" ? clearChallenge(
    {
      webAuthnUserDocumentReference: webAuthnUserDocumentReference,
    },
  ) : callableRequest.data.operation == "clear credential" ? clearCredential(
    {
      clearingCredential:            callableRequest.data.clearingCredential,
      webAuthnUserDocumentReference: webAuthnUserDocumentReference,
    },
  ) : callableRequest.data.operation === "create authentication challenge" ? createAuthenticationChallenge(
    {
      authenticatingCredential:      callableRequest.data.authenticatingCredential,
      authenticationOptions:         {
        attestationType:       "indirect",
        rpID:                  firebaseWebAuthnConfig.relyingPartyID || callableRequest.rawRequest.headers.origin?.split("://")[1].split(":")[0] || "",
        supportedAlgorithmIDs: [
          - 7,
          - 8,
          - 257,
        ],
      },
      webAuthnUserDocumentReference: webAuthnUserDocumentReference,
    },
  ) : callableRequest.data.operation === "create reauthentication challenge" ? createReauthenticationChallenge(
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
      webAuthnUserDocumentReference:    webAuthnUserDocumentReference,
    },
  ) : callableRequest.data.operation === "create registration challenge" ? createRegistrationChallenge(
    {
      registeringCredentialFactor:   callableRequest.data.registeringCredential,
      registrationOptions:           {
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
      webAuthnUserDocumentReference: webAuthnUserDocumentReference,
    },
  ) : callableRequest.data.operation === "verify authentication" ? verifyAuthentication(
    {
      authenticationOptions:               {
        expectedOrigin:          callableRequest.rawRequest.headers.origin || "",
        expectedRPID:            firebaseWebAuthnConfig.relyingPartyID || callableRequest.rawRequest.headers.origin?.split("://")[1].split(":")[0] || "",
        requireUserVerification: (firebaseWebAuthnConfig.authenticatorAttachment2FA || firebaseWebAuthnConfig.authenticatorAttachment) === "platform" && firebaseWebAuthnConfig.userVerificationRequirement !== "discouraged",
        response:                callableRequest.data.authenticationResponse,
      },
      authenticatorAttachment:             firebaseWebAuthnConfig.authenticatorAttachment,
      authenticatorAttachment2FA:          firebaseWebAuthnConfig.authenticatorAttachment2FA,
      createCustomToken:                   (uid: string) => auth.createCustomToken(uid),
      userID:                              userID,
      userVerificationRequirement:         firebaseWebAuthnConfig.userVerificationRequirement,
      webAuthnUserDocumentReference:       webAuthnUserDocumentReference,
      webAuthnUserDocumentReferenceTarget: webAuthnUserDocumentReferenceTarget,
    },
  ) : callableRequest.data.operation === "verify reauthentication" ? verifyReauthentication(
    {
      authenticationOptions:         {
        expectedOrigin:          callableRequest.rawRequest.headers.origin || "",
        expectedRPID:            firebaseWebAuthnConfig.relyingPartyID || callableRequest.rawRequest.headers.origin?.split("://")[1].split(":")[0] || "",
        requireUserVerification: (firebaseWebAuthnConfig.authenticatorAttachment2FA || firebaseWebAuthnConfig.authenticatorAttachment) === "platform" && firebaseWebAuthnConfig.userVerificationRequirement !== "discouraged",
        response:                callableRequest.data.authenticationResponse,
      },
      authenticatorAttachment:       firebaseWebAuthnConfig.authenticatorAttachment,
      authenticatorAttachment2FA:    firebaseWebAuthnConfig.authenticatorAttachment2FA,
      createCustomToken:             () => auth.createCustomToken(userID),
      userID:                        userID,
      userVerificationRequirement:   firebaseWebAuthnConfig.userVerificationRequirement,
      webAuthnUserDocumentReference: webAuthnUserDocumentReference,
    },
  ) : callableRequest.data.operation === "verify registration" ? verifyRegistration(
    {
      authenticatorAttachment:       firebaseWebAuthnConfig.authenticatorAttachment,
      authenticatorAttachment2FA:    firebaseWebAuthnConfig.authenticatorAttachment2FA,
      createCustomToken:             () => auth.createCustomToken(userID),
      registrationOptions:           {
        expectedOrigin: callableRequest.rawRequest.headers.origin || "",
        expectedRPID:   firebaseWebAuthnConfig.relyingPartyID || callableRequest.rawRequest.headers.origin?.split("://")[1].split(":")[0] || "",
        response:       callableRequest.data.registrationResponse,
      },
      userVerificationRequirement:   firebaseWebAuthnConfig.userVerificationRequirement,
      webAuthnUserDocumentReference: webAuthnUserDocumentReference,
    },
  ) : ((): never => {
    throw new Error("Invalid operation.");
  })())(
    app ? getAuth(app) : getAuth(),
    callableRequest.auth.uid,
    firestore.collection("users").doc(callableRequest.auth.uid) as DocumentReference<WebAuthnUserDocument>,
    firestore.collection("users").doc(callableRequest.data.operation === "verify authentication" && callableRequest.data.authenticationResponse.response.userHandle || callableRequest.auth.uid) as DocumentReference<WebAuthnUserDocument>,
  ))(
    app ? getFirestore(
      app,
      "ext-firebase-web-authn",
    ) : getFirestore("ext-firebase-web-authn"),
  ) : {
    code:      "missing-auth",
    message:   "No user is signed in.",
    operation: callableRequest.data.operation,
    success:   false,
  },
);
