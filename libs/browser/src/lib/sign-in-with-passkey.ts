import { Auth, signInAnonymously, UserCredential }              from "firebase/auth";
import { Functions, httpsCallableFromURL, HttpsCallableResult } from "firebase/functions";
import { FunctionRequest, FunctionResponse }                    from "@firebase-web-authn/functions";
import { startAuthentication }                                  from "@simplewebauthn/browser";
import { AuthenticationResponseJSON }                           from "@simplewebauthn/typescript-types";
import { clearChallenge }                                       from "./clear-challenge";
import { handleVerifyFunctionResponse }                         from "./handle-verify-function-response";
import { FirebaseWebAuthnError }                                from "./firebase-web-authn-error";


export const signInWithPasskey: (auth: Auth, functions: Functions) => Promise<UserCredential> = (auth: Auth, functions: Functions): Promise<UserCredential> => ((handler: () => Promise<UserCredential>): Promise<UserCredential> => auth.currentUser ? handler() : signInAnonymously(auth).then<UserCredential>((): Promise<UserCredential> => handler()).catch<never>((firebaseError): never => {
  throw new FirebaseWebAuthnError({
    code: firebaseError.code,
    message: firebaseError.message,
    method: "signInAnonymously",
  });
}))((): Promise<UserCredential> => httpsCallableFromURL<FunctionRequest, FunctionResponse>(functions, "/firebaseWebAuthn")({
  operation: "create authentication challenge",
}).then<UserCredential>(({ data: functionResponse }: HttpsCallableResult<FunctionResponse>): Promise<UserCredential> => "code" in functionResponse ? ((): never => {
  throw new FirebaseWebAuthnError(functionResponse);
})() : "requestOptions" in functionResponse ? startAuthentication(functionResponse.requestOptions).then<UserCredential>((authenticationResponse: AuthenticationResponseJSON): Promise<UserCredential> => httpsCallableFromURL<FunctionRequest, FunctionResponse>(functions, "/firebaseWebAuthn")({
  authenticationResponse: authenticationResponse,
  operation: "verify authentication",
}).then<UserCredential>(({ data: functionResponse }: HttpsCallableResult<FunctionResponse>): Promise<UserCredential> => handleVerifyFunctionResponse(auth, functionResponse)).catch<never>((firebaseError): never => {
  throw new FirebaseWebAuthnError({
    code: firebaseError.code,
    message: firebaseError.message,
    method: "httpsCallableFromURL",
    operation: "verify authentication",
  });
})).catch<never>((): Promise<never> => clearChallenge(functions)) : ((): never => {
  throw new FirebaseWebAuthnError({
    code: "invalid",
    message: "Invalid function response.",
    operation: functionResponse.operation,
  });
})()).catch<never>((firebaseError): never => {
  throw new FirebaseWebAuthnError({
    code: firebaseError.code,
    message: firebaseError.message,
    method: "httpsCallableFromURL",
    operation: "create authentication challenge",
  });
}));
