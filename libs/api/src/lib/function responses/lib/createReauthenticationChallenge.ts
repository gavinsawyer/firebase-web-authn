import { FunctionResponse, WebAuthnUserDocument } from "@firebase-web-authn/types";
import { generateAuthenticationOptions }          from "@simplewebauthn/server";
import { PublicKeyCredentialRequestOptionsJSON }  from "@simplewebauthn/typescript-types";
import { FirebaseError }                          from "firebase-admin";
import { DocumentReference, DocumentSnapshot }    from "firebase-admin/firestore";


export const createReauthenticationChallenge: (options: { hostname: string, userVerificationRequirement?: UserVerificationRequirement, webAuthnUserDocumentReference: DocumentReference<WebAuthnUserDocument> }) => Promise<FunctionResponse> = (options: { hostname: string, userVerificationRequirement?: UserVerificationRequirement, webAuthnUserDocumentReference: DocumentReference<WebAuthnUserDocument> }): Promise<FunctionResponse> => options.webAuthnUserDocumentReference.get().then<FunctionResponse, FunctionResponse>(
  (userDocumentSnapshot: DocumentSnapshot<WebAuthnUserDocument>): Promise<FunctionResponse> => (async (userDocument: WebAuthnUserDocument | undefined): Promise<FunctionResponse> => userDocument ? userDocument.credential ? generateAuthenticationOptions(
    {
      allowCredentials: [
        {
          id:   userDocument.credential.id,
          type: "public-key",
        },
      ],
      rpID:             options.hostname,
      userVerification: options.userVerificationRequirement,
    },
  ).then<FunctionResponse>(
    (publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptionsJSON): Promise<FunctionResponse> => options.webAuthnUserDocumentReference.set(
      {
        challenge: publicKeyCredentialRequestOptions.challenge,
      },
      {
        merge: true,
      },
    ).then<FunctionResponse, FunctionResponse>(
      (): FunctionResponse => ({
        operation:      "create reauthentication challenge",
        requestOptions: publicKeyCredentialRequestOptions,
        success:        true,
      }),
      (firebaseError: FirebaseError): FunctionResponse => ({
        code:      firebaseError.code,
        message:   firebaseError.message,
        operation: "create reauthentication challenge",
        success:   false,
      }),
    ),
  ) : {
    code:      "user-doc-missing-passkey-fields",
    message:   "User doc is missing passkey fields from prior operation.",
    operation: "create reauthentication challenge",
    success:   false,
  } : {
    code:      "missing-user-doc",
    message:   "No user document was found in Firestore.",
    operation: "create reauthentication challenge",
    success:   false,
  })(userDocumentSnapshot.data()),
  (firebaseError: FirebaseError): FunctionResponse => ({
    code:      firebaseError.code,
    message:   firebaseError.message,
    operation: "create reauthentication challenge",
    success:   false,
  }),
);
