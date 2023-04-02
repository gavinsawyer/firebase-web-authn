import { generateAuthenticationOptions, generateRegistrationOptions, VerifiedAuthenticationResponse, verifyAuthenticationResponse, VerifiedRegistrationResponse, verifyRegistrationResponse } from "@simplewebauthn/server";
import { AuthenticationResponseJSON, PublicKeyCredentialCreationOptionsJSON, PublicKeyCredentialRequestOptionsJSON, RegistrationResponseJSON }                                                from "@simplewebauthn/typescript-types";
import { FirebaseError }                                                                                                                                                                      from "firebase-admin";
import { Auth, getAuth }                                                                                                                                                                      from "firebase-admin/auth";
import { DocumentReference, DocumentSnapshot, FieldValue, Firestore, getFirestore, Timestamp }                                                                                                from "firebase-admin/firestore";
import { HttpsFunction, runWith }                                                                                                                                                             from "firebase-functions";
import { CallableContext }                                                                                                                                                                    from "firebase-functions/lib/common/providers/https";


interface ClearChallengeFunctionRequest extends UnknownFunctionRequest {
  "operation": "clear challenge",
}
interface ClearChallengeFunctionResponseSuccessful extends UnknownFunctionResponseSuccessful {
  "operation": "clear challenge",
}
interface ClearChallengeFunctionResponseUnsuccessful extends UnknownFunctionResponseUnsuccessful {
  "code": FirebaseError["code"] | "missing-auth" | "missing-user-doc" | "no-op",
  "message": FirebaseError["message"] | "No user is signed in." | "No user document was found in Firestore." | "No operation is needed.",
  "operation": "clear challenge",
}
interface ClearUserDocFunctionRequest extends UnknownFunctionRequest {
  "operation": "clear user doc",
}
interface ClearUserDocFunctionResponseSuccessful extends UnknownFunctionResponseSuccessful {
  "operation": "clear user doc",
}
interface ClearUserDocFunctionResponseUnsuccessful extends UnknownFunctionResponseUnsuccessful {
  "code": FirebaseError["code"] | "missing-auth" | "no-op",
  "message": FirebaseError["message"] | "No user is signed in." | "No operation is needed.",
  "operation": "clear user doc",
}
interface CreateAuthenticationChallengeFunctionRequest extends UnknownFunctionRequest {
  "operation": "create authentication challenge",
}
interface CreateAuthenticationChallengeFunctionResponseSuccessful extends UnknownFunctionResponseSuccessful {
  "requestOptions": PublicKeyCredentialRequestOptionsJSON,
  "operation": "create authentication challenge",
}
interface CreateAuthenticationChallengeFunctionResponseUnsuccessful extends UnknownFunctionResponseUnsuccessful {
  "code": FirebaseError["code"] | "missing-auth",
  "message": FirebaseError["message"] | "No user is signed in.",
  "operation": "create authentication challenge",
}
interface CreateReauthenticationChallengeFunctionRequest extends UnknownFunctionRequest {
  "operation": "create reauthentication challenge",
}
interface CreateReauthenticationChallengeFunctionResponseSuccessful extends UnknownFunctionResponseSuccessful {
  "requestOptions": PublicKeyCredentialRequestOptionsJSON,
  "operation": "create reauthentication challenge",
}
interface CreateReauthenticationChallengeFunctionResponseUnsuccessful extends UnknownFunctionResponseUnsuccessful {
  "code": FirebaseError["code"] | "missing-auth" | "missing-user-doc" | "user-doc-missing-passkey-fields",
  "message": FirebaseError["message"] | "No user is signed in." | "No user document was found in Firestore." | "User doc is missing passkey fields from prior operation.",
  "operation": "create reauthentication challenge",
}
interface CreateRegistrationChallengeFunctionRequest extends UnknownFunctionRequest {
  "name": string,
  "operation": "create registration challenge",
}
interface CreateRegistrationChallengeFunctionResponseSuccessful extends UnknownFunctionResponseSuccessful {
  "creationOptions": PublicKeyCredentialCreationOptionsJSON,
  "operation": "create registration challenge",
}
interface CreateRegistrationChallengeFunctionResponseUnsuccessful extends UnknownFunctionResponseUnsuccessful {
  "code": FirebaseError["code"] | "missing-auth" | "no-op",
  "message": FirebaseError["message"] | "No user is signed in." | "No operation is needed.",
  "operation": "create registration challenge",
}
interface UnknownFunctionRequest {
  "operation": "clear challenge" | "clear user doc" | "create authentication challenge" | "create reauthentication challenge" | "create registration challenge" | "verify authentication" | "verify reauthentication" | "verify registration",
}
interface UnknownFunctionResponse {
  "operation": "clear challenge" | "clear user doc" | "create authentication challenge" | "create reauthentication challenge" | "create registration challenge" | "verify authentication" | "verify reauthentication" | "verify registration",
  "success": boolean,
}
interface UnknownFunctionResponseSuccessful extends UnknownFunctionResponse {
  "success": true,
}
interface UserDocument {
  "challenge"?: string,
  "credentialCounter"?: number,
  "credentialId"?: Uint8Array,
  "credentialPublicKey"?: Uint8Array,
  "lastVerified"?: Timestamp,
}
interface VerifyAuthenticationFunctionRequest extends UnknownFunctionRequest {
  "authenticationResponse": AuthenticationResponseJSON,
  "operation": "verify authentication",
}
interface VerifyAuthenticationFunctionResponseSuccessful extends UnknownFunctionResponseSuccessful {
  "customToken": string,
  "operation": "verify authentication",
}
interface VerifyAuthenticationFunctionResponseUnsuccessful extends UnknownFunctionResponseUnsuccessful {
  "code": FirebaseError["code"] | "missing-auth" | "missing-user-doc" | "no-op" | "not-verified" | "user-doc-missing-challenge-field" | "user-doc-missing-passkey-fields",
  "message": FirebaseError["message"] | "No user is signed in." | "No user document was found in Firestore." | "No operation is needed." | "User not verified." | "User doc is missing challenge field from prior operation." | "User doc is missing passkey fields from prior operation.",
  "operation": "verify authentication",
}
interface VerifyReauthenticationFunctionRequest extends UnknownFunctionRequest {
  "authenticationResponse": AuthenticationResponseJSON,
  "operation": "verify reauthentication",
}
interface VerifyReauthenticationFunctionResponseSuccessful extends UnknownFunctionResponseSuccessful {
  "customToken": string,
  "operation": "verify reauthentication",
}
interface VerifyReauthenticationFunctionResponseUnsuccessful extends UnknownFunctionResponseUnsuccessful {
  "code": FirebaseError["code"] | "missing-auth" | "missing-user-doc" | "not-verified" | "user-doc-missing-challenge-field" | "user-doc-missing-passkey-fields",
  "message": FirebaseError["message"] | "No user is signed in." | "No user document was found in Firestore." | "User not verified." | "User doc is missing challenge field from prior operation." | "User doc is missing passkey fields from prior operation.",
  "operation": "verify reauthentication",
}
interface VerifyRegistrationFunctionRequest extends UnknownFunctionRequest {
  "operation": "verify registration",
  "registrationResponse": RegistrationResponseJSON,
}
interface VerifyRegistrationFunctionResponseSuccessful extends UnknownFunctionResponseSuccessful {
  "customToken": string,
  "operation": "verify registration",
}
interface VerifyRegistrationFunctionResponseUnsuccessful extends UnknownFunctionResponseUnsuccessful {
  "code": FirebaseError["code"] | "missing-auth" | "missing-user-doc" | "no-op" | "not-verified" | "user-doc-missing-challenge-field",
  "message": FirebaseError["message"] | "No user is signed in." | "No user document was found in Firestore." | "No operation is needed." | "User not verified." | "User doc is missing challenge field from prior operation.",
  "operation": "verify registration",
}

