/*
 * Copyright © 2026 Gavin William Sawyer. All rights reserved.
 */

import { type FunctionRequest, type FunctionResponse }                                         from "@firebase-web-authn/types";
import { type Functions, type FunctionsError, httpsCallableFromURL, type HttpsCallableResult } from "firebase/functions";
import { FirebaseWebAuthnError }                                                               from "./FirebaseWebAuthnError";


export const clearChallenge: (functions: Functions) => Promise<void> = (functions: Functions) => httpsCallableFromURL<FunctionRequest, FunctionResponse>(
  functions,
  "/firebase-web-authn-api",
)(
  { operation: "clear challenge" },
).then<void, never>(
  ({ data: functionResponse }: HttpsCallableResult<FunctionResponse>): void => "code" in functionResponse ? ((): never => {
    throw new FirebaseWebAuthnError(functionResponse);
  })() : void (0),
  (functionsError: FunctionsError): never => {
    throw new FirebaseWebAuthnError(
      {
        code:      functionsError.code.replace(
          "firebaseWebAuthn/",
          "",
        ),
        message:   functionsError.message,
        method:    "httpsCallableFromURL",
        operation: "clear challenge",
      },
    );
  },
);
