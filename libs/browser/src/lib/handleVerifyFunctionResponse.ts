import { FunctionResponse }                            from "@firebase-web-authn/types";
import { Auth, signInWithCustomToken, UserCredential } from "firebase/auth";
import { FirebaseWebAuthnError }                       from "./FirebaseWebAuthnError.js";


export const handleVerifyFunctionResponse: (auth: Auth, functionResponse: FunctionResponse) => Promise<UserCredential> = (auth: Auth, functionResponse: FunctionResponse): Promise<UserCredential> => "customToken" in functionResponse ? signInWithCustomToken(
  auth,
  functionResponse.customToken,
)
  .catch<never>(
    (firebaseError): never => {
      throw new FirebaseWebAuthnError(
        {
          code:    firebaseError.code.replace(
            "firebaseWebAuthn/",
            "",
          ),
          message: firebaseError.message,
          method:  "signInWithCustomToken",
        },
      );
    },
  ) : "code" in functionResponse ? ((): never => {
    throw new FirebaseWebAuthnError(functionResponse);
  })() : ((): never => {
    throw new FirebaseWebAuthnError(
      {
        code:      "invalid",
        message:   "Invalid function response.",
        operation: functionResponse.operation,
      },
    );
  })();