type ClearChallengeFunctionResponse = ClearChallengeFunctionResponseSuccessful | ClearChallengeFunctionResponseUnsuccessful;
type ClearUserDocFunctionResponse = ClearUserDocFunctionResponseSuccessful | ClearUserDocFunctionResponseUnsuccessful;
type CreateAuthenticationChallengeFunctionResponse = CreateAuthenticationChallengeFunctionResponseSuccessful | CreateAuthenticationChallengeFunctionResponseUnsuccessful;
type CreateReauthenticationChallengeFunctionResponse = CreateReauthenticationChallengeFunctionResponseSuccessful | CreateReauthenticationChallengeFunctionResponseUnsuccessful;
type CreateRegistrationChallengeFunctionResponse = CreateRegistrationChallengeFunctionResponseSuccessful | CreateRegistrationChallengeFunctionResponseUnsuccessful;
type VerifyAuthenticationFunctionResponse = VerifyAuthenticationFunctionResponseSuccessful | VerifyAuthenticationFunctionResponseUnsuccessful;
type VerifyReauthenticationFunctionResponse = VerifyReauthenticationFunctionResponseSuccessful | VerifyReauthenticationFunctionResponseUnsuccessful;
type VerifyRegistrationFunctionResponse = VerifyRegistrationFunctionResponseSuccessful | VerifyRegistrationFunctionResponseUnsuccessful;

