/*
 * Copyright © 2025 Gavin Sawyer. All rights reserved.
 */

import { type FunctionRequest, type FunctionResponse }                    from "@firebase-web-authn/types";
import { type Functions, httpsCallableFromURL, type HttpsCallableResult } from "firebase/functions";
import { FirebaseWebAuthnError }                                          from "./FirebaseWebAuthnError.js";


export const clearChallenge: (functions: Functions) => Promise<void> = (functions: Functions) => httpsCallableFromURL<FunctionRequest, FunctionResponse>(
  functions,
  "/firebase-web-authn-api",
)(
  {
    operation: "clear challenge",
  },
).then<void, never>(
  ({ data: functionResponse }: HttpsCallableResult<FunctionResponse>): void => "code" in functionResponse ? ((): never => {
    throw new FirebaseWebAuthnError(functionResponse);
  })() : void (0),
  (firebaseError): never => {
    throw new FirebaseWebAuthnError(
      {
        code:      firebaseError.code.replace(
          "firebaseWebAuthn/",
          "",
        ),
        message:   firebaseError.message,
        method:    "httpsCallableFromURL",
        operation: "clear challenge",
      },
    );
  },
);
