import { PublicKeyCredentialCreationOptionsJSON, PublicKeyCredentialRequestOptionsJSON } from "@simplewebauthn/typescript-types";
import { FirebaseError }                                                                 from "firebase-admin";


interface UnknownFunctionResponse {
  "operation": "clear challenge" | "clear user doc" | "create authentication challenge" | "create reauthentication challenge" | "create registration challenge" | "verify authentication" | "verify reauthentication" | "verify registration",
  "success": boolean,
}

interface UnknownFunctionResponseSuccessful extends UnknownFunctionResponse {
  "success": true,
}

interface UnknownFunctionResponseUnsuccessful extends UnknownFunctionResponse {
  "code": FirebaseError["code"] | "missing-auth" | "missing-user-doc" | "no-op" | "not-verified" | "user-doc-missing-challenge-field" | "user-doc-missing-passkey-fields",
  "message": FirebaseError["message"] | "No user is signed in." | "No user document was found in Firestore." | "No operation is needed." | "User not verified." | "User doc is missing challenge field from prior operation." | "User doc is missing passkey fields from prior operation.",
  "success": false,
}

interface ClearChallengeFunctionResponseSuccessful extends UnknownFunctionResponseSuccessful {
  "operation": "clear challenge",
}

interface ClearChallengeFunctionResponseUnsuccessful extends UnknownFunctionResponseUnsuccessful {
  "code": FirebaseError["code"] | "missing-auth" | "missing-user-doc" | "no-op",
  "message": FirebaseError["message"] | "No user is signed in." | "No user document was found in Firestore." | "No operation is needed.",
  "operation": "clear challenge",
}

interface ClearUserDocFunctionResponseSuccessful extends UnknownFunctionResponseSuccessful {
  "operation": "clear user doc",
}

interface ClearUserDocFunctionResponseUnsuccessful extends UnknownFunctionResponseUnsuccessful {
  "code": FirebaseError["code"] | "missing-auth" | "no-op",
  "message": FirebaseError["message"] | "No user is signed in." | "No operation is needed.",
  "operation": "clear user doc",
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

interface CreateReauthenticationChallengeFunctionResponseSuccessful extends UnknownFunctionResponseSuccessful {
  "requestOptions": PublicKeyCredentialRequestOptionsJSON,
  "operation": "create reauthentication challenge",
}

interface CreateReauthenticationChallengeFunctionResponseUnsuccessful extends UnknownFunctionResponseUnsuccessful {
  "code": FirebaseError["code"] | "missing-auth" | "missing-user-doc" | "user-doc-missing-passkey-fields",
  "message": FirebaseError["message"] | "No user is signed in." | "No user document was found in Firestore." | "User doc is missing passkey fields from prior operation.",
  "operation": "create reauthentication challenge",
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

interface VerifyAuthenticationFunctionResponseSuccessful extends UnknownFunctionResponseSuccessful {
  "customToken": string,
  "operation": "verify authentication",
}

interface VerifyAuthenticationFunctionResponseUnsuccessful extends UnknownFunctionResponseUnsuccessful {
  "code": FirebaseError["code"] | "missing-auth" | "missing-user-doc" | "no-op" | "not-verified" | "user-doc-missing-challenge-field" | "user-doc-missing-passkey-fields",
  "message": FirebaseError["message"] | "No user is signed in." | "No user document was found in Firestore." | "No operation is needed." | "User not verified." | "User doc is missing challenge field from prior operation." | "User doc is missing passkey fields from prior operation.",
  "operation": "verify authentication",
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

export declare type FunctionResponse = ClearChallengeFunctionResponse | ClearUserDocFunctionResponse | CreateAuthenticationChallengeFunctionResponse | CreateReauthenticationChallengeFunctionResponse | CreateRegistrationChallengeFunctionResponse | VerifyAuthenticationFunctionResponse | VerifyReauthenticationFunctionResponse | VerifyRegistrationFunctionResponse;