export interface UnknownFunctionResponseUnsuccessful extends UnknownFunctionResponse {
  "code": FirebaseError["code"] | "missing-auth" | "missing-user-doc" | "no-op" | "not-verified" | "user-doc-missing-challenge-field" | "user-doc-missing-passkey-fields",
  "message": FirebaseError["message"] | "No user is signed in." | "No user document was found in Firestore." | "No operation is needed." | "User not verified." | "User doc is missing challenge field from prior operation." | "User doc is missing passkey fields from prior operation.",
  "success": false,
}

export type FunctionRequest = ClearChallengeFunctionRequest | ClearUserDocFunctionRequest | CreateAuthenticationChallengeFunctionRequest | CreateReauthenticationChallengeFunctionRequest | CreateRegistrationChallengeFunctionRequest | VerifyAuthenticationFunctionRequest | VerifyReauthenticationFunctionRequest | VerifyRegistrationFunctionRequest;
export type FunctionResponse = ClearChallengeFunctionResponse | ClearUserDocFunctionResponse | CreateAuthenticationChallengeFunctionResponse | CreateReauthenticationChallengeFunctionResponse | CreateRegistrationChallengeFunctionResponse | VerifyAuthenticationFunctionResponse | VerifyReauthenticationFunctionResponse | VerifyRegistrationFunctionResponse;

