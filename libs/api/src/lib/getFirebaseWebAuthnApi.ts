import { FunctionRequest, FunctionResponse, WebAuthnUserDocument }                                                                                                                                     from "@firebase-web-authn/types";
import { App }                                                                                                                                                                                         from "firebase-admin/app";
import { Auth, getAuth }                                                                                                                                                                               from "firebase-admin/auth";
import { CollectionReference, DocumentReference, Firestore, getFirestore }                                                                                                                             from "firebase-admin/firestore";
import { HttpsFunction, runWith }                                                                                                                                                                      from "firebase-functions";
import { clearChallenge, clearUserDoc, createAuthenticationChallenge, createReauthenticationChallenge, createRegistrationChallenge, verifyAuthentication, verifyReauthentication, verifyRegistration } from "./function responses";
import { FirebaseWebAuthnConfig }                                                                                                                                                                      from "./interfaces";


/**
 * @param firebaseWebAuthnConfig - Configuration for your WebAuthn Cloud Function.
 * @param app - An optional {@link App} to use with Firebase Auth and Firestore.
 *
 * @returns
 *  An {@link HttpsFunction} which will need to be exported from your Firebase Functions package index.
 */
export const getFirebaseWebAuthnApi: (firebaseWebAuthnConfig: FirebaseWebAuthnConfig, app?: App) => HttpsFunction = (firebaseWebAuthnConfig: FirebaseWebAuthnConfig, app?: App): HttpsFunction => runWith({
  enforceAppCheck: true,
  ingressSettings: "ALLOW_ALL",
})
  .https
  .onCall(
    async (functionRequest: FunctionRequest, callableContext): Promise<FunctionResponse> => callableContext.auth ? ((firestore: Firestore): Promise<FunctionResponse> => (async (createCustomToken: () => Promise<string>, userID: string, webAuthnUserCollectionReference: CollectionReference<WebAuthnUserDocument>, webAuthnUserDocumentReference: DocumentReference<WebAuthnUserDocument>): Promise<FunctionResponse> => functionRequest.operation === "clear challenge" ? clearChallenge(
      {
        webAuthnUserDocumentReference: webAuthnUserDocumentReference,
      },
    ) : functionRequest.operation == "clear user doc" ? clearUserDoc(
      {
        webAuthnUserDocumentReference: webAuthnUserDocumentReference,
      },
    ) : functionRequest.operation === "create authentication challenge" ? createAuthenticationChallenge(
      {
        hostname:                      callableContext.rawRequest.hostname,
        userVerificationRequirement:   firebaseWebAuthnConfig.userVerificationRequirement,
        webAuthnUserDocumentReference: webAuthnUserDocumentReference,
      },
    ) : functionRequest.operation === "create reauthentication challenge" ? createReauthenticationChallenge(
      {
        hostname:                      callableContext.rawRequest.hostname,
        userVerificationRequirement:   firebaseWebAuthnConfig.userVerificationRequirement,
        webAuthnUserDocumentReference: webAuthnUserDocumentReference,
      },
    ) : functionRequest.operation === "create registration challenge" ? createRegistrationChallenge(
      {
        authenticatorAttachment:       firebaseWebAuthnConfig.authenticatorAttachment,
        hostname:                      callableContext.rawRequest.hostname,
        relyingPartyName:              firebaseWebAuthnConfig.relyingPartyName,
        userID:                        userID,
        userName:                      functionRequest.name,
        userVerificationRequirement:   firebaseWebAuthnConfig.userVerificationRequirement,
        webAuthnUserDocumentReference: webAuthnUserDocumentReference,
      },
    ) : functionRequest.operation === "verify authentication" ? verifyAuthentication(
      {
        authenticationResponse:          functionRequest.authenticationResponse,
        createCustomToken:               createCustomToken,
        hostname:                        callableContext.rawRequest.hostname,
        userID:                          userID,
        webAuthnUserCollectionReference: webAuthnUserCollectionReference,
        webAuthnUserDocumentReference:   webAuthnUserDocumentReference,
      },
    ) : functionRequest.operation === "verify reauthentication" ? verifyReauthentication(
      {
        authenticationResponse:        functionRequest.authenticationResponse,
        createCustomToken:             createCustomToken,
        hostname:                      callableContext.rawRequest.hostname,
        webAuthnUserDocumentReference: webAuthnUserDocumentReference,
      },
    ) : functionRequest.operation === "verify registration" ? verifyRegistration(
      {
        createCustomToken:             createCustomToken,
        hostname:                      callableContext.rawRequest.hostname,
        registrationResponse:          functionRequest.registrationResponse,
        webAuthnUserDocumentReference: webAuthnUserDocumentReference,
      },
    ) : ((): never => {
      throw new Error("Invalid operation.");
    })())(
      ((auth: Auth): () => Promise<string> => () => auth.createCustomToken(callableContext.auth?.uid || ""))(app ? getAuth(app) : getAuth()),
      callableContext.auth.uid,
      firestore.collection("users") as CollectionReference<WebAuthnUserDocument>,
      firestore.collection("users").doc(callableContext.auth?.uid || "") as DocumentReference<WebAuthnUserDocument>,
    ))(
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
