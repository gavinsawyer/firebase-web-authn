/*
 * Copyright © 2026 Gavin William Sawyer. All rights reserved.
 */

import { type FunctionRequest, type FunctionResponse, type WebAuthnUserCredentialFactor }      from "@firebase-web-authn/types";
import { type AuthenticationResponseJSON, startAuthentication }                                from "@simplewebauthn/browser";
import { type Auth, type AuthError, signInAnonymously, type UserCredential }                   from "firebase/auth";
import { type Functions, type FunctionsError, httpsCallableFromURL, type HttpsCallableResult } from "firebase/functions";
import { clearChallenge }                                                                      from "./clearChallenge";
import { FirebaseWebAuthnError }                                                               from "./FirebaseWebAuthnError";
import { handleVerifyFunctionResponse }                                                        from "./handleVerifyFunctionResponse";


/**
 * Asynchronously signs in a user with WebAuthn.
 *
 * @async
 *
 * @param auth - The {@link Auth} instance.
 * @param functions - The {@link Functions} instance.
 * @param factor - An optional {@link WebAuthnUserCredentialFactor} to be required. Not passing a value attempts both credentials if they exist.
 *
 * @returns
 *  A {@link UserCredential} when successful.
 * @throws
 *  {@link FirebaseWebAuthnError}
 */
export const signInWithPasskey: (
  auth: Auth,
  functions: Functions,
  factor?: WebAuthnUserCredentialFactor,
) => Promise<UserCredential> = (
  auth: Auth,
  functions: Functions,
  factor?: WebAuthnUserCredentialFactor,
): Promise<UserCredential> => ((handler: () => Promise<UserCredential>): Promise<UserCredential> => auth.currentUser ? handler() : signInAnonymously(auth).then<UserCredential, never>(
  handler,
  (authError: AuthError): never => {
    throw new FirebaseWebAuthnError(
      {
        code:    authError.code.replace(
          "firebaseWebAuthn/",
          "",
        ),
        message: authError.message,
        method:  "signInAnonymously",
      },
    );
  },
))(
  (): Promise<UserCredential> => httpsCallableFromURL<FunctionRequest, FunctionResponse>(
    functions,
    "/firebase-web-authn-api",
  )(
    {
      authenticatingCredential: factor,
      operation:                "create authentication challenge",
    },
  ).then<UserCredential, never>(
    ({ data: functionResponse }: HttpsCallableResult<FunctionResponse>): Promise<UserCredential> => "requestOptions" in functionResponse ? startAuthentication({ optionsJSON: functionResponse.requestOptions }).then<UserCredential, never>(
      (authenticationResponse: AuthenticationResponseJSON): Promise<UserCredential> => httpsCallableFromURL<FunctionRequest, FunctionResponse>(
        functions,
        "/firebase-web-authn-api",
      )(
        {
          authenticationResponse,
          operation: "verify authentication",
        },
      ).then<UserCredential>(
        ({ data: functionResponse }: HttpsCallableResult<FunctionResponse>): Promise<UserCredential> => handleVerifyFunctionResponse(
          auth,
          functionResponse,
        ),
      ),
      (): Promise<never> => clearChallenge(functions).then<never>(
        (): never => {
          throw new FirebaseWebAuthnError(
            {
              code:    "cancelled",
              message: "Cancelled by user.",
            },
          );
        },
      ),
    ) : "code" in functionResponse ? ((): never => {
      throw new FirebaseWebAuthnError(functionResponse);
    })() : ((): never => {
      throw new FirebaseWebAuthnError(
        {
          code:    "invalid",
          message: "Invalid function response.",
        },
      );
    })(),
    (functionsError: FunctionsError): never => {
      throw new FirebaseWebAuthnError(
        {
          code:      functionsError.code.replace(
            "firebaseWebAuthn/",
            "",
          ),
          message:   functionsError.message,
          method:    "httpsCallableFromURL",
          operation: "create authentication challenge",
        },
      );
    },
  ),
);
