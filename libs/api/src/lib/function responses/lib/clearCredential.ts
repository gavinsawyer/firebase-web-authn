import { FunctionResponse, WebAuthnUserCredentialType, WebAuthnUserDocument } from "@firebase-web-authn/types";
import { FirebaseError }                                                      from "firebase-admin";
import { DocumentReference, DocumentSnapshot, FieldValue }                    from "firebase-admin/firestore";


export const clearCredential: (options: { clearingCredentialType?: WebAuthnUserCredentialType, webAuthnUserDocumentReference: DocumentReference<WebAuthnUserDocument> }) => Promise<FunctionResponse> = (options: { clearingCredentialType?: WebAuthnUserCredentialType, webAuthnUserDocumentReference: DocumentReference<WebAuthnUserDocument> }) => options.webAuthnUserDocumentReference.get().then<FunctionResponse, FunctionResponse>(
  (userDocumentSnapshot: DocumentSnapshot<WebAuthnUserDocument>): Promise<FunctionResponse> => (async (userDocument: WebAuthnUserDocument | undefined): Promise<FunctionResponse> => userDocument && userDocument[options.clearingCredentialType === "backup" ? "backupCredential" : "credential"] ? (options.clearingCredentialType === "backup" ? options.webAuthnUserDocumentReference.update(
    {
      backupCredential: FieldValue.delete(),
    },
  ) : options.webAuthnUserDocumentReference.delete()).then<FunctionResponse, FunctionResponse>(
    (): FunctionResponse => ({
      clearingCredentialType: options.clearingCredentialType,
      operation:              "clear credential",
      success:                true,
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
