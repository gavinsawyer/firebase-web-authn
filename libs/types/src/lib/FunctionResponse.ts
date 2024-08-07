import { PublicKeyCredentialCreationOptionsJSON, PublicKeyCredentialRequestOptionsJSON } from "@simplewebauthn/types";
import { FirebaseError }                                                                 from "firebase-admin";
import { WebAuthnUserCredentialFactor }                                                  from "./WebAuthnUserCredentialFactor.js";


interface UnknownFunctionResponse {
  "operation": "clear challenge" | "clear credential" | "create authentication challenge" | "create reauthentication challenge" | "create registration challenge" | "verify authentication" | "verify reauthentication" | "verify registration";
  "success": boolean;
}

interface UnknownFunctionResponseSuccessful extends UnknownFunctionResponse {
  "success": true;
}

interface UnknownFunctionResponseUnsuccessful extends UnknownFunctionResponse {
  "code": FirebaseError["code"] | "missing-auth" | "missing-user-doc" | "no-op" | "not-verified" | "user-doc-missing-challenge-field" | "user-doc-missing-passkey-fields";
  "message": FirebaseError["message"] | "No user is signed in." | "No user document was found in Firestore." | "No operation is needed." | "User not verified." | "User doc is missing challenge field from prior operation." | "User doc is missing passkey fields from prior operation.";
  "success": false;
}

interface ClearChallengeFunctionResponseSuccessful extends UnknownFunctionResponseSuccessful {
  "operation": "clear challenge";
}

interface ClearChallengeFunctionResponseUnsuccessful extends UnknownFunctionResponseUnsuccessful {
  "code": FirebaseError["code"] | "missing-auth" | "missing-user-doc" | "no-op";
  "message": FirebaseError["message"] | "No user is signed in." | "No user document was found in Firestore." | "No operation is needed.";
  "operation": "clear challenge";
}

interface ClearUserDocFunctionResponseSuccessful extends UnknownFunctionResponseSuccessful {
  "clearingCredential"?: WebAuthnUserCredentialFactor;
  "operation": "clear credential";
}

interface ClearUserDocFunctionResponseUnsuccessful extends UnknownFunctionResponseUnsuccessful {
  "code": FirebaseError["code"] | "missing-auth" | "no-op";
  "message": FirebaseError["message"] | "No user is signed in." | "No operation is needed.";
  "operation": "clear credential";
}

interface CreateAuthenticationChallengeFunctionResponseSuccessful extends UnknownFunctionResponseSuccessful {
  "authenticatingCredential"?: WebAuthnUserCredentialFactor;
  "requestOptions": PublicKeyCredentialRequestOptionsJSON;
  "operation": "create authentication challenge";
}

interface CreateAuthenticationChallengeFunctionResponseUnsuccessful extends UnknownFunctionResponseUnsuccessful {
  "code": FirebaseError["code"] | "missing-auth";
  "message": FirebaseError["message"] | "No user is signed in.";
  "operation": "create authentication challenge";
}

interface CreateReauthenticationChallengeFunctionResponseSuccessful extends UnknownFunctionResponseSuccessful {
  "operation": "create reauthentication challenge";
  "reauthenticatingCredential"?: WebAuthnUserCredentialFactor;
  "requestOptions": PublicKeyCredentialRequestOptionsJSON;
}

interface CreateReauthenticationChallengeFunctionResponseUnsuccessful extends UnknownFunctionResponseUnsuccessful {
  "code": FirebaseError["code"] | "missing-auth" | "missing-user-doc" | "user-doc-missing-passkey-fields";
  "message": FirebaseError["message"] | "No user is signed in." | "No user document was found in Firestore." | "User doc is missing passkey fields from prior operation.";
  "operation": "create reauthentication challenge";
}

interface CreateRegistrationChallengeFunctionResponseSuccessful extends UnknownFunctionResponseSuccessful {
  "registeringCredential": WebAuthnUserCredentialFactor;
  "creationOptions": PublicKeyCredentialCreationOptionsJSON;
  "operation": "create registration challenge";
}

interface CreateRegistrationChallengeFunctionResponseUnsuccessful extends UnknownFunctionResponseUnsuccessful {
  "code": FirebaseError["code"] | "missing-auth" | "missing-primary" | "no-op";
  "message": FirebaseError["message"] | "No user is signed in." | "No primary passkey was found in Firestore." | "No operation is needed.";
  "operation": "create registration challenge";
}

