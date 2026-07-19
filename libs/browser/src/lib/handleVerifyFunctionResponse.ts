/*
 * Copyright © 2026 Gavin William Sawyer. All rights reserved.
 */

import { type FunctionResponse }                                                 from "@firebase-web-authn/types";
import { type Auth, type AuthError, signInWithCustomToken, type UserCredential } from "firebase/auth";
import { FirebaseWebAuthnError }                                                 from "./FirebaseWebAuthnError";


export const handleVerifyFunctionResponse: (
  auth: Auth,
  functionResponse: FunctionResponse,
) => Promise<UserCredential> = (
  auth: Auth,
  functionResponse: FunctionResponse,
): Promise<UserCredential> => "customToken" in functionResponse ? signInWithCustomToken(
  auth,
  functionResponse.customToken,
).catch<never>(
  (authError: AuthError): never => {
    throw new FirebaseWebAuthnError(
      {
        code:    authError.code.replace(
          "firebaseWebAuthn/",
          "",
        ),
        message: authError.message,
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
