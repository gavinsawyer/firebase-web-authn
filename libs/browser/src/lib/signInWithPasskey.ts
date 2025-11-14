/*
 * Copyright © 2025 Gavin Sawyer. All rights reserved.
 */

import { type FunctionRequest, type FunctionResponse, type WebAuthnUserCredentialFactor } from "@firebase-web-authn/types";
import { startAuthentication }                                                            from "@simplewebauthn/browser";
import { type AuthenticationResponseJSON }                                                from "@simplewebauthn/types";
import { type Auth, signInAnonymously, type UserCredential }                              from "firebase/auth";
import { type Functions, httpsCallableFromURL, type HttpsCallableResult }                 from "firebase/functions";
import { clearChallenge }                                                                 from "./clearChallenge.js";
import { FirebaseWebAuthnError }                                                          from "./FirebaseWebAuthnError.js";
import { handleVerifyFunctionResponse }                                                   from "./handleVerifyFunctionResponse.js";


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
  (): Promise<UserCredential> => handler(),
  (firebaseError): never => {
    throw new FirebaseWebAuthnError(
      {
        code:    firebaseError.code.replace(
          "firebaseWebAuthn/",
          "",
        ),
        message: firebaseError.message,
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
    ({ data: functionResponse }: HttpsCallableResult<FunctionResponse>): Promise<UserCredential> => "requestOptions" in functionResponse ? startAuthentication(functionResponse.requestOptions).then<UserCredential, never>(
      (authenticationResponse: AuthenticationResponseJSON): Promise<UserCredential> => httpsCallableFromURL<FunctionRequest, FunctionResponse>(
        functions,
        "/firebase-web-authn-api",
      )(
        {
          authenticationResponse: authenticationResponse,
          operation:              "verify authentication",
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
    (firebaseError): never => {
      throw new FirebaseWebAuthnError(
        {
          code:      firebaseError.code.replace(
            "firebaseWebAuthn/",
            "",
          ),
          message:   firebaseError.message,
          method:    "httpsCallableFromURL",
          operation: "create authentication challenge",
        },
      );
    },
  ),
);
