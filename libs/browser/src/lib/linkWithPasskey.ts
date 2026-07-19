/*
 * Copyright © 2026 Gavin William Sawyer. All rights reserved.
 */

import { type FunctionRequest, type FunctionResponse, type WebAuthnUserCredentialFactor }      from "@firebase-web-authn/types";
import { type RegistrationResponseJSON, startRegistration }                                    from "@simplewebauthn/browser";
import { type Auth, type UserCredential }                                                      from "firebase/auth";
import { type Functions, type FunctionsError, httpsCallableFromURL, type HttpsCallableResult } from "firebase/functions";
import { clearChallenge }                                                                      from "./clearChallenge";
import { FirebaseWebAuthnError }                                                               from "./FirebaseWebAuthnError";
import { handleVerifyFunctionResponse }                                                        from "./handleVerifyFunctionResponse";


/**
 * Asynchronously creates WebAuthn credentials associated with the signed-in user.
 *
 * @async
 *
 * @param auth - The {@link Auth} instance.
 * @param functions - The {@link Functions} instance.
 * @param name - An existing user identifier if FirebaseWebAuthn is configured as an MFA provider, or any recognizable value if FirebaseWebAuthn is your sole auth provider. With generic values consider passing something like `"${firstName} | Personal"` for users who share a passkey manager with others.
 * @param factor - An optional {@link WebAuthnUserCredentialFactor} to be required. Not passing a value attempts to link a primary credential.
 *
 * @returns
 *  A {@link UserCredential} when successful.
 * @throws
 *  {@link FirebaseWebAuthnError}
 */
export const linkWithPasskey: (
  auth: Auth,
  functions: Functions,
  name: string,
  factor?: WebAuthnUserCredentialFactor,
) => Promise<UserCredential> = (
  auth: Auth,
  functions: Functions,
  name: string,
  factor?: WebAuthnUserCredentialFactor,
): Promise<UserCredential> => auth.currentUser ? httpsCallableFromURL<FunctionRequest, FunctionResponse>(
  functions,
  "/firebase-web-authn-api",
)(
  {
    name,
    operation:             "create registration challenge",
    registeringCredential: factor || "first",
  },
).then<UserCredential, never>(
  ({ data: functionResponse }: HttpsCallableResult<FunctionResponse>): Promise<UserCredential> => "creationOptions" in functionResponse ? startRegistration({ optionsJSON: functionResponse.creationOptions }).then<UserCredential, never>(
    (registrationResponse: RegistrationResponseJSON): Promise<UserCredential> => httpsCallableFromURL<FunctionRequest, FunctionResponse>(
      functions,
      "/firebase-web-authn-api",
    )(
      {
        registrationResponse,
        operation: "verify registration",
      },
    ).then<UserCredential, never>(
      ({ data: functionResponse }: HttpsCallableResult<FunctionResponse>): Promise<UserCredential> => handleVerifyFunctionResponse(
        auth,
        functionResponse,
      ),
      (functionsError: FunctionsError): never => {
        throw new FirebaseWebAuthnError(
          {
            code:      functionsError.code.replace(
              "firebaseWebAuthn/",
              "",
            ),
            message:   functionsError.message,
            method:    "httpsCallableFromURL",
            operation: "verify registration",
          },
        );
      },
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
        code:      "invalid",
        message:   "Invalid function response.",
        operation: functionResponse.operation,
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
        operation: "create registration challenge",
      },
    );
  },
) : ((): never => {
  throw new FirebaseWebAuthnError(
    {
      code:    "missing-auth",
      message: "No user is signed in.",
    },
  );
})();
