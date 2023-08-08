import { FunctionRequest, FunctionResponse }                    from "@firebase-web-authn/types";
import { startAuthentication }                                  from "@simplewebauthn/browser";
import { AuthenticationResponseJSON }                           from "@simplewebauthn/typescript-types";
import { Auth }                                                 from "firebase/auth";
import { Functions, httpsCallableFromURL, HttpsCallableResult } from "firebase/functions";
import { clearChallenge }                                       from "./clear-challenge";
import { FirebaseWebAuthnError }                                from "./firebase-web-authn-error";
import { handleVerifyFunctionResponse }                         from "./handle-verify-function-response";


/**
 * Asynchronously verifies a user with a passkey. Your backend security logic should depend on the `lastPresent` and `lastVerified` fields in the user's document in the `webAuthnUsers` collection in Firestore which are updated automatically on successful operations.
 *
 * @see {@link https://developers.yubico.com/WebAuthn/WebAuthn_Developer_Guide/User_Presence_vs_User_Verification.html User Presence vs User Verification}
 *
 * @param auth - The {@link Auth} instance.
 * @param functions - The {@link Functions} instance.
 *
 * @returns {@link void} when successful.
 * @throws {@link FirebaseWebAuthnError}
 */
export const verifyUserWithPasskey: (auth: Auth, functions: Functions) => Promise<void> = (auth: Auth, functions: Functions): Promise<void> => auth
  .currentUser ? httpsCallableFromURL<FunctionRequest, FunctionResponse>(functions, "/firebase-web-authn-api")({
    operation: "create reauthentication challenge",
  })
  .then<void>(async ({ data: functionResponse }: HttpsCallableResult<FunctionResponse>): Promise<void> => "code" in functionResponse ? ((): never => {
    throw new FirebaseWebAuthnError(functionResponse);
  })() : "requestOptions" in functionResponse ? startAuthentication(functionResponse.requestOptions).then<void>((authenticationResponse: AuthenticationResponseJSON): Promise<void> => httpsCallableFromURL<FunctionRequest, FunctionResponse>(functions, "/firebase-web-authn-api")({
    authenticationResponse: authenticationResponse,
    operation: "verify reauthentication",
  }).then<void>(({ data: functionResponse }: HttpsCallableResult<FunctionResponse>): Promise<void> => handleVerifyFunctionResponse(auth, functionResponse).then<void>((): void => void(0)))).catch<never>(async (): Promise<never> => clearChallenge(functions).then<never>((): never => {
    throw new FirebaseWebAuthnError({
      code: "cancelled",
      message: "Cancelled by user.",
      operation: functionResponse.operation,
    });
  })) : ((): never => {
    throw new FirebaseWebAuthnError({
      code: "invalid",
      message: "Invalid function response.",
      operation: functionResponse.operation,
    });
  })())
  .catch<never>((firebaseError): never => {
    throw new FirebaseWebAuthnError({
      code: firebaseError.code.replace("firebaseWebAuthn/", ""),
      message: firebaseError.message,
      method: "httpsCallableFromURL",
      operation: "create reauthentication challenge",
    });
  }) : ((): never => {
    throw new FirebaseWebAuthnError({
      code: "missing-auth",
      message: "No user is signed in.",
      operation: "create reauthentication challenge",
    });
  })();
