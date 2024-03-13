import { FunctionRequest, FunctionResponse, WebAuthnUserCredentialFactor } from "@firebase-web-authn/types";
import { Auth }                                                            from "firebase/auth";
import { Functions, httpsCallableFromURL, HttpsCallableResult }            from "firebase/functions";
import { FirebaseWebAuthnError }                                           from "./FirebaseWebAuthnError.js";


// noinspection JSUnusedGlobalSymbols
/**
 * Asynchronously deletes WebAuthn credentials associated with the signed-in user.
 *
 * @async
 *
 * @param auth - The {@link Auth} instance.
 * @param functions - The {@link Functions} instance.
 * @param factor - An optional {@link WebAuthnUserCredentialFactor} associated with the credential being unlinked from the user. Not passing a value unlinks both credentials if they exist.
 *
 * @returns
 *  {@link void} when successful.
 * @throws
 *  {@link FirebaseWebAuthnError}
 */
export const unlinkPasskey: (auth: Auth, functions: Functions, factor?: WebAuthnUserCredentialFactor) => Promise<void> = (auth: Auth, functions: Functions, factor?: WebAuthnUserCredentialFactor): Promise<void> => auth
  .currentUser ? httpsCallableFromURL<FunctionRequest, FunctionResponse>(
    functions,
    "/firebase-web-authn-api",
  )(
    {
      clearingCredential: factor,
      operation:          "clear credential",
    },
  )
  .then<void, never>(
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
          operation: "clear credential",
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
