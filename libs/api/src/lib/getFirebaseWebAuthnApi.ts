import { FunctionRequest, FunctionResponse, WebAuthnUserDocument }                                                                                                                                        from "@firebase-web-authn/types";
import { App }                                                                                                                                                                                            from "firebase-admin/app";
import { Auth, getAuth }                                                                                                                                                                                  from "firebase-admin/auth";
import { CollectionReference, DocumentReference, Firestore, getFirestore }                                                                                                                                from "firebase-admin/firestore";
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
  async (callableRequest: CallableRequest<FunctionRequest>): Promise<FunctionResponse> => callableRequest.auth ? ((firestore: Firestore): Promise<FunctionResponse> => (async (auth: Auth, userID: string, webAuthnUserCollectionReference: CollectionReference<WebAuthnUserDocument>, webAuthnUserDocumentReference: DocumentReference<WebAuthnUserDocument>): Promise<FunctionResponse> => callableRequest.data.operation === "clear challenge" ? clearChallenge(
    {
      webAuthnUserDocumentReference: webAuthnUserDocumentReference,
    },
  ) : callableRequest.data.operation == "clear credential" ? clearCredential(
    {
      clearingCredentialType:        callableRequest.data.clearingCredentialType,
      webAuthnUserDocumentReference: webAuthnUserDocumentReference,
    },
  ) : callableRequest.data.operation === "create authentication challenge" ? createAuthenticationChallenge(
    {
      authenticatorAttachment:       firebaseWebAuthnConfig.authenticatorAttachment,
      authenticatingCredentialType:  callableRequest.data.authenticatingCredentialType,
      backupAuthenticatorAttachment: firebaseWebAuthnConfig.backupAuthenticatorAttachment,
      hostname:                      callableRequest.rawRequest.hostname,
      userVerificationRequirement:   firebaseWebAuthnConfig.userVerificationRequirement,
      webAuthnUserDocumentReference: webAuthnUserDocumentReference,
    },
  ) : callableRequest.data.operation === "create reauthentication challenge" ? createReauthenticationChallenge(
    {
      authenticatorAttachment:        firebaseWebAuthnConfig.authenticatorAttachment,
      backupAuthenticatorAttachment:  firebaseWebAuthnConfig.backupAuthenticatorAttachment,
      hostname:                       callableRequest.rawRequest.hostname,
      reauthenticatingCredentialType: callableRequest.data.reauthenticatingCredentialType,
      userVerificationRequirement:    firebaseWebAuthnConfig.userVerificationRequirement,
      webAuthnUserDocumentReference:  webAuthnUserDocumentReference,
    },
  ) : callableRequest.data.operation === "create registration challenge" ? createRegistrationChallenge(
    {
      authenticatorAttachment:       firebaseWebAuthnConfig.authenticatorAttachment,
      backupAuthenticatorAttachment: firebaseWebAuthnConfig.backupAuthenticatorAttachment,
      hostname:                      callableRequest.rawRequest.hostname,
      registeringCredentialType:     callableRequest.data.registeringCredentialType,
      relyingPartyName:              firebaseWebAuthnConfig.relyingPartyName,
      userID:                        userID,
      userName:                      callableRequest.data.name,
      userVerificationRequirement:   firebaseWebAuthnConfig.userVerificationRequirement,
      webAuthnUserDocumentReference: webAuthnUserDocumentReference,
    },
  ) : callableRequest.data.operation === "verify authentication" ? verifyAuthentication(
    {
      authenticationResponse:          callableRequest.data.authenticationResponse,
      authenticatorAttachment:       firebaseWebAuthnConfig.authenticatorAttachment,
      backupAuthenticatorAttachment: firebaseWebAuthnConfig.backupAuthenticatorAttachment,
      createCustomToken:               (uid: string) => auth.createCustomToken(uid),
      hostname:                        callableRequest.rawRequest.hostname,
      userID:                          userID,
      userVerificationRequirement:     firebaseWebAuthnConfig.userVerificationRequirement,
      webAuthnUserCollectionReference: webAuthnUserCollectionReference,
      webAuthnUserDocumentReference:   webAuthnUserDocumentReference,
    },
  ) : callableRequest.data.operation === "verify reauthentication" ? verifyReauthentication(
    {
      authenticationResponse:        callableRequest.data.authenticationResponse,
      authenticatorAttachment:       firebaseWebAuthnConfig.authenticatorAttachment,
      backupAuthenticatorAttachment: firebaseWebAuthnConfig.backupAuthenticatorAttachment,
      createCustomToken:             () => auth.createCustomToken(userID),
      hostname:                      callableRequest.rawRequest.hostname,
      userVerificationRequirement:   firebaseWebAuthnConfig.userVerificationRequirement,
      webAuthnUserDocumentReference: webAuthnUserDocumentReference,
    },
  ) : callableRequest.data.operation === "verify registration" ? verifyRegistration(
    {
      authenticatorAttachment:       firebaseWebAuthnConfig.authenticatorAttachment,
      backupAuthenticatorAttachment: firebaseWebAuthnConfig.backupAuthenticatorAttachment,
      createCustomToken:             () => auth.createCustomToken(userID),
      hostname:                      callableRequest.rawRequest.hostname,
      registrationResponse:          callableRequest.data.registrationResponse,
      userVerificationRequirement:   firebaseWebAuthnConfig.userVerificationRequirement,
      webAuthnUserDocumentReference: webAuthnUserDocumentReference,
    },
  ) : ((): never => {
    throw new Error("Invalid operation.");
  })())(
    app ? getAuth(app) : getAuth(),
    callableRequest.auth.uid,
    firestore.collection("users") as CollectionReference<WebAuthnUserDocument>,
    firestore.collection("users").doc(callableRequest.auth.uid) as DocumentReference<WebAuthnUserDocument>,
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
