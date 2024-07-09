import { FunctionResponse, WebAuthnUserCredentialFactor, WebAuthnUserDocument } from "@firebase-web-authn/types";
import { generateAuthenticationOptions }                                        from "@simplewebauthn/server";
import { isoUint8Array }                                                        from "@simplewebauthn/server/helpers";
import { PublicKeyCredentialRequestOptionsJSON }                                from "@simplewebauthn/types";
import { FirebaseError }                                                        from "firebase-admin";
import { DocumentReference, DocumentSnapshot, FieldValue }                      from "firebase-admin/firestore";


interface CreateReauthenticationChallengeOptions {
  authenticationOptions: {
    attestationType: AttestationConveyancePreference
    rpID: string
    supportedAlgorithmIDs: COSEAlgorithmIdentifier[]
  }
  reauthenticatingCredentialFactor?: WebAuthnUserCredentialFactor
  webAuthnUserDocumentReference: DocumentReference<WebAuthnUserDocument>
}

export const createReauthenticationChallenge: (options: CreateReauthenticationChallengeOptions) => Promise<FunctionResponse> = (options: CreateReauthenticationChallengeOptions): Promise<FunctionResponse> => options.webAuthnUserDocumentReference.get().then<FunctionResponse, FunctionResponse>(
  (userDocumentSnapshot: DocumentSnapshot<WebAuthnUserDocument>): Promise<FunctionResponse> => (async (userDocument: WebAuthnUserDocument | undefined): Promise<FunctionResponse> => userDocument ? (options.reauthenticatingCredentialFactor === "second" ? userDocument.credentials?.second : userDocument.credentials?.first) ? generateAuthenticationOptions(
    {
      ...options.authenticationOptions,
      allowCredentials: options.reauthenticatingCredentialFactor ? [
        {
          id: isoUint8Array.toUTF8String(userDocument.credentials?.[options.reauthenticatingCredentialFactor]?.id || new Uint8Array()),
        },
      ] : userDocument.credentials?.second ? [
        {
          id: isoUint8Array.toUTF8String(userDocument.credentials.first.id || new Uint8Array()),
        },
        {
          id: isoUint8Array.toUTF8String(userDocument.credentials.second.id),
        },
      ] : [
        {
          id: isoUint8Array.toUTF8String(userDocument.credentials?.first.id || new Uint8Array()),
        },
      ],
    },
  ).then<FunctionResponse>(
    (publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptionsJSON): Promise<FunctionResponse> => options.webAuthnUserDocumentReference.set(
      {
        challenge: {
          process:              "reauthentication",
          processingCredential: options.reauthenticatingCredentialFactor || FieldValue.delete(),
          value:                publicKeyCredentialRequestOptions.challenge,
        },
      },
      {
        merge: true,
      },
    ).then<FunctionResponse, FunctionResponse>(
      (): FunctionResponse => ({
        operation:                  "create reauthentication challenge",
        reauthenticatingCredential: options.reauthenticatingCredentialFactor,
        requestOptions:             publicKeyCredentialRequestOptions,
        success:                    true,
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
