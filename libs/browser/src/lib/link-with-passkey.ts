import { FunctionRequest, FunctionResponse }                    from "@firebase-web-authn/functions";
import { startRegistration }                                    from "@simplewebauthn/browser";
import { RegistrationResponseJSON }                             from "@simplewebauthn/typescript-types";
import { Auth, signInWithCustomToken, UserCredential }          from "firebase/auth";
import { Functions, httpsCallableFromURL, HttpsCallableResult } from "firebase/functions";
import { clearChallenge }                                       from "./clear-challenge";
import { FirebaseWebAuthnError }                                from "./firebase-web-authn-error";
import { handleVerifyFunctionResponse }                         from "./handle-verify-function-response";


/**
 * Asynchronously creates a passkey for the signed-in user, relying on {@link signInWithCustomToken}.
 *
 * @param auth - The {@link Auth} instance.
 * @param functions - The {@link Functions} instance.
 * @param name - An existing user identifier if FirebaseWebAuthn is configured as an MFA provider, or any recognizable value if FirebaseWebAuthn is your sole auth provider. With generic values consider passing something like "${firstName} | Personal" for users who share a passkey manager with others.
 *
 * @returns {@link UserCredential} when successful.
 * @throws {@link FirebaseWebAuthnError}
 */
export const linkWithPasskey: (auth: Auth, functions: Functions, name: string) => Promise<UserCredential> = (auth: Auth, functions: Functions, name: string): Promise<UserCredential> => auth
  .currentUser ? httpsCallableFromURL<FunctionRequest, FunctionResponse>(functions, "/firebaseWebAuthn")({
    name: name,
    operation: "create registration challenge",
  })
  .then<UserCredential>(({ data: functionResponse }: HttpsCallableResult<FunctionResponse>): Promise<UserCredential> => "code" in functionResponse ? ((): never => {
    throw new FirebaseWebAuthnError(functionResponse);
  })() : "creationOptions" in functionResponse ? startRegistration(functionResponse.creationOptions).then<UserCredential>((registrationResponse: RegistrationResponseJSON): Promise<UserCredential> => httpsCallableFromURL<FunctionRequest, FunctionResponse>(functions, "/firebaseWebAuthn")({
    registrationResponse: registrationResponse,
    operation: "verify registration",
  }).then<UserCredential>(({ data: functionResponse }: HttpsCallableResult<FunctionResponse>): Promise<UserCredential> => handleVerifyFunctionResponse(auth, functionResponse)).catch<never>((firebaseError): never => {
    throw new FirebaseWebAuthnError({
      code: firebaseError.code,
      message: firebaseError.message,
      method: "httpsCallableFromURL",
      operation: "verify registration",
    });
  })).catch<never>((): Promise<never> => clearChallenge(functions)) : ((): never => {
    throw new FirebaseWebAuthnError({
      code: "invalid",
      message: "Invalid function response.",
      operation: functionResponse.operation,
    });
  })())
  .catch<never>((firebaseError): never => {
    throw new FirebaseWebAuthnError({
      code: firebaseError.code,
      message: firebaseError.message,
      method: "httpsCallableFromURL",
      operation: "create registration challenge",
    });
  }) : ((): never => {
    throw new FirebaseWebAuthnError({
      code: "missing-auth",
      message: "No user is signed in.",
      operation: "create reauthentication challenge",
    });
  })();
