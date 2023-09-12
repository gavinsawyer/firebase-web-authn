import { FunctionResponse, WebAuthnUserCredentialType, WebAuthnUserDocument } from "@firebase-web-authn/types";
import { generateAuthenticationOptions }                                      from "@simplewebauthn/server";
import { PublicKeyCredentialRequestOptionsJSON }                              from "@simplewebauthn/typescript-types";
import { FirebaseError }                                                      from "firebase-admin";
import { DocumentReference, DocumentSnapshot }                                from "firebase-admin/firestore";


export const createReauthenticationChallenge: (options: { authenticatorAttachment?: AuthenticatorAttachment, backupAuthenticatorAttachment?: AuthenticatorAttachment, hostname: string, reauthenticatingCredentialType?: WebAuthnUserCredentialType, userVerificationRequirement?: UserVerificationRequirement, webAuthnUserDocumentReference: DocumentReference<WebAuthnUserDocument> }) => Promise<FunctionResponse> = (options: { authenticatorAttachment?: AuthenticatorAttachment, backupAuthenticatorAttachment?: AuthenticatorAttachment, hostname: string, reauthenticatingCredentialType?: WebAuthnUserCredentialType, userVerificationRequirement?: UserVerificationRequirement, webAuthnUserDocumentReference: DocumentReference<WebAuthnUserDocument> }): Promise<FunctionResponse> => options.webAuthnUserDocumentReference.get().then<FunctionResponse, FunctionResponse>(
  (userDocumentSnapshot: DocumentSnapshot<WebAuthnUserDocument>): Promise<FunctionResponse> => (async (userDocument: WebAuthnUserDocument | undefined): Promise<FunctionResponse> => userDocument ? (options.reauthenticatingCredentialType === "backup" ? userDocument.backupCredential : userDocument.credential) ? generateAuthenticationOptions(
    {
      allowCredentials: options.reauthenticatingCredentialType === "backup" ? [
        {
          id:   userDocument.backupCredential?.id || new Uint8Array(),
          type: "public-key",
        },
      ] : options.reauthenticatingCredentialType === "primary" ? [
        {
          id:   userDocument.credential?.id || new Uint8Array(),
          type: "public-key",
        },
      ] : userDocument.backupCredential ? [
        {
          id:   userDocument.credential?.id || new Uint8Array(),
          type: "public-key",
        },
        {
          id:   userDocument.backupCredential.id,
          type: "public-key",
        },
      ] : [
        {
          id:   userDocument.credential?.id || new Uint8Array(),
          type: "public-key",
        },
      ],
      rpID:             options.hostname,
      userVerification: options.reauthenticatingCredentialType === "backup" ? options.backupAuthenticatorAttachment === "platform" ? options.userVerificationRequirement : "preferred" : options.authenticatorAttachment === "platform" ? options.userVerificationRequirement : "preferred",
    },
  ).then<FunctionResponse>(
    (publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptionsJSON): Promise<FunctionResponse> => options.webAuthnUserDocumentReference.set(
      {
        challenge: {
          process:                  "reauthentication",
          processingCredentialType: options.reauthenticatingCredentialType,
          value:                    publicKeyCredentialRequestOptions.challenge,
        },
      },
      {
        merge: true,
      },
    ).then<FunctionResponse, FunctionResponse>(
      (): FunctionResponse => ({
        operation:                      "create reauthentication challenge",
        reauthenticatingCredentialType: options.reauthenticatingCredentialType,
        requestOptions:                 publicKeyCredentialRequestOptions,
        success:                        true,
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