interface VerifyAuthenticationFunctionResponseSuccessful extends UnknownFunctionResponseSuccessful {
  "authenticatedCredential": WebAuthnUserCredentialFactor;
  "customToken": string;
  "operation": "verify authentication";
}

interface VerifyAuthenticationFunctionResponseUnsuccessful extends UnknownFunctionResponseUnsuccessful {
  "code": FirebaseError["code"] | "missing-auth" | "missing-user-doc" | "no-op" | "not-verified" | "user-doc-missing-challenge-field" | "user-doc-missing-passkey-fields";
  "message": FirebaseError["message"] | "No user is signed in." | "No user document was found in Firestore." | "No operation is needed." | "User not verified." | "User doc is missing challenge field from prior operation." | "User doc is missing passkey fields from prior operation.";
  "operation": "verify authentication";
}

interface VerifyReauthenticationFunctionResponseSuccessful extends UnknownFunctionResponseSuccessful {
  "customToken": string;
  "operation": "verify reauthentication";
  "reauthenticatedCredential": WebAuthnUserCredentialFactor;
}

interface VerifyReauthenticationFunctionResponseUnsuccessful extends UnknownFunctionResponseUnsuccessful {
  "code": FirebaseError["code"] | "missing-auth" | "missing-user-doc" | "not-verified" | "user-doc-missing-challenge-field" | "user-doc-missing-passkey-fields";
  "message": FirebaseError["message"] | "No user is signed in." | "No user document was found in Firestore." | "User not verified." | "User doc is missing challenge field from prior operation." | "User doc is missing passkey fields from prior operation.";
  "operation": "verify reauthentication";
}

interface VerifyRegistrationFunctionResponseSuccessful extends UnknownFunctionResponseSuccessful {
  "customToken": string;
  "operation": "verify registration";
  "registeredCredential": WebAuthnUserCredentialFactor;
}

interface VerifyRegistrationFunctionResponseUnsuccessful extends UnknownFunctionResponseUnsuccessful {
  "code": FirebaseError["code"] | "missing-auth" | "missing-user-doc" | "no-op" | "not-verified" | "user-doc-missing-challenge-field";
  "message": FirebaseError["message"] | "No user is signed in." | "No user document was found in Firestore." | "No operation is needed." | "User not verified." | "User doc is missing challenge field from prior operation.";
  "operation": "verify registration";
}

type ClearChallengeFunctionResponse = ClearChallengeFunctionResponseSuccessful | ClearChallengeFunctionResponseUnsuccessful
type ClearUserDocFunctionResponse = ClearUserDocFunctionResponseSuccessful | ClearUserDocFunctionResponseUnsuccessful
type CreateAuthenticationChallengeFunctionResponse = CreateAuthenticationChallengeFunctionResponseSuccessful | CreateAuthenticationChallengeFunctionResponseUnsuccessful
type CreateReauthenticationChallengeFunctionResponse = CreateReauthenticationChallengeFunctionResponseSuccessful | CreateReauthenticationChallengeFunctionResponseUnsuccessful
type CreateRegistrationChallengeFunctionResponse = CreateRegistrationChallengeFunctionResponseSuccessful | CreateRegistrationChallengeFunctionResponseUnsuccessful
type VerifyAuthenticationFunctionResponse = VerifyAuthenticationFunctionResponseSuccessful | VerifyAuthenticationFunctionResponseUnsuccessful
type VerifyReauthenticationFunctionResponse = VerifyReauthenticationFunctionResponseSuccessful | VerifyReauthenticationFunctionResponseUnsuccessful
type VerifyRegistrationFunctionResponse = VerifyRegistrationFunctionResponseSuccessful | VerifyRegistrationFunctionResponseUnsuccessful

export declare type FunctionResponse = ClearChallengeFunctionResponse | ClearUserDocFunctionResponse | CreateAuthenticationChallengeFunctionResponse | CreateReauthenticationChallengeFunctionResponse | CreateRegistrationChallengeFunctionResponse | VerifyAuthenticationFunctionResponse | VerifyReauthenticationFunctionResponse | VerifyRegistrationFunctionResponse
