import { FunctionResponse, WebAuthnUserDocument } from "@firebase-web-authn/types";
import { FirebaseError }                          from "firebase-admin";
import { DocumentReference, DocumentSnapshot }    from "firebase-admin/firestore";


export const clearUserDoc: (options: { webAuthnUserDocumentReference: DocumentReference<WebAuthnUserDocument> }) => Promise<FunctionResponse> = (options: { webAuthnUserDocumentReference: DocumentReference<WebAuthnUserDocument> }) => options.webAuthnUserDocumentReference.get().then<FunctionResponse, FunctionResponse>(
  (userDocumentSnapshot: DocumentSnapshot<WebAuthnUserDocument>): Promise<FunctionResponse> => (async (userDocument: WebAuthnUserDocument | undefined): Promise<FunctionResponse> => userDocument ? options.webAuthnUserDocumentReference.delete().then<FunctionResponse, FunctionResponse>(
    (): FunctionResponse => ({
      operation: "clear user doc",
      success:   true,
    }),
    (firebaseError: FirebaseError): FunctionResponse => ({
      code:      firebaseError.code,
      message:   firebaseError.message,
      operation: "clear user doc",
      success:   false,
    }),
  ) : {
    code:      "no-op",
    message:   "No operation is needed.",
    operation: "clear user doc",
    success:   false,
  })(userDocumentSnapshot.data()),
  (firebaseError: FirebaseError): FunctionResponse => ({
    code:      firebaseError.code,
    message:   firebaseError.message,
    operation: "clear user doc",
    success:   false,
  }),
);
