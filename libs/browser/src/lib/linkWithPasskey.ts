import { FunctionRequest, FunctionResponse }                    from "@firebase-web-authn/types";
import { startRegistration }                                    from "@simplewebauthn/browser";
import { RegistrationResponseJSON }                             from "@simplewebauthn/typescript-types";
import { Auth, UserCredential }                                 from "firebase/auth";
import { Functions, httpsCallableFromURL, HttpsCallableResult } from "firebase/functions";
import { clearChallenge }                                       from "./clearChallenge";
import { FirebaseWebAuthnError }                                from "./FirebaseWebAuthnError";
import { handleVerifyFunctionResponse }                         from "./handleVerifyFunctionResponse";


/**
 * Asynchronously creates a passkey for the signed-in user.
 *
 * @param auth - The {@link Auth} instance.
 * @param functions - The {@link Functions} instance.
 * @param name - An existing user identifier if FirebaseWebAuthn is configured as an MFA provider, or any recognizable value if FirebaseWebAuthn is your sole auth provider. With generic values consider passing something like "${firstName} | Personal" for users who share a passkey manager with others.
 *
 * @returns {@link UserCredential} when successful.
 * @throws {@link FirebaseWebAuthnError}
 */
export const linkWithPasskey: (auth: Auth, functions: Functions, name: string) => Promise<UserCredential> = (auth: Auth, functions: Functions, name: string): Promise<UserCredential> => auth
  .currentUser ? httpsCallableFromURL<FunctionRequest, FunctionResponse>(
    functions,
    "/firebase-web-authn-api",
  )(
    {
      name:      name,
      operation: "create registration challenge",
    },
  )
  .then<UserCredential, never>(
    ({ data: functionResponse }: HttpsCallableResult<FunctionResponse>): Promise<UserCredential> => "code" in functionResponse ? ((): never => {
      throw new FirebaseWebAuthnError(functionResponse);
    })() : "creationOptions" in functionResponse ? startRegistration(functionResponse.creationOptions).then<UserCredential, never>(
      (registrationResponse: RegistrationResponseJSON): Promise<UserCredential> => httpsCallableFromURL<FunctionRequest, FunctionResponse>(
        functions,
        "/firebase-web-authn-api",
      )(
        {
          registrationResponse: registrationResponse,
          operation:            "verify registration",
        },
      ).then<UserCredential, never>(
        ({ data: functionResponse }: HttpsCallableResult<FunctionResponse>): Promise<UserCredential> => handleVerifyFunctionResponse(
          auth,
          functionResponse,
        ),
        (firebaseError): never => {
          throw new FirebaseWebAuthnError(
            {
              code:      firebaseError.code.replace(
                "firebaseWebAuthn/",
                "",
              ),
              message:   firebaseError.message,
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
    ) : ((): never => {
      throw new FirebaseWebAuthnError(
        {
          code:      "invalid",
          message:   "Invalid function response.",
          operation: functionResponse.operation,
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