export const firebaseWebAuthn: HttpsFunction = runWith({
  enforceAppCheck: true,
})
  .https
  .onCall(async (functionRequest: FunctionRequest, callableContext: CallableContext): Promise<FunctionResponse> => callableContext.auth ? (async (auth: Auth, firestore: Firestore): Promise<FunctionResponse> => functionRequest.operation === "clear challenge" ? (firestore.collection("webAuthnUsers").doc(callableContext.auth?.uid || "") as DocumentReference<UserDocument>).get().then<FunctionResponse>((userDocumentSnapshot: DocumentSnapshot<UserDocument>): Promise<FunctionResponse> => (async (userDocument: UserDocument | undefined): Promise<FunctionResponse> => userDocument ? userDocument.challenge ? userDocument.credentialId && userDocument.credentialPublicKey ? (firestore.collection("webAuthnUsers").doc(callableContext.auth?.uid || "") as DocumentReference<UserDocument>).update({
    challenge: FieldValue.delete(),
  }).then<FunctionResponse>((): FunctionResponse => ({
    operation: functionRequest.operation,
    success: true,
  })).catch<FunctionResponse>((firebaseError: FirebaseError): FunctionResponse => ({
    code: firebaseError.code,
    message: firebaseError.message,
    operation: functionRequest.operation,
    success: false,
  })) : firestore.collection("webAuthnUsers").doc(callableContext.auth?.uid || "").delete().then<FunctionResponse>((): FunctionResponse => ({
    operation: functionRequest.operation,
    success: true,
  })).catch<FunctionResponse>((firebaseError: FirebaseError): FunctionResponse => ({
    code: firebaseError.code,
    message: firebaseError.message,
    operation: functionRequest.operation,
    success: false,
  })) : {
    code: "no-op",
    message: "No operation is needed.",
    operation: functionRequest.operation,
    success: false,
  } : {
    code: "missing-user-doc",
    message: "No user document was found in Firestore.",
    operation: functionRequest.operation,
    success: false,
  })(userDocumentSnapshot.data())).catch<FunctionResponse>((firebaseError: FirebaseError): FunctionResponse => ({
    code: firebaseError.code,
    message: firebaseError.message,
    operation: functionRequest.operation,
    success: false,
  })) : functionRequest.operation === "clear user doc" ? firestore.collection("webAuthnUsers").doc(callableContext.auth?.uid || "").get().then<FunctionResponse>((userDocumentSnapshot: DocumentSnapshot<UserDocument>): Promise<FunctionResponse> => (async (userDocument: UserDocument | undefined): Promise<FunctionResponse> => userDocument ? firestore.collection("webAuthnUsers").doc(callableContext.auth?.uid || "").delete().then<FunctionResponse>((): FunctionResponse => ({
    operation: functionRequest.operation,
    success: true,
  })).catch<FunctionResponse>((firebaseError: FirebaseError): FunctionResponse => ({
    code: firebaseError.code,
    message: firebaseError.message,
    operation: functionRequest.operation,
    success: false,
  })) : {
    code: "no-op",
    message: "No operation is needed.",
    operation: functionRequest.operation,
    success: false,
  })(userDocumentSnapshot.data())).catch<FunctionResponse>((firebaseError: FirebaseError): FunctionResponse => ({
    code: firebaseError.code,
    message: firebaseError.message,
    operation: functionRequest.operation,
    success: false,
  })) : functionRequest.operation === "create authentication challenge" ? ((publicKeyCredentialRequestOptionsJSON: PublicKeyCredentialRequestOptionsJSON): Promise<FunctionResponse> => (firestore.collection("webAuthnUsers").doc(callableContext.auth?.uid || "") as DocumentReference<UserDocument>).set({
    challenge: publicKeyCredentialRequestOptionsJSON.challenge,
  }, {
    merge: true,
  }).then<FunctionResponse>((): FunctionResponse => ({
    requestOptions: publicKeyCredentialRequestOptionsJSON,
    operation: functionRequest.operation,
    success: true,
  })).catch<FunctionResponse>((firebaseError: FirebaseError): FunctionResponse => ({
    code: firebaseError.code,
    message: firebaseError.message,
    operation: functionRequest.operation,
    success: false,
  })))(generateAuthenticationOptions({
    rpID: callableContext.rawRequest.hostname,
    userVerification: "required",
  })) : functionRequest.operation === "create reauthentication challenge" ? (firestore.collection("webAuthnUsers").doc(callableContext.auth?.uid || "") as DocumentReference<UserDocument>).get().then<FunctionResponse>((userDocumentSnapshot: DocumentSnapshot<UserDocument>): Promise<FunctionResponse> => (async (userDocument: UserDocument | undefined): Promise<FunctionResponse> => userDocument ? userDocument.credentialId && userDocument.credentialPublicKey ? ((publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptionsJSON): Promise<FunctionResponse> => (firestore.collection("webAuthnUsers").doc(callableContext.auth?.uid || "") as DocumentReference<UserDocument>).set({
    challenge: publicKeyCredentialRequestOptions.challenge,
  }, {
    merge: true,
  }).then<FunctionResponse>((): FunctionResponse => ({
    requestOptions: publicKeyCredentialRequestOptions,
    operation: functionRequest.operation,
    success: true,
  })).catch<FunctionResponse>((firebaseError: FirebaseError): FunctionResponse => ({
    code: firebaseError.code,
    message: firebaseError.message,
    operation: functionRequest.operation,
    success: false,
  })))(generateAuthenticationOptions({
    allowCredentials: [
      {
        id: userDocument.credentialId,
        type: "public-key",
      },
    ],
    rpID: callableContext.rawRequest.hostname,
    userVerification: "required",
  })) : {
    code: "user-doc-missing-passkey-fields",
    message: "User doc is missing passkey fields from prior operation.",
    operation: functionRequest.operation,
    success: false,
  } : {
    code: "missing-user-doc",
    message: "No user document was found in Firestore.",
    operation: functionRequest.operation,
    success: false,
  })(userDocumentSnapshot.data())).catch<FunctionResponse>((firebaseError: FirebaseError): FunctionResponse => ({
    code: firebaseError.code,
    message: firebaseError.message,
    operation: functionRequest.operation,
    success: false,
  })) : functionRequest.operation === "create registration challenge" ? (firestore.collection("webAuthnUsers").doc(callableContext.auth?.uid || "") as DocumentReference<UserDocument>).get().then<FunctionResponse>((userDocumentSnapshot: DocumentSnapshot<UserDocument>): Promise<FunctionResponse> => (async (userDocument: UserDocument | undefined): Promise<FunctionResponse> => !userDocument?.credentialPublicKey ? ((publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptionsJSON): Promise<FunctionResponse> => (firestore.collection("webAuthnUsers").doc(callableContext.auth?.uid || "") as DocumentReference<UserDocument>).set({
    challenge: publicKeyCredentialCreationOptions.challenge,
  }).then<FunctionResponse>((): FunctionResponse => ({
    creationOptions: publicKeyCredentialCreationOptions,
    operation: functionRequest.operation,
    success: true,
  })).catch<FunctionResponse>((firebaseError: FirebaseError): FunctionResponse => ({
    code: firebaseError.code,
    message: firebaseError.message,
    operation: functionRequest.operation,
    success: false,
  })))(generateRegistrationOptions({
    authenticatorSelection: {
      residentKey: "required",
      userVerification: "required",
    },
    rpID: callableContext.rawRequest.hostname,
    rpName: callableContext.rawRequest.hostname,
    userID: callableContext.auth?.uid || "",
    userName: functionRequest.name,
  })) : {
    code: "no-op",
    message: "No operation is needed.",
    operation: functionRequest.operation,
    success: false,
  })(userDocumentSnapshot.data())).catch<FunctionResponse>((firebaseError: FirebaseError): FunctionResponse => ({
    code: firebaseError.code,
    message: firebaseError.message,
    operation: functionRequest.operation,
    success: false,
  })) : functionRequest.operation === "verify authentication" ? functionRequest.authenticationResponse.response.userHandle !== callableContext.auth?.uid ? (firestore.collection("webAuthnUsers").doc(functionRequest.authenticationResponse.response.userHandle || "") as DocumentReference<UserDocument>).get().then<FunctionResponse>((userDocumentSnapshot: DocumentSnapshot<UserDocument>): Promise<FunctionResponse> => ((userDocument: UserDocument | undefined) => userDocument ? userDocument.credentialId && userDocument.credentialPublicKey ? (firestore.collection("webAuthnUsers").doc(callableContext.auth?.uid || "") as DocumentReference<UserDocument>).get().then((priorUserDocumentSnapshot: DocumentSnapshot<UserDocument>): Promise<FunctionResponse> => ((priorUserDocument: UserDocument | undefined): Promise<FunctionResponse> => priorUserDocument && priorUserDocument.challenge ? verifyAuthenticationResponse({
    authenticator: {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      counter: userDocument.credentialCounter!,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      credentialID: userDocument.credentialId!,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      credentialPublicKey: userDocument.credentialPublicKey!,
    },
    expectedChallenge: priorUserDocument.challenge,
    expectedOrigin: "https://" + callableContext.rawRequest.hostname,
    expectedRPID: callableContext.rawRequest.hostname,
    requireUserVerification: true,
    response: functionRequest.authenticationResponse,
  }).then<FunctionResponse>((verifiedAuthenticationResponse: VerifiedAuthenticationResponse): Promise<FunctionResponse> => verifiedAuthenticationResponse.verified ? (firestore.collection("webAuthnUsers").doc(functionRequest.authenticationResponse.response.userHandle || "") as DocumentReference<UserDocument>).update({
    challenge: FieldValue.delete(),
    lastVerified: Timestamp.fromDate(new Date()),
  }).then<FunctionResponse>((): Promise<FunctionResponse> => priorUserDocument.credentialId && priorUserDocument.credentialPublicKey ? (firestore.collection("webAuthnUsers").doc(callableContext.auth?.uid || "") as DocumentReference<UserDocument>).update({
    challenge: FieldValue.delete(),
  }).then<FunctionResponse>((): Promise<FunctionResponse> => auth.createCustomToken(functionRequest.authenticationResponse.response.userHandle || "").then<FunctionResponse>((customToken: string): FunctionResponse => ({
    customToken: customToken,
    operation: functionRequest.operation,
    success: true,
  })).catch<FunctionResponse>((firebaseError: FirebaseError): FunctionResponse => ({
    code: firebaseError.code,
    message: firebaseError.message,
    operation: functionRequest.operation,
    success: false,
  }))).catch<FunctionResponse>((firebaseError: FirebaseError): FunctionResponse => ({
    code: firebaseError.code,
    message: firebaseError.message,
    operation: functionRequest.operation,
    success: false,
  })) : firestore.collection("webAuthnUsers").doc(callableContext.auth?.uid || "").delete().then<FunctionResponse>((): Promise<FunctionResponse> => auth.createCustomToken(functionRequest.authenticationResponse.response.userHandle || "").then<FunctionResponse>((customToken: string): FunctionResponse => ({
    customToken: customToken,
    operation: functionRequest.operation,
    success: true,
  })).catch<FunctionResponse>((firebaseError: FirebaseError): FunctionResponse => ({
    code: firebaseError.code,
    message: firebaseError.message,
    operation: functionRequest.operation,
    success: false,
  }))).catch<FunctionResponse>((firebaseError: FirebaseError): FunctionResponse => ({
    code: firebaseError.code,
    message: firebaseError.message,
    operation: functionRequest.operation,
    success: false,
  }))).catch<FunctionResponse>((firebaseError: FirebaseError): FunctionResponse => ({
    code: firebaseError.code,
    message: firebaseError.message,
    operation: functionRequest.operation,
    success: false,
  })) : firestore.collection("webAuthnUsers").doc(callableContext.auth?.uid || "").delete().then<FunctionResponse>((): FunctionResponse => ({
    code: "not-verified",
    message: "User not verified.",
    operation: functionRequest.operation,
    success: false,
  })).catch<FunctionResponse>((firebaseError: FirebaseError): FunctionResponse => ({
    code: firebaseError.code,
    message: firebaseError.message,
    operation: functionRequest.operation,
    success: false,
  }))) : firestore.collection("webAuthnUsers").doc(callableContext.auth?.uid || "").delete().then<FunctionResponse>((): FunctionResponse => ({
    code: "user-doc-missing-challenge-field",
    message: "User doc is missing challenge field from prior operation.",
    operation: functionRequest.operation,
    success: false,
  })).catch<FunctionResponse>((firebaseError: FirebaseError): FunctionResponse => ({
    code: firebaseError.code,
    message: firebaseError.message,
    operation: functionRequest.operation,
    success: false,
  })))(priorUserDocumentSnapshot.data())) : firestore.collection("webAuthnUsers").doc(callableContext.auth?.uid || "").delete().then<FunctionResponse>((): FunctionResponse => ({
    code: "user-doc-missing-passkey-fields",
    message: "User doc is missing passkey fields from prior operation.",
    operation: functionRequest.operation,
    success: false,
  })).catch<FunctionResponse>((firebaseError: FirebaseError): FunctionResponse => ({
    code: firebaseError.code,
    message: firebaseError.message,
    operation: functionRequest.operation,
    success: false,
  })) : firestore.collection("webAuthnUsers").doc(callableContext.auth?.uid || "").delete().then<FunctionResponse>((): FunctionResponse => ({
    code: "missing-user-doc",
    message: "No user document was found in Firestore.",
    operation: functionRequest.operation,
    success: false,
  })).catch<FunctionResponse>((firebaseError: FirebaseError): FunctionResponse => ({
    code: firebaseError.code,
    message: firebaseError.message,
    operation: functionRequest.operation,
    success: false,
  })))(userDocumentSnapshot.data())) : (firestore.collection("webAuthnUsers").doc(callableContext.auth?.uid || "") as DocumentReference<UserDocument>).update({
    challenge: FieldValue.delete(),
  }).then<FunctionResponse>((): FunctionResponse => ({
    code: "no-op",
    message: "No operation is needed.",
    operation: functionRequest.operation,
    success: false,
  })).catch<FunctionResponse>((firebaseError: FirebaseError): FunctionResponse => ({
    code: firebaseError.code,
    message: firebaseError.message,
    operation: functionRequest.operation,
    success: false,
  })) : functionRequest.operation === "verify reauthentication" ? (firestore.collection("webAuthnUsers").doc(callableContext.auth?.uid || "") as DocumentReference<UserDocument>).get().then<FunctionResponse>((userDocumentSnapshot: DocumentSnapshot<UserDocument>): Promise<FunctionResponse> => (async (userDocument: UserDocument | undefined): Promise<FunctionResponse> => userDocument ? userDocument.credentialId && userDocument.credentialPublicKey ? (async (): Promise<FunctionResponse> => userDocument.challenge ? verifyAuthenticationResponse({
    authenticator: {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      counter: userDocument.credentialCounter!,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      credentialID: userDocument.credentialId!,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      credentialPublicKey: userDocument.credentialPublicKey!,
    },
    expectedChallenge: userDocument.challenge,
    expectedOrigin: "https://" + callableContext.rawRequest.hostname,
    expectedRPID: callableContext.rawRequest.hostname,
    requireUserVerification: true,
    response: functionRequest.authenticationResponse,
  }).then<FunctionResponse>((verifiedAuthenticationResponse: VerifiedAuthenticationResponse): Promise<FunctionResponse> => verifiedAuthenticationResponse.verified ? (firestore.collection("webAuthnUsers").doc(callableContext.auth?.uid || "") as DocumentReference<UserDocument>).update({
    challenge: FieldValue.delete(),
    lastVerified: Timestamp.fromDate(new Date()),
  }).then<FunctionResponse>((): Promise<FunctionResponse> => auth.createCustomToken(callableContext.auth?.uid || "").then<FunctionResponse>((customToken: string): FunctionResponse => ({
    customToken: customToken,
    operation: functionRequest.operation,
    success: true,
  })).catch<FunctionResponse>((firebaseError: FirebaseError): FunctionResponse => ({
    code: firebaseError.code,
    message: firebaseError.message,
    operation: functionRequest.operation,
    success: false,
  }))).catch<FunctionResponse>((firebaseError: FirebaseError): FunctionResponse => ({
    code: firebaseError.code,
    message: firebaseError.message,
    operation: functionRequest.operation,
    success: false,
  })) : (firestore.collection("webAuthnUsers").doc(callableContext.auth?.uid || "") as DocumentReference<UserDocument>).update({
    challenge: FieldValue.delete(),
  }).then<FunctionResponse>((): FunctionResponse => ({
    code: "not-verified",
    message: "User not verified.",
    operation: functionRequest.operation,
    success: false,
  })).catch<FunctionResponse>((firebaseError: FirebaseError): FunctionResponse => ({
    code: firebaseError.code,
    message: firebaseError.message,
    operation: functionRequest.operation,
    success: false,
  }))) : {
    code: "user-doc-missing-challenge-field",
    message: "User doc is missing challenge field from prior operation.",
    operation: functionRequest.operation,
    success: false,
  })() : firestore.collection("webAuthnUsers").doc(callableContext.auth?.uid || "").delete().then<FunctionResponse>((): FunctionResponse => ({
    code: "user-doc-missing-passkey-fields",
    message: "User doc is missing passkey fields from prior operation.",
    operation: functionRequest.operation,
    success: false,
  })).catch<FunctionResponse>((firebaseError: FirebaseError): FunctionResponse => ({
    code: firebaseError.code,
    message: firebaseError.message,
    operation: functionRequest.operation,
    success: false,
  })) : {
    code: "missing-user-doc",
    message: "No user document was found in Firestore.",
    operation: functionRequest.operation,
    success: false,
  })(userDocumentSnapshot.data())) : functionRequest.operation === "verify registration" ? (firestore.collection("webAuthnUsers").doc(callableContext.auth?.uid || "") as DocumentReference<UserDocument>).get().then<FunctionResponse>((userDocumentSnapshot: DocumentSnapshot<UserDocument>): Promise<FunctionResponse> => (async (userDocument: UserDocument | undefined): Promise<FunctionResponse> => userDocument ? userDocument.challenge ? !userDocument.credentialPublicKey ? verifyRegistrationResponse({
    expectedChallenge: userDocument["challenge"],
    expectedOrigin: "https://" + callableContext.rawRequest.hostname,
    expectedRPID: callableContext.rawRequest.hostname,
    requireUserVerification: true,
    response: functionRequest.registrationResponse,
  }).then<FunctionResponse>((verifiedRegistrationResponse: VerifiedRegistrationResponse): Promise<FunctionResponse> => verifiedRegistrationResponse.verified ? (firestore.collection("webAuthnUsers").doc(callableContext.auth?.uid || "") as DocumentReference<UserDocument | undefined>).update({
    challenge: FieldValue.delete(),
    credentialCounter: verifiedRegistrationResponse.registrationInfo?.counter,
    credentialId: verifiedRegistrationResponse.registrationInfo?.credentialID,
    credentialPublicKey: verifiedRegistrationResponse.registrationInfo?.credentialPublicKey,
    lastVerified: Timestamp.fromDate(new Date()),
  }).then<FunctionResponse>((): Promise<FunctionResponse> => auth.createCustomToken(callableContext.auth?.uid || "").then<FunctionResponse>((customToken: string): FunctionResponse => ({
    customToken: customToken,
    operation: functionRequest.operation,
    success: true,
  })).catch<FunctionResponse>((firebaseError: FirebaseError): FunctionResponse => ({
    code: firebaseError.code,
    message: firebaseError.message,
    operation: functionRequest.operation,
    success: false,
  }))).catch<FunctionResponse>((firebaseError: FirebaseError): FunctionResponse => ({
    code: firebaseError.code,
    message: firebaseError.message,
    operation: functionRequest.operation,
    success: false,
  })) : firestore.collection("webAuthnUsers").doc(callableContext.auth?.uid || "").delete().then<FunctionResponse>((): FunctionResponse => ({
    code: "not-verified",
    message: "User not verified.",
    operation: functionRequest.operation,
    success: false,
  })).catch<FunctionResponse>((firebaseError: FirebaseError): FunctionResponse => ({
    code: firebaseError.code,
    message: firebaseError.message,
    operation: functionRequest.operation,
    success: false,
  }))) : (firestore.collection("webAuthnUsers").doc(callableContext.auth?.uid || "") as DocumentReference<UserDocument>).update({
    challenge: FieldValue.delete(),
  }).then<FunctionResponse>((): FunctionResponse => ({
    code: "no-op",
    message: "No operation is needed.",
    operation: functionRequest.operation,
    success: false,
  })).catch<FunctionResponse>((firebaseError: FirebaseError): FunctionResponse => ({
    code: firebaseError.code,
    message: firebaseError.message,
    operation: functionRequest.operation,
    success: false,
  })) : firestore.collection("webAuthnUsers").doc(callableContext.auth?.uid || "").delete().then<FunctionResponse>((): FunctionResponse => ({
    code: "user-doc-missing-challenge-field",
    message: "User doc is missing challenge field from prior operation.",
    operation: functionRequest.operation,
    success: false,
  })).catch<FunctionResponse>((firebaseError: FirebaseError): FunctionResponse => ({
    code: firebaseError.code,
    message: firebaseError.message,
    operation: functionRequest.operation,
    success: false,
  })) : {
    code: "missing-user-doc",
    message: "No user document was found in Firestore.",
    operation: functionRequest.operation,
    success: false,
  })(userDocumentSnapshot.data())).catch<FunctionResponse>((firebaseError: FirebaseError): FunctionResponse => ({
    code: firebaseError.code,
    message: firebaseError.message,
    operation: functionRequest.operation,
    success: false,
  })) : ((): never => {
    throw new Error("Invalid function request type.");
  })())(getAuth(), getFirestore()) : {
    code: "missing-auth",
    message: "No user is signed in.",
    operation: functionRequest.operation,
    success: false,
  });
