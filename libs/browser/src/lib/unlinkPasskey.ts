import { FunctionRequest, FunctionResponse }                    from "@firebase-web-authn/types";
import { Auth }                                                 from "firebase/auth";
import { Functions, httpsCallableFromURL, HttpsCallableResult } from "firebase/functions";
import { FirebaseWebAuthnError }                                from "./FirebaseWebAuthnError";


// noinspection JSUnusedGlobalSymbols
/**
 * Asynchronously deletes stored public key credentials associated with the signed-in user.
 *
 * @param auth - The {@link Auth} instance.
 * @param functions - The {@link Functions} instance.
 *
 * @returns
 *  {@link void} when successful.
 * @throws
 *  {@link FirebaseWebAuthnError}
 */
export const unlinkPasskey: (auth: Auth, functions: Functions) => Promise<void> = (auth: Auth, functions: Functions): Promise<void> => auth
  .currentUser ? httpsCallableFromURL<FunctionRequest, FunctionResponse>(
    functions,
    "/firebase-web-authn-api",
  )(
    {
      operation: "clear user doc",
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
          operation: "clear challenge",
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
