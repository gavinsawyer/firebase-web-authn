import { FunctionResponse, WebAuthnUserDocument } from "@firebase-web-authn/types";
import { generateRegistrationOptions }            from "@simplewebauthn/server";
import { PublicKeyCredentialCreationOptionsJSON } from "@simplewebauthn/typescript-types";
import { FirebaseError }                          from "firebase-admin";
import { DocumentReference, DocumentSnapshot }    from "firebase-admin/firestore";


export const createRegistrationChallenge: (options: { authenticatorAttachment?: AuthenticatorAttachment, hostname: string, relyingPartyName: string, userID: string, userName: string, userVerificationRequirement?: UserVerificationRequirement, webAuthnUserDocumentReference: DocumentReference<WebAuthnUserDocument> }) => Promise<FunctionResponse> = (options: { authenticatorAttachment?: AuthenticatorAttachment, hostname: string, relyingPartyName: string, userID: string, userName: string, userVerificationRequirement?: UserVerificationRequirement, webAuthnUserDocumentReference: DocumentReference<WebAuthnUserDocument> }): Promise<FunctionResponse> => options.webAuthnUserDocumentReference.get().then<FunctionResponse, FunctionResponse>(
  (userDocumentSnapshot: DocumentSnapshot<WebAuthnUserDocument>): Promise<FunctionResponse> => (async (userDocument: WebAuthnUserDocument | undefined): Promise<FunctionResponse> => !userDocument?.credential ? generateRegistrationOptions(
    {
      authenticatorSelection: {
        authenticatorAttachment: options.authenticatorAttachment,
        residentKey:             "required",
        userVerification:        options.userVerificationRequirement,
      },
      rpID:                   options.hostname,
      rpName:                 options.relyingPartyName,
      userID:                 options.userID,
      userName:               options.userName,
    },
  ).then<FunctionResponse>(
    (publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptionsJSON): Promise<FunctionResponse> => options.webAuthnUserDocumentReference.set(
      {
        challenge: publicKeyCredentialCreationOptions.challenge,
      },
    ).then<FunctionResponse, FunctionResponse>(
      (): FunctionResponse => ({
        creationOptions: publicKeyCredentialCreationOptions,
        operation:       "create registration challenge",
        success:         true,
      }),
      (firebaseError: FirebaseError): FunctionResponse => ({
        code:      firebaseError.code,
        message:   firebaseError.message,
        operation: "create registration challenge",
        success:   false,
      }),
    ),
  ) : {
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
