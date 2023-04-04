import { Auth }                                                 from "firebase/auth";
import { Functions, httpsCallableFromURL, HttpsCallableResult } from "firebase/functions";
import { FunctionRequest, FunctionResponse } from "@firebase-web-authn/functions";
import { FirebaseWebAuthnError }             from "./firebase-web-authn-error";


export const unlinkPasskey: (auth: Auth, functions: Functions) => Promise<void> = (auth: Auth, functions: Functions): Promise<void> => auth
  .currentUser ? httpsCallableFromURL<FunctionRequest, FunctionResponse>(functions, "/firebaseWebAuthn")({
    operation: "clear user doc",
  })
  .then<void>(({ data: functionResponse }: HttpsCallableResult<FunctionResponse>): void => "code" in functionResponse ? ((): never => {
    throw new FirebaseWebAuthnError(functionResponse);
  })() : void(0))
  .catch<never>((firebaseError): never => {
    throw new FirebaseWebAuthnError({
      code: firebaseError.code,
      message: firebaseError.message,
      method: "httpsCallableFromURL",
      operation: "clear challenge",
    });
  }) : ((): never => {
  throw new FirebaseWebAuthnError({
    code: "missing-auth",
    message: "No user is signed in.",
    operation: "create reauthentication challenge",
  });
})();
