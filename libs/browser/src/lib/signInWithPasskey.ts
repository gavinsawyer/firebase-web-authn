import { FunctionRequest, FunctionResponse }                    from "@firebase-web-authn/types";
import { startAuthentication }                                  from "@simplewebauthn/browser";
import { AuthenticationResponseJSON }                           from "@simplewebauthn/typescript-types";
import { Auth, signInAnonymously, UserCredential }              from "firebase/auth";
import { Functions, httpsCallableFromURL, HttpsCallableResult } from "firebase/functions";
import { clearChallenge }                                       from "./clearChallenge";
import { FirebaseWebAuthnError }                                from "./FirebaseWebAuthnError";
import { handleVerifyFunctionResponse }                         from "./handleVerifyFunctionResponse";


/**
 * Asynchronously signs in a user with a passkey.
 *
 * @param auth - The {@link Auth} instance.
 * @param functions - The {@link Functions} instance.
 *
 * @returns {@link UserCredential} when successful.
 * @throws {@link FirebaseWebAuthnError}
 */
export const signInWithPasskey: (auth: Auth, functions: Functions) => Promise<UserCredential> = (auth: Auth, functions: Functions): Promise<UserCredential> => ((handler: () => Promise<UserCredential>): Promise<UserCredential> => auth.currentUser ? handler() : signInAnonymously(auth).then<UserCredential, never>(
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
      operation: "create authentication challenge",
    },
  ).then<UserCredential, never>(
    ({ data: functionResponse }: HttpsCallableResult<FunctionResponse>): Promise<UserCredential> => "code" in functionResponse ? ((): never => {
      throw new FirebaseWebAuthnError(functionResponse);
    })() : "requestOptions" in functionResponse ? startAuthentication(functionResponse.requestOptions).then<UserCredential, never>(
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
    ) : ((): never => {
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
