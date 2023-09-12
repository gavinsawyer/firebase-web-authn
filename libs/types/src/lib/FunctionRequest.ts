import { AuthenticationResponseJSON, RegistrationResponseJSON } from "@simplewebauthn/typescript-types";
import { WebAuthnUserCredentialType }                           from "./WebAuthnUserCredentialType";


interface UnknownFunctionRequest {
  "operation": "clear challenge" | "clear credential" | "create authentication challenge" | "create reauthentication challenge" | "create registration challenge" | "verify authentication" | "verify reauthentication" | "verify registration",
}

interface ClearChallengeFunctionRequest extends UnknownFunctionRequest {
  "operation": "clear challenge",
}
interface ClearUserDocFunctionRequest extends UnknownFunctionRequest {
  "clearingCredentialType"?: WebAuthnUserCredentialType,
  "operation": "clear credential",
}

interface CreateAuthenticationChallengeFunctionRequest extends UnknownFunctionRequest {
  "authenticatingCredentialType"?: WebAuthnUserCredentialType,
  "operation": "create authentication challenge",
}
interface CreateReauthenticationChallengeFunctionRequest extends UnknownFunctionRequest {
  "operation": "create reauthentication challenge",
  "reauthenticatingCredentialType"?: WebAuthnUserCredentialType,
}
interface CreateRegistrationChallengeFunctionRequest extends UnknownFunctionRequest {
  "name": string,
  "operation": "create registration challenge",
  "registeringCredentialType": WebAuthnUserCredentialType,
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

export declare type FunctionRequest = ClearChallengeFunctionRequest | ClearUserDocFunctionRequest | CreateAuthenticationChallengeFunctionRequest | CreateReauthenticationChallengeFunctionRequest | CreateRegistrationChallengeFunctionRequest | VerifyAuthenticationFunctionRequest | VerifyReauthenticationFunctionRequest | VerifyRegistrationFunctionRequest;
