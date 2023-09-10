import { FunctionResponse, WebAuthnUserDocument } from "@firebase-web-authn/types";
import { generateAuthenticationOptions }          from "@simplewebauthn/server";
import { PublicKeyCredentialRequestOptionsJSON }  from "@simplewebauthn/typescript-types";
import { FirebaseError }                          from "firebase-admin";
import { DocumentReference }                      from "firebase-admin/firestore";


export const createAuthenticationChallenge: (options: { hostname: string, userVerificationRequirement?: UserVerificationRequirement, webAuthnUserDocumentReference: DocumentReference<WebAuthnUserDocument> }) => Promise<FunctionResponse> = (options: { hostname: string, userVerificationRequirement?: UserVerificationRequirement, webAuthnUserDocumentReference: DocumentReference<WebAuthnUserDocument> }): Promise<FunctionResponse> => generateAuthenticationOptions(
  {
    rpID:             options.hostname,
    userVerification: options.userVerificationRequirement,
  },
).then<FunctionResponse>(
  (publicKeyCredentialRequestOptionsJSON: PublicKeyCredentialRequestOptionsJSON): Promise<FunctionResponse> => options.webAuthnUserDocumentReference.set(
    {
      challenge: publicKeyCredentialRequestOptionsJSON.challenge,
    },
    {
      merge: true,
    },
  ).then<FunctionResponse, FunctionResponse>(
    (): FunctionResponse => ({
      operation:      "create authentication challenge",
      requestOptions: publicKeyCredentialRequestOptionsJSON,
      success:        true,
    }),
    (firebaseError: FirebaseError): FunctionResponse => ({
      code:      firebaseError.code,
      message:   firebaseError.message,
      operation: "create authentication challenge",
      success:   false,
    }),
  ),
);
