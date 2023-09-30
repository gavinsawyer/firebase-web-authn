import { FunctionResponse } from "@firebase-web-authn/types";


interface FirebaseWebAuthnErrorOptions {
  "code": Extract<FunctionResponse, {
    success: false
  }>["code"] | "cancelled" | "invalid";
  "message": Extract<FunctionResponse, {
    success: false
  }>["message"] | "Cancelled by user." | "Invalid function response.";
  "method"?: "httpsCallableFromURL" | "signInAnonymously" | "signInWithCustomToken";
  "operation"?: FunctionResponse["operation"];
}

/**
 * This class extends the built-in `Error` class and provides additional properties specific to FirebaseWebAuthn errors. These properties include `code`, `method`, and `operation`.
 */
export class FirebaseWebAuthnError extends Error {

  /**
   * FirebaseError["message"] | "No user is signed in." | "No user document was found in Firestore." | "No operation is needed." | "User not verified." | "User doc is missing challenge field from prior operation." | "User doc is missing passkey fields from prior operation."
   */
  public override readonly message!: FirebaseWebAuthnErrorOptions["message"];
  public override readonly name!: string;

  /**
   * An error code prefixed by `firebaseWebAuthn/` which is produced by Firebase in either the JavaScript or Admin SDK
   */
  public readonly code: `firebaseWebAuthn/${FirebaseWebAuthnErrorOptions["code"]}`;
  /**
   * The method from the Firebase JS SDK which threw the error if applicable.
   */
  public readonly method?: FirebaseWebAuthnErrorOptions["method"];
  /**
   * The API operation which threw the error if applicable.
   */
  public readonly operation?: FirebaseWebAuthnErrorOptions["operation"];

  constructor(
    firebaseWebAuthnErrorOptions: FirebaseWebAuthnErrorOptions,
  ) {
    super(firebaseWebAuthnErrorOptions.message);

    this
      .message = firebaseWebAuthnErrorOptions.message;
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
