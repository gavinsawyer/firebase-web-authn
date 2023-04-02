import { UnknownFunctionResponseUnsuccessful } from "@firebase-web-authn/functions";


interface FirebaseWebAuthnErrorOptions {
  "code": UnknownFunctionResponseUnsuccessful["code"] | "cancelled" | "invalid",
  "message": UnknownFunctionResponseUnsuccessful["message"] | "Cancelled by user." | "Invalid function response.",
  "method"?: "httpsCallableFromURL" | "signInAnonymously" | "signInWithCustomToken",
  "operation"?: UnknownFunctionResponseUnsuccessful["operation"],
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
