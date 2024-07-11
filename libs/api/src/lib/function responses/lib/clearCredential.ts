import { FunctionResponse, WebAuthnUserCredentialFactor, WebAuthnUserDocument } from "@firebase-web-authn/types";
import { FirebaseError }                                                        from "firebase-admin";
import { DocumentReference, DocumentSnapshot, FieldValue }                      from "firebase-admin/firestore";


interface ClearCredentialOptions {
  clearingCredential?: WebAuthnUserCredentialFactor;
  webAuthnUserDocumentReference: DocumentReference<WebAuthnUserDocument>;
}

export const clearCredential: (options: ClearCredentialOptions) => Promise<FunctionResponse> = (options: ClearCredentialOptions) => options.webAuthnUserDocumentReference.get().then<FunctionResponse, FunctionResponse>(
  (userDocumentSnapshot: DocumentSnapshot<WebAuthnUserDocument>): Promise<FunctionResponse> => (async (userDocument: WebAuthnUserDocument | undefined): Promise<FunctionResponse> => userDocument && userDocument.credentials?.[options.clearingCredential || "first"] ? options.webAuthnUserDocumentReference.update(
    {
      ["credentials." + (options.clearingCredential || "first")]: FieldValue.delete(),
    },
  ).then<FunctionResponse, FunctionResponse>(
    (): FunctionResponse => ({
      clearingCredential: options.clearingCredential,
      operation:          "clear credential",
      success:            true,
    }),
    (firebaseError: FirebaseError): FunctionResponse => ({
      code:      firebaseError.code,
      message:   firebaseError.message,
      operation: "clear credential",
      success:   false,
    }),
  ) : {
    code:      "no-op",
    message:   "No operation is needed.",
    operation: "clear credential",
    success:   false,
  })(userDocumentSnapshot.data()),
  (firebaseError: FirebaseError): FunctionResponse => ({
    code:      firebaseError.code,
    message:   firebaseError.message,
    operation: "clear credential",
    success:   false,
  }),
);
