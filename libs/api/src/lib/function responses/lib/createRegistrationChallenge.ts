import { FunctionResponse, WebAuthnUserCredentialType, WebAuthnUserDocument } from "@firebase-web-authn/types";
import { generateRegistrationOptions }                                        from "@simplewebauthn/server";
import { PublicKeyCredentialCreationOptionsJSON }                             from "@simplewebauthn/typescript-types";
import { FirebaseError }                                                      from "firebase-admin";
import { DocumentReference, DocumentSnapshot }                                from "firebase-admin/firestore";


export const createRegistrationChallenge: (options: { authenticatorAttachment?: AuthenticatorAttachment, backupAuthenticatorAttachment?: AuthenticatorAttachment, hostname: string, registeringCredentialType: WebAuthnUserCredentialType, relyingPartyName: string, userID: string, userName: string, userVerificationRequirement?: UserVerificationRequirement, webAuthnUserDocumentReference: DocumentReference<WebAuthnUserDocument> }) => Promise<FunctionResponse> = (options: { authenticatorAttachment?: AuthenticatorAttachment, backupAuthenticatorAttachment?: AuthenticatorAttachment, hostname: string, registeringCredentialType: WebAuthnUserCredentialType, relyingPartyName: string, userID: string, userName: string, userVerificationRequirement?: UserVerificationRequirement, webAuthnUserDocumentReference: DocumentReference<WebAuthnUserDocument> }): Promise<FunctionResponse> => options.webAuthnUserDocumentReference.get().then<FunctionResponse, FunctionResponse>(
  (userDocumentSnapshot: DocumentSnapshot<WebAuthnUserDocument>): Promise<FunctionResponse> => (async (userDocument: WebAuthnUserDocument | undefined): Promise<FunctionResponse> => (options.registeringCredentialType === "backup" ? !userDocument?.backupCredential : !userDocument?.credential) ? (options.registeringCredentialType !== "backup" || userDocument && userDocument.credential) ? generateRegistrationOptions(
    {
      authenticatorSelection: options.registeringCredentialType === "backup" ? options.backupAuthenticatorAttachment ? {
        authenticatorAttachment: options.backupAuthenticatorAttachment,
        residentKey:             "required",
        userVerification:        options.backupAuthenticatorAttachment === "platform" ? options.userVerificationRequirement : "preferred",
      } : {
        residentKey:      "required",
        userVerification: "preferred",
      } : options.authenticatorAttachment ? {
        authenticatorAttachment: options.authenticatorAttachment,
        residentKey:             "required",
        userVerification:        options.authenticatorAttachment === "platform" ? options.userVerificationRequirement : "preferred",
      } : {
        residentKey:      "required",
        userVerification: "preferred",
      },
      excludeCredentials:     options.registeringCredentialType === "backup" ? [
        {
          id:   userDocument?.credential?.id || new Uint8Array(),
          type: "public-key",
        },
      ] : undefined,
      rpID:                   options.hostname,
      rpName:                 options.relyingPartyName,
      userID:                 options.userID,
      userName:               options.userName,
    },
  ).then<FunctionResponse>(
    (publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptionsJSON): Promise<FunctionResponse> => options.webAuthnUserDocumentReference.set(
      {
        challenge: {
          process:                  "registration",
          processingCredentialType: options.registeringCredentialType,
          value:                    publicKeyCredentialCreationOptions.challenge,
        },
      },
      {
        merge: true,
      },
    ).then<FunctionResponse, FunctionResponse>(
      (): FunctionResponse => ({
        creationOptions:           publicKeyCredentialCreationOptions,
        operation:                 "create registration challenge",
        registeringCredentialType: options.registeringCredentialType,
        success:                   true,
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
