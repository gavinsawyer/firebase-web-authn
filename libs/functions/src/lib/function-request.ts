import { AuthenticationResponseJSON, RegistrationResponseJSON } from "@simplewebauthn/typescript-types";


interface UnknownFunctionRequest {
  "operation": "clear challenge" | "clear user doc" | "create authentication challenge" | "create reauthentication challenge" | "create registration challenge" | "verify authentication" | "verify reauthentication" | "verify registration",
}
interface ClearChallengeFunctionRequest extends UnknownFunctionRequest {
  "operation": "clear challenge",
}
interface ClearUserDocFunctionRequest extends UnknownFunctionRequest {
  "operation": "clear user doc",
}
interface CreateAuthenticationChallengeFunctionRequest extends UnknownFunctionRequest {
  "operation": "create authentication challenge",
}
interface CreateReauthenticationChallengeFunctionRequest extends UnknownFunctionRequest {
  "operation": "create reauthentication challenge",
}
interface CreateRegistrationChallengeFunctionRequest extends UnknownFunctionRequest {
  "name": string,
  "operation": "create registration challenge",
}
interface VerifyAuthenticationFunctionRequest extends UnknownFunctionRequest {
  "authenticationResponse": AuthenticationResponseJSON,
  "operation": "verify authentication",
}
interface VerifyReauthenticationFunctionRequest extends UnknownFunctionRequest {
  "authenticationResponse": AuthenticationResponseJSON,
  "operation": "verify reauthentication",
}
interface VerifyRegistrationFunctionRequest extends UnknownFunctionRequest {
  "operation": "verify registration",
  "registrationResponse": RegistrationResponseJSON,
}

export type FunctionRequest = ClearChallengeFunctionRequest | ClearUserDocFunctionRequest | CreateAuthenticationChallengeFunctionRequest | CreateReauthenticationChallengeFunctionRequest | CreateRegistrationChallengeFunctionRequest | VerifyAuthenticationFunctionRequest | VerifyReauthenticationFunctionRequest | VerifyRegistrationFunctionRequest;
