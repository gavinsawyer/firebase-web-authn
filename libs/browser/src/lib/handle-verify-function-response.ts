import { Auth, signInWithCustomToken, UserCredential } from "firebase/auth";
import { FunctionResponse }                            from "@firebase-web-authn/functions";
import { FirebaseWebAuthnError }                       from "./firebase-web-authn-error";


export const handleVerifyFunctionResponse: (auth: Auth, functionResponse: FunctionResponse) => Promise<UserCredential> = (auth: Auth, functionResponse: FunctionResponse): Promise<UserCredential> => "code" in functionResponse ? ((): never => {
  throw new FirebaseWebAuthnError(functionResponse);
})() : "customToken" in functionResponse ? signInWithCustomToken(auth, functionResponse.customToken)
  .catch<never>((firebaseError): never => {
    throw new FirebaseWebAuthnError({
      code: firebaseError.code,
      message: firebaseError.message,
      method: "signInWithCustomToken",
    });
  }) : ((): never => {
    throw new FirebaseWebAuthnError({
      code: "invalid",
      message: "Invalid function response.",
      operation: functionResponse.operation,
    });
  })();
