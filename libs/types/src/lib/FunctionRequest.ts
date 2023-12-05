import { AuthenticationResponseJSON, RegistrationResponseJSON } from "@simplewebauthn/typescript-types";
import { WebAuthnUserCredentialFactor }                         from "./WebAuthnUserCredentialFactor";


interface UnknownFunctionRequest {
  "operation": "clear challenge" | "clear credential" | "create authentication challenge" | "create reauthentication challenge" | "create registration challenge" | "verify authentication" | "verify reauthentication" | "verify registration"
}

interface ClearChallengeFunctionRequest extends UnknownFunctionRequest {
  "operation": "clear challenge"
}

interface ClearUserDocFunctionRequest extends UnknownFunctionRequest {
  "clearingCredential"?: WebAuthnUserCredentialFactor
  "operation": "clear credential"
}

interface CreateAuthenticationChallengeFunctionRequest extends UnknownFunctionRequest {
  "authenticatingCredential"?: WebAuthnUserCredentialFactor
  "operation": "create authentication challenge"
}

interface CreateReauthenticationChallengeFunctionRequest extends UnknownFunctionRequest {
  "operation": "create reauthentication challenge"
  "reauthenticatingCredential"?: WebAuthnUserCredentialFactor
}

interface CreateRegistrationChallengeFunctionRequest extends UnknownFunctionRequest {
  "name": string
  "operation": "create registration challenge"
  "registeringCredential": WebAuthnUserCredentialFactor
}

interface VerifyAuthenticationFunctionRequest extends UnknownFunctionRequest {
  "authenticationResponse": AuthenticationResponseJSON
  "operation": "verify authentication"
}

interface VerifyReauthenticationFunctionRequest extends UnknownFunctionRequest {
  "authenticationResponse": AuthenticationResponseJSON
  "operation": "verify reauthentication"
}

interface VerifyRegistrationFunctionRequest extends UnknownFunctionRequest {
  "operation": "verify registration"
  "registrationResponse": RegistrationResponseJSON
}

export declare type FunctionRequest = ClearChallengeFunctionRequest | ClearUserDocFunctionRequest | CreateAuthenticationChallengeFunctionRequest | CreateReauthenticationChallengeFunctionRequest | CreateRegistrationChallengeFunctionRequest | VerifyAuthenticationFunctionRequest | VerifyReauthenticationFunctionRequest | VerifyRegistrationFunctionRequest
