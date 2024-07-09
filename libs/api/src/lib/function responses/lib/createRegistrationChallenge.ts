import { FunctionResponse, WebAuthnUserCredentialFactor, WebAuthnUserDocument } from "@firebase-web-authn/types";
import { generateRegistrationOptions }                                          from "@simplewebauthn/server";
import { isoUint8Array }                                                        from "@simplewebauthn/server/helpers";
import { PublicKeyCredentialCreationOptionsJSON }                               from "@simplewebauthn/types";
import { FirebaseError }                                                        from "firebase-admin";
import { DocumentReference, DocumentSnapshot }                                  from "firebase-admin/firestore";


interface CreateRegistrationChallengeOptions {
  registeringCredentialFactor: WebAuthnUserCredentialFactor
  registrationOptions: {
    attestationType: AttestationConveyancePreference
    authenticatorSelection: AuthenticatorSelectionCriteria
    rpID: string
    rpName: string
    supportedAlgorithmIDs: COSEAlgorithmIdentifier[]
    userID: Uint8Array
    userName: string
  }
  webAuthnUserDocumentReference: DocumentReference<WebAuthnUserDocument>
}

export const createRegistrationChallenge: (options: CreateRegistrationChallengeOptions) => Promise<FunctionResponse> = (options: CreateRegistrationChallengeOptions): Promise<FunctionResponse> => options.webAuthnUserDocumentReference.get().then<FunctionResponse, FunctionResponse>(
  (userDocumentSnapshot: DocumentSnapshot<WebAuthnUserDocument>): Promise<FunctionResponse> => (async (userDocument: WebAuthnUserDocument | undefined): Promise<FunctionResponse> => (options.registeringCredentialFactor === "second" ? !userDocument?.credentials?.second : !userDocument?.credentials?.first) ? (options.registeringCredentialFactor !== "second" || userDocument && userDocument.credentials?.first) ? generateRegistrationOptions(
    {
      ...options.registrationOptions,
      excludeCredentials: options.registeringCredentialFactor === "second" ? [
        {
          id: isoUint8Array.toUTF8String(userDocument?.credentials?.first.id || new Uint8Array()),
        },
      ] : undefined,
    },
  ).then<FunctionResponse>(
    (publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptionsJSON): Promise<FunctionResponse> => options.webAuthnUserDocumentReference.set(
      {
        challenge: {
          process:              "registration",
          processingCredential: options.registeringCredentialFactor,
          value:                publicKeyCredentialCreationOptions.challenge,
        },
      },
      {
        merge: true,
      },
    ).then<FunctionResponse, FunctionResponse>(
      (): FunctionResponse => ({
        creationOptions:       publicKeyCredentialCreationOptions,
        operation:             "create registration challenge",
        registeringCredential: options.registeringCredentialFactor,
        success:               true,
      }),
      (firebaseError: FirebaseError): FunctionResponse => ({
        code:      firebaseError.code,
        message:   firebaseError.message,
        operation: "create registration challenge",
        success:   false,
      }),
    ),
  ) : {
    code:      "missing-primary",
    message:   "No primary passkey was found in Firestore.",
    operation: "create registration challenge",
    success:   false,
  } : {
    code:      "no-op",
    message:   "No operation is needed.",
    operation: "create registration challenge",
    success:   false,
  })(userDocumentSnapshot.data()),
  (firebaseError: FirebaseError): FunctionResponse => ({
    code:      firebaseError.code,
    message:   firebaseError.message,
    operation: "create registration challenge",
    success:   false,
  }),
);
