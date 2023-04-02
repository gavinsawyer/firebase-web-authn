import { Functions, httpsCallableFromURL, HttpsCallableResult } from "firebase/functions";
import { FunctionRequest, FunctionResponse }                    from "@firebase-web-authn/functions";
import { FirebaseWebAuthnError }                                from "./firebase-web-authn-error";


export const clearChallenge: (functions: Functions) => Promise<never> = (functions: Functions) => httpsCallableFromURL<FunctionRequest, FunctionResponse>(functions, "/firebaseWebAuthn")({
  operation: "clear challenge",
})
  .then<never>(({ data: functionResponse }: HttpsCallableResult<FunctionResponse>): never => "code" in functionResponse ? ((): never => {
    throw new FirebaseWebAuthnError(functionResponse);
  })() : ((): never => {
    throw new FirebaseWebAuthnError({
      code: "cancelled",
      message: "Cancelled by user.",
      operation: functionResponse.operation,
    });
  })())
  .catch<never>((firebaseError): never => {
    throw new FirebaseWebAuthnError({
      code: firebaseError.code,
      message: firebaseError.message,
      method: "httpsCallableFromURL",
      operation: "clear challenge",
    });
  });
