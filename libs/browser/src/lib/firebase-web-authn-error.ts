import { FunctionResponse } from "@firebase-web-authn/functions";


interface FirebaseWebAuthnErrorOptions {
  "code": Extract<FunctionResponse, { success: false, }>["code"] | "cancelled" | "invalid",
  "message": Extract<FunctionResponse, { success: false, }>["message"] | "Cancelled by user." | "Invalid function response.",
  "method"?: "httpsCallableFromURL" | "signInAnonymously" | "signInWithCustomToken",
  "operation"?: FunctionResponse["operation"],
}
export class FirebaseWebAuthnError extends Error {

  constructor(
    private readonly firebaseWebAuthnErrorOptions: FirebaseWebAuthnErrorOptions,
  ) {
    super(firebaseWebAuthnErrorOptions.message);

    this
      .code = `firebaseWebAuthn/${firebaseWebAuthnErrorOptions.code}`;
    this
      .method = firebaseWebAuthnErrorOptions
      .method;
    this
      .operation = firebaseWebAuthnErrorOptions
      .operation;
  }

  public override readonly message!: FirebaseWebAuthnErrorOptions["message"];

  public readonly code: `firebaseWebAuthn/${FirebaseWebAuthnErrorOptions["code"]}`;
  public readonly method?: FirebaseWebAuthnErrorOptions["method"];
  public readonly operation?: FirebaseWebAuthnErrorOptions["operation"];

}
