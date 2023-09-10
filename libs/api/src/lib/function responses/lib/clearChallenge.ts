import { FunctionResponse, WebAuthnUserDocument }          from "@firebase-web-authn/types";
import { FirebaseError }                                   from "firebase-admin";
import { DocumentReference, DocumentSnapshot, FieldValue } from "firebase-admin/firestore";


export const clearChallenge: (options: { webAuthnUserDocumentReference: DocumentReference<WebAuthnUserDocument> }) => Promise<FunctionResponse> = (options: { webAuthnUserDocumentReference: DocumentReference<WebAuthnUserDocument> }) => options.webAuthnUserDocumentReference.get().then<FunctionResponse, FunctionResponse>(
  (userDocumentSnapshot: DocumentSnapshot<WebAuthnUserDocument>): Promise<FunctionResponse> => (async (userDocument: WebAuthnUserDocument | undefined): Promise<FunctionResponse> => userDocument ? userDocument.challenge ? userDocument.credential ? options.webAuthnUserDocumentReference.update(
    {
      challenge: FieldValue.delete(),
    },
  ).then<FunctionResponse, FunctionResponse>(
    (): FunctionResponse => ({
      operation: "clear challenge",
      success:   true,
    }),
    (firebaseError: FirebaseError): FunctionResponse => ({
      code:      firebaseError.code,
      message:   firebaseError.message,
      operation: "clear challenge",
      success:   false,
    }),
  ) : options.webAuthnUserDocumentReference.delete().then<FunctionResponse, FunctionResponse>(
    (): FunctionResponse => ({
      operation: "clear challenge",
      success:   true,
    }),
    (firebaseError: FirebaseError): FunctionResponse => ({
      code:      firebaseError.code,
      message:   firebaseError.message,
      operation: "clear challenge",
      success:   false,
    }),
  ) : {
    code:      "no-op",
    message:   "No operation is needed.",
    operation: "clear challenge",
    success:   false,
  } : {
    code:      "missing-user-doc",
    message:   "No user document was found in Firestore.",
    operation: "clear challenge",
    success:   false,
  })(userDocumentSnapshot.data()),
  (firebaseError: FirebaseError): FunctionResponse => (
    {
      code:      firebaseError.code,
      message:   firebaseError.message,
      operation: "clear challenge",
      success:   false,
    }
  ),
);
