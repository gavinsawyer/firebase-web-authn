import { FunctionResponse, WebAuthnUserDocument }                     from "@firebase-web-authn/types";
import { VerifiedRegistrationResponse, verifyRegistrationResponse }   from "@simplewebauthn/server";
import { RegistrationResponseJSON }                                   from "@simplewebauthn/typescript-types";
import { FirebaseError }                                              from "firebase-admin";
import { DocumentReference, DocumentSnapshot, FieldValue, Timestamp } from "firebase-admin/firestore";


export const verifyRegistration: (options: { createCustomToken: () => Promise<string>, hostname: string, registrationResponse: RegistrationResponseJSON, userVerificationRequirement?: UserVerificationRequirement, webAuthnUserDocumentReference: DocumentReference<WebAuthnUserDocument> }) => Promise<FunctionResponse> = (options: { createCustomToken: () => Promise<string>, hostname: string, registrationResponse: RegistrationResponseJSON, userVerificationRequirement?: UserVerificationRequirement, webAuthnUserDocumentReference: DocumentReference<WebAuthnUserDocument> }): Promise<FunctionResponse> => options.webAuthnUserDocumentReference.get().then<FunctionResponse, FunctionResponse>(
  (userDocumentSnapshot: DocumentSnapshot<WebAuthnUserDocument>): Promise<FunctionResponse> => (async (userDocument: WebAuthnUserDocument | undefined): Promise<FunctionResponse> => userDocument ? userDocument.challenge && userDocument.challenge.process === "registration" ? (userDocument.challenge?.processingCredentialType === "backup" ? !userDocument?.credential : !userDocument?.backupCredential) ? verifyRegistrationResponse(
    {
      expectedChallenge:       userDocument.challenge.value,
      expectedOrigin:          "https://" + options.hostname,
      expectedRPID:            options.hostname,
      requireUserVerification: options.userVerificationRequirement === "required" || options.userVerificationRequirement === "preferred",
      response:                options.registrationResponse,
    },
  ).then<FunctionResponse>(
    (verifiedRegistrationResponse: VerifiedRegistrationResponse): Promise<FunctionResponse> => verifiedRegistrationResponse.verified && verifiedRegistrationResponse.registrationInfo ? options.webAuthnUserDocumentReference.update(
      {
        challenge:                                                      FieldValue.delete(),
        [userDocument.challenge?.processingCredentialType === "backup" ? "backupCredential" : "credential"]: {
          backupEligible:   verifiedRegistrationResponse.registrationInfo.credentialDeviceType === "multiDevice",
          backupSuccessful: verifiedRegistrationResponse.registrationInfo.credentialBackedUp,
          counter:          verifiedRegistrationResponse.registrationInfo.counter,
          id:               verifiedRegistrationResponse.registrationInfo.credentialID,
          publicKey:        verifiedRegistrationResponse.registrationInfo.credentialPublicKey,
          type:             userDocument.challenge?.processingCredentialType,
        },
        lastPresent:                                                    Timestamp.fromDate(new Date()),
        lastVerified:                                                   verifiedRegistrationResponse.registrationInfo.userVerified ? Timestamp.fromDate(new Date()) : userDocument["lastVerified"],
      },
    ).then<FunctionResponse, FunctionResponse>(
      (): Promise<FunctionResponse> => options.createCustomToken().then<FunctionResponse, FunctionResponse>(
        (customToken: string): FunctionResponse => ({
          registeredCredentialType: userDocument.lastPresent ? "backup" : "primary",
          customToken:              customToken,
          operation:                "verify registration",
          success:                  true,
        }),
        (firebaseError: FirebaseError): FunctionResponse => ({
          code:      firebaseError.code,
          message:   firebaseError.message,
          operation: "verify registration",
          success:   false,
        }),
      ),
      (firebaseError: FirebaseError): FunctionResponse => ({
        code:      firebaseError.code,
        message:   firebaseError.message,
        operation: "verify registration",
        success:   false,
      }),
    ) : options.webAuthnUserDocumentReference.delete().then<FunctionResponse, FunctionResponse>(
      (): FunctionResponse => ({
        code:      "not-verified",
        message:   "User not verified.",
        operation: "verify registration",
        success:   false,
      }),
      (firebaseError: FirebaseError): FunctionResponse => ({
        code:      firebaseError.code,
        message:   firebaseError.message,
        operation: "verify registration",
        success:   false,
      }),
    ),
  ) : options.webAuthnUserDocumentReference.delete().then<FunctionResponse, FunctionResponse>(
    (): FunctionResponse => ({
      code:      "user-doc-missing-passkey-fields",
      message:   "User doc is missing passkey fields from prior operation.",
      operation: "verify registration",
      success:   false,
    }),
    (firebaseError: FirebaseError): FunctionResponse => ({
      code:      firebaseError.code,
      message:   firebaseError.message,
      operation: "verify registration",
      success:   false,
    }),
  ) : userDocument.lastPresent ? {
    code:      "user-doc-missing-challenge-field",
    message:   "User doc is missing challenge field from prior operation.",
    operation: "verify registration",
    success:   false,
  } : options.webAuthnUserDocumentReference.delete().then<FunctionResponse, FunctionResponse>(
    (): FunctionResponse => ({
      code:      "user-doc-missing-challenge-field",
      message:   "User doc is missing challenge field from prior operation.",
      operation: "verify registration",
      success:   false,
    }),
    (firebaseError: FirebaseError): FunctionResponse => ({
      code:      firebaseError.code,
      message:   firebaseError.message,
      operation: "verify registration",
      success:   false,
    }),
  ) : {
    code:      "missing-user-doc",
    message:   "No user document was found in Firestore.",
    operation: "verify registration",
    success:   false,
  })(userDocumentSnapshot.data()),
  (firebaseError: FirebaseError): FunctionResponse => ({
    code:      firebaseError.code,
    message:   firebaseError.message,
    operation: "verify registration",
    success:   false,
  }),
);
