import { FirebaseWebAuthnError }                                from "@firebase-web-authn/browser";
import { FunctionRequest, FunctionResponse }                    from "@firebase-web-authn/functions";
import { Functions, httpsCallableFromURL, HttpsCallableResult } from "firebase/functions";


export const clearChallenge: (functions: Functions) => Promise<void> = (functions: Functions) => httpsCallableFromURL<FunctionRequest, FunctionResponse>(functions, "/firebaseWebAuthn")({
  operation: "clear challenge",
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
  });
