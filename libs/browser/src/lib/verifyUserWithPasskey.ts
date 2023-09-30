import { FunctionRequest, FunctionResponse, WebAuthnUserCredentialFactor } from "@firebase-web-authn/types";
import { startAuthentication }                                             from "@simplewebauthn/browser";
import { AuthenticationResponseJSON }                                      from "@simplewebauthn/typescript-types";
import { Auth }                                                            from "firebase/auth";
import { Functions, httpsCallableFromURL, HttpsCallableResult }            from "firebase/functions";
import { clearChallenge }                                                  from "./clearChallenge";
import { FirebaseWebAuthnError }                                           from "./FirebaseWebAuthnError";
import { handleVerifyFunctionResponse }                                    from "./handleVerifyFunctionResponse";


/**
 * Asynchronously verifies a user with WebAuthn.
 *
 * Your backend security logic should depend on the `lastPresent` and `lastVerified` fields in the user's document in the `ext-firebase-web-authn` Firestore Database which are updated automatically on successful operations.
 *
 * @see
 *  {@link https://developers.yubico.com/WebAuthn/WebAuthn_Developer_Guide/User_Presence_vs_User_Verification.html User Presence vs User Verification}
 *
 * @async
 *
 * @param auth - The {@link Auth} instance.
 * @param functions - The {@link Functions} instance.
 * @param factor - An optional {@link WebAuthnUserCredentialFactor} associated with the credential being verified. Not passing a value allows either credential to be used in verification.
 *
 * @returns
 *  {@link void} when successful.
 * @throws
 *  {@link FirebaseWebAuthnError}
 */
export const verifyUserWithPasskey: (auth: Auth, functions: Functions, factor?: WebAuthnUserCredentialFactor) => Promise<void> = (auth: Auth, functions: Functions, factor?: WebAuthnUserCredentialFactor): Promise<void> => auth
  .currentUser ? httpsCallableFromURL<FunctionRequest, FunctionResponse>(
    functions,
    "/firebase-web-authn-api",
  )(
    {
      operation:                  "create reauthentication challenge",
      reauthenticatingCredential: factor,
    },
  )
  .then<void, never>(
    ({ data: functionResponse }: HttpsCallableResult<FunctionResponse>): Promise<void> => "requestOptions" in functionResponse ? startAuthentication(functionResponse.requestOptions).then<void, never>(
      (authenticationResponse: AuthenticationResponseJSON): Promise<void> => httpsCallableFromURL<FunctionRequest, FunctionResponse>(
        functions,
        "/firebase-web-authn-api",
      )(
        {
          authenticationResponse: authenticationResponse,
          operation:              "verify reauthentication",
        },
      ).then<void>(
        ({ data: functionResponse }: HttpsCallableResult<FunctionResponse>): Promise<void> => handleVerifyFunctionResponse(
          auth,
          functionResponse,
        ).then<void>(
          (): void => void (0),
        ),
      ),
      (): Promise<never> => clearChallenge(functions).then<never>(
        (): never => {
          throw new FirebaseWebAuthnError(
            {
              code:      "cancelled",
              message:   "Cancelled by user.",
              operation: functionResponse.operation,
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
    (firebaseError): never => {
      throw new FirebaseWebAuthnError(
        {
          code:      firebaseError.code.replace(
            "firebaseWebAuthn/",
            "",
          ),
          message:   firebaseError.message || "An unknown error occured.",
          method:    "httpsCallableFromURL",
          operation: "create reauthentication challenge",
        },
      );
    },
  ) : ((): never => {
  throw new FirebaseWebAuthnError(
    {
      code:      "missing-auth",
      message:   "No user is signed in.",
      operation: "create reauthentication challenge",
    },
  );
})();
