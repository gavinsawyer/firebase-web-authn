import { FunctionResponse, WebAuthnUserCredentialFactor, WebAuthnUserDocument } from "@firebase-web-authn/types";
import { generateAuthenticationOptions }                                        from "@simplewebauthn/server";
import { PublicKeyCredentialRequestOptionsJSON }                                from "@simplewebauthn/typescript-types";
import { FirebaseError }                                                        from "firebase-admin";
import { DocumentReference, FieldValue }                                        from "firebase-admin/firestore";


interface CreateAuthenticationChallengeOptions {
  authenticatingCredential?: WebAuthnUserCredentialFactor
  authenticationOptions: {
    attestationType: AttestationConveyancePreference
    rpID: string
    supportedAlgorithmIDs: COSEAlgorithmIdentifier[]
  }
  webAuthnUserDocumentReference: DocumentReference<WebAuthnUserDocument>
}

export const createAuthenticationChallenge: (options: CreateAuthenticationChallengeOptions) => Promise<FunctionResponse> = (options: CreateAuthenticationChallengeOptions): Promise<FunctionResponse> => generateAuthenticationOptions(options.authenticationOptions).then<FunctionResponse>(
  (publicKeyCredentialRequestOptionsJSON: PublicKeyCredentialRequestOptionsJSON): Promise<FunctionResponse> => options.webAuthnUserDocumentReference.set(
    {
      challenge: {
        process:              "authentication",
        processingCredential: options.authenticatingCredential || FieldValue.delete(),
        value:                publicKeyCredentialRequestOptionsJSON.challenge,
      },
    },
    {
      merge: true,
    },
  ).then<FunctionResponse, FunctionResponse>(
    (): FunctionResponse => ({
      authenticatingCredential: options.authenticatingCredential,
      operation:                "create authentication challenge",
      requestOptions:           publicKeyCredentialRequestOptionsJSON,
      success:                  true,
    }),
    (firebaseError: FirebaseError): FunctionResponse => ({
      code:      firebaseError.code,
      message:   firebaseError.message,
      operation: "create authentication challenge",
      success:   false,
    }),
  ),
);
