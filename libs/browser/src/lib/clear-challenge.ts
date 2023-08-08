import { FunctionRequest, FunctionResponse }                    from "@firebase-web-authn/types";
import { Functions, httpsCallableFromURL, HttpsCallableResult } from "firebase/functions";
import { FirebaseWebAuthnError }                                from "./firebase-web-authn-error";


export const clearChallenge: (functions: Functions) => Promise<void> = (functions: Functions) => httpsCallableFromURL<FunctionRequest, FunctionResponse>(functions, "/firebase-web-authn-api")({
  operation: "clear challenge",
})
  .then<void>(({ data: functionResponse }: HttpsCallableResult<FunctionResponse>): void => "code" in functionResponse ? ((): never => {
    throw new FirebaseWebAuthnError(functionResponse);
  })() : void(0))
  .catch<never>((firebaseError): never => {
    throw new FirebaseWebAuthnError({
      code: firebaseError.code.replace("firebaseWebAuthn/", ""),
      message: firebaseError.message,
      method: "httpsCallableFromURL",
      operation: "clear challenge",
    });
  });
