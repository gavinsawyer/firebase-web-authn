import { FunctionResponse } from "@firebase-web-authn/types";


interface FirebaseWebAuthnErrorOptions {
  "code": Extract<FunctionResponse, { success: false, }>["code"] | "cancelled" | "invalid",
  "message": Extract<FunctionResponse, { success: false, }>["message"] | "Cancelled by user." | "Invalid function response.",
  "method"?: "httpsCallableFromURL" | "signInAnonymously" | "signInWithCustomToken",
  "operation"?: FunctionResponse["operation"],
}

/**
 * This class extends the built-in `Error` class and provides additional properties
 * specific to FirebaseWebAuthn errors. These properties include `code`, `method`, and `operation`.
 *
 * @property code - "firebaseWebAuthn/${FirebaseError['code] | 'missing-auth' | 'missing-user-doc' | 'no-op' | 'not-verified' | 'user-doc-missing-challenge-field' | 'user-doc-missing-passkey-fields' | 'cancelled' | 'invalid'}"
 * @property message - FirebaseError["message"] | "No user is signed in." | "No user document was found in Firestore." | "No operation is needed." | "User not verified." | "User doc is missing challenge field from prior operation." | "User doc is missing passkey fields from prior operation."
 * @property method - "httpsCallableFromURL" | "signInAnonymously" | "signInWithCustomToken"
 * @property operation - "clear challenge" | "clear user doc" | "create authentication challenge" | "create reauthentication challenge" | "create registration challenge" | "verify authentication" | "verify reauthentication" | "verify registration"
 */
export class FirebaseWebAuthnError extends Error {

  public override readonly message!: FirebaseWebAuthnErrorOptions["message"];
  public override readonly name!: string;

  public readonly code: `firebaseWebAuthn/${FirebaseWebAuthnErrorOptions["code"]}`;
  public readonly method?: FirebaseWebAuthnErrorOptions["method"];
  public readonly operation?: FirebaseWebAuthnErrorOptions["operation"];

  constructor(
    private readonly firebaseWebAuthnErrorOptions: FirebaseWebAuthnErrorOptions,
  ) {
    super(firebaseWebAuthnErrorOptions.message);

    this
      .name = "FirebaseWebAuthnError";
    this
      .code = `firebaseWebAuthn/${firebaseWebAuthnErrorOptions.code}`;
    this
      .method = firebaseWebAuthnErrorOptions
      .method;
    this
      .operation = firebaseWebAuthnErrorOptions
      .operation;
  }

}
